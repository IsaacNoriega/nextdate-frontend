import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import StarRating from '../ui/star-rating';
import LeafletMap, { MapClickEvent } from '../map/leaflet-map';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useAuth } from '../../context/AuthContext';
import { getItinerariesByUserIdApi, Itinerary } from '../../services/itineraryService';
import {
  GASTRO_PREFERENCES,
  BUDGET_OPTIONS,
  DEFAULT_PRESET_IMAGES,
} from '../../mocks/community.mock';

export interface CreateExperiencePayload {
  title: string;
  place: string;
  location: string;
  selectedGastro: string[];
  budget: string;
  imageUrl: string;
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

  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [location, setLocation] = useState('');
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [selectedGastro, setSelectedGastro] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>('$$');
  const [selectedImage, setSelectedImage] = useState<string>(DEFAULT_PRESET_IMAGES[0]);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [userItineraries, setUserItineraries] = useState<Itinerary[]>([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string>('');
  const [loadingItineraries, setLoadingItineraries] = useState(false);

  useEffect(() => {
    if (visible && user?.id) {
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
        .catch((err) => console.warn('Error loading itineraries for sharing:', err))
        .finally(() => setLoadingItineraries(false));
    }
  }, [visible, user?.id]);

  useEffect(() => {
    if (userLoc.formattedAddress && !location) {
      setLocation(userLoc.formattedAddress);
    }
  }, [userLoc.formattedAddress, location]);

  const toggleGastro = (pref: string) => {
    setSelectedGastro((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleFormSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Falta información', 'Por favor ingresa un título para la cita.');
      return;
    }

    if (!selectedItineraryId && userItineraries.length === 0) {
      Alert.alert(
        'Sin itinerarios',
        'Para compartir una experiencia primero necesitas crear un itinerario en la pestaña de Planificador o IA Concierge.'
      );
      return;
    }

    await onSubmit({
      title: title.trim(),
      place: place.trim(),
      location: location.trim(),
      selectedGastro,
      budget,
      imageUrl: selectedImage,
      reviewText: review.trim(),
      rating,
      selectedItineraryId: selectedItineraryId || userItineraries[0]?.id,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalRoot, { backgroundColor: colors.background }]}>
        {/* Header Modal */}
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2}>
              <Path d="M18 6L6 18M6 6l12 12" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            Compartir Experiencia
          </Text>
          <TouchableOpacity
            style={[styles.publishActionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
            activeOpacity={0.8}
            onPress={handleFormSubmit}
            disabled={publishing}
          >
            {publishing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={[styles.publishActionText, { fontFamily: typography.fonts.bold }]}>
                Publicar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
          {/* Selector de Itinerarios */}
          {userItineraries.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Seleccionar Itinerario a compartir 📋
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {userItineraries.map((itin) => {
                  const isSelected = selectedItineraryId === itin.id;
                  return (
                    <TouchableOpacity
                      key={itin.id}
                      style={[
                        styles.itineraryChip,
                        {
                          backgroundColor: isSelected ? colors.primary + '20' : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: borderRadius.md,
                        },
                      ]}
                      onPress={() => {
                        setSelectedItineraryId(itin.id);
                        if (!title) setTitle(itin.title);
                      }}
                    >
                      <Text
                        style={[
                          styles.itineraryChipTitle,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontFamily: typography.fonts.bold,
                          },
                        ]}
                      >
                        {itin.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        ${itin.totalCost} MXN • {itin.items?.length || 0} lugares
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Título de la Cita */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
            Título de la cita *
          </Text>
          <TextInput
            style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}
            placeholder="Ej. Tarde de Cócteles y Jazz en la Americana"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />

          {/* Imagen de la Cita */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
            Foto de la experiencia 📸
          </Text>
          <View style={[styles.imagePickerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
            {selectedImage ? (
              <View style={styles.imagePreviewWrap}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity style={styles.changeImageOverlay} activeOpacity={0.8} onPress={handlePickImage}>
                  <Text style={[styles.changeImageText, { fontFamily: typography.fonts.bold }]}>
                    Cambiar foto
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadPlaceholder} activeOpacity={0.8} onPress={handlePickImage}>
                <Text style={[styles.uploadPlaceholderText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                  Seleccionar foto desde la galería
                </Text>
              </TouchableOpacity>
            )}

            {/* Presets */}
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
                      },
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
            style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}
            placeholder="Ej. Terraza Luna Gastro Bar"
            placeholderTextColor={colors.textSecondary}
            value={place}
            onChangeText={setPlace}
          />

          {/* Ubicación y Mapa */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
            Ubicación en el mapa 🗺️
          </Text>
          <View style={[styles.mapPickerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
            <TouchableOpacity style={styles.miniMapCanvas} activeOpacity={0.9} onPress={() => setShowMapPickerModal(true)}>
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <LeafletMap
                  waypoints={[
                    {
                      lat: pickedCoords?.lat ?? userLoc.lat,
                      lng: pickedCoords?.lng ?? userLoc.lng,
                      title: title || 'Tu Cita',
                      placeName: location || userLoc.formattedAddress || 'Ubicación actual',
                      stepNumber: 1,
                    },
                  ]}
                  showRoutingMachine={false}
                  showGeocoder={false}
                  userLocation={{ lat: userLoc.lat, lng: userLoc.lng }}
                  isDark={isDark}
                />
              </View>
              <View style={styles.miniMapOverlayBtn}>
                <Text style={[styles.miniMapOverlayText, { fontFamily: typography.fonts.bold }]}>
                  Tocar para abrir mapa interactivo 🗺️
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.selectedLocationRow}>
              <Text style={[styles.selectedLocationText, { color: colors.text, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
                📍 {location || userLoc.formattedAddress || 'Detectando ubicación...'}
              </Text>
            </View>
          </View>

          {/* Preferencias Gastronómicas */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
            Categorías gastronómicas
          </Text>
          <View style={styles.gastroChipsGrid}>
            {GASTRO_PREFERENCES.map((pref) => {
              const isSelected = selectedGastro.includes(pref);
              return (
                <TouchableOpacity
                  key={pref}
                  style={[
                    styles.gastroChip,
                    {
                      backgroundColor: isSelected ? colors.primary + '20' : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.round,
                    },
                  ]}
                  onPress={() => toggleGastro(pref)}
                >
                  <Text style={[styles.gastroChipText, { color: isSelected ? colors.primary : colors.text }]}>
                    {pref}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Presupuesto */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
            Rango de Costo
          </Text>
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
                >
                  <Text style={[styles.budgetChipLabel, { color: isSelected ? '#FFF' : colors.text, fontFamily: typography.fonts.bold }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Calificación */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
            Calificación
          </Text>
          <View style={styles.ratingRow}>
            <StarRating rating={rating} onRatingChange={setRating} />
          </View>


          {/* Reseña / Tips */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold, marginTop: 16 }]}>
            Tu reseña y consejos
          </Text>
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}
            placeholder="Cuenta qué tal estuvo el ambiente, el servicio o qué platillo no perderse..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={review}
            onChangeText={setReview}
          />
        </ScrollView>

        {/* Modal de Mapa Completo */}
        <Modal visible={showMapPickerModal} animationType="slide" onRequestClose={() => setShowMapPickerModal(false)}>
          <SafeAreaView style={[styles.modalRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowMapPickerModal(false)} style={styles.closeBtn}>
                <Text style={{ color: colors.primary, fontFamily: typography.fonts.bold }}>Listo</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Seleccionar Ubicación
              </Text>
              <View style={{ width: 40 }} />
            </View>
            <View style={{ flex: 1 }}>
              <LeafletMap
                waypoints={[]}
                showRoutingMachine={false}
                showGeocoder={true}
                userLocation={{ lat: userLoc.lat, lng: userLoc.lng }}
                isDark={isDark}
                onMapClick={(e: MapClickEvent) => {
                  setPickedCoords({ lat: e.lat, lng: e.lng });
                  setLocation(`Lat: ${e.lat.toFixed(4)}, Lng: ${e.lng.toFixed(4)}`);
                }}
              />
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: 4 },
  modalTitle: { fontSize: 17 },
  publishActionBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  publishActionText: { color: '#FFF', fontSize: 13 },
  formScroll: { padding: 20, paddingBottom: 60 },
  fieldLabel: { fontSize: 13, marginBottom: 8 },
  inputField: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  imagePickerCard: { borderWidth: 1, padding: 12, marginBottom: 4 },
  imagePreviewWrap: { position: 'relative', height: 160, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeImageText: { color: '#FFF', fontSize: 12 },
  uploadPlaceholder: { height: 100, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#888', borderRadius: 12 },
  uploadPlaceholderText: { fontSize: 13 },
  presetSection: { marginTop: 12 },
  presetTitle: { fontSize: 12, marginBottom: 8 },
  presetGrid: { flexDirection: 'row', gap: 8 },
  presetThumbWrap: { width: 56, height: 56, borderWidth: 2, overflow: 'hidden' },
  presetThumb: { width: '100%', height: '100%' },
  mapPickerCard: { borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  miniMapCanvas: { height: 130, position: 'relative' },
  miniMapOverlayBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  miniMapOverlayText: { color: '#FFF', fontSize: 11 },
  selectedLocationRow: { padding: 10 },
  selectedLocationText: { fontSize: 12 },
  gastroChipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gastroChip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  gastroChipText: { fontSize: 12 },
  budgetRow: { flexDirection: 'row', gap: 8 },
  budgetChip: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1 },
  budgetChipLabel: { fontSize: 12 },
  ratingRow: { paddingVertical: 4 },
  textArea: { borderWidth: 1, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 14 },
  itineraryChip: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, minWidth: 160 },
  itineraryChipTitle: { fontSize: 13, marginBottom: 2 },
});
