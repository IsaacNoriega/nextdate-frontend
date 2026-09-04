import React, { useState, useRef } from 'react';
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
import Svg, { Path, Rect } from 'react-native-svg';
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

export default function GeneratorScreen() {
  const { colors, typography, borderRadius } = useTheme();
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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <View
            style={[
              styles.avatarIconWrap,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.primary}
              strokeWidth={2}
            >
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </Svg>
          </View>
          <View>
            <Text
              style={[
                styles.headerTitle,
                { color: colors.text, fontFamily: typography.fonts.bold },
              ]}
            >
              Concierge de IA
            </Text>
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
                Online • Generador de citas
              </Text>
            </View>
          </View>
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
                    <Svg
                      width={12}
                      height={12}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFF"
                      strokeWidth={2.5}
                    >
                      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </Svg>
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
                          },
                        ]
                      : styles.aiBubble,
                  ]}
                >
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
                            backgroundColor: colors.card,
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
                        <Text
                          style={[
                            styles.itinCost,
                            {
                              color: colors.primary,
                              fontFamily: typography.fonts.bold,
                            },
                          ]}
                        >
                          {msg.itinerary.totalCost}
                        </Text>
                      </View>

                      {/* Pasos */}
                      <View style={styles.stepsList}>
                        {msg.itinerary.steps.map((step, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.stepCard,
                              {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                borderRadius: borderRadius.md,
                              },
                            ]}
                            activeOpacity={0.8}
                            onPress={() => setSelectedStep(step)}
                          >
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
                              >
                                {step.time} • {step.placeName}
                              </Text>
                              <Text
                                style={[
                                  styles.stepTitle,
                                  {
                                    color: colors.text,
                                    fontFamily: typography.fonts.medium,
                                  },
                                ]}
                              >
                                {step.title}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Botón Guardar */}
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
                        <Text
                          style={[
                            styles.saveBtnText,
                            { fontFamily: typography.fonts.bold },
                          ]}
                        >
                          {savedItineraryIds[msg.itinerary.id]
                            ? '✓ Guardado en tu Perfil'
                            : 'Guardar Itinerario'}
                        </Text>
                      </TouchableOpacity>
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
                  styles.thinkingBubble,
                  {
                    backgroundColor: colors.card,
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
                  El Concierge está diseñando tu cita...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Prompts */}
        {!hasUserSentMessage && !isThinking && (
          <QuickPrompts onSelectPrompt={(p) => handleSendMessage(p)} />
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.background,
                borderColor: isInputFocused ? colors.primary : colors.border,
                borderRadius: borderRadius.round,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  fontFamily: typography.fonts.regular,
                },
              ]}
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
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputPrompt.trim()
                    ? colors.primary
                    : colors.border,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isThinking}
            >
              <Svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke={
                  inputPrompt.trim()
                    ? colors.primaryContrast
                    : colors.textSecondary
                }
                strokeWidth={2.5}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarIconWrap: {
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
  keyboardRoot: {
    flex: 1,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
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
    fontSize: 17,
    flex: 1,
    marginRight: 8,
  },
  matchBadge: {
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
    marginBottom: 6,
  },
  itinCost: {
    fontSize: 14,
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
  stepImage: {
    width: 50,
    height: 50,
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
  saveBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 13,
  },
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
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
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
});
