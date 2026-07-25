import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Switch,
  FlatList,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import BottomBar from '../components/ui/bottom-bar';

type ProfileTab = 'SAVED' | 'POSTS' | 'SETTINGS';

interface SavedPlan {
  id: string;
  title: string;
  tagline: string;
  matchScore: number;
  stepsCount: number;
  imageUrl: string;
  savedAt: string;
}

const MOCK_SAVED_PLANS: SavedPlan[] = [
  {
    id: 'plan-1',
    title: 'Noche Mágica en la Americana',
    tagline: 'Coctelería de autor, cena gourmet y caminata bajo las estrellas.',
    matchScore: 98,
    stepsCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    savedAt: 'Guardado ayer'
  },
  {
    id: 'plan-2',
    title: 'Tarde Romántica & Picnic',
    tagline: 'Helado artesanal, caminata por el bosque y vista panorámica.',
    matchScore: 95,
    stepsCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    savedAt: 'Guardado hace 3 días'
  }
];

export default function ProfileScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProfileTab>('SAVED');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* Header del Perfil */}
        <View style={styles.profileHeader}>
          
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }} 
              style={styles.avatarImage} 
            />
            <View style={[styles.vipBadge, { backgroundColor: colors.primary }]}>
              <Text style={{ fontSize: 10 }}>✨</Text>
            </View>
          </View>

          <Text style={[styles.userNameText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            Isaac Noriega
          </Text>
          <Text style={[styles.userHandleText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            @isaac_noriega
          </Text>

          <View style={[styles.relationshipPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.relationshipText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
              En relación con <Text style={{ color: colors.primary, fontFamily: typography.fonts.bold }}>Valeria 💕</Text>
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.editProfileBtn, { borderColor: colors.border, borderRadius: borderRadius.round }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(onboarding)/setup-profile')}
          >
            <Text style={[styles.editProfileBtnText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Editar Perfil
            </Text>
          </TouchableOpacity>

        </View>

        {/* Métricas de Pareja */}
        <View style={[styles.metricsContainer, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
              12
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
              Planes
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
              15
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
              Citas
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
              4.9 ⭐
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
              Rating
            </Text>
          </View>
        </View>

        {/* Pestañas de Navegación del Perfil */}
        <View style={styles.profileTabsRow}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'SAVED' && [styles.activeTabButton, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab('SAVED')}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === 'SAVED' ? colors.primary : colors.textSecondary, fontFamily: typography.fonts.bold }]}>
              💾 Planes Guardados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'SETTINGS' && [styles.activeTabButton, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab('SETTINGS')}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === 'SETTINGS' ? colors.primary : colors.textSecondary, fontFamily: typography.fonts.bold }]}>
              ⚙️ Preferencias
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTENIDO DE PESTAÑA: PLANES GUARDADOS */}
        {activeTab === 'SAVED' ? (
          <View style={styles.savedSection}>
            {MOCK_SAVED_PLANS.map((plan) => (
              <View key={plan.id} style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Image source={{ uri: plan.imageUrl }} style={styles.savedCardImage} />
                
                <View style={styles.savedCardContent}>
                  <View style={styles.savedBadgeRow}>
                    <Text style={[styles.savedMatchText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                      ✨ {plan.matchScore}% Compatibilidad
                    </Text>
                    <Text style={[styles.savedDateText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                      {plan.savedAt}
                    </Text>
                  </View>

                  <Text style={[styles.savedTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {plan.title}
                  </Text>
                  <Text style={[styles.savedTaglineText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    {plan.tagline}
                  </Text>

                  <TouchableOpacity 
                    style={[styles.planActionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                    activeOpacity={0.88}
                    onPress={() => router.push('/generator')}
                  >
                    <Text style={[styles.planActionBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                      Ver Itinerario & Planear ✨
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* CONTENIDO DE PESTAÑA: CONFIGURACIÓN & PREFERENCIAS */}
        {activeTab === 'SETTINGS' ? (
          <View style={styles.settingsSection}>
            
            <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
              <View style={styles.settingItemRow}>
                <Text style={[styles.settingLabel, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                  Notificaciones de Citas
                </Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

              <TouchableOpacity style={styles.settingItemRow} onPress={() => router.push('/(onboarding)/setup-profile')}>
                <Text style={[styles.settingLabel, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                  Preferencias Gastronómicas
                </Text>

                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Path d="M9 18l6-6-6-6" />
                </Svg>
              </TouchableOpacity>

              <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

              <TouchableOpacity style={styles.settingItemRow} onPress={() => router.push('/(onboarding)/setup-profile')}>
                <Text style={[styles.settingLabel, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                  Rango de Presupuesto Habitual
                </Text>

                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Path d="M9 18l6-6-6-6" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Cerrar Sesión */}
            <TouchableOpacity 
              style={[styles.logoutBtn, { borderColor: '#FF3B30', borderRadius: borderRadius.md }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={[styles.logoutBtnText, { color: '#FF3B30', fontFamily: typography.fonts.bold }]}>
                Cerrar Sesión
              </Text>
            </TouchableOpacity>

          </View>
        ) : null}

      </ScrollView>

      {/* FLOATING PILL BOTTOM BAR REUTILIZABLE */}
      <BottomBar activeTab="profile" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  vipBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justify: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userNameText: {
    fontSize: 22,
    marginBottom: 2,
  },
  userHandleText: {
    fontSize: 13,
    marginBottom: 10,
  },
  relationshipPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  relationshipText: {
    fontSize: 12,
  },
  editProfileBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
  },
  editProfileBtnText: {
    fontSize: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 18,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  profileTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {},
  tabButtonText: {
    fontSize: 13,
  },
  savedSection: {
    gap: 16,
  },
  savedCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  savedCardImage: {
    width: '100%',
    height: 140,
  },
  savedCardContent: {
    padding: 14,
  },
  savedBadgeRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  savedMatchText: {
    fontSize: 11,
  },
  savedDateText: {
    fontSize: 11,
  },
  savedTitleText: {
    fontSize: 17,
    marginBottom: 4,
  },
  savedTaglineText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  planActionBtn: {
    height: 44,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
  },
  planActionBtnText: {
    fontSize: 13,
  },
  settingsSection: {
    gap: 20,
  },
  settingsGroup: {
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  settingItemRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingLabel: {
    fontSize: 14,
  },
  settingDivider: {
    height: 1,
    width: '100%',
  },
  logoutBtn: {
    height: 48,
    width: '100%',
    borderWidth: 1,
    alignItems: 'center',
    justify: 'center',
    marginTop: 10,
  },
  logoutBtnText: {
    fontSize: 14,
  },
});
