import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

type DateVibe = 'ROMANTIC' | 'CASUAL' | 'BOHEMIAN' | 'CULTURAL' | 'ADVENTURE';

interface ItineraryStep {
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
}

interface GeneratedItinerary {
  id: string;
  title: string;
  tagline: string;
  totalDuration: string;
  totalCost: string;
  matchScore: number;
  steps: ItineraryStep[];
}

const VIBES: { id: DateVibe; label: string; icon: string }[] = [
  { id: 'ROMANTIC', label: 'Romántico', icon: '✨' },
  { id: 'CASUAL', label: 'Casual', icon: '☕' },
  { id: 'BOHEMIAN', label: 'Nocturno', icon: '🍷' },
  { id: 'CULTURAL', label: 'Cultura', icon: '🎭' },
  { id: 'ADVENTURE', label: 'Aventura', icon: '⚡' },
];

const MOCK_GENERATED_ITINERARY: GeneratedItinerary = {
  id: 'itin-101',
  title: 'Noche Mágica en la Americana',
  tagline: 'Coctelería de autor, cena gourmet y caminata bajo las estrellas.',
  totalDuration: '3.5 Horas',
  totalCost: '$$ ($850 MXN aprox.)',
  matchScore: 98,
  steps: [
    {
      stepNumber: 1,
      time: '18:30 PM',
      title: 'Cócteles de Autor al Atardecer',
      placeName: 'Terraza Luna Gastro Bar',
      categoryEmoji: '🍸',
      address: 'Av. Chapultepec Norte 340, Americana',
      latitude: 20.6741,
      longitude: -103.3682,
      description: 'Coctelería artesanal y bocadillos con vista panorámica de la ciudad.',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      estimatedCost: '$250 MXN'
    },
    {
      stepNumber: 2,
      time: '19:45 PM',
      title: 'Cena a la Luz de las Velas',
      placeName: 'Trattoria Barrio',
      categoryEmoji: '🍝',
      address: 'Calle López Cotilla 1420, Americana',
      latitude: 20.6725,
      longitude: -103.3611,
      description: 'Pasta artesanal italiana, vino tinto de la casa y ambiente romántico.',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      estimatedCost: '$480 MXN'
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
      description: 'Paseo tranquilo degustando helado italiano artesanal.',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      estimatedCost: '$120 MXN'
    }
  ]
};

