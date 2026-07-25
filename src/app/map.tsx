import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import BottomBar from '../components/ui/bottom-bar';

interface RouteStep {
  stepNumber: number;
  time: string;
  title: string;
  placeName: string;
  categoryEmoji: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl: string;
  estimatedCost: string;
  topPct: number;
  leftPct: number;
}

const MOCK_ITINERARY_ROUTE: RouteStep[] = [
  {
    stepNumber: 1,
    time: '18:30 PM',
    title: 'Cócteles de Autor al Atardecer',
    placeName: 'Terraza Luna Gastro Bar',
    categoryEmoji: '🍸',
    address: 'Av. Chapultepec Norte 340, Americana',
    latitude: 20.6741,
    longitude: -103.3682,
    description: 'Coctelería artesanal y vista del atardecer para iniciar la cita.',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    estimatedCost: '$250 MXN',
    topPct: 25,
    leftPct: 30
  },
  {
    stepNumber: 2,
    time: '19:45 PM',
    title: 'Cena a la Luz de las Velas',
    placeName: 'Trattoria Barrio Americana',
    categoryEmoji: '🍝',
    address: 'Calle López Cotilla 1420, Americana',
    latitude: 20.6725,
    longitude: -103.3611,
    description: 'Pasta artesanal italiana, ambiente íntimo y vino de la casa.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    estimatedCost: '$480 MXN',
    topPct: 48,
    leftPct: 58
  },
  {
    stepNumber: 3,
    time: '21:15 PM',
    title: 'Postre & Paseo Nocturno',
    placeName: 'Jardín Botánico & Gelato',
    categoryEmoji: '🍦',
    address: 'Camino del Jardín s/n',
    latitude: 20.7102,
    longitude: -103.3745,
    description: 'Gelato artesanal italiano y caminata bajo las estrellas.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    estimatedCost: '$120 MXN',
    topPct: 70,
    leftPct: 75
  }
];

