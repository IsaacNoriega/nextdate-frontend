import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface MapPreviewProps {
  placeName: string;
  subtitle?: string;
  height?: number;
}

export default function MapPreview({ placeName, subtitle, height = 180 }: MapPreviewProps) {
  const { colors, typography, borderRadius } = useTheme();

  return (
    <View style={[styles.mapCard, { height, backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
      <View style={[styles.mapBackground, { backgroundColor: colors.primary + '08' }]}>
        <View style={[styles.pinBox, { backgroundColor: colors.primary }]}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2}>
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          </Svg>
        </View>
        <Text style={[styles.placeName, { color: colors.text, fontFamily: typography.fonts.bold }]}>
          {placeName}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 28,
  },
  mapBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pinBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 15,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
});
