import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import BottomBar from '../components/ui/bottom-bar';

interface RouteStep {
  stepNumber: number;
  time: string;
  title: string;
  placeName: string;
  categoryEmoji: string;
  address: string;
  description: string;
  imageUrl: string;
  estimatedCost: string;
  turnInstruction: string;
  distanceRemaining: string;
  eta: string;
  topPct: number;
  leftPct: number;
}

const MOCK_NAV_ROUTE: RouteStep[] = [
  {
    stepNumber: 1,
    time: '18:30 PM',
    title: 'Cócteles de Autor al Atardecer',
    placeName: 'Terraza Luna Gastro Bar',
    categoryEmoji: '🍸',
    address: 'Av. Chapultepec Norte 340, Americana',
    description: 'Coctelería artesanal y bocadillos con vista panorámica del atardecer.',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    estimatedCost: '$250 MXN',
    turnInstruction: 'En 150m gira a la derecha en Av. Chapultepec Norte.',
    distanceRemaining: '350m',
    eta: '2 min',
    topPct: 28,
    leftPct: 32
  },
  {
    stepNumber: 2,
    time: '19:45 PM',
    title: 'Cena a la Luz de las Velas',
    placeName: 'Trattoria Barrio Americana',
    categoryEmoji: '🍝',
    address: 'Calle López Cotilla 1420, Americana',
    description: 'Pasta artesanal italiana, vino tinto de la casa y ambiente romántico.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    estimatedCost: '$480 MXN',
    turnInstruction: 'Continúa recto durante 600m por Calle López Cotilla.',
    distanceRemaining: '1.1 km',
    eta: '5 min',
    topPct: 50,
    leftPct: 60
  },
  {
    stepNumber: 3,
    time: '21:15 PM',
    title: 'Postre & Paseo Nocturno',
    placeName: 'Jardín Botánico & Gelato',
    categoryEmoji: '🍦',
    address: 'Camino del Jardín s/n',
    description: 'Gelato artesanal italiano y paseo tranquilo bajo las estrellas.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    estimatedCost: '$120 MXN',
    turnInstruction: 'Gira a la izquierda al final de la avenida.',
    distanceRemaining: '950m',
    eta: '4 min',
    topPct: 72,
    leftPct: 78
  }
];

