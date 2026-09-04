import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import QuickPrompts from '../../components/generator/quick-prompts';
import StepDetailModal from '../../components/generator/step-detail-modal';
import { recommendItineraryApi } from '../../services/itineraryService';
import {
  ItineraryStep,
  GeneratedItinerary,
  ChatMessage,
  INITIAL_MESSAGES,
} from '../../mocks/generator.mock';
import {
  SparklesIcon,
  BookmarkIcon,
  CompassIcon,
  StarIcon,
  CheckIcon,
  WandIcon,
} from '../../components/ui/icons';

export default function GeneratorScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ presetPrompt?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [savedItineraryIds, setSavedItineraryIds] = useState<Record<string, boolean>>({});
  const [selectedStep, setSelectedStep] = useState<ItineraryStep | null>(null);
  const [stepRating, setStepRating] = useState<number>(0);

  useEffect(() => {
    if (params.presetPrompt && typeof params.presetPrompt === 'string') {
      setInputPrompt(params.presetPrompt);
    }
  }, [params.presetPrompt]);

  const toggleSaveItinerary = (id: string) => {
    setSavedItineraryIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setInputPrompt('');
    setIsTyping(false);
    setIsThinking(false);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);
    setIsThinking(true);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    const messageText = textToSend.trim();

    if (!user?.id) {
      const authRequiredMsg: ChatMessage = {
        id: `ai-auth-${Date.now()}`,
        sender: 'ai',
        text: 'Para que pueda diseñar y guardar tu itinerario personalizado en tu cuenta de NextDate, por favor inicia sesión o crea una cuenta.',
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, authRequiredMsg]);
      setIsTyping(false);
      setIsThinking(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    try {
      const result = await recommendItineraryApi(user.id, messageText);
      const generatedItinerary: GeneratedItinerary = {
        id: result.id,
        title: result.title,
        tagline: result.description || 'Itinerario personalizado con NextDate AI',
        totalCost: `$${result.totalCost.toFixed(2)} USD`,
        matchScore: 98,
        steps: result.items.map((item, idx) => ({
          stepNumber: item.sequenceOrder || idx + 1,
          time: `${19 + idx}:00 hrs`,
          title: item.notes || `Paso ${item.sequenceOrder}`,
          placeName: item.place ? item.place.name : 'Lugar Recomendado',
          categoryEmoji:
            item.place?.category === 'FOOD_DRINK'
              ? '🍷'
              : item.place?.category === 'CULTURE'
              ? '🎭'
              : '✨',
          address: item.place?.address || 'Guadalajara, Jal.',
          latitude: item.place?.latitude || 20.6745,
          longitude: item.place?.longitude || -103.3702,
          duration: `${item.durationInMinutes || 60} min`,
          notes: item.notes || 'Disfruta de esta parada recomendada.',
          transportMode: item.transportToNext || 'WALKING',
          transitTime: `${item.transitTimeToNext || 10} min`,
          cost: `$${(result.totalCost / (result.items.length || 1)).toFixed(2)}`,
          imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
        })),
      };

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `¡Listo! He diseñado este plan ideal para ustedes basado en tu solicitud: "${messageText}".`,
        itinerary: generatedItinerary,
        timestamp: 'Ahora',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.log('Error conectando con el Concierge de IA:', err);
      let errorDetail = err?.message || 'Error del servidor';
      if (errorDetail.includes('token JWT') || errorDetail.includes('Acceso no autorizado')) {
        errorDetail = 'Tu sesión no está activa o ha expirado. Por favor inicia sesión nuevamente.';
      }
      const errorAiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Lo siento, no pude generar el itinerario en este momento: ${errorDetail}`,
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, errorAiMsg]);
    } finally {
      setIsTyping(false);
      setIsThinking(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const hasUserSentMessage = messages.some((m) => m.sender === 'user');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header Estilizado */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.avatarIconWrap,
                {
                  backgroundColor: colors.primary + '18',
                  borderColor: colors.primary + '35',
                },
              ]}
            >
              <SparklesIcon size={18} color={colors.primary} />
            </View>
            <View>
              <View style={styles.headerTitleRow}>
                <Text
                  style={[
                    styles.headerTitle,
                    { color: colors.text, fontFamily: typography.fonts.bold },
                  ]}
                >
                  Concierge de IA
                </Text>
                <View
                  style={[
                    styles.aiBadge,
                    { backgroundColor: colors.primary + '16', borderColor: colors.primary + '30' },
                  ]}
                >
                  <Text
                    style={[
                      styles.aiBadgeText,
                      { color: colors.primary, fontFamily: typography.fonts.bold },
                    ]}
                  >
                    AI 2.0
                  </Text>
                </View>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fonts.regular,
                    },
                  ]}
                >
                  Online • Diseñador inteligente de citas
                </Text>
              </View>
            </View>
          </View>

          {hasUserSentMessage && (
            <TouchableOpacity
              style={[
                styles.resetBtn,
                {
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                },
              ]}
              onPress={handleResetChat}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.resetBtnText,
                  { color: colors.textSecondary, fontFamily: typography.fonts.medium },
                ]}
              >
                Nueva cita
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.chatCenterWrap}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.msgRow,
                    isUser ? styles.userRow : styles.aiRow,
                  ]}
                >
                  {!isUser && (
                    <View
                      style={[
                        styles.msgAvatar,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <SparklesIcon size={12} color="#FFF" />
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isUser
                        ? [
                            styles.userBubble,
                            {
                              backgroundColor: colors.primary,
                              borderRadius: borderRadius.lg,
                              borderBottomRightRadius: 4,
                            },
                          ]
                        : [
                            styles.aiBubble,
                            {
                              backgroundColor: isDark ? 'rgba(28, 28, 34, 0.96)' : '#F2F3F7',
                              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                              borderRadius: borderRadius.lg,
                              borderBottomLeftRadius: 4,
                            },
                          ],
                    ]}
                  >
                    {!isUser && (
                      <View style={styles.aiSenderHeader}>
                        <Text style={[styles.aiSenderName, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                          Concierge AI
                        </Text>
                        <Text style={[styles.msgTime, { color: colors.textSecondary }]}>
                          {msg.timestamp}
                        </Text>
                      </View>
                    )}

                    <Text
                      style={[
                        styles.bubbleText,
                        {
                          color: isUser ? colors.primaryContrast : colors.text,
                          fontFamily: typography.fonts.regular,
                        },
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {isUser && (
                      <Text style={[styles.userMsgTime, { color: colors.primaryContrast + 'B3' }]}>
                        {msg.timestamp}
                      </Text>
                    )}

                    {/* CTA para iniciar sesión si no está autenticado */}
                    {!user?.id && msg.id.startsWith('ai-auth') && (
                      <TouchableOpacity
                        style={[
                          styles.authPromptBtn,
                          {
                            backgroundColor: colors.primary,
                            borderRadius: borderRadius.md,
                          },
                        ]}
                        activeOpacity={0.85}
                        onPress={() => router.push('/(auth)/login')}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2.2}>
                            <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </Svg>
                          <Text
                            style={[
                              styles.authPromptBtnText,
                              {
                                color: colors.primaryContrast,
                                fontFamily: typography.fonts.bold,
                              },
                            ]}
                          >
                            Iniciar Sesión / Registrarse
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Tarjeta de Itinerario Generado */}
                    {msg.itinerary && (
                      <View style={styles.itinContainer}>
                        <View
                          style={[
                            styles.itinHeader,
                            {
                              backgroundColor: isDark ? '#1C1C20' : '#FFFFFF',
                              borderColor: colors.border,
                              borderRadius: borderRadius.lg,
                            },
                          ]}
                        >
                          <View style={styles.itinHeaderTop}>
                            <Text
                              style={[
                                styles.itinTitle,
                                {
                                  color: colors.text,
                                  fontFamily: typography.fonts.bold,
                                },
                              ]}
                            >
                              {msg.itinerary.title}
                            </Text>
                            <View
                              style={[
                                styles.matchBadge,
                                { backgroundColor: colors.primary },
                              ]}
                            >
                              <StarIcon size={10} color="#FFF" fill="#FFF" />
                              <Text
                                style={[
                                  styles.matchBadgeText,
                                  { fontFamily: typography.fonts.bold },
                                ]}
                              >
                                {msg.itinerary.matchScore}% Match
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={[
                              styles.itinTagline,
                              {
                                color: colors.textSecondary,
                                fontFamily: typography.fonts.regular,
                              },
                            ]}
                          >
                            {msg.itinerary.tagline}
                          </Text>

                          <View style={styles.itinMetaRow}>
                            <Text
                              style={[
                                styles.itinCost,
                                {
                                  color: colors.primary,
                                  fontFamily: typography.fonts.bold,
                                },
                              ]}
                            >
                              Presupuesto: {msg.itinerary.totalCost}
                            </Text>
                            <Text
                              style={[
                                styles.itinStepsBadge,
                                {
                                  color: colors.textSecondary,
                                  fontFamily: typography.fonts.medium,
                                },
                              ]}
                            >
                              {msg.itinerary.steps.length} paradas
                            </Text>
                          </View>
                        </View>

                        {/* Pasos Interactivos */}
                        <View style={styles.stepsList}>
                          {msg.itinerary.steps.map((step, idx) => (
                            <TouchableOpacity
                              key={idx}
                              style={[
                                styles.stepCard,
                                {
                                  backgroundColor: isDark ? '#1C1C20' : '#FFFFFF',
                                  borderColor: colors.border,
                                  borderRadius: borderRadius.md,
                                },
                              ]}
                              activeOpacity={0.8}
                              onPress={() => setSelectedStep(step)}
                            >
                              <View style={[styles.stepNumWrap, { backgroundColor: colors.primary + '18' }]}>
                                <Text style={[styles.stepNumText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                                  {step.stepNumber}
                                </Text>
                              </View>
                              <Image
                                source={{ uri: step.imageUrl }}
                                style={[
                                  styles.stepImage,
                                  { borderRadius: borderRadius.sm },
                                ]}
                              />
                              <View style={styles.stepInfo}>
                                <Text
                                  style={[
                                    styles.stepTime,
                                    {
                                      color: colors.primary,
                                      fontFamily: typography.fonts.bold,
                                    },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {step.time} • {step.categoryEmoji} {step.placeName}
                                </Text>
                                <Text
                                  style={[
                                    styles.stepTitle,
                                    {
                                      color: colors.text,
                                      fontFamily: typography.fonts.medium,
                                    },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {step.title}
                                </Text>
                                <Text
                                  style={[
                                    styles.stepDurationText,
                                    {
                                      color: colors.textSecondary,
                                      fontFamily: typography.fonts.regular,
                                    },
                                  ]}
                                >
                                  {step.duration} • {step.transitTime} traslado
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {/* Botones de Acción */}
                        <View style={styles.itinActionsRow}>
                          <TouchableOpacity
                            style={[
                              styles.saveBtn,
                              {
                                backgroundColor: savedItineraryIds[msg.itinerary.id]
                                  ? '#30D158'
                                  : colors.primary,
                                borderRadius: borderRadius.md,
                              },
                            ]}
                            activeOpacity={0.8}
                            onPress={() => toggleSaveItinerary(msg.itinerary!.id)}
                          >
                            {savedItineraryIds[msg.itinerary.id] ? (
                              <CheckIcon size={14} color="#FFF" />
                            ) : (
                              <BookmarkIcon size={14} color={colors.primaryContrast} />
                            )}
                            <Text
                              style={[
                                styles.saveBtnText,
                                { fontFamily: typography.fonts.bold, color: colors.primaryContrast },
                              ]}
                            >
                              {savedItineraryIds[msg.itinerary.id]
                                ? '✓ Guardado en tu Perfil'
                                : 'Guardar Itinerario'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.mapBtn,
                              {
                                borderColor: colors.border,
                                borderRadius: borderRadius.md,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                              },
                            ]}
                            activeOpacity={0.8}
                            onPress={() => router.push('/(tabs)/map')}
                          >
                            <CompassIcon size={14} color={colors.text} />
                            <Text
                              style={[
                                styles.mapBtnText,
                                { color: colors.text, fontFamily: typography.fonts.medium },
                              ]}
                            >
                              Ver en Mapa
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {isThinking && (
              <View style={styles.msgRow}>
                <View
                  style={[
                    styles.msgAvatar,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <SparklesIcon size={12} color="#FFF" />
                </View>
                <View
                  style={[
                    styles.thinkingBubble,
                    {
                      backgroundColor: isDark ? 'rgba(28, 28, 34, 0.96)' : '#F2F3F7',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      borderRadius: borderRadius.lg,
                    },
                  ]}
                >
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text
                    style={[
                      styles.thinkingText,
                      {
                        color: colors.textSecondary,
                        fontFamily: typography.fonts.medium,
                      },
                    ]}
                  >
                    El Concierge está diseñando tu cita ideal...
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Quick Prompts */}
        {!hasUserSentMessage && !isThinking && (
          <View style={styles.quickPromptsContainer}>
            <View style={styles.quickPromptsInner}>
              <QuickPrompts onSelectPrompt={(p) => handleSendMessage(p)} />
            </View>
          </View>
        )}

        {/* Input Bar Flotante sobre la Navbar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: isDark ? 'rgba(16, 16, 20, 0.94)' : 'rgba(255, 255, 255, 0.94)',
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: isDark ? 'rgba(28, 28, 34, 0.96)' : '#F5F6F9',
                borderColor: isInputFocused
                  ? colors.primary
                  : isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            <View style={styles.inputLeftIconWrap}>
              <SparklesIcon
                size={16}
                color={isInputFocused ? colors.primary : colors.textSecondary}
              />
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  fontFamily: typography.fonts.regular,
                },
              ]}
              placeholder="Describe tu cita ideal (lugar, vibra, presupuesto)..."
              placeholderTextColor={colors.textSecondary}
              value={inputPrompt}
              onChangeText={setInputPrompt}
              onSubmitEditing={() => handleSendMessage()}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              returnKeyType="send"
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputPrompt.trim()
                    ? colors.primary
                    : isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isThinking}
            >
              <Svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke={
                  inputPrompt.trim()
                    ? colors.primaryContrast
                    : colors.textSecondary
                }
                strokeWidth={2.4}
              >
                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal Modular de Detalle de Paso */}
      <StepDetailModal
        step={selectedStep}
        onClose={() => setSelectedStep(null)}
        rating={stepRating}
        onRate={setStepRating}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
  },
  aiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  aiBadgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
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
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 11,
  },
  keyboardRoot: {
    flex: 1,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 190, // Margen holgado para no chocar con el input bar ni la navbar
  },
  chatCenterWrap: {
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
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
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  bubble: {
    maxWidth: '85%',
  },
  userBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  aiBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  aiSenderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiSenderName: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  msgTime: {
    fontSize: 10,
    opacity: 0.7,
  },
  userMsgTime: {
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  authPromptBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authPromptBtnText: {
    fontSize: 13,
  },
  itinContainer: {
    marginTop: 12,
    width: '100%',
  },
  itinHeader: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  itinHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itinTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  matchBadgeText: {
    color: '#FFF',
    fontSize: 11,
  },
  itinTagline: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  itinMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  itinCost: {
    fontSize: 13,
  },
  itinStepsBadge: {
    fontSize: 11,
  },
  stepsList: {
    gap: 8,
    marginBottom: 10,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
  },
  stepNumWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepNumText: {
    fontSize: 11,
  },
  stepImage: {
    width: 48,
    height: 48,
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
  },
  stepDurationText: {
    fontSize: 10,
    marginTop: 2,
  },
  itinActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  saveBtnText: {
    fontSize: 12,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  mapBtnText: {
    fontSize: 12,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  thinkingText: {
    fontSize: 12,
  },
  quickPromptsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  quickPromptsInner: {
    width: '100%',
    maxWidth: 768,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 104, // Elevado 16px arriba de la navbar flotante (bottom: 24 + height: 64 = 88 + 16px = 104)
    borderTopWidth: 1,
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputLeftIconWrap: {
    marginRight: 6,
    marginLeft: 2,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    paddingHorizontal: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
