import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { MapPinIcon, PlusIcon } from '../ui/icons';

interface ExploreHeaderProps {
  title?: string;
  subtitle?: string;
  locationName?: string;
  isDetectingLocation?: boolean;
  onLocationPress?: () => void;
  onSharePress?: () => void;
}

export default function ExploreHeader({
  title = 'Explorar Citas',
  subtitle = 'Experiencias compartidas por la comunidad',
  locationName,
  isDetectingLocation = false,
  onLocationPress,
  onSharePress,
}: ExploreHeaderProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fonts.bold }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
          {subtitle}
        </Text>

        {/* Location Row / Button */}
        <TouchableOpacity
          style={[
            styles.locationPill,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              borderRadius: borderRadius.round,
            },
          ]}
          activeOpacity={0.75}
          onPress={onLocationPress}
        >
          <MapPinIcon size={13} color={colors.accent || colors.primary} />
          <Text
            style={[styles.locationText, { color: colors.text, fontFamily: typography.fonts.medium }]}
            numberOfLines={1}
          >
            {isDetectingLocation
              ? 'Localizando...'
              : locationName && locationName.trim().length > 0
              ? locationName
              : 'Ubicación actual'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Share / Publish Button */}
      {onSharePress && (
        <TouchableOpacity
          style={[
            styles.shareButton,
            {
              backgroundColor: colors.primary,
              borderRadius: borderRadius.round,
            },
          ]}
          activeOpacity={0.85}
          onPress={onSharePress}
        >
          <PlusIcon size={14} color={colors.primaryContrast} strokeWidth={2.5} />
          <Text style={[styles.shareButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
            Compartir
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  locationText: {
    fontSize: 11,
    maxWidth: 200,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 2,
  },
  shareButtonText: {
    fontSize: 12,
  },
});
