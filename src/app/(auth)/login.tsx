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

export default function LoginScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return false;
    }
    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.replace('/(tabs)/explore');
    } catch (err: any) {
      setErrorMessage('Credenciales inválidas. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.replace('/');
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
            {/* Logo and Greeting */}
            <View style={styles.brandingHeader}>
              <View style={[styles.miniLogo, { backgroundColor: colors.primary }]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill={colors.primaryContrast}>
                  <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </Svg>
              </View>
              <Text style={[styles.welcomeTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                NextDate
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Inicia sesión para continuar planificando citas memorables.
              </Text>
            </View>

            {/* Error Feedback */}
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

            {/* Inputs */}
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

            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  Contraseña
                </Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={[styles.forgotText, { color: colors.accent, fontFamily: typography.fonts.medium }]}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input, 
                    styles.passwordInput,
                    { 
                      color: colors.text, 
                      borderColor: isPasswordFocused ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.card
                    }
                  ]}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrorMessage(null); }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setSecureText(!secureText)}
                  activeOpacity={0.7}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    {secureText ? (
                      <>
                        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </>
                    ) : (
                      <>
                        <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <Path d="M1 1l22 22" />
                      </>
                    )}
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Button Centrado */}
            <TouchableOpacity 
              style={[
                styles.signInButton, 
                { backgroundColor: colors.primary, borderRadius: borderRadius.md },
                loading && { opacity: 0.7 }
              ]}
              activeOpacity={0.9}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryContrast} />
              ) : (
                <Text style={[styles.signInButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.medium }]}>
                  Iniciar Sesión
                </Text>
              )}
            </TouchableOpacity>

            {/* Social Divider */}
            <View style={styles.socialDivider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                o inicia sesión con
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Grid Centrada */}
            <View style={styles.socialGrid}>
              <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card }]} activeOpacity={0.7}>
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </Svg>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card }]} activeOpacity={0.7}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill={colors.text}>
                  <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C4.31 16.92 3.46 11.2 5.56 8.3c1.02-1.42 2.5-2.3 4.12-2.32 1.25.02 2.15.54 2.92.54.76 0 2-.68 3.51-.52 1.26.13 2.53.58 3.33 1.7-3.15 1.88-2.64 6.2.5 7.42-.64 1.76-1.5 3.5-2.81 5.16zM12.03 6.16c-.08-2.69 2.24-5.06 4.83-5.16.27 3.04-2.8 5.4-4.83 5.16z" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Create Account Link */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                ¿No tienes una cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
                <Text style={[styles.footerLink, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                  Crear Cuenta
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
  miniLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
  },
  welcomeSubtitle: {
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
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  signInButton: {
    height: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  signInButtonText: {
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
  },
});
