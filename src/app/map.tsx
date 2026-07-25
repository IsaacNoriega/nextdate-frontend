import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import BottomBar from '../components/ui/bottom-bar';

interface MapPin {
  id: string;
  name: string;
  categoryEmoji: string;
  categoryLabel: string;
  rating: number;
  price: string;
  distance: string;
  address: string;
  description: string;
  imageUrl: string;
  topPct: number; // Porcentaje de posición en el mapa
  leftPct: number;
}

const MOCK_MAP_PINS: MapPin[] = [
  {
    id: 'pin-1',
    name: 'Terraza Luna Gastro Bar',
    categoryEmoji: '🍸',
    categoryLabel: 'Coctelería',
    rating: 4.9,
    price: '$$$',
    distance: '0.8 km',
    address: 'Av. Chapultepec Norte 340, Americana',
    description: 'Vista panorámica espectacular del atardecer con coctelería artesanal y música suave.',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    topPct: 35,
    leftPct: 45
  },
  {
    id: 'pin-2',
    name: 'Trattoria Barrio',
    categoryEmoji: '🍝',
    categoryLabel: 'Italiana',
    rating: 4.8,
    price: '$$',
    distance: '1.4 km',
    address: 'Calle López Cotilla 1420, Americana',
    description: 'Ambiente íntimo con velas, pasta fresca hecha a mano y vinos seleccionados.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    topPct: 52,
    leftPct: 65
  },
  {
    id: 'pin-3',
    name: 'Jardín Botánico & Gelato',
    categoryEmoji: '🍦',
    categoryLabel: 'Postres & Paseo',
    rating: 4.7,
    price: '$',
    distance: '2.1 km',
    address: 'Camino del Jardín s/n',
    description: 'Gelato artesanal italiano y senderos románticos illuminados al atardecer.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    topPct: 22,
    leftPct: 28
  }
];

