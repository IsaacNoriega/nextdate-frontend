import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import CommunityCard from '../../components/community/community-card';
import StarRating from '../../components/ui/star-rating';
import { getSharedExperiencesApi, shareExperienceApi } from '../../services/communityService';
import LeafletMap, { MapClickEvent } from '../../components/map/leaflet-map';
import { useUserLocation } from '../../hooks/useUserLocation';

type FeedCategory = 'ALL' | 'ROMANTIC' | 'OUTDOOR' | 'GASTRO' | 'CULTURE';

const GASTRO_PREFERENCES = [
  'Italiana & Pasta',
  'Mexicana & Tacos',
  'Sushi & Asiática',
  'Cocteles & Bar',
  'Postres & Café',
  'Cortes de Carne',
  'Mariscos',
  'Vegetariana/Vegana',
  'Comida Fusión',
  'Brunch & Hamburguesas',
];

const BUDGET_OPTIONS = [
  { id: '$', label: '$ Económico', desc: '< $300 MXN' },
  { id: '$$', label: '$$ Moderado', desc: '$300 - $700 MXN' },
  { id: '$$$', label: '$$$ Elevado', desc: '$700 - $1,500 MXN' },
  { id: '$$$$', label: '$$$$ Lujo', desc: '> $1,500 MXN' },
];

const DEFAULT_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=80',
];

interface SharedExperience {
  id: string;
  authorName: string;
  partnerName: string;
  authorAvatar: string;
  timeAgo: string;
  planTitle: string;
  placeName: string;
  location?: string;
  budget?: string;
  gastroTags?: string[];
  rating: number;
  likesCount: number;
  commentsCount: number;
  imageUrl: string;
  reviewText: string;
  category: FeedCategory;
}

const FEED_CATEGORIES: { id: FeedCategory; label: string }[] = [
  { id: 'ALL', label: 'Todas' },
  { id: 'ROMANTIC', label: 'Románticas' },
  { id: 'OUTDOOR', label: 'Naturaleza' },
  { id: 'GASTRO', label: 'Gastronomía' },
  { id: 'CULTURE', label: 'Cultura' },
];

