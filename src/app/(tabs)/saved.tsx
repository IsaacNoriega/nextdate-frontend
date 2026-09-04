import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import {
  getItinerariesByUserIdApi,
  Itinerary,
} from '../../services/itineraryService';
import {
  getSharedExperiencesApi,
  shareExperienceApi,
} from '../../services/communityService';
import { createPlaceApi } from '../../services/placeService';
import { PlaceCategory, PriceRange } from '../../services/profileService';
import StepDetailModal from '../../components/generator/step-detail-modal';
import ShareExperienceModal, {
  CreateExperiencePayload,
} from '../../components/community/share-experience-modal';
import { RouteStep } from '../../mocks/map.mock';

type SavedSegment = 'itineraries' | 'places' | 'my_uploads';

export default function SavedScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [activeSegment, setActiveSegment] = useState<SavedSegment>('itineraries');
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [myUploads, setMyUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal para detalle de paradas
  const [selectedStepDetail, setSelectedStepDetail] = useState<RouteStep | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);

  // Carga de datos
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Itinerarios
      if (user?.id) {
        const itinData = await getItinerariesByUserIdApi(user.id);
        setItineraries(itinData || []);
      } else {
        setItineraries([]);
      }

      // 2. Lugares Guardados
      const placesData = await storageService.getSavedPlaces();
      setSavedPlaces(placesData || []);

      // 3. Mis Aportes / Experiencias
      const expData = await getSharedExperiencesApi();
      if (expData && Array.isArray(expData)) {
        const userPosts = user?.id
          ? expData.filter((e: any) => e.userId === user.id)
          : expData;
        setMyUploads(userPosts.length > 0 ? userPosts : expData);
      } else {
        setMyUploads([]);
      }
    } catch (err) {
      console.warn('Error al cargar datos de guardados:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user?.id])
  );

  const handleOpenInMap = (itin: Itinerary) => {
    // Redirige al tab del mapa
    router.push('/(tabs)/map');
  };

  const handleRemoveSavedPlace = async (placeId: string) => {
    await storageService.removeSavedPlace(placeId);
    const updated = await storageService.getSavedPlaces();
    setSavedPlaces(updated);
  };

  const handleUploadSubmit = async (payload: CreateExperiencePayload) => {
    if (!user?.id) {
      Alert.alert('Acceso requerido', 'Inicia sesión para subir un lugar o experiencia.');
      return;
    }
    setPublishing(true);
    try {
      // 1. Registrar o verificar el lugar en el catálogo de lugares físicos (con deduplicación backend)
      const mappedPriceRange: PriceRange =
        payload.budget === '$'
          ? 'CHEAP'
          : payload.budget === '$$$'
          ? 'EXPENSIVE'
          : payload.budget === '$$$$'
          ? 'LUXURY'
          : 'MODERATE';

      const placeName = payload.place || payload.title;
      const placeCategory: PlaceCategory =
        payload.selectedGastro.length > 0
          ? 'FOOD_DRINK'
          : 'ENTERTAINMENT';

      await createPlaceApi({
        name: placeName,
        description: payload.reviewText || `Lugar compartido: ${placeName}`,
        category: placeCategory,
        priceRange: mappedPriceRange,
        address: payload.location,
        latitude: payload.latitude ?? 20.6745,
        longitude: payload.longitude ?? -103.3702,
      }).catch((err) => {
        console.warn('Aviso al registrar lugar en catálogo:', err);
      });

      // 2. Validar formato UUID para el itinerario seleccionado
      const isValidUuid = (id?: string) =>
        typeof id === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      const targetItineraryId = isValidUuid(payload.selectedItineraryId)
        ? payload.selectedItineraryId
        : undefined;

      // 3. Guardar la experiencia de la comunidad vinculada
      try {
        await shareExperienceApi({
          userId: user.id,
          title: payload.title,
          description: payload.reviewText,
          tips: payload.location || payload.place,
          rating: payload.rating,
          actualCost: payload.budget === '$' ? 150 : payload.budget === '$$$' ? 800 : payload.budget === '$$$$' ? 2000 : 400,
          itineraryId: targetItineraryId,
          imageUrls: payload.imageUrl ? [payload.imageUrl] : [],
        });
      } catch (err: any) {
        // Si falló por itinerario inexistente, reintentar sin itinerario
        if (targetItineraryId && err.message && err.message.includes('Itinerario no encontrado')) {
          await shareExperienceApi({
            userId: user.id,
            title: payload.title,
            description: payload.reviewText,
            tips: payload.location || payload.place,
            rating: payload.rating,
            actualCost: payload.budget === '$' ? 150 : payload.budget === '$$$' ? 800 : payload.budget === '$$$$' ? 2000 : 400,
            itineraryId: undefined,
            imageUrls: payload.imageUrl ? [payload.imageUrl] : [],
          });
        } else {
          throw err;
        }
      }

      setShowUploadModal(false);
      Alert.alert('¡Publicado!', 'Tu lugar y experiencia han sido guardados y ahora son visibles en la comunidad y en el mapa.');
      loadData();
    } catch (e: any) {
      console.error('Error al publicar experiencia:', e);
      Alert.alert('Error', e.message || 'No se pudo guardar la experiencia.');
    } finally {
      setPublishing(false);
    }
  };

  // Convertir item de itinerario para el StepDetailModal
  const handleViewStepDetail = (item: any, itin: Itinerary) => {
    const routeStep: RouteStep = {
      stepNumber: item.sequenceOrder || 1,
      time: 'Hora sugerida',
      title: item.notes || item.place?.name || 'Parada',
      placeName: item.place?.name || 'Lugar de la Cita',
      categoryEmoji: '📍',
      address: item.place?.address || 'Ubicación seleccionada',
      description: item.place?.category || 'Parada programada de tu cita',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      estimatedCost: `$${item.transitTimeToNext || 50} USD`,
      turnInstruction: `Dirígete a ${item.place?.name || 'este punto'}`,
      distanceRemaining: 'En tu ruta',
      eta: `${item.durationInMinutes || 45} min`,
      lat: item.place?.latitude || 0,
      lng: item.place?.longitude || 0,
    };
    setSelectedStepDetail(routeStep);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header Superior */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            Mis Guardados
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
            Tus planes, citas e inspiraciones
          </Text>
        </View>

        {activeSegment === 'my_uploads' && (
          <TouchableOpacity
            style={[styles.uploadHeaderBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
            activeOpacity={0.85}
            onPress={() => setShowUploadModal(true)}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
              <Path d="M12 5v14M5 12h14" />
            </Svg>
            <Text style={[styles.uploadHeaderBtnText, { fontFamily: typography.fonts.bold }]}>
              Subir
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selector de Segmentos (Segmented Control) */}
      <View style={[styles.segmentedControl, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: borderRadius.lg }]}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeSegment === 'itineraries' && [styles.segmentBtnActive, { backgroundColor: colors.card, shadowColor: '#000' }],
            { borderRadius: borderRadius.md }
          ]}
          activeOpacity={0.8}
          onPress={() => setActiveSegment('itineraries')}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={activeSegment === 'itineraries' ? colors.primary : colors.textSecondary} strokeWidth={2}>
            <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </Svg>
          <Text
            style={[
              styles.segmentBtnText,
              {
                color: activeSegment === 'itineraries' ? colors.text : colors.textSecondary,
                fontFamily: activeSegment === 'itineraries' ? typography.fonts.bold : typography.fonts.medium,
              },
            ]}
          >
            Citas ({itineraries.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeSegment === 'places' && [styles.segmentBtnActive, { backgroundColor: colors.card, shadowColor: '#000' }],
            { borderRadius: borderRadius.md }
          ]}
          activeOpacity={0.8}
          onPress={() => setActiveSegment('places')}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={activeSegment === 'places' ? colors.primary : colors.textSecondary} strokeWidth={2}>
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" />
          </Svg>
          <Text
            style={[
              styles.segmentBtnText,
              {
                color: activeSegment === 'places' ? colors.text : colors.textSecondary,
                fontFamily: activeSegment === 'places' ? typography.fonts.bold : typography.fonts.medium,
              },
            ]}
          >
            Lugares ({savedPlaces.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeSegment === 'my_uploads' && [styles.segmentBtnActive, { backgroundColor: colors.card, shadowColor: '#000' }],
            { borderRadius: borderRadius.md }
          ]}
          activeOpacity={0.8}
          onPress={() => setActiveSegment('my_uploads')}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={activeSegment === 'my_uploads' ? colors.primary : colors.textSecondary} strokeWidth={2}>
            <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <Circle cx="12" cy="13" r="4" />
          </Svg>
          <Text
            style={[
              styles.segmentBtnText,
              {
                color: activeSegment === 'my_uploads' ? colors.text : colors.textSecondary,
                fontFamily: activeSegment === 'my_uploads' ? typography.fonts.bold : typography.fonts.medium,
              },
            ]}
          >
            Aportes ({myUploads.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido Principal */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            Cargando tus guardados...
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* 1. SECCIÓN DE ITINERARIOS */}
          {activeSegment === 'itineraries' && (
            <FlatList
              data={itineraries}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: borderRadius.lg,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                        {item.title}
                      </Text>
                      {item.description ? (
                        <Text
                          style={[styles.cardDesc, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[styles.costBadge, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[styles.costBadgeText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                        ${item.totalCost.toFixed(0)} USD
                      </Text>
                    </View>
                  </View>

                  {/* Paradas resumidas */}
                  <View style={styles.stopsContainer}>
                    <Text style={[styles.stopsLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                      Paradas de la cita ({item.items?.length || 0}):
                    </Text>
                    <View style={styles.stopsList}>
                      {item.items?.map((stop, idx) => (
                        <TouchableOpacity
                          key={stop.id || idx}
                          style={[
                            styles.stopPill,
                            {
                              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              borderColor: colors.border,
                              borderRadius: borderRadius.sm,
                            },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => handleViewStepDetail(stop, item)}
                        >
                          <View style={[styles.stopNumberCircle, { backgroundColor: colors.primary }]}>
                            <Text style={styles.stopNumberText}>{stop.sequenceOrder || idx + 1}</Text>
                          </View>
                          <Text
                            style={[styles.stopNameText, { color: colors.text, fontFamily: typography.fonts.medium }]}
                            numberOfLines={1}
                          >
                            {stop.place?.name || 'Parada'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Botones de Acción */}
                  <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                      style={[styles.actionBtnSecondary, { borderColor: colors.border, borderRadius: borderRadius.md }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (item.items && item.items.length > 0) {
                          handleViewStepDetail(item.items[0], item);
                        }
                      }}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2}>
                        <Path d="M9 18l6-6-6-6" />
                      </Svg>
                      <Text style={[styles.actionBtnSecondaryText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                        Ver Paradas
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtnPrimary, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                      activeOpacity={0.88}
                      onPress={() => handleOpenInMap(item)}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
                        <Path d="M1 6v13l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v13M16 6v13" />
                      </Svg>
                      <Text style={[styles.actionBtnPrimaryText, { fontFamily: typography.fonts.bold }]}>
                        Ver en Mapa
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '15' }]}>
                    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </Svg>
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Aún no tienes citas guardadas
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    Genera tu primer itinerario inteligente con IA y guárdalo aquí para consultarlo cuando quieras.
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyActionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                    activeOpacity={0.88}
                    onPress={() => router.push('/(tabs)/generator')}
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="#FFFFFF">
                      <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </Svg>
                    <Text style={[styles.emptyActionBtnText, { fontFamily: typography.fonts.bold }]}>
                      Crear Cita con IA
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}

          {/* 2. SECCIÓN DE LUGARES GUARDADOS */}
          {activeSegment === 'places' && (
            <FlatList
              data={savedPlaces}
              keyExtractor={(item, index) => item.id || String(index)}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.placeCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: borderRadius.lg,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
                    }}
                    style={styles.placeCardImage}
                  />
                  <View style={styles.placeCardBody}>
                    <View style={styles.placeMetaRow}>
                      <Text style={[styles.placeCategory, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                        {item.categoryLabel || item.category || 'Lugar'}
                      </Text>
                      <Text style={[styles.placePrice, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                        {item.priceSymbol || '$$'}
                      </Text>
                    </View>
                    <Text style={[styles.placeTitle, { color: colors.text, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.placeAddress, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                      {item.address || 'Ubicación local'}
                    </Text>

                    <View style={styles.placeBottomActions}>
                      <TouchableOpacity
                        style={[styles.removePlaceBtn, { borderColor: colors.border, borderRadius: borderRadius.sm }]}
                        activeOpacity={0.7}
                        onPress={() => handleRemoveSavedPlace(item.id)}
                      >
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth={2}>
                          <Path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </Svg>
                        <Text style={[styles.removePlaceBtnText, { fontFamily: typography.fonts.medium }]}>
                          Quitar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.planDateBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.sm }]}
                        activeOpacity={0.88}
                        onPress={() => router.push('/(tabs)/generator')}
                      >
                        <Text style={[styles.planDateBtnText, { fontFamily: typography.fonts.bold }]}>
                          Planear Cita
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '15' }]}>
                    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <Circle cx="12" cy="10" r="3" />
                    </Svg>
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    No tienes lugares guardados
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    Explora restaurantes, cafeterías y actividades cerca de ti y guárdalos aquí para tus próximas salidas.
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyActionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                    activeOpacity={0.88}
                    onPress={() => router.push('/(tabs)/explore')}
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <Circle cx="12" cy="10" r="3" />
                    </Svg>
                    <Text style={[styles.emptyActionBtnText, { fontFamily: typography.fonts.bold }]}>
                      Explorar Lugares
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}

          {/* 3. SECCIÓN DE MIS APORTES / SUBIDAS */}
          {activeSegment === 'my_uploads' && (
            <FlatList
              data={myUploads}
              keyExtractor={(item, index) => item.id || String(index)}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.uploadCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: borderRadius.lg,
                    },
                  ]}
                >
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <Image source={{ uri: item.imageUrls[0] }} style={styles.uploadCardImage} />
                  ) : item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.uploadCardImage} />
                  ) : null}

                  <View style={styles.uploadCardBody}>
                    <View style={styles.uploadHeaderRow}>
                      <Text style={[styles.uploadTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                        {item.title || item.planTitle || 'Experiencia Subida'}
                      </Text>
                      {item.rating ? (
                        <View style={styles.ratingBadge}>
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="#FFD700">
                            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </Svg>
                          <Text style={[styles.ratingText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                            {item.rating}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {item.description || item.reviewText ? (
                      <Text
                        style={[styles.uploadDesc, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}
                        numberOfLines={3}
                      >
                        {item.description || item.reviewText}
                      </Text>
                    ) : null}

                    {item.tips || item.location ? (
                      <View style={styles.locationTagRow}>
                        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <Circle cx="12" cy="10" r="3" />
                        </Svg>
                        <Text
                          style={[styles.locationTagText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}
                          numberOfLines={1}
                        >
                          {item.tips || item.location}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '15' }]}>
                    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <Circle cx="12" cy="13" r="4" />
                    </Svg>
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Aún no has subido lugares o experiencias
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    Comparte fotos de tus citas favoritas, secretos locales y recomendaciones personales.
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyActionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                    activeOpacity={0.88}
                    onPress={() => setShowUploadModal(true)}
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                      <Path d="M12 5v14M5 12h14" />
                    </Svg>
                    <Text style={[styles.emptyActionBtnText, { fontFamily: typography.fonts.bold }]}>
                      Subir mi primer aporte
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </View>
      )}

      {/* Modal de Detalle de Paradas */}
      <StepDetailModal
        visible={!!selectedStepDetail}
        step={selectedStepDetail}
        onClose={() => setSelectedStepDetail(null)}
      />

      {/* Modal de Subida de Lugar/Experiencia */}
      <ShareExperienceModal
        visible={showUploadModal}
        publishing={publishing}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22 },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  uploadHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  uploadHeaderBtnText: { color: '#FFFFFF', fontSize: 13 },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  segmentBtnActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentBtnText: { fontSize: 12 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { fontSize: 13, marginTop: 12 },
  listContainer: { padding: 16, paddingBottom: 100 },
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  cardTitle: { fontSize: 16, marginBottom: 4 },
  cardDesc: { fontSize: 12, lineHeight: 17 },
  costBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  costBadgeText: { fontSize: 12 },
  stopsContainer: { marginTop: 12 },
  stopsLabel: { fontSize: 11, marginBottom: 8 },
  stopsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    maxWidth: '100%',
  },
  stopNumberCircle: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stopNumberText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  stopNameText: { fontSize: 11 },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  actionBtnSecondaryText: { fontSize: 12 },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionBtnPrimaryText: { color: '#FFFFFF', fontSize: 12 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIconCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, textAlign: 'center', marginBottom: 6 },
  emptySubtitle: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyActionBtnText: { color: '#FFFFFF', fontSize: 13 },
  placeCard: {
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    height: 120,
  },
  placeCardImage: { width: 110, height: '100%' },
  placeCardBody: { flex: 1, padding: 10, justifyContent: 'space-between' },
  placeMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  placeCategory: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  placePrice: { fontSize: 11 },
  placeTitle: { fontSize: 14 },
  placeAddress: { fontSize: 11 },
  placeBottomActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  removePlaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  removePlaceBtnText: { color: '#FF3B30', fontSize: 10 },
  planDateBtn: { paddingHorizontal: 12, paddingVertical: 5 },
  planDateBtnText: { color: '#FFFFFF', fontSize: 10 },
  uploadCard: {
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  uploadCardImage: { width: '100%', height: 160 },
  uploadCardBody: { padding: 14 },
  uploadHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  uploadTitle: { fontSize: 15, flex: 1 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12 },
  uploadDesc: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  locationTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationTagText: { fontSize: 11 },
});
