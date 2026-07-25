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
    text: '¡Hola! 🪄 Soy tu Asistente NextDate AI. Aquí tienes una propuesta inicial recomendada paso a paso. También puedes escribir tu propio deseo abajo:',
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

    // Simular respuesta inteligente de la IA
    setTimeout(() => {
      setIsThinking(false);
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `¡Excelente idea! Basado en "${userText}", he diseñado el siguiente itinerario personalizado:`,
        itinerary: MOCK_GENERATED_ITINERARY,
        timestamp: 'Ahora'
      };
      setMessages((prev) => [...prev, aiResponse]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }, 1600);
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
        
        {/* Header Superior del Chat AI */}
        <View style={[styles.chatHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.avatarAi}>
            <Text style={{ fontSize: 18 }}>🪄</Text>
          </View>
          <View>
            <Text style={[styles.chatHeaderTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              NextDate AI
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.greenDot} />
              <Text style={[styles.chatHeaderStatus, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                En línea • Asistente Inteligente
              </Text>
            </View>
          </View>
        </View>

        {/* Lista de Mensajes del Chat */}
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
                  styles.messageWrapper,
                  isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
                ]}
              >
                {!isUser ? (
                  <View style={styles.smallAiAvatar}>
                    <Text style={{ fontSize: 12 }}>🪄</Text>
                  </View>
                ) : null}

                <View 
                  style={[
                    styles.messageBubble,
                    isUser ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                    { borderRadius: borderRadius.lg }
                  ]}
                >
                  {msg.text ? (
                    <Text 
                      style={[
                        styles.messageText, 
                        { color: isUser ? colors.primaryContrast : colors.text, fontFamily: typography.fonts.regular }
                      ]}
                    >
                      {msg.text}
                    </Text>
                  ) : null}

                  {/* ITINERARIO PASO A PASO EN FORMATO STEPPER DENTRO DEL CHAT */}
                  {msg.itinerary ? (
                    <View style={styles.itineraryContainer}>
                      
                      <View style={styles.itineraryHeader}>
                        <Text style={[styles.matchBadge, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                          🎯 {msg.itinerary.matchScore}% Compatibilidad
                        </Text>
                        <Text style={[styles.itineraryTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                          {msg.itinerary.title}
                        </Text>
                        <Text style={[styles.itineraryTagline, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                          {msg.itinerary.tagline}
                        </Text>
                      </View>

                      {/* STEPPER VERTICAL INTERACTIVO */}
                      <View style={styles.stepperContainer}>
                        {msg.itinerary.steps.map((step, index) => {
                          const isLast = index === msg.itinerary!.steps.length - 1;
                          return (
                            <View key={step.stepNumber} style={styles.stepperRow}>
                              
                              {/* Nodo y línea conectora */}
                              <View style={styles.stepperNodeCol}>
                                <View style={[styles.stepperCircle, { backgroundColor: colors.primary }]}>
                                  <Text style={[styles.stepperCircleText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                                    {step.stepNumber}
                                  </Text>
                                </View>
                                {!isLast ? (
                                  <View style={[styles.stepperLine, { backgroundColor: colors.primary + '50' }]} />
                                ) : null}
                              </View>

                              {/* Card del Paso */}
                              <TouchableOpacity
                                style={[styles.stepperCard, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.md }]}
                                activeOpacity={0.88}
                                onPress={() => openStepDetail(step)}
                              >
                                <Image source={{ uri: step.imageUrl }} style={styles.stepThumb} />
                                
                                <View style={styles.stepInfo}>
                                  <Text style={[styles.stepTime, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                                    🕒 {step.time}
                                  </Text>

                                  <Text style={[styles.stepTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                                    {step.categoryEmoji} {step.title}
                                  </Text>

                                  <Text style={[styles.stepPlaceText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                                    📍 {step.placeName}
                                  </Text>
                                </View>

                                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                                  <Path d="M9 18l6-6-6-6" />
                                </Svg>
                              </TouchableOpacity>

                            </View>
                          );
                        })}
                      {/* Botón de Guardar Plan de Cita */}
                      <View style={styles.savePlanActionRow}>
                        <TouchableOpacity
                          style={[
                            styles.savePlanBtn,
                            {
                              backgroundColor: savedItineraryIds[msg.itinerary.id] ? '#34C759' : colors.primary,
                              borderRadius: borderRadius.md
                            }
                          ]}
                          activeOpacity={0.88}
                          onPress={() => toggleSaveItinerary(msg.itinerary!.id)}
                        >
                          <Text style={[styles.savePlanBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                            {savedItineraryIds[msg.itinerary.id] ? '✅ ¡Plan Guardado en Mis Citas!' : '💾 Guardar este Plan de Cita'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                    </View>
                  ) : null}

                </View>
              </View>
            );
          })}

          {/* Indicador de Pensando/Diseñando de la IA */}
          {isThinking ? (
            <View style={styles.aiThinkingWrapper}>
              <View style={styles.smallAiAvatar}>
                <Text style={{ fontSize: 12 }}>🪄</Text>
              </View>
              <View style={[styles.thinkingBubble, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.thinkingText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  Diseñando la cita perfecta para ti...
                </Text>
              </View>
            </View>
          ) : null}

        </ScrollView>

        {/* INPUT DE CHAT EN LA PARTE INFERIOR */}
        <View style={[styles.chatInputBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.chatTextInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.round, fontFamily: typography.fonts.regular }]}
            placeholder="Escribe cómo quieres tu cita..."
            placeholderTextColor={colors.textSecondary}
            value={inputPrompt}
            onChangeText={setInputPrompt}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: inputPrompt.trim() ? colors.primary : colors.border, borderRadius: 22 }]}
            activeOpacity={0.8}
            onPress={handleSendMessage}
            disabled={!inputPrompt.trim() || isThinking}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2.5}>
              <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </Svg>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* DETALLE COMPLETO DEL PASO AL DARLE CLICK EN CUALQUIER STEP CARD */}
      <Modal
        visible={!!selectedStep}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedStep(null)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {selectedStep ? (
            <View style={{ flex: 1 }}>
              
              {/* Imagen & Botón X de Cierre con top: 36 para librar el notch */}
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

      {/* FLOATING PILL BOTTOM BAR REUTILIZABLE */}
      <BottomBar activeTab="ai" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatarAi: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justify: 'center',
  },
  chatHeaderTitle: {
    fontSize: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  chatHeaderStatus: {
    fontSize: 11,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 150,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '90%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  smallAiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justify: 'center',
    marginTop: 4,
  },
  messageBubble: {
    padding: 14,
    maxWidth: '100%',
  },
  userBubble: {},
  aiBubble: {
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiThinkingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  thinkingText: {
    fontSize: 13,
  },
  itineraryContainer: {
    marginTop: 10,
  },
  itineraryHeader: {
    marginBottom: 10,
  },
  matchBadge: {
    fontSize: 12,
    marginBottom: 2,
  },
  itineraryTitle: {
    fontSize: 18,
    marginBottom: 2,
  },
  itineraryTagline: {
    fontSize: 12,
  },
  stepperContainer: {
    marginTop: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepperNodeCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 8,
    paddingTop: 4,
  },
  stepperCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justify: 'center',
    zIndex: 2,
  },
  stepperCircleText: {
    fontSize: 12,
  },
  stepperLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
    marginBottom: -8,
  },
  stepperCard: {
    flex: 1,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  stepThumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 8,
  },
  stepInfo: {
    flex: 1,
  },
  stepTime: {
    fontSize: 10,
    marginBottom: 1,
  },
  stepTitleText: {
    fontSize: 13,
    marginBottom: 1,
  },
  stepPlaceText: {
    fontSize: 11,
  },
  savePlanActionRow: {
    marginTop: 12,
    width: '100%',
  },
  savePlanBtn: {
    height: 44,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
  },
  savePlanBtnText: {
    fontSize: 13,
  },
  chatInputBar: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 28,
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
  },
  sendBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justify: 'center',
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
});