export default function GeneratorScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();

  const [promptText, setPromptText] = useState('');
  const [selectedVibe, setSelectedVibe] = useState<DateVibe>('ROMANTIC');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(MOCK_GENERATED_ITINERARY);
  const [selectedStep, setSelectedStep] = useState<ItineraryStep | null>(null);
  
  // Rating de paso
  const [stepRating, setStepRating] = useState<number>(0);
  const [stepRatingSubmitted, setStepRatingSubmitted] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setItinerary(MOCK_GENERATED_ITINERARY);
    }, 1500);
  };

  const openStepDetail = (step: ItineraryStep) => {
    setSelectedStep(step);
    setStepRating(0);
    setStepRatingSubmitted(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Minimalist Header */}
        <View style={styles.header}>
          <Text style={[styles.headerSub, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
            NEXTDATE AI
          </Text>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            Diseña tu Cita
          </Text>
        </View>

        {/* Minimalist Prompt Bar */}
        <View style={[styles.minimalBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <TextInput
            style={[styles.minimalInput, { color: colors.text, fontFamily: typography.fonts.regular }]}
            placeholder="¿Qué tienes en mente para tu cita? (ej. Cena italiana y caminata...)"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={2}
            value={promptText}
            onChangeText={setPromptText}
          />

          {/* Vibe Selection Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vibeScroll}>
            {VIBES.map((vibe) => {
              const isSelected = selectedVibe === vibe.id;
              return (
                <TouchableOpacity
                  key={vibe.id}
                  style={[
                    styles.vibeChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.round
                    }
                  ]}
                  onPress={() => setSelectedVibe(vibe.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 12, marginRight: 4 }}>{vibe.icon}</Text>
                  <Text style={[
                    styles.vibeChipText,
                    { color: isSelected ? colors.primaryContrast : colors.textSecondary, fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium }
                  ]}>
                    {vibe.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Botón Minimalista */}
          <TouchableOpacity 
            style={[styles.generateBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
            activeOpacity={0.9}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color={colors.primaryContrast} size="small" />
            ) : (
              <Text style={[styles.generateBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                Generar con IA ✨
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* RESULTADO ULTRA MINIMALISTA */}
        {itinerary && !isGenerating ? (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={[styles.matchText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                {itinerary.matchScore}% Compatibilidad
              </Text>
              <Text style={[styles.itineraryTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                {itinerary.title}
              </Text>
              <Text style={[styles.itineraryTagline, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                {itinerary.tagline}
              </Text>
            </View>

            {/* Cronograma de Pasos */}
            <View style={styles.stepsList}>
              {itinerary.steps.map((step) => (
                <TouchableOpacity
                  key={step.stepNumber}
                  style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}
                  activeOpacity={0.88}
                  onPress={() => openStepDetail(step)}
                >
                  <Image source={{ uri: step.imageUrl }} style={styles.stepThumb} />
                  
                  <View style={styles.stepInfo}>
                    <View style={styles.stepTopRow}>
                      <Text style={[styles.stepTime, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                        Paso {step.stepNumber} • {step.time}
                      </Text>
                    </View>

                    <Text style={[styles.stepTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      {step.categoryEmoji} {step.title}
                    </Text>

                    <Text style={[styles.stepPlaceText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                      📍 {step.placeName}
                    </Text>
                  </View>

                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2} style={{ marginRight: 12 }}>
                    <Path d="M9 18l6-6-6-6" />
                  </Svg>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

      </ScrollView>

      {/* DETALLE COMPLETO DEL PASO AL DARLE CLICK EN LA CARD */}
      <Modal
        visible={!!selectedStep}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedStep(null)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {selectedStep ? (
            <View style={{ flex: 1 }}>
              
              {/* Imagen & Botón X */}
              <View style={styles.modalImageWrapper}>
                <Image source={{ uri: selectedStep.imageUrl }} style={styles.modalImage} />
                
                <TouchableOpacity 
                  style={styles.closeBtn}
                  activeOpacity={0.8}
                  onPress={() => setSelectedStep(null)}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Contenido Detallado del Paso */}
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.modalBadgeRow}>
                  <View style={[styles.modalPill, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.modalPillText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                      Paso {selectedStep.stepNumber} del Itinerario
                    </Text>
                  </View>
                  <Text style={[styles.modalTime, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                    🕒 {selectedStep.time}
                  </Text>
                </View>

                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {selectedStep.categoryEmoji} {selectedStep.title}
                </Text>

                <Text style={[styles.modalPlace, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  📍 {selectedStep.placeName} • {selectedStep.estimatedCost}
                </Text>

                <Text style={[styles.modalDesc, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {selectedStep.description}
                </Text>

                {/* UBICACIÓN EN MAPA */}
                <Text style={[styles.modalSectionTitle, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 20 }]}>
                  Ubicación del Plan
                </Text>
                <Text style={[styles.modalAddress, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {selectedStep.address}
                </Text>

                <View style={[styles.mapCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <View style={[styles.mapInner, { backgroundColor: colors.primary + '08' }]}>
                    <View style={[styles.mapPin, { backgroundColor: colors.primary }]}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2}>
                        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </Svg>
                    </View>
                    <Text style={[styles.mapText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      {selectedStep.placeName}
                    </Text>
                  </View>
                </View>

                {/* COMPONENTE DE CALIFICACIÓN (RATE) DEBAJO DEL MAPA */}
                <Text style={[styles.modalSectionTitle, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 12 }]}>
                  Califica este Plan
                </Text>
                <View style={[styles.rateCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        activeOpacity={0.7}
                        onPress={() => setStepRating(star)}
                        style={{ padding: 4 }}
                      >
                        <Text style={{ fontSize: 28, opacity: star <= stepRating ? 1 : 0.25 }}>
                          ⭐
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {stepRating > 0 && !stepRatingSubmitted ? (
                    <TouchableOpacity
                      style={[styles.rateSubmitBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                      onPress={() => setStepRatingSubmitted(true)}
                    >
                      <Text style={[styles.rateSubmitText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                        Enviar Calificación
                      </Text>
                    </TouchableOpacity>
                  ) : stepRatingSubmitted ? (
                    <Text style={[styles.rateThanks, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                      ¡Gracias por calificar este paso! 🙌
                    </Text>
                  ) : null}
                </View>

                {/* BOTÓN SEPARADO DE ACCIÓN */}
                <TouchableOpacity 
                  style={[styles.confirmStepBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => setSelectedStep(null)}
                >
                  <Text style={[styles.confirmStepText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    Planear Este Paso ✨
                  </Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* FLOATING PILL BOTTOM BAR */}
      <View style={styles.floatingPillWrapper}>
        <View style={styles.floatingPillBar}>
          
          <TouchableOpacity style={styles.pillTabItem} activeOpacity={0.8} onPress={() => router.push('/explore')}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </Svg>
            <Text style={styles.pillTabText}>Explorar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pillTabItem} activeOpacity={0.8} onPress={() => router.push('/explore')}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Path d="M1 6v13l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v13M16 6v13" />
            </Svg>
            <Text style={styles.pillTabText}>Mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.pillTabItem, styles.activePillCapsule]} activeOpacity={0.8}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
              <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </Svg>
            <Text style={[styles.pillTabText, styles.activePillText]}>AI Citas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pillTabItem} activeOpacity={0.8}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <Circle cx="9" cy="7" r="4" />
            </Svg>
            <Text style={styles.pillTabText}>Comunidad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pillTabItem} activeOpacity={0.8} onPress={() => router.push('/(onboarding)/setup-profile')}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Circle cx="12" cy="7" r="4" />
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            </Svg>
            <Text style={styles.pillTabText}>Perfil</Text>
          </TouchableOpacity>

        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 14,
  },
  headerSub: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
  },
  minimalBox: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  minimalInput: {
    minHeight: 56,
    fontSize: 14,
    marginBottom: 10,
  },
  vibeScroll: {
    gap: 6,
    marginBottom: 12,
  },
  vibeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vibeChipText: {
    fontSize: 12,
  },
  generateBtn: {
    height: 44,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
  },
  generateBtnText: {
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 4,
  },
  resultsHeader: {
    marginBottom: 12,
  },
  matchText: {
    fontSize: 12,
    marginBottom: 2,
  },
  itineraryTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 2,
  },
  itineraryTagline: {
    fontSize: 13,
    lineHeight: 18,
  },
  stepsList: {
    gap: 12,
    marginTop: 10,
  },
  stepCard: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  stepThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepTopRow: {
    marginBottom: 2,
  },
  stepTime: {
    fontSize: 11,
  },
  stepTitleText: {
    fontSize: 15,
    marginBottom: 2,
  },
  stepPlaceText: {
    fontSize: 12,
  },

  /* MODAL STEP DETAIL */
  modalContainer: {
    flex: 1,
  },
  modalImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justify: 'center',
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalPillText: {
    fontSize: 11,
  },
  modalTime: {
    fontSize: 13,
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 4,
  },
  modalPlace: {
    fontSize: 13,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
  modalSectionTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  modalAddress: {
    fontSize: 13,
    marginBottom: 10,
  },
  mapCard: {
    height: 140,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapInner: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
  },
  mapPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justify: 'center',
    marginBottom: 6,
  },
  mapText: {
    fontSize: 13,
  },
  rateCard: {
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 32,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rateSubmitBtn: {
    height: 38,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
    marginTop: 10,
  },
  rateSubmitText: {
    fontSize: 12,
  },
  rateThanks: {
    fontSize: 12,
    marginTop: 8,
  },
  confirmStepBtn: {
    height: 50,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
    marginTop: 12,
  },
  confirmStepText: {
    fontSize: 15,
  },

  /* FLOTANTE BOTTOM BAR */
  floatingPillWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
    justify: 'center',
  },
  floatingPillBar: {
    height: 68,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E1E22',
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#2A2A30',
  },
  pillTabItem: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 24,
  },
  activePillCapsule: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  pillTabText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 3,
    textAlign: 'center',
    width: '100%',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
