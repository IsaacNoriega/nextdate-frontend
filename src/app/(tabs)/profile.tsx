import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { getProfileByUserIdApi, Profile } from '../../services/profileService';

type ProfileTab = 'SAVED' | 'SETTINGS';

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
  const { colors, typography, borderRadius, isDark } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProfileTab>('SAVED');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const data = await getProfileByUserIdApi('00000000-0000-0000-0000-000000000001');
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        // Fallback silencioso si no se encuentra
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }} 
              style={styles.avatarImage} 
            />
          </View>

          <Text style={[styles.userNameText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            {profile ? profile.username : 'Isaac Noriega'}
          </Text>
          <Text style={[styles.userHandleText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            @{profile ? profile.username.toLowerCase().replace(/\s+/g, '_') : 'isaac_noriega'}
          </Text>

          <TouchableOpacity 
            style={[styles.editProfileBtn, { borderColor: colors.border, borderRadius: borderRadius.round }]}
            activeOpacity={0.8}
            onPress={() => router.push('/edit-profile?mode=profile')}
          >
            <Text style={[styles.editProfileBtnText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Editar Perfil
            </Text>
          </TouchableOpacity>
        </View>

        {/* Metrics */}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FFD700">
                <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </Svg>
              <Text style={[styles.metricNumber, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                4.9
              </Text>
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
              Rating
            </Text>
          </View>
        </View>

        {/* Profile Tabs */}
        <View style={[styles.profileTabsRow, { borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'SAVED' && [styles.activeTabButton, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab('SAVED')}
          >
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'SAVED' ? colors.primary : colors.textSecondary} strokeWidth={2}>
              <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </Svg>
            <Text style={[styles.tabButtonText, { color: activeTab === 'SAVED' ? colors.primary : colors.textSecondary, fontFamily: typography.fonts.bold }]}>
              Planes Guardados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'SETTINGS' && [styles.activeTabButton, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab('SETTINGS')}
          >
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'SETTINGS' ? colors.primary : colors.textSecondary} strokeWidth={2}>
              <Circle cx="12" cy="12" r="3" />
              <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </Svg>
            <Text style={[styles.tabButtonText, { color: activeTab === 'SETTINGS' ? colors.primary : colors.textSecondary, fontFamily: typography.fonts.bold }]}>
              Preferencias
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Saved plans */}
        {activeTab === 'SAVED' ? (
          <View style={styles.savedSection}>
            {MOCK_SAVED_PLANS.map((plan) => (
              <View key={plan.id} style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Image source={{ uri: plan.imageUrl }} style={styles.savedCardImage} />
                
                <View style={styles.savedCardContent}>
                  <View style={styles.savedBadgeRow}>
                    <Text style={[styles.savedMatchText, { color: '#30D158', fontFamily: typography.fonts.bold }]}>
                      {plan.matchScore}% Compatibilidad
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
                    onPress={() => router.push('/(tabs)/generator')}
                  >
                    <Text style={[styles.planActionBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                      Ver Itinerario & Planear
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Tab 2: Settings */}
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

              <TouchableOpacity style={styles.settingItemRow} onPress={() => router.push('/edit-profile?mode=preferences')}>
                <Text style={[styles.settingLabel, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                  Preferencias Gastronómicas
                </Text>

                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Path d="M9 18l6-6-6-6" />
                </Svg>
              </TouchableOpacity>

              <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

              <TouchableOpacity style={styles.settingItemRow} onPress={() => router.push('/edit-profile?mode=budget')}>
                <Text style={[styles.settingLabel, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                  Rango de Presupuesto Habitual
                </Text>

                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Path d="M9 18l6-6-6-6" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Logout */}
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
  userNameText: {
    fontSize: 22,
    marginBottom: 2,
  },
  userHandleText: {
    fontSize: 13,
    marginBottom: 14,
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
    justifyContent: 'center',
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
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
    justifyContent: 'space-between',
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
    justifyContent: 'center',
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
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    marginTop: 10,
  },
  logoutBtnText: {
    fontSize: 14,
  },
});
