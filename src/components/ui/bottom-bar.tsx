import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

export type BottomBarTab = 'explore' | 'map' | 'ai' | 'community' | 'profile';

interface BottomBarProps {
  activeTab: BottomBarTab;
  onTabPress?: (tab: BottomBarTab) => void;
}

export default function BottomBar({ activeTab, onTabPress }: BottomBarProps) {
  const { colors, typography, isDark } = useTheme();
  const router = useRouter();

  const handlePress = (tab: BottomBarTab) => {
    if (onTabPress) {
      onTabPress(tab);
      return;
    }

    if (tab === 'explore') router.push('/(tabs)/explore');
    else if (tab === 'map') router.push('/(tabs)/map');
    else if (tab === 'ai') router.push('/(tabs)/generator');
    else if (tab === 'community') router.push('/(tabs)/community');
    else if (tab === 'profile') router.push('/(tabs)/profile');
  };

  const getTabIcon = (tab: BottomBarTab, isActive: boolean) => {
    const activeColor = colors.primary;
    const inactiveColor = colors.textSecondary;
    const stroke = isActive ? activeColor : inactiveColor;
    const strokeWidth = isActive ? 2.3 : 1.8;

    switch (tab) {
      case 'explore':
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          </Svg>
        );
      case 'map':
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
            <Path d="M1 6v13l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v13M16 6v13" />
          </Svg>
        );
      case 'ai':
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill={isActive ? activeColor : 'none'} stroke={stroke} strokeWidth={strokeWidth}>
            <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </Svg>
        );
      case 'community':
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <Circle cx="9" cy="7" r="4" />
          </Svg>
        );
      case 'profile':
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
            <Circle cx="12" cy="7" r="4" />
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          </Svg>
        );
    }
  };

  const tabs: { id: BottomBarTab; label: string }[] = [
    { id: 'explore', label: 'Explorar' },
    { id: 'map', label: 'Mapa' },
    { id: 'ai', label: 'AI Citas' },
    { id: 'community', label: 'Comunidad' },
    { id: 'profile', label: 'Perfil' },
  ];

  return (
    <View style={styles.floatingPillWrapper} pointerEvents="box-none">
      <View style={[
        styles.floatingPillBar,
        {
          backgroundColor: isDark ? 'rgba(24, 24, 26, 0.94)' : 'rgba(255, 255, 255, 0.94)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        }
      ]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.pillTabItem,
                isActive && [
                  styles.activePillCapsule,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.05)' }
                ]
              ]}
              activeOpacity={0.7}
              onPress={() => handlePress(tab.id)}
            >
              {getTabIcon(tab.id, isActive)}
              <Text
                style={[
                  styles.pillTabText,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontFamily: isActive ? typography.fonts.bold : typography.fonts.medium,
                  }
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingPillWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingPillBar: {
    height: 64,
    width: '100%',
    maxWidth: 420,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  pillTabItem: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    paddingHorizontal: 2,
  },
  activePillCapsule: {},
  pillTabText: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },
});
