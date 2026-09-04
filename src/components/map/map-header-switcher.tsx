import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BookmarkIcon, SparklesIcon, MapPinIcon } from '../ui/icons';

export type MapNavigationMode = 'itineraries' | 'places';

interface MapHeaderSwitcherProps {
  mode: MapNavigationMode;
  onModeChange: (mode: MapNavigationMode) => void;
  itinerariesCount: number;
  placesCount: number;
  userAddress?: string;
  onLocationPress?: () => void;
}

export default function MapHeaderSwitcher({
  mode,
  onModeChange,
  itinerariesCount,
  placesCount,
  userAddress,
  onLocationPress,
}: MapHeaderSwitcherProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  return (
    <View style={styles.headerContainer}>
      {/* Segmented Switcher */}
      <View
        style={[
          styles.segmentedTrack,
          {
            backgroundColor: isDark ? 'rgba(28, 28, 30, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: colors.border,
            borderRadius: borderRadius.round,
          },
        ]}
      >
        {/* Tab 1: Citas Guardadas */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            mode === 'itineraries' && [
              styles.tabButtonActive,
              {
                backgroundColor: colors.primary,
              },
            ],
            { borderRadius: borderRadius.round },
          ]}
          onPress={() => onModeChange('itineraries')}
          activeOpacity={0.8}
        >
          <SparklesIcon
            size={13}
            color={mode === 'itineraries' ? colors.primaryContrast : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: mode === 'itineraries' ? colors.primaryContrast : colors.text,
                fontFamily: mode === 'itineraries' ? typography.fonts.bold : typography.fonts.medium,
              },
            ]}
          >
            Citas ({itinerariesCount})
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Lugares Favoritos */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            mode === 'places' && [
              styles.tabButtonActive,
              {
                backgroundColor: colors.primary,
              },
            ],
            { borderRadius: borderRadius.round },
          ]}
          onPress={() => onModeChange('places')}
          activeOpacity={0.8}
        >
          <BookmarkIcon
            size={13}
            color={mode === 'places' ? colors.primaryContrast : colors.textSecondary}
            fill={mode === 'places' ? colors.primaryContrast : 'none'}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: mode === 'places' ? colors.primaryContrast : colors.text,
                fontFamily: mode === 'places' ? typography.fonts.bold : typography.fonts.medium,
              },
            ]}
          >
            Lugares ({placesCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ubicación actual sutil */}
      {userAddress ? (
        <TouchableOpacity
          style={[
            styles.locationPill,
            {
              backgroundColor: isDark ? 'rgba(28, 28, 30, 0.88)' : 'rgba(255, 255, 255, 0.92)',
              borderColor: colors.border,
              borderRadius: borderRadius.round,
            },
          ]}
          onPress={onLocationPress}
          activeOpacity={0.75}
        >
          <MapPinIcon size={11} color={colors.accent || colors.primary} />
          <Text
            style={[styles.locationText, { color: colors.text, fontFamily: typography.fonts.medium }]}
            numberOfLines={1}
          >
            {userAddress}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 30,
    alignItems: 'center',
    gap: 8,
  },
  segmentedTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButtonActive: {},
  tabText: {
    fontSize: 12,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    maxWidth: '85%',
  },
  locationText: {
    fontSize: 11,
  },
});
