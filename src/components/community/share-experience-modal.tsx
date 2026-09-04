import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import StarRating from '../ui/star-rating';
import LeafletMap, { MapClickEvent } from '../map/leaflet-map';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useAuth } from '../../context/AuthContext';
import { getItinerariesByUserIdApi, Itinerary } from '../../services/itineraryService';
import { GASTRO_PREFERENCES, BUDGET_OPTIONS } from '../../mocks/community.mock';
import {
  CloseIcon,
  MapPinIcon,
  SearchIcon,
  PhotoIcon,
  PlusIcon,
  StarIcon,
  UtensilsIcon,
  TagIcon,
  RefreshIcon,
  CheckIcon,
} from '../ui/icons';

export interface CreateExperiencePayload {
  title: string;
  place: string;
  location: string;
  latitude?: number;
  longitude?: number;
  selectedGastro: string[];
  budget: string;
  imageUrl?: string;
  imageUrls: string[];
  reviewText: string;
  rating: number;
  selectedItineraryId?: string;
}

interface ShareExperienceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateExperiencePayload) => Promise<void>;
  publishing?: boolean;
}

export default function ShareExperienceModal({
  visible,
  onClose,
  onSubmit,
  publishing = false,
}: ShareExperienceModalProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const { user } = useAuth();
  const userLoc = useUserLocation();

  // Form states
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [location, setLocation] = useState('');
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [selectedGastro, setSelectedGastro] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>('$$');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [userItineraries, setUserItineraries] = useState<Itinerary[]>([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string>('');
  const [loadingItineraries, setLoadingItineraries] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Suggestions & autocomplete
  const [placeSuggestions, setPlaceSuggestions] = useState<
    { name: string; address: string; lat: number; lng: number }[]
  >([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const searchTimeoutRef = React.useRef<any>(null);

  // Sincronizar ubicación real cada vez que el modal se abre
  useEffect(() => {
    if (visible) {
      if (userLoc.formattedAddress) {
        setLocation(userLoc.formattedAddress);
      }
      if (userLoc.lat && userLoc.lng) {
        setPickedCoords({ lat: userLoc.lat, lng: userLoc.lng });
      }

      if (user?.id) {
        setLoadingItineraries(true);
        getItinerariesByUserIdApi(user.id)
          .then((itins) => {
            if (itins && itins.length > 0) {
              setUserItineraries(itins);
              setSelectedItineraryId(itins[0].id);
              if (!title) {
                setTitle(itins[0].title);
              }
            }
          })
          .catch((err) => console.warn('Error cargando itinerarios:', err))
          .finally(() => setLoadingItineraries(false));
      }
    }
  }, [visible, user?.id, userLoc.formattedAddress, userLoc.lat, userLoc.lng]);

  // Actualizar a la ubicación actual detectada
  const handleUseCurrentLocation = async () => {
    setDetectingGps(true);
    try {
      await userLoc.requestUserLocation();
      if (userLoc.formattedAddress) {
        setLocation(userLoc.formattedAddress);
      }
      if (userLoc.lat && userLoc.lng) {
        setPickedCoords({ lat: userLoc.lat, lng: userLoc.lng });
      }
    } catch (e) {
      console.warn('Error detectando ubicación:', e);
    } finally {
      setDetectingGps(false);
    }
  };

  const handlePlaceChange = (text: string) => {
    setPlace(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (text.trim().length >= 3) {
      setIsSearchingPlaces(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const lat = pickedCoords?.lat ?? userLoc.lat;
          const lng = pickedCoords?.lng ?? userLoc.lng;
          const delta = 0.4;
          const viewbox = `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              text.trim()
            )}&viewbox=${viewbox}&limit=6&addressdetails=1`
          );

          if (res.ok) {
            const data = await res.json();
            const suggestions = (data || []).map((item: any) => ({
              name: item.name || item.display_name.split(',')[0],
              address: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            }));
            setPlaceSuggestions(suggestions);
          }
        } catch (e) {
          console.warn('Error en búsqueda de lugar:', e);
        } finally {
          setIsSearchingPlaces(false);
        }
      }, 300);
    } else {
      setPlaceSuggestions([]);
      setIsSearchingPlaces(false);
    }
  };

  const handleSelectSuggestion = (s: { name: string; address: string; lat: number; lng: number }) => {
    setPlace(s.name);
    setLocation(s.address);
    setPickedCoords({ lat: s.lat, lng: s.lng });
    setPlaceSuggestions([]);
  };

  const handleMapClick = async (e: MapClickEvent) => {
    setPickedCoords({ lat: e.lat, lng: e.lng });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.lat}&lon=${e.lng}&zoom=18&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        const amenityName = data.name || data.address?.amenity || data.address?.shop || data.address?.tourism;
        const road = data.address?.road || '';
        const suburb = data.address?.suburb || data.address?.neighbourhood || '';
        const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.county || '';
        const state = data.address?.state || '';
        const formatted = data.display_name || [road, suburb, city, state].filter(Boolean).join(', ');
        setLocation(formatted || `${city}${state ? `, ${state}` : ''}`);
        if (!place && amenityName) {
          setPlace(amenityName);
        }
      } else {
        setLocation(`Coordenadas (${e.lat.toFixed(4)}, ${e.lng.toFixed(4)})`);
      }
    } catch {
      setLocation(`Coordenadas (${e.lat.toFixed(4)}, ${e.lng.toFixed(4)})`);
    }
  };

  const toggleGastro = (pref: string) => {
    setSelectedGastro((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  // Subir múltiples fotos de la experiencia
  const handlePickImages = async () => {
    if (selectedImages.length >= 5) {
      Alert.alert('Límite alcanzado', 'Puedes subir un máximo de 5 fotografías por experiencia.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a tus fotos.');
      return;
    }

    const remainingLimit = 5 - selectedImages.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remainingLimit,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = result.assets.map((asset) =>
        asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri
      );
      setSelectedImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Falta información', 'Por favor ingresa un título para la cita.');
      return;
    }

    await onSubmit({
      title: title.trim(),
      place: place.trim() || title.trim(),
      location: location.trim() || userLoc.formattedAddress || 'Ubicación seleccionada',
      latitude: pickedCoords?.lat ?? userLoc.lat,
      longitude: pickedCoords?.lng ?? userLoc.lng,
      selectedGastro,
      budget,
      imageUrl: selectedImages.length > 0 ? selectedImages[0] : '',
      imageUrls: selectedImages,
      reviewText: review.trim(),
      rating,
      selectedItineraryId: selectedItineraryId || undefined,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalRoot, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        {/* Header Rediseñado: Solo botón de cerrar y título, SIN botón duplicado arriba a la derecha */}
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <CloseIcon size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            Compartir Experiencia
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.formScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Selector de Itinerarios (si el usuario tiene guardados) */}
          {userItineraries.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.labelRow}>
                <CheckIcon size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Vincular a un Itinerario
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itinerariesRow}>
                {userItineraries.map((itin) => {
                  const isSelected = selectedItineraryId === itin.id;
                  return (
                    <TouchableOpacity
                      key={itin.id}
                      style={[
                        styles.itineraryChip,
                        {
                          backgroundColor: isSelected ? colors.primary + '14' : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: borderRadius.md,
                        },
                      ]}
                      onPress={() => {
                        setSelectedItineraryId(itin.id);
                        if (!title) setTitle(itin.title);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.itineraryChipTitle,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontFamily: typography.fonts.bold,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {itin.title}
                      </Text>
                      <Text style={[styles.itineraryChipMeta, { color: colors.textSecondary }]}>
                        {itin.items?.length || 0} paradas
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Título de la Cita */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
              Título de la experiencia *
            </Text>
            <TextInput
              style={[
                styles.inputField,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  borderRadius: borderRadius.md,
                  fontFamily: typography.fonts.regular,
                },
              ]}
              placeholder="Ej. Tarde de cócteles y pasta artesanal"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Galería de Fotos Múltiples */}
          <View style={styles.inputGroup}>
            <View style={styles.labelWithCounter}>
              <View style={styles.labelRow}>
                <PhotoIcon size={14} color={colors.textSecondary} />
                <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                  Fotografías de la cita
                </Text>
              </View>
              <Text style={[styles.counterText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                {selectedImages.length}/5 fotos
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}
            >
              {/* Botón para añadir foto */}
              {selectedImages.length < 5 && (
                <TouchableOpacity
                  style={[
                    styles.addPhotoCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                  onPress={handlePickImages}
                  activeOpacity={0.8}
                >
                  <PlusIcon size={20} color={colors.primary} />
                  <Text style={[styles.addPhotoText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                    Añadir fotos
                  </Text>
                </TouchableOpacity>
              )}

              {/* Miniaturas de imágenes seleccionadas */}
              {selectedImages.map((uri, idx) => (
                <View key={idx} style={styles.photoThumbWrapper}>
                  <Image
                    source={{ uri }}
                    style={[styles.photoThumb, { borderRadius: borderRadius.md }]}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={[styles.removeThumbBtn, { borderRadius: borderRadius.round }]}
                    activeOpacity={0.8}
                    onPress={() => handleRemoveImage(idx)}
                  >
                    <CloseIcon size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Nombre del Lugar con Búsqueda */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <SearchIcon size={14} color={colors.textSecondary} />
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Lugar o establecimiento
              </Text>
              {isSearchingPlaces && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 6 }} />}
            </View>

            <TextInput
              style={[
                styles.inputField,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  borderRadius: borderRadius.md,
                  fontFamily: typography.fonts.regular,
                },
              ]}
              placeholder="Ej. Terraza Luna Bar & Bistro"
              placeholderTextColor={colors.textSecondary}
              value={place}
              onChangeText={handlePlaceChange}
            />

            {/* Dropdown de Sugerencias */}
            {placeSuggestions.length > 0 && (
              <View
                style={[
                  styles.suggestionsDropdown,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                {placeSuggestions.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.suggestionItem,
                      { borderBottomColor: colors.border },
                      idx === placeSuggestions.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectSuggestion(s)}
                  >
                    <MapPinIcon size={14} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.suggestionTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                        {s.name}
                      </Text>
                      <Text
                        style={[styles.suggestionAddress, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}
                        numberOfLines={1}
                      >
                        {s.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Ubicación Geográfica Corregida */}
          <View style={styles.inputGroup}>
            <View style={styles.labelWithCounter}>
              <View style={styles.labelRow}>
                <MapPinIcon size={14} color={colors.textSecondary} />
                <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                  Ubicación exacta en el mapa
                </Text>
              </View>

              <TouchableOpacity
                style={styles.useGpsBtn}
                onPress={handleUseCurrentLocation}
                activeOpacity={0.7}
              >
                {detectingGps ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <RefreshIcon size={11} color={colors.primary} />
                    <Text style={[styles.useGpsText, { color: colors.primary, fontFamily: typography.fonts.medium }]}>
                      Mi ubicación actual
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.locationCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                },
              ]}
            >
              {/* Miniatura interactiva de Leaflet */}
              <TouchableOpacity
                style={styles.mapCanvasWrapper}
                activeOpacity={0.9}
                onPress={() => setShowMapPickerModal(true)}
              >
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                  <LeafletMap
                    waypoints={[
                      {
                        lat: pickedCoords?.lat ?? userLoc.lat,
                        lng: pickedCoords?.lng ?? userLoc.lng,
                        title: title || 'Lugar de la Cita',
                        placeName: location || userLoc.formattedAddress || 'Ubicación seleccionada',
                        stepNumber: 1,
                      },
                    ]}
                    showRoutingMachine={false}
                    showGeocoder={false}
                    userLocation={{
                      lat: pickedCoords?.lat ?? userLoc.lat,
                      lng: pickedCoords?.lng ?? userLoc.lng,
                    }}
                    isDark={isDark}
                  />
                </View>

                <View style={[styles.openMapBadge, { borderRadius: borderRadius.round }]}>
                  <MapPinIcon size={13} color="#FFFFFF" />
                  <Text style={[styles.openMapBadgeText, { fontFamily: typography.fonts.bold }]}>
                    Cambiar punto en el mapa
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Fila con el texto de la dirección seleccionada */}
              <View style={styles.addressSummaryRow}>
                <MapPinIcon size={14} color={colors.primary} />
                <Text
                  style={[styles.addressSummaryText, { color: colors.text, fontFamily: typography.fonts.medium }]}
                  numberOfLines={2}
                >
                  {location || userLoc.formattedAddress || 'Ubicación seleccionada'}
                </Text>
              </View>
            </View>
          </View>

          {/* Categorías Gastronómicas / Vibe */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <UtensilsIcon size={14} color={colors.textSecondary} />
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Categorías gastronómicas
              </Text>
            </View>

            <View style={styles.gastroGrid}>
              {GASTRO_PREFERENCES.map((pref) => {
                const isSelected = selectedGastro.includes(pref);
                return (
                  <TouchableOpacity
                    key={pref}
                    style={[
                      styles.gastroChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: borderRadius.round,
                      },
                    ]}
                    onPress={() => toggleGastro(pref)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.gastroChipText,
                        {
                          color: isSelected ? colors.primaryContrast : colors.text,
                          fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium,
                        },
                      ]}
                    >
                      {pref}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Presupuesto */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <TagIcon size={14} color={colors.textSecondary} />
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Rango de presupuesto aproximado
              </Text>
            </View>

            <View style={styles.budgetRow}>
              {BUDGET_OPTIONS.map((opt) => {
                const isSelected = budget === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.budgetChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                    onPress={() => setBudget(opt.id)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.budgetChipText,
                        {
                          color: isSelected ? colors.primaryContrast : colors.text,
                          fontFamily: typography.fonts.bold,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Calificación */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <StarIcon size={14} color="#FFD700" fill="#FFD700" />
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Calificación de la experiencia
              </Text>
            </View>

            <View style={styles.ratingBox}>
              <StarRating rating={rating} onRatingChange={setRating} />
            </View>
          </View>

          {/* Reseña y Consejos */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
              Reseña y consejos para otras parejas
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  borderRadius: borderRadius.md,
                  fontFamily: typography.fonts.regular,
                },
              ]}
              placeholder="Cuenta qué tal el ambiente, si conviene reservar, qué platillo o cóctel pedir..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={review}
              onChangeText={setReview}
            />
          </View>

          {/* Botón Principal y ÚNICO de Publicar */}
          <TouchableOpacity
            style={[
              styles.primarySubmitBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.lg,
              },
            ]}
            activeOpacity={0.88}
            onPress={handleFormSubmit}
            disabled={publishing}
          >
            {publishing ? (
              <ActivityIndicator size="small" color={colors.primaryContrast} />
            ) : (
              <Text style={[styles.primarySubmitBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                Publicar Experiencia
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Modal de Mapa Pantalla Completa para Ajustar Coordenadas */}
        <Modal visible={showMapPickerModal} animationType="slide" onRequestClose={() => setShowMapPickerModal(false)}>
          <SafeAreaView style={[styles.modalRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowMapPickerModal(false)} style={styles.closeBtn}>
                <Text style={{ color: colors.primary, fontFamily: typography.fonts.bold }}>Listo</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Seleccionar Ubicación
              </Text>
              <View style={styles.headerSpacer} />
            </View>
            <View style={{ flex: 1 }}>
              <LeafletMap
                waypoints={[]}
                showRoutingMachine={false}
                showGeocoder={true}
                userLocation={{
                  lat: pickedCoords?.lat ?? userLoc.lat,
                  lng: pickedCoords?.lng ?? userLoc.lng,
                }}
                isDark={isDark}
                onMapClick={(e: MapClickEvent) => handleMapClick(e)}
              />
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 17,
  },
  headerSpacer: {
    width: 32,
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  labelWithCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 13,
  },
  counterText: {
    fontSize: 11,
  },
  inputField: {
    fontSize: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  textArea: {
    fontSize: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  itinerariesRow: {
    gap: 10,
    paddingVertical: 4,
  },
  itineraryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    minWidth: 140,
  },
  itineraryChipTitle: {
    fontSize: 13,
    marginBottom: 2,
  },
  itineraryChipMeta: {
    fontSize: 11,
  },
  photosScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  addPhotoCard: {
    width: 105,
    height: 105,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPhotoText: {
    fontSize: 11,
  },
  photoThumbWrapper: {
    position: 'relative',
    width: 105,
    height: 105,
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  removeThumbBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  suggestionsDropdown: {
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  suggestionTitle: {
    fontSize: 13,
  },
  suggestionAddress: {
    fontSize: 11,
  },
  useGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  useGpsText: {
    fontSize: 11,
  },
  locationCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  mapCanvasWrapper: {
    height: 150,
    position: 'relative',
  },
  openMapBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  openMapBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  addressSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addressSummaryText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  gastroGrid: {
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
  budgetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  budgetChip: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
  },
  budgetChipText: {
    fontSize: 12,
  },
  ratingBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  primarySubmitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  primarySubmitBtnText: {
    fontSize: 14,
  },
});