export default function MapScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();

  const [selectedPin, setSelectedPin] = useState<MapPin | null>(MOCK_MAP_PINS[0]);
  const [showFullDetailModal, setShowFullDetailModal] = useState(false);
  const [placeRating, setPlaceRating] = useState<number>(0);
  const [placeRatingSubmitted, setPlaceRatingSubmitted] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      
      {/* SIMULACIÓN DE MAPA INTERACTIVO A PANTALLA COMPLETA */}
      <View style={[styles.mapContainer, { backgroundColor: colors.card }]}>
        
        {/* Fondo Grid & Elementos Geográficos del Mapa */}
        <View style={[styles.mapBackground, { backgroundColor: colors.primary + '0A' }]}>
          
          {/* Vías / Calles dibujadas */}
          <View style={[styles.mapRoadHorizontal, { top: '38%', backgroundColor: colors.border }]} />
          <View style={[styles.mapRoadHorizontal, { top: '55%', backgroundColor: colors.border }]} />
          <View style={[styles.mapRoadVertical, { left: '48%', backgroundColor: colors.border }]} />
          <View style={[styles.mapRoadVertical, { left: '67%', backgroundColor: colors.border }]} />

          {/* Área Verde Parques */}
          <View style={[styles.mapParkArea, { top: '15%', left: '20%', backgroundColor: '#34C75920' }]}>
            <Text style={{ fontSize: 16 }}>🌿</Text>
          </View>

          {/* PINS INTERACTIVOS SOBRE EL MAPA */}
          {MOCK_MAP_PINS.map((pin) => {
            const isSelected = selectedPin?.id === pin.id;
            return (
              <TouchableOpacity
                key={pin.id}
                style={[
                  styles.mapPinContainer,
                  {
                    top: `${pin.topPct}%`,
                    left: `${pin.leftPct}%`,
                  }
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedPin(pin)}
              >
                <View 
                  style={[
                    styles.mapPinBubble,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primaryContrast : colors.primary,
                      transform: [{ scale: isSelected ? 1.25 : 1 }]
                    }
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>{pin.categoryEmoji}</Text>
                </View>
                {isSelected ? (
                  <View style={[styles.pinPulseRing, { borderColor: colors.primary }]} />
                ) : null}
              </TouchableOpacity>
            );
          })}

        </View>

        {/* Buscador & Filtros Flotantes Superiores */}
        <View style={styles.floatingHeaderArea}>
          <View style={[styles.searchBarBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.round }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
              <Circle cx="11" cy="11" r="8" />
              <Path d="M21 21l-4.35-4.35" />
            </Svg>
            <TextInput
              style={[styles.searchInput, { color: colors.text, fontFamily: typography.fonts.regular }]}
              placeholder="Buscar lugares para citas cerca de ti..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* TARJETA FLOTANTE INFERIOR DEL LUGAR SELECCIONADO */}
        {selectedPin ? (
          <View style={styles.bottomCardWrapper}>
            <View style={[styles.selectedPlaceCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
              
              <Image source={{ uri: selectedPin.imageUrl }} style={styles.placeCardImage} />

              <View style={styles.placeCardDetails}>
                
                <View style={styles.placeCardHeaderRow}>
                  <Text style={[styles.categoryBadgeText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                    {selectedPin.categoryEmoji} {selectedPin.categoryLabel}
                  </Text>
                  <Text style={[styles.distanceText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    📍 {selectedPin.distance}
                  </Text>
                </View>

                <Text style={[styles.placeNameText, { color: colors.text, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
                  {selectedPin.name}
                </Text>

                <Text style={[styles.ratingPriceText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  ⭐ {selectedPin.rating} • {selectedPin.price} • Americana
                </Text>

                <TouchableOpacity 
                  style={[styles.planHereBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.88}
                  onPress={() => {
                    setPlaceRating(0);
                    setPlaceRatingSubmitted(false);
                    setShowFullDetailModal(true);
                  }}
                >
                  <Text style={[styles.planHereBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    Planear Cita Aquí ✨
                  </Text>
                </TouchableOpacity>

              </View>

            </View>
          </View>
        ) : null}

      </View>

      {/* DETALLE COMPLETO MODAL FULL-SCREEN CON BOTÓN "X" A top: 36 */}
      <Modal
        visible={showFullDetailModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowFullDetailModal(false)}
      >
        <SafeAreaView style={[styles.modalArea, { backgroundColor: colors.background }]}>
          {selectedPin ? (
            <View style={{ flex: 1 }}>
              
              {/* Cover Image & Close X Button (top: 36) */}
              <View style={styles.modalCoverWrapper}>
                <Image source={{ uri: selectedPin.imageUrl }} style={styles.modalCover} />
                
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  activeOpacity={0.8}
                  onPress={() => setShowFullDetailModal(false)}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                
                <Text style={[styles.modalHeadline, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {selectedPin.name}
                </Text>

                <Text style={[styles.modalSubHeadline, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  ⭐ {selectedPin.rating} • {selectedPin.categoryEmoji} {selectedPin.categoryLabel} • {selectedPin.price}
                </Text>

                <Text style={[styles.modalParagraph, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {selectedPin.description}
                </Text>

                {/* MAPA Y DIRECCIÓN */}
                <Text style={[styles.modalSectionHeading, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 20 }]}>
                  Dirección GPS
                </Text>
                <Text style={[styles.modalAddressText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {selectedPin.address}
                </Text>

                <View style={[styles.mapContainerPreview, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <View style={[styles.mapContentPreview, { backgroundColor: colors.primary + '08' }]}>
                    <View style={[styles.mapPinBg, { backgroundColor: colors.primary }]}>
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2}>
                        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </Svg>
                    </View>
                    <Text style={[styles.mapPinLabel, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      {selectedPin.name}
                    </Text>
                  </View>
                </View>

                {/* RATE DEL LUGAR (DEBAJO DEL MAPA) */}
                <Text style={[styles.modalSectionHeading, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 12 }]}>
                  Califica este Lugar
                </Text>
                <View style={[styles.rateCardBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        activeOpacity={0.7}
                        onPress={() => setPlaceRating(star)}
                        style={{ padding: 4 }}
                      >
                        <Text style={{ fontSize: 26, opacity: star <= placeRating ? 1 : 0.25 }}>
                          ⭐
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {placeRating > 0 && !placeRatingSubmitted ? (
                    <TouchableOpacity
                      style={[styles.rateActionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                      onPress={() => setPlaceRatingSubmitted(true)}
                    >
                      <Text style={[styles.rateActionBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                        Enviar Calificación
                      </Text>
                    </TouchableOpacity>
                  ) : placeRatingSubmitted ? (
                    <Text style={[styles.rateSuccessText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                      ¡Gracias por calificar este lugar! 🙌
                    </Text>
                  ) : null}
                </View>

                {/* BOTÓN SEPARADO DE ACCIÓN */}
                <TouchableOpacity 
                  style={[styles.modalPlanBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => setShowFullDetailModal(false)}
                >
                  <Text style={[styles.modalPlanBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    Confirmar Plan de Cita ✨
                  </Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* FLOATING PILL BOTTOM BAR REUTILIZABLE */}
      <BottomBar activeTab="map" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  mapRoadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    opacity: 0.3,
  },
  mapRoadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 8,
    opacity: 0.3,
  },
  mapParkArea: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justify: 'center',
  },
  mapPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    justify: 'center',
    width: 44,
    height: 44,
  },
  mapPinBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justify: 'center',
    zIndex: 10,
    elevation: 6,
  },
  pinPulseRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    opacity: 0.5,
  },
  floatingHeaderArea: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
    gap: 10,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  selectedPlaceCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    elevation: 8,
  },
  placeCardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  placeCardDetails: {
    flex: 1,
    justify: 'space-between',
  },
  placeCardHeaderRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 11,
  },
  distanceText: {
    fontSize: 11,
  },
  placeNameText: {
    fontSize: 15,
  },
  ratingPriceText: {
    fontSize: 12,
  },
  planHereBtn: {
    height: 32,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
    marginTop: 4,
  },
  planHereBtnText: {
    fontSize: 11,
  },

  /* MODAL */
  modalArea: {
    flex: 1,
  },
  modalCoverWrapper: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  modalCover: {
    width: '100%',
    height: '100%',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 36,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justify: 'center',
    zIndex: 10,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 40,
  },
  modalHeadline: {
    fontSize: 22,
    marginBottom: 4,
  },
  modalSubHeadline: {
    fontSize: 13,
    marginBottom: 12,
  },
  modalParagraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  modalSectionHeading: {
    fontSize: 16,
    marginBottom: 6,
  },
  modalAddressText: {
    fontSize: 13,
    marginBottom: 10,
  },
  mapContainerPreview: {
    height: 140,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapContentPreview: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
  },
  mapPinBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justify: 'center',
    marginBottom: 6,
  },
  mapPinLabel: {
    fontSize: 13,
  },
  rateCardBox: {
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 32,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rateActionBtn: {
    height: 38,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
    marginTop: 10,
  },
  rateActionBtnText: {
    fontSize: 12,
  },
  rateSuccessText: {
    fontSize: 12,
    marginTop: 8,
  },
  modalPlanBtn: {
    height: 50,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
    marginTop: 12,
  },
  modalPlanBtnText: {
    fontSize: 15,
  },
});
