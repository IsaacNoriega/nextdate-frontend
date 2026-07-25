import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  onSubmit?: () => void;
  isSubmitted?: boolean;
  submitText?: string;
  successText?: string;
}

export default function StarRating({
  rating,
  onRatingChange,
  onSubmit,
  isSubmitted = false,
  submitText = 'Enviar Calificación',
  successText = '¡Gracias por calificar!',
}: StarRatingProps) {
  const { colors, typography, borderRadius } = useTheme();

  return (
    <View style={[styles.rateCardBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= rating;
          return (
            <TouchableOpacity
              key={star}
              activeOpacity={onRatingChange ? 0.7 : 1}
              onPress={() => onRatingChange && onRatingChange(star)}
              disabled={!onRatingChange || isSubmitted}
              style={{ padding: 4 }}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill={isActive ? '#FFD700' : 'none'} stroke={isActive ? '#FFD700' : colors.textSecondary} strokeWidth={1.8}>
                <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </Svg>
            </TouchableOpacity>
          );
        })}
      </View>

      {rating > 0 && !isSubmitted && onSubmit ? (
        <TouchableOpacity
          style={[styles.rateActionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
          onPress={onSubmit}
        >
          <Text style={[styles.rateActionBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
            {submitText}
          </Text>
        </TouchableOpacity>
      ) : isSubmitted ? (
        <Text style={[styles.rateSuccessText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
          {successText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rateCardBox: {
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rateActionBtn: {
    height: 38,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  rateActionBtnText: {
    fontSize: 12,
  },
  rateSuccessText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