export default function MapScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [stepRating, setStepRating] = useState<number>(0);
  const [stepRatingSubmitted, setStepRatingSubmitted] = useState<boolean>(false);

  const activeStep = MOCK_NAV_ROUTE[activeStepIndex];

  // Simulación de avance automático de navegación en tiempo real
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isNavigating) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev < MOCK_NAV_ROUTE.length - 1 ? prev + 1 : prev));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isNavigating]);

  const handleNextStep = () => {
    if (activeStepIndex < MOCK_NAV_ROUTE.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    } else {
      setIsNavigating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      
      {/* VISTA DE MAPA INTERACTIVO NATIVO IN-APP */}
      <View style={styles.mapViewport}>
        
        {/* Fondo del Mapa */}
        <View style={[styles.mapCanvas, { backgroundColor: colors.card }]}>
          
          {/* Trazado de Ruta Estilo Google Maps con gradiente y animación */}
          <Svg style={StyleSheet.absoluteFill}>
            <Line
              x1="32%"
              y1="28%"
              x2="60%"
              y2="50%"
              stroke={colors.primary}
              strokeWidth="5"
              strokeDasharray={isNavigating ? '8, 4' : undefined}
            />
            <Line
              x1="60%"
              y1="50%"
              x2="78%"
              y2="72%"
              stroke={colors.primary}
              strokeWidth="5"
              strokeDasharray={isNavigating ? '8, 4' : undefined}
            />
          </Svg>

          {/* Bloques de la Ciudad */}
          <View style={[styles.cityBlock, { top: '18%', left: '12%', width: 110, height: 75, backgroundColor: colors.border + '25' }]} />
          <View style={[styles.cityBlock, { top: '38%', left: '64%', width: 95, height: 95, backgroundColor: colors.border + '25' }]} />
          <View style={[styles.parkZone, { top: '62%', left: '18%', width: 130, height: 80, backgroundColor: '#34C75920' }]}>
            <Text style={{ fontSize: 16 }}>🌿</Text>
          </View>

          {/* PINS INTERACTIVOS DE LA RUTA (1 -> 2 -> 3) */}
          {MOCK_NAV_ROUTE.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <TouchableOpacity
                key={step.stepNumber}
                style={[
                  styles.mapPinAnchor,
                  {
                    top: `${step.topPct}%`,
                    left: `${step.leftPct}%`,
                  }
                ]}
                activeOpacity={0.88}
                onPress={() => setActiveStepIndex(idx)}
              >
                {/* Badge de Horario */}
                <View style={[styles.timeChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.timeChipText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {step.time}
                  </Text>
                </View>

                {/* Marcador Pin */}
                <View 
                  style={[
                    styles.pinNode,
                    {
                      backgroundColor: isActive ? colors.primary : colors.card,
                      borderColor: isActive ? colors.primaryContrast : colors.primary,
                      transform: [{ scale: isActive ? 1.3 : 1 }]
                    }
                  ]}
                >
                  <Text style={[styles.pinNodeNum, { color: isActive ? colors.primaryContrast : colors.primary, fontFamily: typography.fonts.bold }]}>
                    {step.stepNumber}
                  </Text>
                </View>

                {/* Anillo de Navegación Activa */}
                {isActive && isNavigating ? (
                  <View style={[styles.pulseRing, { borderColor: colors.primary }]} />
                ) : null}
              </TouchableOpacity>
            );
          })}

        </View>

        {/* HEADER FLOTANTE DE INSTRUCCIÓN PASO A PASO (Navegación GPS In-App) */}
        <View style={styles.topHeaderOverlay}>
          {isNavigating ? (
            /* Banner de Instrucción Giro a Giro en Vivo */
            <View style={[styles.turnInstructionBanner, { backgroundColor: '#1C1C1E', borderRadius: borderRadius.lg }]}>
              <View style={styles.turnIconBg}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                  <Path d="M9 18l6-6-6-6" />
                </Svg>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.turnMainText, { color: '#FFFFFF', fontFamily: typography.fonts.bold }]}>
                  {activeStep.turnInstruction}
                </Text>
                <Text style={[styles.turnSubText, { color: '#8E8E93', fontFamily: typography.fonts.medium }]}>
                  Paso {activeStep.stepNumber}: {activeStep.placeName} • {activeStep.distanceRemaining} ({activeStep.eta})
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.stopNavBtn}
                onPress={() => setIsNavigating(false)}
              >
                <Text style={{ color: '#FF3B30', fontSize: 13, fontFamily: typography.fonts.bold }}>Salir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Banner de Resumen de Ruta */
            <View style={[styles.routeSummaryHeader, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
              <View style={styles.summaryTitleRow}>
                <Text style={{ fontSize: 18, marginRight: 8 }}>🧭</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.summaryTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Itinerario Mágico Noche en la Americana
                  </Text>
                  <Text style={[styles.summarySub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    3 Citas conectadas en mapa • 2.4 km total
                  </Text>
                </View>
              </View>

              {/* Selector Rápido de Pasos */}
              <View style={styles.stepsPillRow}>
                {MOCK_NAV_ROUTE.map((st, i) => (
                  <TouchableOpacity
                    key={st.stepNumber}
                    style={[
                      styles.stepChip,
                      {
                        backgroundColor: i === activeStepIndex ? colors.primary : colors.background,
                        borderColor: i === activeStepIndex ? colors.primary : colors.border,
                        borderRadius: borderRadius.round
                      }
                    ]}
                    onPress={() => setActiveStepIndex(i)}
                  >
                    <Text style={[
                      styles.stepChipText,
                      { color: i === activeStepIndex ? colors.primaryContrast : colors.text, fontFamily: typography.fonts.bold }
                    ]}>
                      Paso {st.stepNumber} {st.categoryEmoji}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

            </View>
          )}
        </View>

        {/* TARJETA FLOTANTE INFERIOR NAVEGADORA NATIVA IN-APP */}
        {activeStep ? (
          <View style={styles.bottomCardContainer}>
            <View style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
              
              <Image source={{ uri: activeStep.imageUrl }} style={styles.navCardImage} />

              <View style={styles.navCardContent}>
                
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.cardStepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.cardStepBadgeText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                      Paso {activeStep.stepNumber} de 3
                    </Text>
                  </View>

                  <Text style={[styles.cardTimeText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                    🕒 {activeStep.time}
                  </Text>
                </View>

                <Text style={[styles.cardHeadline, { color: colors.text, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
                  {activeStep.categoryEmoji} {activeStep.title}
                </Text>

                <Text style={[styles.cardPlace, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                  📍 {activeStep.placeName}
                </Text>

                {/* BOTONES DE CONTROL DE NAVEGACIÓN DENTRO DE NEXTDATE */}
                <View style={styles.cardActionsRow}>
                  
                  {/* Botón Ver Detalle */}
                  <TouchableOpacity
                    style={[styles.detailActionBtn, { backgroundColor: colors.primary + '18', borderRadius: borderRadius.md }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setStepRating(0);
                      setStepRatingSubmitted(false);
                      setShowDetailModal(true);
                    }}
                  >
                    <Text style={[styles.detailActionBtnText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                      Ver Detalle ✨
                    </Text>
                  </TouchableOpacity>

                  {/* Botón Iniciar/Avanzar Navegación In-App */}
                  <TouchableOpacity
                    style={[styles.navStartBtn, { backgroundColor: isNavigating ? '#34C759' : colors.primary, borderRadius: borderRadius.md }]}
                    activeOpacity={0.88}
                    onPress={() => {
                      if (!isNavigating) {
                        setIsNavigating(true);
                      } else {
                        handleNextStep();
                      }
                    }}
                  >
                    <Text style={[styles.navStartBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                      {isNavigating ? 'Siguiente Paso ➔' : '🧭 Iniciar Navegación'}
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

                {/* DIRECCIÓN NATIVA */}
                <Text style={[styles.modalSectionHeading, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 20 }]}>
                  Ubicación de la Cita
                </Text>
                <Text style={[styles.modalAddressText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {activeStep.address}
                </Text>

                {/* RATE DEL PLAN */}
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

                {/* BOTÓN INICIAR NAVEGACIÓN EN VIVO */}
                <TouchableOpacity 
                  style={[styles.modalPlanBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => {
                    setShowDetailModal(false);
                    setIsNavigating(true);
                  }}
                >
                  <Text style={[styles.modalPlanBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    Navegar este Paso en Vivo 🧭
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
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  cityBlock: {
    position: 'absolute',
    borderRadius: 8,
  },
  parkZone: {
    position: 'absolute',
    borderRadius: 16,
    alignItems: 'center',
    justify: 'center',
  },
  mapPinAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justify: 'center',
    width: 60,
    height: 60,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  timeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 2,
  },
  timeChipText: {
    fontSize: 9,
  },
  pinNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justify: 'center',
    zIndex: 10,
    elevation: 6,
  },
  pinNodeNum: {
    fontSize: 13,
  },
  pulseRing: {
    position: 'absolute',
    bottom: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    opacity: 0.6,
  },
  topHeaderOverlay: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  turnInstructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    elevation: 8,
  },
  turnIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justify: 'center',
  },
  turnMainText: {
    fontSize: 14,
  },
  turnSubText: {
    fontSize: 11,
  },
  stopNavBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  routeSummaryHeader: {
    padding: 12,
    borderWidth: 1,
    elevation: 6,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 15,
  },
  summarySub: {
    fontSize: 11,
  },
  stepsPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  stepChipText: {
    fontSize: 11,
  },
  bottomCardContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  navCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    elevation: 8,
  },
  navCardImage: {
    width: 86,
    height: 86,
    borderRadius: 10,
    marginRight: 12,
  },
  navCardContent: {
    flex: 1,
    justify: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
  },
  cardStepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardStepBadgeText: {
    fontSize: 10,
  },
  cardTimeText: {
    fontSize: 11,
  },
  cardHeadline: {
    fontSize: 15,
  },
  cardPlace: {
    fontSize: 12,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  detailActionBtn: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justify: 'center',
  },
  detailActionBtnText: {
    fontSize: 11,
  },
  navStartBtn: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justify: 'center',
  },
  navStartBtnText: {
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
