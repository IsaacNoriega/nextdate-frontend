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
type DateDuration = 'SHORT' | 'MEDIUM' | 'FULL_NIGHT';

interface ItineraryStep {
  stepNumber: number;
  time: string;
  title: string;
  placeName: string;
  categoryEmoji: string;
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
  { id: 'ROMANTIC', label: 'Romántico', icon: '💖' },
  { id: 'CASUAL', label: 'Casual & Relax', icon: '☕' },
  { id: 'BOHEMIAN', label: 'Bohemio & Bares', icon: '🍷' },
  { id: 'CULTURAL', label: 'Arte & Cultura', icon: '🎭' },
  { id: 'ADVENTURE', label: 'Aventura', icon: '⚡' },
];

const DURATIONS: { id: DateDuration; label: string; time: string }[] = [
  { id: 'SHORT', label: 'Cita Rápida', time: '1 - 2 hrs' },
  { id: 'MEDIUM', label: 'Tarde Romántica', time: '3 - 4 hrs' },
  { id: 'FULL_NIGHT', label: 'Noche Completa', time: '5+ hrs' },
];

const MOCK_GENERATED_ITINERARY: GeneratedItinerary = {
  id: 'itin-101',
  title: 'Noche Mágica en la Americana',
  tagline: 'Una velada equilibrada con coctelería de autor, cena gourmet y caminata nocturna.',
  totalDuration: '3.5 Horas',
  totalCost: '$$ (Aproximadamente $850 MXN por pareja)',
  matchScore: 98,
  steps: [
    {
      stepNumber: 1,
      time: '18:30 PM',
      title: 'Aperitivos & Cócteles de Autor',
      placeName: 'Terraza Luna & Bar Gastro',
      categoryEmoji: '🍸',
      description: 'Disfruta de la hora dorada con dos cócteles artesanales y una vista increíble de la ciudad.',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      estimatedCost: '$250 MXN'
    },
    {
      stepNumber: 2,
      time: '19:45 PM',
      title: 'Cena a la Luz de las Velas',
      placeName: 'Trattoria & Cervecería Barrio',
      categoryEmoji: '🍝',
      description: 'Pasta fresca hecha en casa, vino tinto de la casa y ambiente íntimo para platicar.',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      estimatedCost: '$480 MXN'
    },
    {
      stepNumber: 3,
      time: '21:15 PM',
      title: 'Postre & Paseo bajo las Estrellas',
      placeName: 'Nieve Artesanal & Jardín Chapultepec',
      categoryEmoji: '🍦',
      description: 'Camina por el camellón iluminado mientras disfrutan un helado de gelato italiano.',
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
  const [selectedDuration, setSelectedDuration] = useState<DateDuration>('MEDIUM');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(MOCK_GENERATED_ITINERARY);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerateItinerary = () => {
    setIsGenerating(true);
    setSavedSuccess(false);
    setTimeout(() => {
      setIsGenerating(false);
      setItinerary(MOCK_GENERATED_ITINERARY);
    }, 1800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header de NextDate AI */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.aiBadge}>
              <Text style={{ fontSize: 12, marginRight: 4 }}>🪄</Text>
              <Text style={[styles.aiBadgeText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                NEXTDATE AI ENGINE
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Generador de Citas
            </Text>
          </View>
        </View>

        {/* Creador por Prompt AI */}
        <View style={[styles.promptCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <Text style={[styles.promptCardTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            ¿Cómo te imaginas tu cita perfecta? ✨
          </Text>
          <Text style={[styles.promptCardSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
            Cuéntale a nuestra Inteligencia Artificial tus gustos, presupuesto u ocasión especial.
          </Text>

          <TextInput
            style={[styles.promptInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
            placeholder="Ej. Cita sorpresa para nuestro aniversario, cena italiana, lugar con velas y terraza..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            value={promptText}
            onChangeText={setPromptText}
          />

          {/* Filtro Vibe / Ambiente */}
          <Text style={[styles.filterLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            Ambiente deseado:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
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
                  <Text style={{ marginRight: 4 }}>{vibe.icon}</Text>
                  <Text style={[
                    styles.vibeChipText,
                    { color: isSelected ? colors.primaryContrast : colors.text, fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium }
                  ]}>
                    {vibe.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Filtro Duración */}
          <Text style={[styles.filterLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium, marginTop: 12 }]}>
            Duración estimada:
          </Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((dur) => {
              const isSelected = selectedDuration === dur.id;
              return (
                <TouchableOpacity
                  key={dur.id}
                  style={[
                    styles.durationChip,
                    {
                      backgroundColor: isSelected ? colors.primary + '18' : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.md
                    }
                  ]}
                  onPress={() => setSelectedDuration(dur.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.durationTitle,
                    { color: isSelected ? colors.primary : colors.text, fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium }
                  ]}>
                    {dur.label}
                  </Text>
                  <Text style={[styles.durationTime, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    {dur.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botón Principal Generar */}
          <TouchableOpacity 
            style={[styles.generateBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
            activeOpacity={0.9}
            onPress={handleGenerateItinerary}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <View style={styles.generatingRow}>
                <ActivityIndicator color={colors.primaryContrast} size="small" style={{ marginRight: 8 }} />
                <Text style={[styles.generateBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                  Diseñando la cita perfecta...
                </Text>
              </View>
            ) : (
              <Text style={[styles.generateBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                🪄 Generar Itinerario con IA
              </Text>
            )}
          </TouchableOpacity>

        </View>

        {/* RESULTADO DEL ITINERARIO GENERADO */}
        {itinerary && !isGenerating ? (
          <View style={styles.resultSection}>
            <View style={styles.resultHeaderRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.matchBadge}>
                  <Text style={[styles.matchBadgeText, { color: '#34C759', fontFamily: typography.fonts.bold }]}>
                    🎯 {itinerary.matchScore}% de compatibilidad
                  </Text>
                </View>
                <Text style={[styles.itineraryTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {itinerary.title}
                </Text>
                <Text style={[styles.itineraryTagline, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {itinerary.tagline}
                </Text>
              </View>
            </View>

            {/* Metadatos Rápidos */}
            <View style={[styles.metaSummaryBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
              <View style={styles.metaItem}>
                <Text style={[styles.metaItemLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>Duración</Text>
                <Text style={[styles.metaItemVal, { color: colors.text, fontFamily: typography.fonts.bold }]}>⏱️ {itinerary.totalDuration}</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
              <View style={styles.metaItem}>
                <Text style={[styles.metaItemLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>Presupuesto</Text>
                <Text style={[styles.metaItemVal, { color: colors.text, fontFamily: typography.fonts.bold }]}>💰 {itinerary.totalCost}</Text>
              </View>
            </View>

            {/* Timeline Paso a Paso */}
            <Text style={[styles.sectionSubtitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Cronograma de la Cita:
            </Text>

            {itinerary.steps.map((step, index) => (
              <View key={step.stepNumber} style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Image source={{ uri: step.imageUrl }} style={styles.stepImage} />
                
                <View style={styles.stepBody}>
                  <View style={styles.stepTimeRow}>
                    <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.stepBadgeText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                        Paso {step.stepNumber}
                      </Text>
                    </View>
                    <Text style={[styles.stepTimeText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                      🕒 {step.time}
                    </Text>
                  </View>

                  <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {step.categoryEmoji} {step.title}
                  </Text>
                  
                  <Text style={[styles.stepPlaceName, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    📍 {step.placeName} • {step.estimatedCost}
                  </Text>

                  <Text style={[styles.stepDesc, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}

            {/* Botones de Acción de Cita */}
            <View style={styles.actionButtonsCol}>
              {!savedSuccess ? (
                <TouchableOpacity 
                  style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => setSavedSuccess(true)}
                >
                  <Text style={[styles.saveBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    💾 Guardar en Mis Citas
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.savedSuccessBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                  <Text style={[styles.savedSuccessText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    ✅ ¡Cita guardada con éxito en tu agenda!
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.variantBtn, { borderColor: colors.border, borderRadius: borderRadius.md }]}
                activeOpacity={0.8}
                onPress={handleGenerateItinerary}
              >
                <Text style={[styles.variantBtnText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                  🔄 Probar otra variante de itinerario
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        ) : null}

      </ScrollView>

      {/* FLOATING PILL BOTTOM BAR — CONECTADA */}
      <View style={styles.floatingPillWrapper}>
        <View style={styles.floatingPillBar}>
          
          {/* TAB 1: Explorar */}
          <TouchableOpacity 
            style={styles.pillTabItem} 
            activeOpacity={0.8}
            onPress={() => router.push('/explore')}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </Svg>
            <Text style={styles.pillTabText}>
              Explorar
            </Text>
          </TouchableOpacity>

          {/* TAB 2: Mapa */}
          <TouchableOpacity 
            style={styles.pillTabItem} 
            activeOpacity={0.8}
            onPress={() => router.push('/explore')}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Path d="M1 6v13l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v13M16 6v13" />
            </Svg>
            <Text style={styles.pillTabText}>
              Mapa
            </Text>
          </TouchableOpacity>

          {/* TAB 3: NextDate AI (ACTIVO) */}
          <TouchableOpacity 
            style={[styles.pillTabItem, styles.activePillCapsule]} 
            activeOpacity={0.8}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
              <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </Svg>
            <Text style={[styles.pillTabText, styles.activePillText]}>
              AI Citas
            </Text>
          </TouchableOpacity>

          {/* TAB 4: Comunidad */}
          <TouchableOpacity 
            style={styles.pillTabItem} 
            activeOpacity={0.8}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <Circle cx="9" cy="7" r="4" />
            </Svg>
            <Text style={styles.pillTabText}>
              Comunidad
            </Text>
          </TouchableOpacity>

          {/* TAB 5: Perfil */}
          <TouchableOpacity 
            style={styles.pillTabItem} 
            activeOpacity={0.8}
            onPress={() => router.push('/(onboarding)/setup-profile')}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Circle cx="12" cy="7" r="4" />
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            </Svg>
            <Text style={styles.pillTabText}>
              Perfil
            </Text>
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
  headerRow: {
    marginBottom: 16,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  promptCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  promptCardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  promptCardSub: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  promptInput: {
    minHeight: 80,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  chipsScroll: {
    gap: 8,
    marginBottom: 4,
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
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  durationChip: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationTitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  durationTime: {
    fontSize: 10,
  },
  generateBtn: {
    height: 48,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateBtnText: {
    fontSize: 15,
  },

  /* SECCIÓN RESULTADO */
  resultSection: {
    marginTop: 8,
  },
  resultHeaderRow: {
    marginBottom: 14,
  },
  matchBadge: {
    marginBottom: 4,
  },
  matchBadgeText: {
    fontSize: 13,
  },
  itineraryTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 4,
  },
  itineraryTagline: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaSummaryBox: {
    flexDirection: 'row',
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaItemLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metaItemVal: {
    fontSize: 13,
  },
  metaDivider: {
    width: 1,
    height: '100%',
  },
  sectionSubtitle: {
    fontSize: 17,
    marginBottom: 14,
  },
  stepCard: {
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  stepImage: {
    width: '100%',
    height: 140,
  },
  stepBody: {
    padding: 16,
  },
  stepTimeRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 11,
  },
  stepTimeText: {
    fontSize: 13,
  },
  stepTitle: {
    fontSize: 17,
    marginBottom: 4,
  },
  stepPlaceName: {
    fontSize: 13,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  actionButtonsCol: {
    gap: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  saveBtn: {
    height: 50,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
  },
  saveBtnText: {
    fontSize: 15,
  },
  savedSuccessBox: {
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  savedSuccessText: {
    fontSize: 14,
  },
  variantBtn: {
    height: 48,
    width: '100%',
    borderWidth: 1,
    alignItems: 'center',
    justify: 'center',
  },
  variantBtnText: {
    fontSize: 14,
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
