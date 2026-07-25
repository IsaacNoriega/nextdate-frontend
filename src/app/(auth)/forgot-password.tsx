import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

export default function ForgotPasswordScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestReset = async () => {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage('Ocurrió un error al solicitar la recuperación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header con Flecha Limpia sin Círculo */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M19 12H5M12 19l-7-7 7-7" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={[styles.formContainer, { maxWidth: width > 430 ? 420 : '100%', alignSelf: 'center' }]}>
            {/* Branding Header */}
            <View style={styles.brandingHeader}>
              <View style={[styles.iconCircle, { backgroundColor: colors.accent + '15' }]}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </Svg>
              </View>
              <Text style={[styles.title, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Recuperar Contraseña
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Ingresa tu correo electrónico y te enviaremos un código/token de recuperación.
              </Text>
            </View>

            {/* Banner de Éxito */}
            {success ? (
              <View style={[styles.successBox, { backgroundColor: '#34C75915', borderColor: '#34C759' }]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth={2} style={{ marginBottom: 8 }}>
                  <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <Path d="M22 4L12 14.01l-3-3" />
                </Svg>
                <Text style={[styles.successTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  ¡Instrucciones enviadas!
                </Text>
                <Text style={[styles.successText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  Revisa tu bandeja de entrada en <Text style={{ color: colors.text }}>{email}</Text>. Copia el token recibido e ingrésalo en la siguiente pantalla.
                </Text>
                <TouchableOpacity 
                  style={[styles.nextActionButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => router.push('/(auth)/reset-password')}
                >
                  <Text style={[styles.nextActionButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.medium }]}>
                    Ingresar Token de Recuperación
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Error Banner */}
                {errorMessage ? (
                  <View style={[styles.errorBanner, { backgroundColor: colors.notification + '15', borderColor: colors.notification }]}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.notification} strokeWidth={2} style={{ marginRight: 8 }}>
                      <Path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </Svg>
                    <Text style={[styles.errorBannerText, { color: colors.notification, fontFamily: typography.fonts.medium }]}>
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    Correo Electrónico
                  </Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        color: colors.text, 
                        borderColor: isEmailFocused ? colors.primary : colors.border,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.card
                      }
                    ]}
                    placeholder="tu.correo@ejemplo.com"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={(text) => { setEmail(text); setErrorMessage(null); }}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                  style={[
                    styles.submitButton, 
                    { backgroundColor: colors.primary, borderRadius: borderRadius.md },
                    loading && { opacity: 0.7 }
                  ]}
                  activeOpacity={0.9}
                  onPress={handleRequestReset}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.primaryContrast} />
                  ) : (
                    <Text style={[styles.submitButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.medium }]}>
                      Enviar Instrucciones
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Back to Login */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
                <Text style={[styles.footerLink, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  ← Volver al Inicio de Sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
    alignSelf: 'flex-start',
  },
  formContainer: {
    width: '100%',
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    flex: 1,
  },
  successBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  nextActionButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextActionButtonText: {
    fontSize: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  submitButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonText: {
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerLink: {
    fontSize: 14,
  },
});
