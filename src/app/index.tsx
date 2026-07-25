import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  useWindowDimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

export default function WelcomeScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { maxWidth: width > 430 ? 420 : '100%', alignSelf: 'center' }]}>
        
        {/* Branding Central Minimalista */}
        <View style={styles.centerSection}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill={colors.primaryContrast}>
              <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </Svg>
          </View>

          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            NextDate
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
            Planificación inteligente para momentos significativos.
          </Text>
        </View>

        {/* Acciones de Navegación Minimalistas */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
            activeOpacity={0.9}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={[styles.primaryButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.medium }]}>
              Comenzar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.card }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>

          <Text style={[styles.legalText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
            Al continuar, aceptas nuestros Términos y Políticas de Privacidad.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
    width: '100%',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justify: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionsGroup: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    height: 52,
    alignItems: 'center',
    justify: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
  },
  secondaryButton: {
    height: 52,
    alignItems: 'center',
    justify: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
  },
  legalText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
});
