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
import { registerUserApi } from '../../services/authService';

export default function RegisterScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cálculo de fortaleza de contraseña
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: colors.border };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: 'Débil', color: '#FF3B30' };
    if (score <= 4) return { score: 2, label: 'Media', color: '#FF9500' };
    return { score: 3, label: 'Fuerte', color: '#34C759' };
  };

  const strength = getPasswordStrength();

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
      setErrorMessage('Por favor ingresa una contraseña.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await registerUserApi(email.trim(), password);
      // Redirige al Onboarding con el ID del usuario creado
      router.replace({
        pathname: '/(onboarding)/setup-profile',
        params: { userId: user.id },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
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
            {/* Greeting */}
            <View style={styles.brandingHeader}>
              <Text style={[styles.welcomeTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Crea tu Cuenta
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Únete a NextDate y comienza a diseñar momentos inolvidables.
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

            {/* Email Field */}
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

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                Contraseña
              </Text>
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
                  placeholder="Mínimo 6 caracteres"
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

              {/* Password strength bar */}
              {password ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    <View style={[styles.strengthBar, { backgroundColor: strength.score >= 1 ? strength.color : colors.border }]} />
                    <View style={[styles.strengthBar, { backgroundColor: strength.score >= 2 ? strength.color : colors.border }]} />
                    <View style={[styles.strengthBar, { backgroundColor: strength.score >= 3 ? strength.color : colors.border }]} />
                  </View>
                  <Text style={[styles.strengthText, { color: strength.color, fontFamily: typography.fonts.medium }]}>
                    Seguridad: {strength.label}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                Confirmar Contraseña
              </Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input, 
                    styles.passwordInput,
                    { 
                      color: colors.text, 
                      borderColor: isConfirmFocused ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.card
                    }
                  ]}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(null); }}
                  onFocus={() => setIsConfirmFocused(true)}
                  onBlur={() => setIsConfirmFocused(false)}
                  secureTextEntry={secureConfirmText}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setSecureConfirmText(!secureConfirmText)}
                  activeOpacity={0.7}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    {secureConfirmText ? (
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

            {/* Action Button Centrado Total */}
            <TouchableOpacity 
              style={[
                styles.registerButton, 
                { backgroundColor: colors.primary, borderRadius: borderRadius.md },
                loading && { opacity: 0.7 }
              ]}
              activeOpacity={0.9}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryContrast} />
              ) : (
                <Text style={[styles.registerButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.medium }]}>
                  Registrarme
                </Text>
              )}
            </TouchableOpacity>

            {/* Already have an account */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                ¿Ya tienes una cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
                <Text style={[styles.footerLink, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                  Iniciar Sesión
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
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
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
    marginBottom: 18,
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginRight: 12,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
  },
  registerButton: {
    height: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  registerButtonText: {
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
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
