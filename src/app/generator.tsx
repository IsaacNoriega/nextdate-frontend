import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import BottomBar from '../components/ui/bottom-bar';

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

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text?: string;
  itinerary?: GeneratedItinerary;
  timestamp: string;
}

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

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: '¡Hola! 🪄 Soy tu Asistente NextDate AI. Aquí tienes una propuesta recomendada paso a paso. También puedes escribir tu propio deseo abajo:',
    itinerary: MOCK_GENERATED_ITINERARY,
    timestamp: 'Ahora'
  }
];

export default function GeneratorScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedStep, setSelectedStep] = useState<ItineraryStep | null>(null);
  
  // Guardado de planes de cita
  const [savedItineraryIds, setSavedItineraryIds] = useState<Record<string, boolean>>({});

  // Rating de paso
  const [stepRating, setStepRating] = useState<number>(0);
  const [stepRatingSubmitted, setStepRatingSubmitted] = useState(false);

  const toggleSaveItinerary = (id: string) => {
    setSavedItineraryIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSendMessage = () => {
    if (!inputPrompt.trim() || isThinking) return;

    const userText = inputPrompt.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Ahora'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsThinking(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setTimeout(() => {
      setIsThinking(false);
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Basado en "${userText}", he preparado este itinerario exclusivo para ti:`,
        itinerary: MOCK_GENERATED_ITINERARY,
        timestamp: 'Ahora'
      };
      setMessages((prev) => [...prev, aiResponse]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }, 1500);
  };

  const openStepDetail = (step: ItineraryStep) => {
    setSelectedStep(step);
    setStepRating(0);
    setStepRatingSubmitted(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        
        {/* Minimal Clean Header */}
        <View style={styles.cleanHeader}>
          <View style={styles.headerTitleRow}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>🪄</Text>
            <Text style={[styles.cleanTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              NextDate AI
            </Text>
            <View style={styles.onlineDot} />
          </View>
        </View>

        {/* Scroll de Conversación Ultra-Minimalista */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View 
                key={msg.id} 
                style={[
                  styles.messageRow,
                  isUser ? styles.userRow : styles.aiRow
                ]}
              >
                <View 
                  style={[
                    styles.cleanBubble,
                    isUser 
                      ? [styles.userBubble, { backgroundColor: colors.primary }] 
                      : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                    { borderRadius: borderRadius.lg }
                  ]}
                >
                  {msg.text ? (
                    <Text 
                      style={[
                        styles.msgText, 
                        { color: isUser ? colors.primaryContrast : colors.text, fontFamily: typography.fonts.regular }
                      ]}
                    >
                      {msg.text}
                    </Text>
                  ) : null}

                  {/* ITINERARIO STEPPER ULTRA-CLEAN */}
                  {msg.itinerary ? (() => {
                    const itin = msg.itinerary;
                    const isSaved = itin ? !!savedItineraryIds[itin.id] : false;
                    return (
                      <View style={styles.itineraryBox}>
                        
                        <View style={styles.itineraryTitleBlock}>
                          <Text style={[styles.matchText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                            ✨ {itin.matchScore}% Compatibilidad
                          </Text>
                          <Text style={[styles.itinTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                            {itin.title}
                          </Text>
                          <Text style={[styles.itinSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                            {itin.tagline}
                          </Text>
                        </View>

                        {/* STEPPER CONECTOR DE NODOS */}
                        <View style={styles.stepperWrap}>
                          {itin.steps.map((step, index) => {
                            const isLast = index === itin.steps.length - 1;
                            return (
                              <View key={step.stepNumber} style={styles.stepperItem}>
                                
                                {/* Nodo Numérico & Línea */}
                                <View style={styles.nodeColumn}>
                                  <View style={[styles.nodeCircle, { backgroundColor: colors.primary }]}>
                                    <Text style={[styles.nodeNum, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                                      {step.stepNumber}
                                    </Text>
                                  </View>
                                  {!isLast ? (
                                    <View style={[styles.nodeLine, { backgroundColor: colors.border }]} />
                                  ) : null}
                                </View>

                                {/* Card del Paso */}
                                <TouchableOpacity
                                  style={[styles.stepCard, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.md }]}
                                  activeOpacity={0.88}
                                  onPress={() => openStepDetail(step)}
                                >
                                  <Image source={{ uri: step.imageUrl }} style={styles.stepImage} />
                                  
                                  <View style={styles.stepDetails}>
                                    <Text style={[styles.stepTime, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                                      {step.time}
                                    </Text>

                                    <Text style={[styles.stepHeadline, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                                      {step.categoryEmoji} {step.title}
                                    </Text>

                                    <Text style={[styles.stepAddress, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                                      📍 {step.placeName}
                                    </Text>
                                  </View>

                                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                                    <Path d="M9 18l6-6-6-6" />
                                  </Svg>
                                </TouchableOpacity>

                              </View>
                            );
                          })}

                          {/* Botón Minimalista Guardar Plan */}
                          <TouchableOpacity
                            style={[
                              styles.minimalSaveBtn,
                              {
                                backgroundColor: isSaved ? '#34C759' : colors.primary,
                                borderRadius: borderRadius.md
                              }
                            ]}
                            activeOpacity={0.88}
                            onPress={() => toggleSaveItinerary(itin.id)}
                          >
                            <Text style={[styles.minimalSaveBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                              {isSaved ? '✓ Plan Guardado' : '💾 Guardar este Plan'}
                            </Text>
                          </TouchableOpacity>

                        </View>

                      </View>
                    );
                  })() : null}

                </View>
              </View>
            );
          })}

          {/* Thinking State */}
          {isThinking ? (
            <View style={styles.thinkingRow}>
              <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.thinkingLabel, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Diseñando tu cita...
              </Text>
            </View>
          ) : null}

        </ScrollView>

        {/* Floating Minimal Chat Input */}
        <View style={[styles.floatingInputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.cleanTextInput, { color: colors.text, fontFamily: typography.fonts.regular }]}
            placeholder="Describe tu cita ideal..."
            placeholderTextColor={colors.textSecondary}
            value={inputPrompt}
            onChangeText={setInputPrompt}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[styles.cleanSendBtn, { backgroundColor: inputPrompt.trim() ? colors.primary : colors.border }]}
            activeOpacity={0.8}
            onPress={handleSendMessage}
            disabled={!inputPrompt.trim() || isThinking}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2.5}>
              <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </Svg>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* DETALLE A PANTALLA COMPLETA NATIVA (MODAL STEP) */}
      <Modal
        visible={!!selectedStep}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedStep(null)}
      >
        <SafeAreaView style={[styles.modalArea, { backgroundColor: colors.background }]}>
          {selectedStep ? (
            <View style={{ flex: 1 }}>
              
              {/* Cover Image & Close X Button (top: 36) */}
              <View style={styles.modalCoverWrapper}>
                <Image source={{ uri: selectedStep.imageUrl }} style={styles.modalCover} />
                
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  activeOpacity={0.8}
                  onPress={() => setSelectedStep(null)}
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
                      Paso {selectedStep.stepNumber}
                    </Text>
                  </View>
                  <Text style={[styles.modalTimeText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                    🕒 {selectedStep.time}
                  </Text>
                </View>

                <Text style={[styles.modalHeadline, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {selectedStep.categoryEmoji} {selectedStep.title}
                </Text>

                <Text style={[styles.modalSubHeadline, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  📍 {selectedStep.placeName} • {selectedStep.estimatedCost}
                </Text>

                <Text style={[styles.modalParagraph, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {selectedStep.description}
                </Text>

                {/* MAPA */}
                <Text style={[styles.modalSectionHeading, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 20 }]}>
                  Ubicación del Plan
                </Text>
                <Text style={[styles.modalAddressText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {selectedStep.address}
                </Text>

                <View style={[styles.mapContainer, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <View style={[styles.mapContent, { backgroundColor: colors.primary + '08' }]}>
                    <View style={[styles.mapPinBg, { backgroundColor: colors.primary }]}>
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2}>
                        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </Svg>
                    </View>
                    <Text style={[styles.mapPinLabel, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      {selectedStep.placeName}
                    </Text>
                  </View>
                </View>

                {/* RATE DEL PLAN (DEBAJO DEL MAPA) */}
                <Text style={[styles.modalSectionHeading, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 12 }]}>
                  Califica este Plan
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

                {/* BOTÓN PLANEAR ESTE PASO SEPARADO */}
                <TouchableOpacity 
                  style={[styles.modalPlanBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => setSelectedStep(null)}
                >
                  <Text style={[styles.modalPlanBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    Planear Este Paso ✨
                  </Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* FLOATING PILL BOTTOM BAR REUTILIZABLE */}
      <BottomBar activeTab="ai" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cleanHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleanTitle: {
    fontSize: 18,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginLeft: 6,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 150,
  },
  messageRow: {
    marginBottom: 14,
    width: '100%',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  aiRow: {
    alignItems: 'flex-start',
  },
  cleanBubble: {
    padding: 12,
    maxWidth: '94%',
  },
  userBubble: {},
  aiBubble: {
    borderWidth: 1,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  thinkingLabel: {
    fontSize: 13,
  },
  itineraryBox: {
    marginTop: 8,
  },
  itineraryTitleBlock: {
    marginBottom: 10,
  },
  matchText: {
    fontSize: 11,
    marginBottom: 2,
  },
  itinTitle: {
    fontSize: 17,
    marginBottom: 2,
  },
  itinSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  stepperWrap: {
    marginTop: 6,
  },
  stepperItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  nodeColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 6,
    paddingTop: 4,
  },
  nodeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justify: 'center',
    zIndex: 2,
  },
  nodeNum: {
    fontSize: 11,
  },
  nodeLine: {
    width: 1.5,
    flex: 1,
    marginTop: 2,
    marginBottom: -6,
  },
  stepCard: {
    flex: 1,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  stepImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: 8,
  },
  stepDetails: {
    flex: 1,
  },
  stepTime: {
    fontSize: 10,
  },
  stepHeadline: {
    fontSize: 13,
  },
  stepAddress: {
    fontSize: 11,
  },
  minimalSaveBtn: {
    height: 40,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
    marginTop: 10,
  },
  minimalSaveBtnText: {
    fontSize: 13,
  },
  floatingInputRow: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 24,
    gap: 8,
  },
  cleanTextInput: {
    flex: 1,
    height: 38,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  cleanSendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justify: 'center',
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
  mapContainer: {
    height: 140,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapContent: {
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
