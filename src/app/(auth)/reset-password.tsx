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
import { resetPasswordApi } from '../../services/authService';

export default function ResetPasswordScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  
  const [isTokenFocused, setIsTokenFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = () => {
    if (!token.trim()) {
      setErrorMessage('Ingresa el token de recuperación recibido por correo.');
      return false;
    }
    if (!newPassword) {
      setErrorMessage('Ingresa tu nueva contraseña.');
      return false;
    }
    if (newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    setErrorMessage(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await resetPasswordApi(token.trim(), newPassword);
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Token inválido o expirado. Solicita uno nuevo.');
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
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '10' }]}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </Svg>
              </View>
              <Text style={[styles.title, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Reestablecer Contraseña
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Ingresa el token enviado a tu correo y define tu nueva clave de acceso.
              </Text>
            </View>

            {/* Banner de Éxito */}
            {success ? (
              <View style={[styles.successBox, { backgroundColor: '#34C75915', borderColor: '#34C759' }]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth={2} style={{ marginBottom: 8 }}>
                  <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <Path d="M22 4L12 14.01l-3-3" />
                </Svg>
                <Text style={[styles.successTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Contraseña Actualizada
                </Text>
                <Text style={[styles.successText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión con tu nueva clave.
                </Text>
                <TouchableOpacity 
                  style={[styles.loginRedirectButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text style={[styles.loginRedirectButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.medium }]}>
                    Ir a Iniciar Sesión
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

                {/* Token Field */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    Token de Recuperación
                  </Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        color: colors.text, 
                        borderColor: isTokenFocused ? colors.primary : colors.border,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.card
                      }
                    ]}
                    placeholder="Ej. ABC-12345"
                    placeholderTextColor={colors.textSecondary}
                    value={token}
                    onChangeText={(text) => { setToken(text); setErrorMessage(null); }}
                    onFocus={() => setIsTokenFocused(true)}
                    onBlur={() => setIsTokenFocused(false)}
                    autoCapitalize="characters"
                  />
                </View>

                {/* New Password Field */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    Nueva Contraseña
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
                      value={newPassword}
                      onChangeText={(text) => { setNewPassword(text); setErrorMessage(null); }}
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

                {/* Confirm Password Field */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    Confirmar Nueva Contraseña
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
                      placeholder="Repite la nueva contraseña"
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

                {/* Submit Button */}
                <TouchableOpacity 
                  style={[
                    styles.submitButton, 
                    { backgroundColor: colors.primary, borderRadius: borderRadius.md },
                    loading && { opacity: 0.7 }
                  ]}
                  activeOpacity={0.9}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.primaryContrast} />
                  ) : (
                    <Text style={[styles.submitButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.medium }]}>
                      Guardar Nueva Contraseña
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Back to Login */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
                <Text style={[styles.footerLink, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  ← Cancelar y Volver
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
    marginBottom: 28,
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
  loginRedirectButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginRedirectButtonText: {
    fontSize: 15,
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
