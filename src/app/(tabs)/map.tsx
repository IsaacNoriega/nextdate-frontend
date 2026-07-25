import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import StarRating from '../../components/ui/star-rating';

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

interface SavedItineraryOption {
  id: string;
  title: string;
  tagline: string;
  totalDistance: string;
  totalTime: string;
  matchScore: number;
  steps: RouteStep[];
}

const AVAILABLE_ITINERARIES: SavedItineraryOption[] = [
  {
    id: 'itin-1',
    title: 'Noche Mágica en la Americana',
    tagline: 'Coctelería de autor, cena gourmet y caminata bajo las estrellas.',
    totalDistance: '2.4 km',
    totalTime: '12 min',
    matchScore: 98,
    steps: [
      {
        stepNumber: 1,
        time: '18:30',
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
        time: '19:45',
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
        time: '21:15',
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
    ]
  },
  {
    id: 'itin-2',
    title: 'Tarde Romántica & Picnic',
    tagline: 'Helado artesanal, caminata por el bosque y vista panorámica.',
    totalDistance: '3.1 km',
    totalTime: '15 min',
    matchScore: 95,
    steps: [
      {
        stepNumber: 1,
        time: '16:00',
        title: 'Helado Artesanal & Café',
        placeName: 'Gelateria Italiana',
        categoryEmoji: '🍦',
        address: 'Av. Vallarta 2100',
        description: 'Café expreso italiano y helado artesanal de pistacho.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        estimatedCost: '$140 MXN',
        turnInstruction: 'En 300m mantente a la derecha por Av. Vallarta.',
        distanceRemaining: '500m',
        eta: '3 min',
        topPct: 22,
        leftPct: 68
      },
      {
        stepNumber: 2,
        time: '17:30',
        title: 'Picnic al Atardecer',
        placeName: 'Mirador del Bosque',
        categoryEmoji: '🌿',
        address: 'Camino Mirador s/n',
        description: 'Vista de toda la ciudad al atardecer sobre césped natural.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
        estimatedCost: '$200 MXN',
        turnInstruction: 'Sigue el camino hacia el mirador principal.',
        distanceRemaining: '1.4 km',
        eta: '7 min',
        topPct: 65,
        leftPct: 25
      }
    ]
  }
];

export default function MapScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();

  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);
  const [stepRating, setStepRating] = useState<number>(0);
  const [stepRatingSubmitted, setStepRatingSubmitted] = useState<boolean>(false);

  // Swipe right-to-left gesture to close detail modal
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 25 && gestureState.dx < 0;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40 || gestureState.vx < -0.4) {
          setShowDetailModal(false);
        }
      },
    })
  ).current;

  const currentItinerary = selectedItineraryId
    ? AVAILABLE_ITINERARIES.find((i) => i.id === selectedItineraryId) || null
    : null;

  const activeStep = currentItinerary ? currentItinerary.steps[activeStepIndex] || currentItinerary.steps[0] : null;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isNavigating && currentItinerary) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev < currentItinerary.steps.length - 1 ? prev + 1 : prev));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isNavigating, currentItinerary]);

  const handleNextStep = () => {
    if (currentItinerary && activeStepIndex < currentItinerary.steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    } else {
      setIsNavigating(false);
    }
  };

  const filteredItineraries = AVAILABLE_ITINERARIES.filter((item) => {
    return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.tagline.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const accentBlue = isDark ? '#0A84FF' : '#007AFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>

      <View style={styles.mapViewport}>

        {/* Map Canvas */}
        <View style={[styles.mapCanvas, { backgroundColor: isDark ? '#0D0D0D' : '#F8F8FA' }]}>

          {/* SVG Map Layer */}
          <Svg style={StyleSheet.absoluteFill}>
            {/* Water */}
            <Path
              d="M-20,140 Q160,200 300,120 T550,240"
              fill="none"
              stroke={accentBlue}
              strokeWidth="22"
              strokeOpacity="0.12"
            />

            {/* Major roads */}
            <Path
              d="M-50,230 Q200,250 550,220"
              fill="none"
              stroke={isDark ? '#2C2C2E' : '#E5E5EA'}
              strokeWidth="14"
              strokeOpacity="0.8"
            />
            <Path
              d="M180,-50 L220,650"
              fill="none"
              stroke={isDark ? '#2C2C2E' : '#E5E5EA'}
              strokeWidth="12"
              strokeOpacity="0.8"
            />
            <Path
              d="M380,-50 L340,650"
              fill="none"
              stroke={isDark ? '#2C2C2E' : '#E5E5EA'}
              strokeWidth="10"
              strokeOpacity="0.5"
            />

            {/* Grid streets */}
            <Line x1="10%" y1="15%" x2="90%" y2="15%" stroke={isDark ? '#1C1C1E' : '#EBEBED'} strokeWidth="2" />
            <Line x1="10%" y1="38%" x2="90%" y2="38%" stroke={isDark ? '#1C1C1E' : '#EBEBED'} strokeWidth="2" />
            <Line x1="10%" y1="58%" x2="90%" y2="58%" stroke={isDark ? '#1C1C1E' : '#EBEBED'} strokeWidth="2" />
            <Line x1="10%" y1="78%" x2="90%" y2="78%" stroke={isDark ? '#1C1C1E' : '#EBEBED'} strokeWidth="2" />
            <Line x1="32%" y1="5%" x2="32%" y2="95%" stroke={isDark ? '#1C1C1E' : '#EBEBED'} strokeWidth="2" />
            <Line x1="62%" y1="5%" x2="62%" y2="95%" stroke={isDark ? '#1C1C1E' : '#EBEBED'} strokeWidth="2" />

            {/* Route lines */}
            {currentItinerary && currentItinerary.steps.length > 1 ? (
              <>
                {currentItinerary.steps.slice(0, -1).map((step, idx) => (
                  <Line
                    key={`route-${idx}`}
                    x1={`${step.leftPct}%`}
                    y1={`${step.topPct}%`}
                    x2={`${currentItinerary.steps[idx + 1].leftPct}%`}
                    y2={`${currentItinerary.steps[idx + 1].topPct}%`}
                    stroke={accentBlue}
                    strokeWidth="4"
                    strokeDasharray={isNavigating ? '8,6' : undefined}
                    strokeLinecap="round"
                  />
                ))}
              </>
            ) : null}
          </Svg>

          {/* City blocks */}
          <View style={[styles.cityBlock, { top: '12%', left: '8%', width: 100, height: 70, backgroundColor: isDark ? '#1A1A1C' : '#EEEEEF', borderRadius: 12 }]} />
          <View style={[styles.cityBlock, { top: '42%', left: '68%', width: 90, height: 110, backgroundColor: isDark ? '#1A1A1C' : '#EEEEEF', borderRadius: 12 }]} />

          {/* Park zone */}
          <View style={[styles.parkZone, { top: '64%', left: '14%', width: 140, height: 90, backgroundColor: isDark ? 'rgba(48,209,88,0.08)' : 'rgba(48,209,88,0.12)', borderRadius: 18 }]}>
            <Text style={[styles.parkLabel, { color: isDark ? '#30D158' : '#248A3D', fontFamily: typography.fonts.medium }]}>
              Bosque Central
            </Text>
          </View>

          {/* User GPS dot */}
          <View style={[styles.userGps, { top: '32%', left: '22%' }]}>
            <View style={styles.gpsHalo} />
            <View style={styles.gpsDot} />
          </View>

          {/* Route pins */}
          {currentItinerary ? currentItinerary.steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <TouchableOpacity
                key={step.stepNumber}
                style={[styles.pinAnchor, { top: `${step.topPct}%`, left: `${step.leftPct}%` }]}
                activeOpacity={0.88}
                onPress={() => setActiveStepIndex(idx)}
              >
                <View style={[
                  styles.pin,
                  {
                    backgroundColor: isActive ? accentBlue : colors.card,
                    borderColor: isActive ? '#FFFFFF' : accentBlue,
                    transform: [{ scale: isActive ? 1.2 : 1 }]
                  }
                ]}>
                  <Text style={[styles.pinText, { color: isActive ? '#FFFFFF' : accentBlue, fontFamily: typography.fonts.bold }]}>
                    {step.stepNumber}
                  </Text>
                </View>
                {isActive && (
                  <View style={[styles.pinLabel, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.pinLabelText, { color: colors.text, fontFamily: typography.fonts.medium }]} numberOfLines={1}>
                      {step.placeName}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }) : null}
        </View>

        {/* Top overlay: search or navigation banner */}
        <View style={styles.topOverlay}>
          {isNavigating && activeStep ? (
            <View style={[styles.navBanner, { backgroundColor: isDark ? '#1C1C1E' : '#000000', borderRadius: borderRadius.lg }]}>
              <View style={[styles.navIconCircle, { backgroundColor: accentBlue }]}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                  <Path d="M9 18l6-6-6-6" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navMainText, { fontFamily: typography.fonts.bold }]}>
                  {activeStep.turnInstruction}
                </Text>
                <Text style={styles.navSubText}>
                  {activeStep.distanceRemaining} · {activeStep.eta}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsNavigating(false)} style={styles.navStopBtn}>
                <Text style={styles.navStopText}>Salir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Search bar */}
              <TouchableOpacity
                style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}
                activeOpacity={0.9}
                onPress={() => setIsSearchDropdownOpen(true)}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Circle cx="11" cy="11" r="8" />
                  <Path d="M21 21l-4.35-4.35" />
                </Svg>
                <Text style={[styles.searchBarText, { color: currentItinerary ? colors.text : colors.textSecondary, fontFamily: typography.fonts.medium }]} numberOfLines={1}>
                  {currentItinerary ? currentItinerary.title : 'Buscar itinerario...'}
                </Text>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Path d="M6 9l6 6 6-6" />
                </Svg>
              </TouchableOpacity>

              {/* Dropdown */}
              {isSearchDropdownOpen && (
                <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <TextInput
                    style={[styles.dropdownSearch, { color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                    placeholder="Buscar por nombre..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />

                  <Text style={[styles.dropdownLabel, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                    ITINERARIOS
                  </Text>

                  {filteredItineraries.map((itin) => {
                    const isSelected = itin.id === selectedItineraryId;
                    return (
                      <TouchableOpacity
                        key={itin.id}
                        style={[
                          styles.dropdownItem,
                          {
                            backgroundColor: isSelected ? accentBlue + '12' : 'transparent',
                            borderColor: isSelected ? accentBlue : colors.border,
                            borderRadius: borderRadius.md,
                          }
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedItineraryId(itin.id);
                          setActiveStepIndex(0);
                          setIsNavigating(false);
                          setIsSearchDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <View style={[styles.dropdownItemIcon, { backgroundColor: accentBlue + '15' }]}>
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={accentBlue} strokeWidth={2}>
                            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                          </Svg>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.dropdownItemTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                            {itin.title}
                          </Text>
                          <Text style={[styles.dropdownItemSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                            {itin.steps.length} pasos · {itin.totalDistance} · {itin.totalTime}
                          </Text>
                        </View>
                        {isSelected && (
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={accentBlue} strokeWidth={2.5}>
                            <Path d="M20 6L9 17l-5-5" />
                          </Svg>
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={[styles.dropdownClose, { borderTopColor: colors.border }]}
                    onPress={() => setIsSearchDropdownOpen(false)}
                  >
                    <Text style={[styles.dropdownCloseText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                      Cerrar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step chips */}
              {!isSearchDropdownOpen && currentItinerary && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsRow}>
                  {currentItinerary.steps.map((st, i) => (
                    <TouchableOpacity
                      key={st.stepNumber}
                      style={[
                        styles.stepChip,
                        {
                          backgroundColor: i === activeStepIndex ? accentBlue : colors.card,
                          borderColor: i === activeStepIndex ? accentBlue : colors.border,
                          borderRadius: borderRadius.round
                        }
                      ]}
                      onPress={() => setActiveStepIndex(i)}
                    >
                      <Text style={[
                        styles.stepChipText,
                        { color: i === activeStepIndex ? '#FFFFFF' : colors.text, fontFamily: typography.fonts.bold }
                      ]}>
                        {st.stepNumber}. {st.placeName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* Bottom card */}
        {activeStep && !isSearchDropdownOpen ? (
          <View style={styles.bottomCard}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
              <Image source={{ uri: activeStep.imageUrl }} style={[styles.cardImage, { borderRadius: borderRadius.md }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={[styles.stepBadge, { backgroundColor: accentBlue }]}>
                    <Text style={[styles.stepBadgeText, { fontFamily: typography.fonts.bold }]}>
                      {activeStep.stepNumber}/{currentItinerary?.steps.length}
                    </Text>
                  </View>
                  <Text style={[styles.cardTime, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    {activeStep.time}
                  </Text>
                </View>

                <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
                  {activeStep.title}
                </Text>
                <Text style={[styles.cardPlace, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                  {activeStep.placeName} · {activeStep.estimatedCost}
                </Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.detailBtn, { borderColor: colors.border, borderRadius: borderRadius.md }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setStepRating(0);
                      setStepRatingSubmitted(false);
                      setShowDetailModal(true);
                    }}
                  >
                    <Text style={[styles.detailBtnText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                      Detalle
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navBtn, { backgroundColor: isNavigating ? '#30D158' : accentBlue, borderRadius: borderRadius.md }]}
                    activeOpacity={0.88}
                    onPress={() => {
                      if (!isNavigating) {
                        setIsNavigating(true);
                      } else {
                        handleNextStep();
                      }
                    }}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FFFFFF">
                      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    </Svg>
                    <Text style={[styles.navBtnText, { fontFamily: typography.fonts.bold }]}>
                      {isNavigating ? 'Siguiente' : 'Navegar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : !currentItinerary && !isSearchDropdownOpen ? (
          <View style={styles.bottomCard}>
            <TouchableOpacity
              style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}
              activeOpacity={0.85}
              onPress={() => setIsSearchDropdownOpen(true)}
            >
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={1.5}>
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              </Svg>
              <Text style={[styles.emptyCardTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Selecciona un itinerario
              </Text>
              <Text style={[styles.emptyCardSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Toca la barra de búsqueda para elegir una cita guardada.
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

      </View>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView 
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
          {...panResponder.panHandlers}
        >
          {activeStep ? (
            <View style={{ flex: 1 }}>
              <View style={styles.modalHero}>
                <Image source={{ uri: activeStep.imageUrl }} style={styles.modalHeroImage} />
                <TouchableOpacity
                  style={styles.modalClose}
                  activeOpacity={0.8}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
                <View style={[styles.modalHeroBadge, { backgroundColor: accentBlue }]}>
                  <Text style={[styles.modalHeroBadgeText, { fontFamily: typography.fonts.bold }]}>
                    Paso {activeStep.stepNumber}
                  </Text>
                </View>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {activeStep.title}
                </Text>

                <View style={styles.modalMeta}>
                  <View style={[styles.modalMetaChip, { backgroundColor: colors.card }]}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </Svg>
                    <Text style={[styles.modalMetaText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                      {activeStep.placeName}
                    </Text>
                  </View>
                  <View style={[styles.modalMetaChip, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalMetaText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                      {activeStep.estimatedCost}
                    </Text>
                  </View>
                  <View style={[styles.modalMetaChip, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalMetaText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                      {activeStep.time}
                    </Text>
                  </View>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Descripción
                  </Text>
                  <Text style={[styles.sectionText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    {activeStep.description}
                  </Text>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Ubicación
                  </Text>
                  <View style={styles.addressRow}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={accentBlue} strokeWidth={2}>
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </Svg>
                    <Text style={[styles.addressText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                      {activeStep.address}
                    </Text>
                  </View>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Califica este paso
                  </Text>
                  <StarRating
                    rating={stepRating}
                    onRatingChange={setStepRating}
                    onSubmit={() => setStepRatingSubmitted(true)}
                    isSubmitted={stepRatingSubmitted}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.modalCta, { backgroundColor: accentBlue, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => {
                    setShowDetailModal(false);
                    setIsNavigating(true);
                  }}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#FFFFFF">
                    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </Svg>
                  <Text style={[styles.modalCtaText, { fontFamily: typography.fonts.bold }]}>
                    Navegar a este paso
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>

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

  // Map elements
  cityBlock: {
    position: 'absolute',
  },
  parkZone: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parkLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  userGps: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  gpsDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 5,
  },
  gpsHalo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,122,255,0.18)',
  },

  // Pins
  pinAnchor: {
    position: 'absolute',
    alignItems: 'center',
    width: 120,
    transform: [{ translateX: -60 }, { translateY: -20 }],
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  pinText: {
    fontSize: 13,
  },
  pinLabel: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 120,
  },
  pinLabelText: {
    fontSize: 10,
    textAlign: 'center',
  },

  // Top overlay
  topOverlay: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 20,
  },

  // Navigation banner
  navBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    elevation: 8,
  },
  navIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navMainText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  navSubText: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  navStopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navStopText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '700',
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 10,
    elevation: 4,
  },
  searchBarText: {
    flex: 1,
    fontSize: 14,
  },

  // Dropdown
  dropdown: {
    marginTop: 8,
    padding: 14,
    borderWidth: 1,
    elevation: 8,
    gap: 8,
  },
  dropdownSearch: {
    height: 40,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 4,
  },
  dropdownLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    gap: 10,
  },
  dropdownItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  dropdownItemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  dropdownClose: {
    borderTopWidth: 1,
    paddingTop: 10,
    alignItems: 'center',
  },
  dropdownCloseText: {
    fontSize: 13,
  },

  // Step chips
  stepsRow: {
    gap: 6,
    marginTop: 10,
    paddingVertical: 2,
  },
  stepChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  stepChipText: {
    fontSize: 11,
  },

  // Bottom card
  bottomCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    elevation: 6,
  },
  cardImage: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  cardTime: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 2,
  },
  cardPlace: {
    fontSize: 12,
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailBtn: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  detailBtnText: {
    fontSize: 12,
  },
  navBtn: {
    flex: 1,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
  },

  // Empty card
  emptyCard: {
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
    elevation: 4,
  },
  emptyCardTitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  emptyCardSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHero: {
    position: 'relative',
    width: '100%',
    height: 260,
  },
  modalHeroImage: {
    width: '100%',
    height: '100%',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalHeroBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  modalHeroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 12,
  },
  modalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  modalMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalMetaText: {
    fontSize: 12,
  },

  // Section cards
  sectionCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 13,
    flex: 1,
  },

  // CTA
  modalCta: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  modalCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  // Overlay Drawer Panel Styles
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalBackdrop: {
    width: '12%',
    height: '100%',
  },
  drawerPanel: {
    flex: 1,
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  drawerHandleBar: {
    width: '100%',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerHandlePill: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
});
