import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
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
      style={[styles.placeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      
      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardCategory, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
            {emoji} {categoryLabel}
          </Text>
          <Text style={[styles.cardPrice, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
            {priceSymbol}
          </Text>
        </View>

        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
          {name}
        </Text>

        <Text style={[styles.cardAddress, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
          📍 {address} • {distance}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.ratingBadge}>
            <Text style={{ fontSize: 13, marginRight: 4 }}>⭐</Text>
            <Text style={[styles.ratingText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              {rating}
            </Text>
            <Text style={[styles.reviewsText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
              ({reviewsCount})
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.planButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
            onPress={onPress}
          >
            <Text style={[styles.planButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
              Planear Cita
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  placeCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardBody: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardCategory: {
    fontSize: 12,
  },
  cardPrice: {
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 13,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
  },
  reviewsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  planButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 'auto',
    alignSelf: 'flex-end',
  },
  planButtonText: {
    fontSize: 13,
  },
});
