import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export default function ExploreSkeleton() {
  const { colors, borderRadius, isDark } = useTheme();
  const placeholderBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <View style={styles.container}>
      {[1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={[styles.avatar, { backgroundColor: placeholderBg }]} />
            <View style={styles.headerInfo}>
              <View style={[styles.barShort, { backgroundColor: placeholderBg }]} />
              <View style={[styles.barTiny, { backgroundColor: placeholderBg, marginTop: 4 }]} />
            </View>
            <View style={[styles.badgeSkeleton, { backgroundColor: placeholderBg }]} />
          </View>

          {/* Title line */}
          <View style={[styles.barLong, { backgroundColor: placeholderBg }]} />

          {/* Image skeleton */}
          <View
            style={[
              styles.imageSkeleton,
              { backgroundColor: placeholderBg, borderRadius: borderRadius.md },
            ]}
          />

          {/* Review skeleton lines */}
          <View style={[styles.barMedium, { backgroundColor: placeholderBg }]} />
          <View style={[styles.barShort, { backgroundColor: placeholderBg, marginTop: 6 }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
    paddingTop: 10,
  },
  card: {
    padding: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  badgeSkeleton: {
    width: 44,
    height: 20,
    borderRadius: 10,
  },
  barShort: {
    width: 90,
    height: 12,
    borderRadius: 6,
  },
  barTiny: {
    width: 50,
    height: 10,
    borderRadius: 5,
  },
  barMedium: {
    width: '75%',
    height: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  barLong: {
    width: '90%',
    height: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageSkeleton: {
    width: '100%',
    height: 200,
  },
});
