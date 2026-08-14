import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface PlaceCardProps {
  name: string;
  categoryLabel: string;
  priceSymbol: string;
  address: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  onPress: () => void;
}

export default function PlaceCard({
  name,
  categoryLabel,
  priceSymbol,
  address,
  distance,
  rating,
  reviewsCount,
  imageUrl,
  onPress,
}: PlaceCardProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          borderRadius: borderRadius.lg,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          backgroundColor: colors.card,
        }
      ]}
      activeOpacity={0.92}
      onPress={onPress}
    >
      {/* Background Cover Image */}
      <Image source={{ uri: imageUrl }} style={styles.image} />

      {/* Subtle top dark overlay gradient for readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent']}
        style={styles.topGradient}
      />

      {/* Main Bottom Overlay Container */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.92)']}
        style={styles.bottomGradient}
      >
        {/* Clean Meta Row: Category Dot + Category + Price Pill */}
        <View style={styles.metaHeaderRow}>
          <View style={styles.categorySubtleTag}>
            <View style={styles.categoryDot} />
            <Text style={[styles.categorySubtleText, { fontFamily: typography.fonts.medium }]}>
              {categoryLabel}
            </Text>
          </View>
          <Text style={[styles.priceSubtleText, { fontFamily: typography.fonts.bold }]}>
            {priceSymbol}
          </Text>
        </View>

        {/* Place Title */}
        <Text style={[styles.cardName, { fontFamily: typography.fonts.bold }]} numberOfLines={2}>
          {name}
        </Text>

        {/* Address Row */}
        <View style={styles.addressRow}>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={2}>
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" />
          </Svg>
          <Text style={[styles.addressText, { fontFamily: typography.fonts.regular }]} numberOfLines={1}>
            {address}
          </Text>
        </View>

        {/* Bottom Rating & Distance Bar */}
        <View style={styles.bottomRow}>
          <View style={styles.ratingGroup}>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="#FFD700">
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </Svg>
            <Text style={[styles.ratingValue, { fontFamily: typography.fonts.bold }]}>
              {rating}
            </Text>
            <Text style={[styles.reviewsCount, { fontFamily: typography.fonts.regular }]}>
              ({reviewsCount})
            </Text>
          </View>

          <View style={styles.distanceGroup}>
            <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2}>
              <Path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            </Svg>
            <Text style={[styles.distanceText, { fontFamily: typography.fonts.medium }]}>
              {distance}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 240,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 40,
  },
  metaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categorySubtleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  categoryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFD700',
    marginRight: 6,
  },
  categorySubtleText: {
    color: '#FFFFFF',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  priceSubtleText: {
    color: '#FFFFFF',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 23,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  addressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  reviewsCount: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
  },
  distanceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
});
