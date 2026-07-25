import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

export type BottomBarTab = 'explore' | 'map' | 'ai' | 'community' | 'profile';

interface BottomBarProps {
  activeTab: BottomBarTab;
  onTabPress?: (tab: BottomBarTab) => void;
}

export default function BottomBar({ activeTab, onTabPress }: BottomBarProps) {
  const router = useRouter();

  const handlePress = (tab: BottomBarTab) => {
    if (onTabPress) {
      onTabPress(tab);
    }

    if (tab === 'explore' || tab === 'map') {
      router.push('/explore');
    } else if (tab === 'ai') {
      router.push('/generator');
    } else if (tab === 'profile') {
      router.push('/(onboarding)/setup-profile');
    }
  };

  return (
    <View style={styles.floatingPillWrapper}>
      <View style={styles.floatingPillBar}>
        
        {/* TAB 1: Explorar */}
        <TouchableOpacity 
          style={[styles.pillTabItem, activeTab === 'explore' && styles.activePillCapsule]} 
          activeOpacity={0.8}
          onPress={() => handlePress('explore')}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'explore' ? '#FFFFFF' : '#8E8E93'} strokeWidth={2}>
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          </Svg>
          <Text style={[styles.pillTabText, activeTab === 'explore' && styles.activePillText]}>
            Explorar
          </Text>
        </TouchableOpacity>

        {/* TAB 2: Mapa */}
        <TouchableOpacity 
          style={[styles.pillTabItem, activeTab === 'map' && styles.activePillCapsule]} 
          activeOpacity={0.8}
          onPress={() => handlePress('map')}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'map' ? '#FFFFFF' : '#8E8E93'} strokeWidth={2}>
            <Path d="M1 6v13l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v13M16 6v13" />
          </Svg>
          <Text style={[styles.pillTabText, activeTab === 'map' && styles.activePillText]}>
            Mapa
          </Text>
        </TouchableOpacity>

        {/* TAB 3: NextDate AI */}
        <TouchableOpacity 
          style={[styles.pillTabItem, activeTab === 'ai' && styles.activePillCapsule]} 
          activeOpacity={0.8}
          onPress={() => handlePress('ai')}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'ai' ? '#FFFFFF' : '#8E8E93'} strokeWidth={2}>
            <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </Svg>
          <Text style={[styles.pillTabText, activeTab === 'ai' && styles.activePillText]}>
            AI Citas
          </Text>
        </TouchableOpacity>

        {/* TAB 4: Comunidad */}
        <TouchableOpacity 
          style={[styles.pillTabItem, activeTab === 'community' && styles.activePillCapsule]} 
          activeOpacity={0.8}
          onPress={() => handlePress('community')}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'community' ? '#FFFFFF' : '#8E8E93'} strokeWidth={2}>
            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <Circle cx="9" cy="7" r="4" />
          </Svg>
          <Text style={[styles.pillTabText, activeTab === 'community' && styles.activePillText]}>
            Comunidad
          </Text>
        </TouchableOpacity>

        {/* TAB 5: Perfil */}
        <TouchableOpacity 
          style={[styles.pillTabItem, activeTab === 'profile' && styles.activePillCapsule]} 
          activeOpacity={0.8}
          onPress={() => handlePress('profile')}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'profile' ? '#FFFFFF' : '#8E8E93'} strokeWidth={2}>
            <Circle cx="12" cy="7" r="4" />
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          </Svg>
          <Text style={[styles.pillTabText, activeTab === 'profile' && styles.activePillText]}>
            Perfil
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingPillWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
    justify: 'center',
  },
  floatingPillBar: {
    height: 68,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E1E22',
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#2A2A30',
  },
  pillTabItem: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 24,
  },
  activePillCapsule: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  pillTabText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 3,
    textAlign: 'center',
    width: '100%',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