export default function MapScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [stepRating, setStepRating] = useState<number>(0);
  const [stepRatingSubmitted, setStepRatingSubmitted] = useState<boolean>(false);

  const activeStep = MOCK_ITINERARY_ROUTE[activeStepIndex];

  const handleOpenGoogleMaps = (step: RouteStep) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(step.placeName + ' ' + step.address)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      
      {/* GOOGLE MAPS STYLE CONTAINER */}
      <View style={styles.mapViewport}>
        
        {/* Fondo con diseño de Google Maps Dark / Light Theme */}
        <View style={[styles.googleMapBg, { backgroundColor: colors.card }]}>
          
          {/* SVG Polyline Ruta trazada en el Mapa estilo Google Maps */}
          <Svg style={StyleSheet.absoluteFill}>
            {/* Ruta punteada conectora de fondo */}
            <Line
              x1="30%"
              y1="25%"
              x2="58%"
              y2="48%"
              stroke={colors.primary}
              strokeWidth="4"
              strokeDasharray="6, 6"
              strokeOpacity="0.8"
            />
            <Line
              x1="58%"
              y1="48%"
              x2="75%"
              y2="70%"
              stroke={colors.primary}
              strokeWidth="4"
              strokeDasharray="6, 6"
              strokeOpacity="0.8"
            />
          </Svg>

          {/* Bloques de Manzanas y Parques de Mapa */}
          <View style={[styles.mapBlock, { top: '15%', left: '10%', width: 120, height: 80, backgroundColor: colors.border + '30' }]} />
          <View style={[styles.mapBlock, { top: '35%', left: '60%', width: 100, height: 100, backgroundColor: colors.border + '30' }]} />
          <View style={[styles.mapParkBlock, { top: '58%', left: '15%', width: 140, height: 90, backgroundColor: '#34C75918' }]}>
            <Text style={{ fontSize: 18 }}>🌿</Text>
          </View>

          {/* PINS NUMERADOS DE LA RUTA EN EL MAPA (1 -> 2 -> 3) */}
          {MOCK_ITINERARY_ROUTE.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <TouchableOpacity
                key={step.stepNumber}
                style={[
                  styles.routePinWrapper,
                  {
                    top: `${step.topPct}%`,
                    left: `${step.leftPct}%`,
                  }
                ]}
                activeOpacity={0.85}
                onPress={() => setActiveStepIndex(idx)}
              >
                {/* Etiqueta de Horario sobre el Pin */}
                <View style={[styles.pinTimeTag, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.pinTimeText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {step.time}
                  </Text>
                </View>

                {/* Marcador Pin Circular */}
                <View 
                  style={[
                    styles.routePinCircle,
                    {
                      backgroundColor: isActive ? colors.primary : colors.card,
                      borderColor: isActive ? colors.primaryContrast : colors.primary,
                      transform: [{ scale: isActive ? 1.3 : 1 }]
                    }
                  ]}
                >
                  <Text style={[styles.routePinNum, { color: isActive ? colors.primaryContrast : colors.primary, fontFamily: typography.fonts.bold }]}>
                    {step.stepNumber}
                  </Text>
                </View>

                {/* Sombra / Halo Activo */}
                {isActive ? (
                  <View style={[styles.activeHaloRing, { borderColor: colors.primary }]} />
                ) : null}
              </TouchableOpacity>
            );
          })}

        </View>

        {/* HEADER FLOTANTE DE LA RUTA GOOGLE MAPS */}
        <View style={styles.floatingRouteHeader}>
          <View style={[styles.routeHeaderBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
            <View style={styles.routeTitleRow}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>🗺️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.routeItinName, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Ruta: Noche Mágica en la Americana
                </Text>
                <Text style={[styles.routeItinSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  3 Pasos • 2.4 km • 12 min en auto
                </Text>
              </View>
            </View>

            {/* Selector Rápido de Pasos */}
            <View style={styles.stepChipsRow}>
              {MOCK_ITINERARY_ROUTE.map((st, i) => (
                <TouchableOpacity
                  key={st.stepNumber}
                  style={[
                    styles.stepSelectChip,
                    {
                      backgroundColor: i === activeStepIndex ? colors.primary : colors.background,
                      borderColor: i === activeStepIndex ? colors.primary : colors.border,
                      borderRadius: borderRadius.round
                    }
                  ]}
                  onPress={() => setActiveStepIndex(i)}
                >
                  <Text style={[
                    styles.stepSelectChipText,
                    { color: i === activeStepIndex ? colors.primaryContrast : colors.text, fontFamily: typography.fonts.bold }
                  ]}>
                    Paso {st.stepNumber} {st.categoryEmoji}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

          </View>
        </View>

        {/* TARJETA FLOTANTE INFERIOR NAVEGADORA DE RUTA */}
        {activeStep ? (
          <View style={styles.floatingStepCardWrapper}>
            <View style={[styles.stepNavigatorCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
              
              {/* Cover Image Thumb */}
              <Image source={{ uri: activeStep.imageUrl }} style={styles.navigatorThumb} />

              <View style={styles.navigatorInfo}>
                <View style={styles.navHeaderRow}>
                  <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.stepBadgeText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                      Paso {activeStep.stepNumber} de {MOCK_ITINERARY_ROUTE.length}
                    </Text>
                  </View>
                  <Text style={[styles.navTimeText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                    🕒 {activeStep.time}
                  </Text>
                </View>

                <Text style={[styles.navTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
                  {activeStep.categoryEmoji} {activeStep.title}
                </Text>

                <Text style={[styles.navPlaceText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                  📍 {activeStep.placeName}
                </Text>

                {/* Acciones de Navegación */}
                <View style={styles.navActionsRow}>
                  
                  {/* Botón Ver Detalle & Calificar */}
                  <TouchableOpacity
                    style={[styles.navDetailBtn, { backgroundColor: colors.primary + '18', borderRadius: borderRadius.md }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setStepRating(0);
                      setStepRatingSubmitted(false);
                      setShowDetailModal(true);
                    }}
                  >
                    <Text style={[styles.navDetailBtnText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                      Ver Detalle ✨
                    </Text>
                  </TouchableOpacity>

                  {/* Botón Abrir Google Maps */}
                  <TouchableOpacity
                    style={[styles.navMapsBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                    activeOpacity={0.88}
                    onPress={() => handleOpenGoogleMaps(activeStep)}
                  >
                    <Text style={[styles.navMapsBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                      Navegar GPS 🧭
                    </Text>
                  </TouchableOpacity>

                </View>

              </View>

            </View>
          </View>
        ) : null}

      </View>

      {/* DETALLE COMPLETO MODAL FULL-SCREEN CON BOTÓN "X" A top: 36 */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={[styles.modalArea, { backgroundColor: colors.background }]}>
          {activeStep ? (
            <View style={{ flex: 1 }}>
              
              {/* Cover Image & Close X Button (top: 36) */}
              <View style={styles.modalCoverWrapper}>
                <Image source={{ uri: activeStep.imageUrl }} style={styles.modalCover} />
                
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  activeOpacity={0.8}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                
                <View style={styles.modalHeaderRow}>
                  <View style={[styles.modalStepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.modalStepBadgeText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                      Paso {activeStep.stepNumber}
                    </Text>
                  </View>
                  <Text style={[styles.modalTimeText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                    🕒 {activeStep.time}
                  </Text>
                </View>

                <Text style={[styles.modalHeadline, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {activeStep.categoryEmoji} {activeStep.title}
                </Text>

                <Text style={[styles.modalSubHeadline, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  📍 {activeStep.placeName} • {activeStep.estimatedCost}
                </Text>

                <Text style={[styles.modalParagraph, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {activeStep.description}
                </Text>

                {/* DIRECCIÓN GPS */}
                <Text style={[styles.modalSectionHeading, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 20 }]}>
                  Dirección GPS
                </Text>
                <Text style={[styles.modalAddressText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {activeStep.address}
                </Text>

                {/* RATE DEL PLAN (DEBAJO DEL MAPA) */}
                <Text style={[styles.modalSectionHeading, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 12 }]}>
                  Califica este Paso del Itinerario
                </Text>
                <View style={[styles.rateCardBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        activeOpacity={0.7}
                        onPress={() => setStepRating(star)}
                        style={{ padding: 4 }}
                      >
                        <Text style={{ fontSize: 26, opacity: star <= stepRating ? 1 : 0.25 }}>
                          ⭐
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {stepRating > 0 && !stepRatingSubmitted ? (
                    <TouchableOpacity
                      style={[styles.rateActionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                      onPress={() => setStepRatingSubmitted(true)}
                    >
                      <Text style={[styles.rateActionBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                        Enviar Calificación
                      </Text>
                    </TouchableOpacity>
                  ) : stepRatingSubmitted ? (
                    <Text style={[styles.rateSuccessText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                      ¡Gracias por calificar este paso! 🙌
                    </Text>
                  ) : null}
                </View>

                {/* BOTÓN SEPARADO DE NAVEGACIÓN DIRECTA */}
                <TouchableOpacity 
                  style={[styles.modalPlanBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => {
                    setShowDetailModal(false);
                    handleOpenGoogleMaps(activeStep);
                  }}
                >
                  <Text style={[styles.modalPlanBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    Abrir en Google Maps / Waze 🧭
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
  mapViewport: {
    flex: 1,
    position: 'relative',
  },
  googleMapBg: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  mapBlock: {
    position: 'absolute',
    borderRadius: 8,
  },
  mapParkBlock: {
    position: 'absolute',
    borderRadius: 16,
    alignItems: 'center',
    justify: 'center',
  },
  routePinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justify: 'center',
    width: 60,
    height: 60,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  pinTimeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 2,
  },
  pinTimeText: {
    fontSize: 9,
  },
  routePinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justify: 'center',
    zIndex: 10,
    elevation: 6,
  },
  routePinNum: {
    fontSize: 13,
  },
  activeHaloRing: {
    position: 'absolute',
    bottom: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    opacity: 0.6,
  },
  floatingRouteHeader: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  routeHeaderBox: {
    padding: 12,
    borderWidth: 1,
    elevation: 6,
  },
  routeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeItinName: {
    fontSize: 15,
  },
  routeItinSub: {
    fontSize: 11,
  },
  stepChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepSelectChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  stepSelectChipText: {
    fontSize: 11,
  },
  floatingStepCardWrapper: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  stepNavigatorCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    elevation: 8,
  },
  navigatorThumb: {
    width: 86,
    height: 86,
    borderRadius: 10,
    marginRight: 12,
  },
  navigatorInfo: {
    flex: 1,
    justify: 'space-between',
  },
  navHeaderRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 10,
  },
  navTimeText: {
    fontSize: 11,
  },
  navTitleText: {
    fontSize: 15,
  },
  navPlaceText: {
    fontSize: 12,
  },
  navActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  navDetailBtn: {
    flex: 1,
    height: 32,
    alignItems: 'center',
    justify: 'center',
  },
  navDetailBtnText: {
    fontSize: 11,
  },
  navMapsBtn: {
    flex: 1,
    height: 32,
    alignItems: 'center',
    justify: 'center',
  },
  navMapsBtnText: {
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
  modalHeaderRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalStepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalStepBadgeText: {
    fontSize: 11,
  },
  modalTimeText: {
    fontSize: 13,
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
