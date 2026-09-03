import React, { useState, useEffect } from 'react';
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
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import StarRating from '../ui/star-rating';
import LeafletMap, { MapClickEvent } from '../map/leaflet-map';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useAuth } from '../../context/AuthContext';
import { getItinerariesByUserIdApi, Itinerary } from '../../services/itineraryService';
import { GASTRO_PREFERENCES, BUDGET_OPTIONS } from '../../mocks/community.mock';

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
  const [selectedImage, setSelectedImage] = useState<string>('');
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
      Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a tus fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const imagePayload = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setSelectedImage(imagePayload);
    }
  };

  const handleFormSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Falta información', 'Por favor ingresa un título para la cita.');
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
      selectedItineraryId: selectedItineraryId || undefined,
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
            <View style={{ marginBottom: 18 }}>
              <View style={styles.labelWithIcon}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Path d="M9 11l3 3L22 4" />
                  <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </Svg>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                  Seleccionar Itinerario
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
                {userItineraries.map((itin) => {
                  const isSelected = selectedItineraryId === itin.id;
                  return (
                    <TouchableOpacity
                      key={itin.id}
                      style={[
                        styles.itineraryChip,
                        {
                          backgroundColor: isSelected ? colors.primary + '18' : colors.card,
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
                        numberOfLines={1}
                      >
                        {itin.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        ${itin.totalCost.toFixed(2)} USD • {itin.items?.length || 0} paradas
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Título de la Cita */}
          <View style={styles.inputSection}>
            <View style={styles.labelWithIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                <Path d="M12 20h9" />
                <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </Svg>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Título de la cita *
              </Text>
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
              placeholder="Ej. Tarde de Cócteles y Jazz"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Foto de la Experiencia (Solo subida propia) */}
          <View style={styles.inputSection}>
            <View style={styles.labelWithIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <Circle cx="12" cy="13" r="4" />
              </Svg>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Foto de la experiencia
              </Text>
            </View>

            <View
              style={[
                styles.imagePickerCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                },
              ]}
            >
              {selectedImage ? (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
                  <View style={styles.previewActionRow}>
                    <TouchableOpacity
                      style={[styles.actionBadgeBtn, { backgroundColor: colors.primary }]}
                      activeOpacity={0.85}
                      onPress={handlePickImage}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={2.2}>
                        <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <Circle cx="12" cy="13" r="4" />
                      </Svg>
                      <Text style={[styles.actionBadgeText, { fontFamily: typography.fonts.bold }]}>
                        Cambiar foto
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBadgeBtn, { backgroundColor: '#FF3B30' }]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedImage('')}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={2.2}>
                        <Path d="M18 6L6 18M6 6l12 12" />
                      </Svg>
                      <Text style={[styles.actionBadgeText, { fontFamily: typography.fonts.bold }]}>
                        Quitar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadBox, { borderColor: colors.border }]}
                  activeOpacity={0.8}
                  onPress={handlePickImage}
                >
                  <View style={[styles.uploadIconCircle, { backgroundColor: colors.primary + '15' }]}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <Path d="M17 8l-5-5-5 5" />
                      <Path d="M12 3v12" />
                    </Svg>
                  </View>
                  <Text style={[styles.uploadTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Subir foto desde la galería
                  </Text>
                  <Text style={[styles.uploadSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    Formato PNG o JPG en alta resolución
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Nombre del Lugar */}
          <View style={styles.inputSection}>
            <View style={styles.labelWithIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <Circle cx="12" cy="10" r="3" />
              </Svg>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Lugar visitado
              </Text>
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
              placeholder="Ej. Terraza Luna Gastro Bar"
              placeholderTextColor={colors.textSecondary}
              value={place}
              onChangeText={setPlace}
            />
          </View>

          {/* Ubicación y Mapa */}
          <View style={styles.inputSection}>
            <View style={styles.labelWithIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                <Path d="M8 2v16" />
                <Path d="M16 6v16" />
              </Svg>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Ubicación geográfica
              </Text>
            </View>

            <View
              style={[
                styles.mapPickerCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                },
              ]}
            >
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
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={2}>
                    <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                  </Svg>
                  <Text style={[styles.miniMapOverlayText, { fontFamily: typography.fonts.bold }]}>
                    Abrir mapa interactivo
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.selectedLocationRow}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <Circle cx="12" cy="10" r="3" />
                </Svg>
                <Text style={[styles.selectedLocationText, { color: colors.text, fontFamily: typography.fonts.medium }]} numberOfLines={1}>
                  {location || userLoc.formattedAddress || 'Detectando ubicación...'}
                </Text>
              </View>
            </View>
          </View>

          {/* Preferencias Gastronómicas */}
          <View style={styles.inputSection}>
            <View style={styles.labelWithIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                <Path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <Path d="M6 1v3" />
                <Path d="M10 1v3" />
                <Path d="M14 1v3" />
              </Svg>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Categorías gastronómicas
              </Text>
            </View>

            <View style={styles.gastroChipsGrid}>
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
                  >
                    <Text
                      style={[
                        styles.gastroChipText,
                        {
                          color: isSelected ? colors.primaryContrast : colors.text,
                          fontFamily: typography.fonts.medium,
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
          <View style={styles.inputSection}>
            <View style={styles.labelWithIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                <Path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </Svg>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Rango de Costo
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
                  >
                    <Text
                      style={[
                        styles.budgetChipLabel,
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
          <View style={styles.inputSection}>
            <View style={styles.labelWithIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth={1}>
                <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </Svg>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Calificación
              </Text>
            </View>

            <View style={styles.ratingRow}>
              <StarRating rating={rating} onRatingChange={setRating} />
            </View>
          </View>

          {/* Reseña / Tips */}
          <View style={styles.inputSection}>
            <View style={styles.labelWithIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </Svg>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Tu reseña y consejos
              </Text>
            </View>

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
              placeholder="Cuenta qué tal estuvo el ambiente, el servicio o qué platillo no perderse..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={review}
              onChangeText={setReview}
            />
          </View>

          {/* Botón Principal de Publicar al final del formulario */}
          <TouchableOpacity
            style={[
              styles.bottomSubmitBtn,
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
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.bottomSubmitBtnInner}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
                  <Path d="M22 2L11 13" />
                  <Path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </Svg>
                <Text style={[styles.bottomSubmitBtnText, { fontFamily: typography.fonts.bold }]}>
                  Publicar Experiencia
                </Text>
              </View>
            )}
          </TouchableOpacity>
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
  publishActionBtn: { paddingHorizontal: 18, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  publishActionText: { color: '#FFFFFF', fontSize: 13 },
  bottomSubmitBtn: {
    marginTop: 16,
    marginBottom: 40,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSubmitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  formScroll: { padding: 20, paddingBottom: 60 },
  inputSection: { marginBottom: 18 },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fieldLabel: { fontSize: 13 },
  inputField: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  imagePickerCard: { borderWidth: 1, padding: 12, overflow: 'hidden' },
  imagePreviewWrap: { position: 'relative', height: 180, borderRadius: 10, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  previewActionRow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  actionBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBadgeText: { color: '#FFF', fontSize: 12 },
  uploadBox: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadTitle: { fontSize: 14, marginBottom: 2 },
  uploadSubtitle: { fontSize: 11 },
  mapPickerCard: { borderWidth: 1, overflow: 'hidden' },
  miniMapCanvas: { height: 130, position: 'relative' },
  miniMapOverlayBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniMapOverlayText: { color: '#FFF', fontSize: 11 },
  selectedLocationRow: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedLocationText: { fontSize: 12, flex: 1 },
  gastroChipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gastroChip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  gastroChipText: { fontSize: 12 },
  budgetRow: { flexDirection: 'row', gap: 8 },
  budgetChip: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1 },
  budgetChipLabel: { fontSize: 12 },
  ratingRow: { paddingVertical: 4 },
  textArea: { borderWidth: 1, padding: 12, height: 90, textAlignVertical: 'top', fontSize: 14 },
  itineraryChip: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, minWidth: 160 },
  itineraryChipTitle: { fontSize: 13, marginBottom: 2 },
});
