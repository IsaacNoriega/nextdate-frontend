import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import StarRating from '../../components/ui/star-rating';

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
  totalCost: '$850 MXN aprox.',
  matchScore: 98,
  steps: [
    {
      stepNumber: 1,
      time: '18:30',
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
      time: '19:45',
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
      time: '21:15',
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
    text: 'Hola, soy tu asistente NextDate. Describe cómo imaginas tu cita ideal y diseñaré un plan perfecto paso a paso.',
    timestamp: 'Ahora'
  }
];

const QUICK_PROMPTS = [
  'Cita romántica de aniversario',
  'Día casual al aire libre',
  'Noche de gastronomía',
];

export default function GeneratorScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedStep, setSelectedStep] = useState<ItineraryStep | null>(null);
  const [savedItineraryIds, setSavedItineraryIds] = useState<Record<string, boolean>>({});
  const [stepRating, setStepRating] = useState<number>(0);
  const [stepRatingSubmitted, setStepRatingSubmitted] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Swipe right-to-left to close step detail modal
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 25 && gestureState.dx < 0;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40 || gestureState.vx < -0.4) {
          setSelectedStep(null);
        }
      },
    })
  ).current;

  const toggleSaveItinerary = (id: string) => {
    setSavedItineraryIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendMessage = (text?: string) => {
    const messageText = (text || inputPrompt).trim();
    if (!messageText || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: 'Ahora'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsThinking(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    setTimeout(() => {
      setIsThinking(false);
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `He diseñado este plan basado en "${messageText}":`,
        itinerary: MOCK_GENERATED_ITINERARY,
        timestamp: 'Ahora'
      };
      setMessages((prev) => [...prev, aiResponse]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }, 1800);
  };

  const openStepDetail = (step: ItineraryStep) => {
    setSelectedStep(step);
    setStepRating(0);
    setStepRatingSubmitted(false);
  };

  const hasUserSentMessage = messages.some(m => m.sender === 'user');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.aiAvatar, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill={colors.primary}>
                <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </Svg>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                NextDate AI
              </Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={[styles.statusText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  Listo para planear
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chat messages */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View key={msg.id} style={[styles.msgRow, isUser ? styles.userRow : styles.aiRow]}>

                {/* AI avatar */}
                {!isUser && (
                  <View style={[styles.msgAvatar, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill={colors.primary}>
                      <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </Svg>
                  </View>
                )}

                <View style={[
                  styles.bubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: colors.primary, borderRadius: borderRadius.lg }]
                    : [styles.aiBubble, { borderRadius: borderRadius.lg }]
                ]}>
                  {msg.text ? (
                    <Text style={[
                      styles.bubbleText,
                      { color: isUser ? colors.primaryContrast : colors.text, fontFamily: typography.fonts.regular }
                    ]}>
                      {msg.text}
                    </Text>
                  ) : null}

                  {/* Itinerary card */}
                  {msg.itinerary ? (() => {
                    const itin = msg.itinerary!;
                    const isSaved = !!savedItineraryIds[itin.id];
                    return (
                      <View style={styles.itinContainer}>
                        {/* Header card */}
                        <View style={[styles.itinHeader, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                          <View style={styles.itinHeaderTop}>
                            <Text style={[styles.itinTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                              {itin.title}
                            </Text>
                            <View style={styles.matchBadge}>
                              <Text style={[styles.matchText, { fontFamily: typography.fonts.bold }]}>
                                {itin.matchScore}%
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.itinTagline, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                            {itin.tagline}
                          </Text>
                          <View style={styles.itinMeta}>
                            <View style={[styles.metaChip, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
                              <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                                <Path d="M12 6v6l4 2" />
                                <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                              </Svg>
                              <Text style={[styles.metaChipText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                                {itin.totalDuration}
                              </Text>
                            </View>
                            <View style={[styles.metaChip, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
                              <Text style={[styles.metaChipText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                                {itin.totalCost}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Steps timeline */}
                        <View style={styles.timeline}>
                          {itin.steps.map((step, index) => {
                            const isLast = index === itin.steps.length - 1;
                            return (
                              <View key={step.stepNumber} style={styles.timelineItem}>
                                {/* Timeline column */}
                                <View style={styles.timelineCol}>
                                  <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
                                    <Text style={[styles.timelineDotText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                                      {step.stepNumber}
                                    </Text>
                                  </View>
                                  {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                                </View>

                                {/* Step card */}
                                <TouchableOpacity
                                  style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}
                                  activeOpacity={0.9}
                                  onPress={() => openStepDetail(step)}
                                >
                                  <Image source={{ uri: step.imageUrl }} style={[styles.stepImage, { borderRadius: borderRadius.sm }]} />
                                  <View style={styles.stepInfo}>
                                    <Text style={[styles.stepTime, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                                      {step.time}
                                    </Text>
                                    <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
                                      {step.title}
                                    </Text>
                                    <Text style={[styles.stepPlace, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                                      {step.placeName} · {step.estimatedCost}
                                    </Text>
                                  </View>
                                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                                    <Path d="M9 18l6-6-6-6" />
                                  </Svg>
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>

                        {/* Save button */}
                        <TouchableOpacity
                          style={[
                            styles.saveBtn,
                            {
                              backgroundColor: isSaved ? '#30D158' : colors.primary,
                              borderRadius: borderRadius.md
                            }
                          ]}
                          activeOpacity={0.88}
                          onPress={() => toggleSaveItinerary(itin.id)}
                        >
                          {isSaved ? (
                            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2.5}>
                              <Path d="M20 6L9 17l-5-5" />
                            </Svg>
                          ) : (
                            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2}>
                              <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </Svg>
                          )}
                          <Text style={[styles.saveBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                            {isSaved ? 'Guardado' : 'Guardar itinerario'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })() : null}
                </View>
              </View>
            );
          })}

          {/* Thinking indicator */}
          {isThinking && (
            <View style={[styles.msgRow, styles.aiRow]}>
              <View style={[styles.msgAvatar, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill={colors.primary}>
                  <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </Svg>
              </View>
              <View style={[styles.thinkingBubble, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.thinkingText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  Diseñando tu cita...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick prompts - only show before first user message */}
        {!hasUserSentMessage && !isThinking && (
          <View style={styles.quickPrompts}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsScroll}>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.quickChip, { borderColor: colors.border, borderRadius: borderRadius.round }]}
                  activeOpacity={0.8}
                  onPress={() => handleSendMessage(prompt)}
                >
                  <Text style={[styles.quickChipText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: isInputFocused ? colors.primary : colors.border, borderRadius: borderRadius.round }]}>
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: typography.fonts.regular }]}
              placeholder="Describe tu cita ideal..."
              placeholderTextColor={colors.textSecondary}
              value={inputPrompt}
              onChangeText={setInputPrompt}
              onSubmitEditing={() => handleSendMessage()}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: inputPrompt.trim() ? colors.primary : colors.border }]}
              activeOpacity={0.8}
              onPress={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isThinking}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={inputPrompt.trim() ? colors.primaryContrast : colors.textSecondary} strokeWidth={2.5}>
                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>

      {/* Step Detail Modal */}
      <Modal
        visible={!!selectedStep}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedStep(null)}
      >
        <SafeAreaView 
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
          {...panResponder.panHandlers}
        >
          {selectedStep ? (
            <View style={{ flex: 1 }}>
              <View style={styles.modalHero}>
                <Image source={{ uri: selectedStep.imageUrl }} style={styles.modalHeroImage} />
                <TouchableOpacity
                  style={styles.modalClose}
                  activeOpacity={0.8}
                  onPress={() => setSelectedStep(null)}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
                <View style={[styles.modalHeroBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.modalHeroBadgeText, { fontFamily: typography.fonts.bold }]}>
                    Paso {selectedStep.stepNumber}
                  </Text>
                </View>
              </View>

                <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {selectedStep.title}
                  </Text>

                  <View style={styles.modalMeta}>
                    <View style={[styles.modalMetaChip, { backgroundColor: colors.card }]}>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </Svg>
                      <Text style={[styles.modalMetaText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                        {selectedStep.placeName}
                      </Text>
                    </View>
                    <View style={[styles.modalMetaChip, { backgroundColor: colors.card }]}>
                      <Text style={[styles.modalMetaText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                        {selectedStep.estimatedCost}
                      </Text>
                    </View>
                    <View style={[styles.modalMetaChip, { backgroundColor: colors.card }]}>
                      <Text style={[styles.modalMetaText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                        {selectedStep.time}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      Descripción
                    </Text>
                    <Text style={[styles.sectionText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                      {selectedStep.description}
                    </Text>
                  </View>

                  <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      Ubicación
                    </Text>
                    <View style={styles.addressRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </Svg>
                      <Text style={[styles.addressText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                        {selectedStep.address}
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
                    style={[styles.modalCta, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                    activeOpacity={0.9}
                    onPress={() => setSelectedStep(null)}
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill={colors.primaryContrast}>
                      <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </Svg>
                    <Text style={[styles.modalCtaText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                      Agregar al itinerario
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#30D158',
  },
  statusText: {
    fontSize: 11,
  },

  // Chat
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  bubble: {
    maxWidth: '85%',
  },
  userBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  aiBubble: {
    paddingVertical: 2,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Thinking
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  thinkingText: {
    fontSize: 13,
  },

  // Itinerary
  itinContainer: {
    marginTop: 12,
    width: '100%',
  },
  itinHeader: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  itinHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itinTitle: {
    fontSize: 18,
    lineHeight: 24,
    flex: 1,
    marginRight: 8,
  },
  matchBadge: {
    backgroundColor: 'rgba(48,209,88,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchText: {
    color: '#30D158',
    fontSize: 12,
  },
  itinTagline: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  itinMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaChipText: {
    fontSize: 11,
  },

  // Timeline
  timeline: {
    marginBottom: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 10,
    paddingTop: 10,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineDotText: {
    fontSize: 11,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -6,
  },
  stepCard: {
    flex: 1,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  stepImage: {
    width: 52,
    height: 52,
    marginRight: 10,
  },
  stepInfo: {
    flex: 1,
  },
  stepTime: {
    fontSize: 11,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 13,
    lineHeight: 17,
    marginBottom: 2,
  },
  stepPlace: {
    fontSize: 11,
  },
  saveBtn: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 14,
  },

  // Quick prompts
  quickPrompts: {
    paddingVertical: 6,
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 13,
  },

  // Input bar
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 95,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 38,
    fontSize: 14,
    paddingHorizontal: 12,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalCta: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  modalCtaText: {
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
