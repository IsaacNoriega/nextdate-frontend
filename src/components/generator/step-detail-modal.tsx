import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import StarRating from '../ui/star-rating';
import { ItineraryStep } from '../../mocks/generator.mock';

interface StepDetailModalProps {
  step: ItineraryStep | null;
  onClose: () => void;
  rating?: number;
  onRate?: (rating: number) => void;
}

export default function StepDetailModal({
  step,
  onClose,
  rating = 0,
  onRate,
}: StepDetailModalProps) {
  const { colors, typography, borderRadius } = useTheme();

  // Swipe gesture right-to-left to close modal
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 25 && gestureState.dx < 0;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40 || gestureState.vx < -0.4) {
          onClose();
        }
      },
    })
  ).current;

  if (!step) return null;

  return (
    <Modal
      visible={!!step}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
        {...panResponder.panHandlers}
      >
        <View style={{ flex: 1 }}>
          {/* Hero Image */}
          <View style={styles.modalHero}>
            <Image source={{ uri: step.imageUrl }} style={styles.modalHeroImage} />
            <TouchableOpacity style={styles.modalClose} activeOpacity={0.8} onPress={onClose}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                <Path d="M18 6L6 18M6 6l12 12" />
              </Svg>
            </TouchableOpacity>
            <View style={[styles.modalHeroBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.modalHeroBadgeText, { fontFamily: typography.fonts.bold }]}>
                Paso {step.stepNumber}
              </Text>
            </View>
          </View>

          {/* Body */}
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              {step.title}
            </Text>

            <View style={styles.modalMeta}>
              <View style={[styles.modalMetaChip, { backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <Circle cx="12" cy="10" r="3" />
                </Svg>
                <Text style={[styles.modalMetaText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                  {step.placeName}
                </Text>
              </View>
              <View style={[styles.modalMetaChip, { backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Circle cx="12" cy="12" r="10" />
                  <Path d="M12 6v6l4 2" />
                </Svg>
                <Text style={[styles.modalMetaText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                  {step.time} ({step.duration})
                </Text>
              </View>
              <View style={[styles.modalMetaChip, { backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                  <Path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </Svg>
                <Text style={[styles.modalMetaText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                  {step.cost || step.estimatedCost || '$0.00'}
                </Text>
              </View>
            </View>

            {/* Description Card */}
            {step.description ? (
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                  DESCRIPCIÓN DE LA ACTIVIDAD
                </Text>
                <Text style={[styles.sectionText, { color: colors.text, fontFamily: typography.fonts.regular }]}>
                  {step.description}
                </Text>
              </View>
            ) : null}

            {/* Tips & Notes */}
            {step.notes ? (
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg, marginTop: 12 }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                  CONSEJO DEL CONCIERGE 💡
                </Text>
                <Text style={[styles.sectionText, { color: colors.text, fontFamily: typography.fonts.regular }]}>
                  {step.notes}
                </Text>
              </View>
            ) : null}

            {/* Transport info */}
            {step.transitTime ? (
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg, marginTop: 12 }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                  TRANSPORTE HACIA EL SIGUIENTE PUNTO 🚶
                </Text>
                <Text style={[styles.sectionText, { color: colors.text, fontFamily: typography.fonts.regular }]}>
                  {step.transitTime} ({step.transportMode || 'A pie'})
                </Text>
              </View>
            ) : null}

            {/* Step rating */}
            {onRate ? (
              <View style={[styles.ratingCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg, marginTop: 16 }]}>
                <Text style={[styles.ratingCardTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  ¿Qué te parece este paso?
                </Text>
                <View style={styles.ratingRow}>
                  <StarRating rating={rating} onRatingChange={onRate} />
                </View>
              </View>
            ) : null}

          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHero: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  modalHeroImage: {
    width: '100%',
    height: '100%',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalHeroBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  modalHeroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 12,
  },
  modalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalMetaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalMetaText: {
    fontSize: 12,
  },
  sectionCard: {
    padding: 14,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 19,
  },
  ratingCard: {
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  ratingCardTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  ratingRow: {
    paddingVertical: 4,
  },
});