export default function CommunityScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const userLoc = useUserLocation();

  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>('ALL');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [experiencesList, setExperiencesList] = useState<SharedExperience[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (userLoc.formattedAddress && !newLocation) {
      setNewLocation(userLoc.formattedAddress);
    }
  }, [userLoc.formattedAddress]);

  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [pinCoords, setPinCoords] = useState<{ topPct: number; leftPct: number }>({ topPct: 45, leftPct: 50 });
  const [newSelectedGastro, setNewSelectedGastro] = useState<string[]>([]);
  const [newBudget, setNewBudget] = useState<string>('$$');
  const [selectedImage, setSelectedImage] = useState<string>(DEFAULT_PRESET_IMAGES[0]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function loadExperiences() {
      setLoading(true);
      try {
        const apiData = await getSharedExperiencesApi();
        if (apiData && apiData.length > 0) {
          const mapped: SharedExperience[] = apiData.map((exp: any) => ({
            id: exp.id,
            authorName: 'Pareja NextDate',
            partnerName: 'Pareja',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            timeAgo: 'Hace un momento',
            planTitle: exp.title,
            placeName: exp.itinerary ? exp.itinerary.title : 'Cita Romántica',
            rating: exp.rating || 5,
            likesCount: 12,
            commentsCount: 2,
            imageUrl: (exp.imageUrls && exp.imageUrls.length > 0) ? exp.imageUrls[0] : DEFAULT_PRESET_IMAGES[0],
            reviewText: exp.description || exp.tips || 'Una gran experiencia en pareja.',
            category: 'ROMANTIC'
          }));
          setExperiencesList(mapped);
        } else {
          setExperiencesList([]);
        }
      } catch (err) {
        setExperiencesList([]);
      } finally {
        setLoading(false);
      }
    }
    loadExperiences();
  }, []);

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleGastroPreference = (pref: string) => {
    if (newSelectedGastro.includes(pref)) {
      setNewSelectedGastro(newSelectedGastro.filter((item) => item !== pref));
    } else {
      setNewSelectedGastro([...newSelectedGastro, pref]);
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        if (Platform.OS !== 'web') {
          Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para subir una imagen de la cita.');
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Error seleccionando imagen:', err);
    }
  };

  const handlePublishExperience = async () => {
    if (!newTitle.trim()) {
      if (Platform.OS !== 'web') {
        Alert.alert('Falta información', 'Por favor ingresa un título para la cita.');
      }
      return;
    }

    setPublishing(true);
    const finalPlace = newPlace.trim() || 'Lugar recomendado';
    const finalLocation = newLocation.trim() ? `${finalPlace} (${newLocation.trim()})` : finalPlace;

    try {
      await shareExperienceApi({
        userId: '00000000-0000-0000-0000-000000000001',
        itineraryId: '00000000-0000-0000-0000-000000000001',
        title: newTitle.trim(),
        description: newReview.trim() || undefined,
        tips: finalLocation,
        actualCost: newBudget === '$' ? 250 : newBudget === '$$' ? 500 : newBudget === '$$$' ? 1000 : 2000,
        rating: newRating,
        imageUrls: [selectedImage],
      });
    } catch (err) {
      console.log('Fallo API, publicando localmente:', err);
    } finally {
      const newExp: SharedExperience = {
        id: `exp-${Date.now()}`,
        authorName: 'Tú',
        partnerName: 'Pareja',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        timeAgo: 'Ahora mismo',
        planTitle: newTitle.trim(),
        placeName: finalPlace,
        location: newLocation.trim() || undefined,
        budget: newBudget,
        gastroTags: newSelectedGastro,
        rating: newRating,
        likesCount: 1,
        commentsCount: 0,
        imageUrl: selectedImage,
        reviewText: newReview.trim() || 'Excelente experiencia.',
        category: 'ROMANTIC',
      };

      setExperiencesList((prev) => [newExp, ...prev]);
      setPublishing(false);
      setShowShareModal(false);

      // Reset Form
      setNewTitle('');
      setNewPlace('');
      setNewLocation('');
      setNewSelectedGastro([]);
      setNewBudget('$$');
      setSelectedImage(DEFAULT_PRESET_IMAGES[0]);
      setNewReview('');
      setNewRating(5);
    }
  };

  const filteredExperiences = experiencesList.filter((exp) => {
    return selectedCategory === 'ALL' || exp.category === selectedCategory;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.mainWrapper}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Comunidad
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
              Experiencia e historias reales de parejas
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.shareBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.round }]}
            activeOpacity={0.88}
            onPress={() => setShowShareModal(true)}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2.5}>
              <Path d="M12 5v14M5 12h14" />
            </Svg>
            <Text style={[styles.shareBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
              Publicar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtro Horizontal de Categorías */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {FEED_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const strokeColor = isSelected ? colors.primaryContrast : colors.text;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.round
                    }
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ marginRight: 6 }}>
                    {cat.id === 'ALL' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </Svg>
                    )}
                    {cat.id === 'ROMANTIC' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </Svg>
                    )}
                    {cat.id === 'OUTDOOR' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                        <Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                      </Svg>
                    )}
                    {cat.id === 'GASTRO' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
                      </Svg>
                    )}
                    {cat.id === 'CULTURE' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
                      </Svg>
                    )}
                  </View>
                  <Text style={[
                    styles.categoryChipText,
                    { color: isSelected ? colors.primaryContrast : colors.text, fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Feed */}
        <FlatList
          data={filteredExperiences}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedScroll}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isLiked = !!likedPosts[item.id];
            const isSaved = !!savedPosts[item.id];

            return (
              <CommunityCard
                authorName={item.authorName}
                partnerName={item.partnerName}
                authorAvatar={item.authorAvatar}
                timeAgo={item.timeAgo}
                planTitle={item.planTitle}
                placeName={item.location ? `${item.placeName} • ${item.location}` : item.placeName}
                rating={item.rating}
                likesCount={item.likesCount}
                commentsCount={item.commentsCount}
                imageUrl={item.imageUrl}
                reviewText={item.reviewText}
                isLiked={isLiked}
                isSaved={isSaved}
                onToggleLike={() => toggleLike(item.id)}
                onToggleSave={() => toggleSave(item.id)}
              />
            );
          }}
        />

      </View>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowShareModal(false)}
      >
        <SafeAreaView style={[styles.modalArea, { backgroundColor: colors.background }]}>
          <View style={{ flex: 1 }}>
            
            {/* Modal TopBar Header */}
            <View style={styles.modalTopBar}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.modalIconBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                    <Path d="M12 5v14M5 12h14" />
                  </Svg>
                </View>
                <Text style={[styles.modalTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Compartir cita
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.modalCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}
                activeOpacity={0.8}
                onPress={() => setShowShareModal(false)}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.5}>
                  <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              
              {/* Título de la cita */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Título de la cita *
              </Text>
              <TextInput
                style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                placeholder="Ej. Aniversario en Terraza Luna..."
                placeholderTextColor={colors.textSecondary}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Imagen de la cita (Imagen de galería o URL) */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
                Foto de la cita 📸
              </Text>
              
              <View style={[styles.imageUploadCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                {selectedImage ? (
                  <View style={styles.imagePreviewWrap}>
                    <Image source={{ uri: selectedImage }} style={[styles.previewImage, { borderRadius: borderRadius.md }]} />
                    <TouchableOpacity 
                      style={styles.changeImageOverlayBtn}
                      activeOpacity={0.85}
                      onPress={handlePickImage}
                    >
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={2}>
                        <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <Path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                      </Svg>
                      <Text style={[styles.changeImageText, { fontFamily: typography.fonts.bold }]}>
                        Cambiar foto
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.uploadPlaceholder}
                    activeOpacity={0.8}
                    onPress={handlePickImage}
                  >
                    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </Svg>
                    <Text style={[styles.uploadPlaceholderText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                      Seleccionar foto desde la galería
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Fotos prediseñadas rápidas */}
                <View style={styles.presetSection}>
                  <Text style={[styles.presetTitle, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    O elige una de nuestras imágenes:
                  </Text>
                  <View style={styles.presetGrid}>
                    {DEFAULT_PRESET_IMAGES.map((imgUrl, idx) => (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.8}
                        onPress={() => setSelectedImage(imgUrl)}
                        style={[
                          styles.presetThumbWrap,
                          {
                            borderColor: selectedImage === imgUrl ? colors.primary : 'transparent',
                            borderRadius: borderRadius.md,
                          }
                        ]}
                      >
                        <Image source={{ uri: imgUrl }} style={styles.presetThumb} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Nombre del Lugar */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
                Lugar visitado 📍
              </Text>
              <TextInput
                style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                placeholder="Ej. Terraza Luna Gastro Bar"
                placeholderTextColor={colors.textSecondary}
                value={newPlace}
                onChangeText={setNewPlace}
              />

              {/* Ubicación con Mapa Interactivo */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
                Ubicación exacta en el mapa 🗺️
              </Text>

              <View style={[styles.mapPickerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                {/* Mini Mapa Interactivo */}
                <TouchableOpacity 
                  style={styles.miniMapCanvas} 
                  activeOpacity={0.92}
                  onPress={() => setShowMapPickerModal(true)}
                >
                  <Svg style={StyleSheet.absoluteFill}>
                    <Path d="M-20,60 Q120,90 260,50 T400,100" fill="none" stroke={colors.primary} strokeWidth="12" strokeOpacity="0.15" />
                    <Line x1="10%" y1="30%" x2="90%" y2="30%" stroke={isDark ? '#2C2C2E' : '#E5E5EA'} strokeWidth="2" />
                    <Line x1="10%" y1="70%" x2="90%" y2="70%" stroke={isDark ? '#2C2C2E' : '#E5E5EA'} strokeWidth="2" />
                    <Line x1="35%" y1="5%" x2="35%" y2="95%" stroke={isDark ? '#2C2C2E' : '#E5E5EA'} strokeWidth="2" />
                    <Line x1="68%" y1="5%" x2="68%" y2="95%" stroke={isDark ? '#2C2C2E' : '#E5E5EA'} strokeWidth="2" />
                  </Svg>

                  {/* Pin interactivo en el mapa */}
                  <View style={styles.miniMapPinWrap}>
                    <View style={[styles.miniMapPin, { backgroundColor: colors.primary }]}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FFF">
                        <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      </Svg>
                    </View>
                    <View style={styles.miniMapPinShadow} />
                  </View>

                  <View style={styles.miniMapOverlayBtn}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={2}>
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </Svg>
                    <Text style={[styles.miniMapOverlayText, { fontFamily: typography.fonts.bold }]}>
                      Tocar para abrir mapa
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Ubicación Seleccionada Info */}
                <View style={styles.selectedLocationRow}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  </Svg>
                  <Text style={[styles.selectedLocationText, { color: colors.text, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
                    {newLocation || userLoc.formattedAddress || 'Detectando ubicación...'}
                  </Text>
                </View>

                {/* Ubicaciones sugeridas basadas en la posición del usuario */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mapHotspotsScroll}>
                  {[
                    userLoc.formattedAddress || 'Mi ubicación',
                    `${userLoc.city || 'Centro'}, Zona Centro`,
                    `${userLoc.city || 'Ciudad'} Norte`,
                    `${userLoc.city || 'Ciudad'} Sur`,
                  ].filter(Boolean).map((zone) => {
                    const isSelected = newLocation === zone;
                    return (
                      <TouchableOpacity
                        key={zone}
                        activeOpacity={0.8}
                        onPress={() => setNewLocation(zone)}
                        style={[
                          styles.hotspotChip,
                          {
                            backgroundColor: isSelected ? colors.primary + '20' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderRadius: borderRadius.round,
                          }
                        ]}
                      >
                        <Text style={[styles.hotspotChipText, { color: isSelected ? colors.primary : colors.text, fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium }]}>
                          📍 {zone}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Preferencias Gastronómicas */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
                Preferencias gastronómicas / Estilo
              </Text>
              <View style={styles.gastroChipsGrid}>
                {GASTRO_PREFERENCES.map((pref) => {
                  const isSelected = newSelectedGastro.includes(pref);
                  return (
                    <TouchableOpacity
                      key={pref}
                      activeOpacity={0.8}
                      onPress={() => toggleGastroPreference(pref)}
                      style={[
                        styles.gastroChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: borderRadius.round,
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.gastroChipText,
                          {
                            color: isSelected ? colors.primaryContrast : colors.text,
                            fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium,
                          }
                        ]}
                      >
                        {pref}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Presupuesto */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
                Presupuesto aprox.
              </Text>
              <View style={styles.budgetRow}>
                {BUDGET_OPTIONS.map((b) => {
                  const isSelected = newBudget === b.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      activeOpacity={0.8}
                      onPress={() => setNewBudget(b.id)}
                      style={[
                        styles.budgetCard,
                        {
                          backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: borderRadius.md,
                        }
                      ]}
                    >
                      <Text style={[styles.budgetLabel, { color: isSelected ? colors.primary : colors.text, fontFamily: typography.fonts.bold }]}>
                        {b.id}
                      </Text>
                      <Text style={[styles.budgetDesc, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                        {b.desc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Reseña o Historia */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
                Reseña o experiencia ✍️
              </Text>
              <TextInput
                style={[styles.inputField, styles.textAreaField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                placeholder="¿Qué platillos recomiendan? ¿Cómo fue el ambiente o servicio?"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={newReview}
                onChangeText={setNewReview}
              />

              {/* Calificación */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
                Calificación general
              </Text>
              <View style={[styles.starRatingWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                <StarRating
                  rating={newRating}
                  onRatingChange={setNewRating}
                />
              </View>

              {/* Publicar CTA */}
              <TouchableOpacity 
                style={[styles.publishBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                activeOpacity={0.9}
                onPress={handlePublishExperience}
              >
                {publishing ? (
                  <ActivityIndicator color={colors.primaryContrast} />
                ) : (
                  <Text style={[styles.publishBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    Publicar cita en la comunidad
                  </Text>
                )}
              </TouchableOpacity>

            </ScrollView>

          </View>
        </SafeAreaView>
      </Modal>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPickerModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMapPickerModal(false)}
      >
        <SafeAreaView style={[styles.modalArea, { backgroundColor: colors.background }]}>
          <View style={{ flex: 1 }}>
            
            {/* Top Bar Header */}
            <View style={styles.modalTopBar}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.modalIconBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  </Svg>
                </View>
                <Text style={[styles.modalTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Selecciona la Ubicación
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.modalCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}
                activeOpacity={0.8}
                onPress={() => setShowMapPickerModal(false)}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.5}>
                  <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Instruction Banner */}
            <View style={[styles.mapPickerBanner, { backgroundColor: colors.primary + '15' }]}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                <Path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              </Svg>
              <Text style={[styles.mapPickerBannerText, { color: colors.primary, fontFamily: typography.fonts.medium }]}>
                Toca cualquier punto en el mapa para colocar el pin de tu cita 📍
              </Text>
            </View>

            {/* Real Leaflet Map Canvas with Geocoder & Map Click Location Picker */}
            <View style={[styles.fullMapCanvas, { backgroundColor: isDark ? '#0F0F11' : '#F5F5F7' }]}>
              <LeafletMap
                waypoints={
                  pickedCoords
                    ? [
                        {
                          lat: pickedCoords.lat,
                          lng: pickedCoords.lng,
                          title: newTitle || 'Tu Cita',
                          placeName: newLocation || newPlace || 'Ubicación seleccionada',
                          stepNumber: 1,
                        },
                      ]
                    : [
                        {
                          lat: userLoc.lat,
                          lng: userLoc.lng,
                          title: newTitle || 'Tu Cita',
                          placeName: newLocation || userLoc.formattedAddress || 'Tu ubicación',
                          stepNumber: 1,
                        },
                      ]
                }
                showRoutingMachine={false}
                showGeocoder={true}
                userLocation={{ lat: userLoc.lat, lng: userLoc.lng }}
                onMapClick={(e: MapClickEvent) => {
                  setPickedCoords({ lat: e.lat, lng: e.lng });
                  if (e.address) {
                    setNewLocation(e.address);
                  }
                }}
                isDark={isDark}
              />
            </View>

            {/* Selected Spot Bottom Sheet */}
            <View style={[styles.mapPickerFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
              <View style={styles.footerLocRow}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                </Svg>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.footerLocTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {newLocation}
                  </Text>
                  <Text style={[styles.footerLocSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    Ubicación seleccionada para la cita
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.confirmLocationBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                activeOpacity={0.9}
                onPress={() => setShowMapPickerModal(false)}
              >
                <Text style={[styles.confirmLocationBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                  Confirmar esta ubicación
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  shareBtnText: {
    fontSize: 13,
  },
  categoriesSection: {
    marginBottom: 14,
  },
  categoriesScroll: {
    gap: 8,
    paddingRight: 12,
    paddingVertical: 4,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 13,
  },
  feedScroll: {
    paddingBottom: 110,
    gap: 18,
  },

  /* MODAL */
  modalArea: {
    flex: 1,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.select({ android: 24, default: 16 }),
    paddingBottom: 14,
  },
  modalIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleText: {
    fontSize: 20,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  inputField: {
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
  },
  textAreaField: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  /* Image Upload Section */
  imageUploadCard: {
    padding: 12,
    borderWidth: 1,
  },
  imagePreviewWrap: {
    position: 'relative',
    width: '100%',
    height: 180,
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeImageOverlayBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#FFF',
    fontSize: 12,
  },
  uploadPlaceholder: {
    height: 120,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  uploadPlaceholderText: {
    fontSize: 13,
  },
  presetSection: {
    paddingTop: 4,
  },
  presetTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  presetThumbWrap: {
    flex: 1,
    height: 54,
    borderWidth: 2,
    overflow: 'hidden',
  },
  presetThumb: {
    width: '100%',
    height: '100%',
  },

  /* Gastro Chips */
  gastroChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gastroChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  gastroChipText: {
    fontSize: 12,
  },

  /* Budget */
  budgetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  budgetDesc: {
    fontSize: 10,
  },

  starRatingWrap: {
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  publishBtn: {
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnText: {
    fontSize: 15,
  },

  /* MAP PICKER STYLES */
  mapPickerCard: {
    padding: 12,
    borderWidth: 1,
  },
  miniMapCanvas: {
    position: 'relative',
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniMapPinWrap: {
    alignItems: 'center',
  },
  miniMapPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMapPinShadow: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 2,
  },
  miniMapOverlayBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  miniMapOverlayText: {
    color: '#FFF',
    fontSize: 11,
  },
  selectedLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 8,
  },
  selectedLocationText: {
    fontSize: 13,
  },
  mapHotspotsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  hotspotChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  hotspotChipText: {
    fontSize: 11,
  },

  /* FULLSCREEN MAP PICKER MODAL */
  mapPickerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mapPickerBannerText: {
    fontSize: 12,
  },
  fullMapCanvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapZoneBadge: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapZoneText: {
    fontSize: 11,
  },
  placedPinAnchor: {
    position: 'absolute',
    alignItems: 'center',
    width: 100,
    transform: [{ translateX: -50 }, { translateY: -35 }],
  },
  placedPinBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
    elevation: 3,
  },
  placedPinBadgeText: {
    fontSize: 10,
  },
  placedPinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  mapPickerFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  footerLocTitle: {
    fontSize: 15,
  },
  footerLocSub: {
    fontSize: 11,
    marginTop: 1,
  },
  confirmLocationBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLocationBtnText: {
    fontSize: 14,
  },
});

