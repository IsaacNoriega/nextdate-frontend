import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface PlaceCardProps {
  name: string;
  emoji: string;
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
  emoji,
  categoryLabel,
  priceSymbol,
  address,
  distance,
  rating,
  reviewsCount,
  imageUrl,
  onPress,
}: PlaceCardProps) {
  const { colors, typography, borderRadius } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { borderRadius: borderRadius.lg, borderColor: colors.border }]}
      activeOpacity={0.92}
      onPress={onPress}
    >
      {/* Full image background */}
      <Image source={{ uri: imageUrl }} style={styles.image} />

      {/* Top badges */}
      <View style={styles.topOverlay}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {emoji} {categoryLabel}
          </Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>{priceSymbol}</Text>
        </View>
      </View>

      {/* Bottom gradient overlay with info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.92)']}
        style={styles.gradient}
      >
        <Text style={[styles.cardName, { fontFamily: typography.fonts.bold }]} numberOfLines={2}>
          {name}
        </Text>

        <View style={styles.metaRow}>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          </Svg>
          <Text style={[styles.addressText, { fontFamily: typography.fonts.regular }]} numberOfLines={1}>
            {address}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.ratingChip}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="#FFD700">
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </Svg>
            <Text style={[styles.ratingText, { fontFamily: typography.fonts.bold }]}>
              {rating}
            </Text>
            <Text style={[styles.reviewsText, { fontFamily: typography.fonts.regular }]}>
              ({reviewsCount})
            </Text>
          </View>

          <View style={styles.distanceChip}>
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
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backdropFilter: 'blur(10)',
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  priceBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  priceBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 50,
    justifyContent: 'flex-end',
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 23,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  addressText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  reviewsText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
  },
  distanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});
