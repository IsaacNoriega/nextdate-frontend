import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { RouteStep } from '../../mocks/map.mock';

interface NavigationOverlayProps {
  step: RouteStep;
  activeStepIndex: number;
  totalSteps: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenDetail: () => void;
}

export default function NavigationOverlay({
  step,
  activeStepIndex,
  totalSteps,
  onNextStep,
  onPrevStep,
  onOpenDetail,
}: NavigationOverlayProps) {
  const { colors, typography, borderRadius } = useTheme();

  return (
    <View
      style={[
        styles.navCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
        },
      ]}
    >
      {/* Header Turn Instruction */}
      <View style={styles.navTopRow}>
        <View
          style={[
            styles.turnIconWrap,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primary}
            strokeWidth={2.5}
          >
            <Path d="M9 18l6-6-6-6" />
          </Svg>
        </View>
        <View style={styles.turnInfo}>
          <Text
            style={[
              styles.turnInstruction,
              { color: colors.text, fontFamily: typography.fonts.bold },
            ]}
          >
            {step.turnInstruction}
          </Text>
          <Text
            style={[
              styles.turnMeta,
              {
                color: colors.textSecondary,
                fontFamily: typography.fonts.regular,
              },
            ]}
          >
            {step.distanceRemaining} • {step.eta} aprox.
          </Text>
        </View>
      </View>

      {/* Target Place Info */}
      <TouchableOpacity
        style={[
          styles.stepPlaceRow,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
          },
        ]}
        activeOpacity={0.8}
        onPress={onOpenDetail}
      >
        <Image
          source={{ uri: step.imageUrl }}
          style={[styles.stepImage, { borderRadius: borderRadius.sm }]}
        />
        <View style={styles.stepInfo}>
          <Text
            style={[
              styles.stepBadge,
              { color: colors.primary, fontFamily: typography.fonts.bold },
            ]}
          >
            Paso {step.stepNumber} de {totalSteps} • {step.time}
          </Text>
          <Text
            style={[
              styles.stepTitle,
              { color: colors.text, fontFamily: typography.fonts.bold },
            ]}
            numberOfLines={1}
          >
            {step.placeName}
          </Text>
          <Text
            style={[
              styles.stepAddress,
              {
                color: colors.textSecondary,
                fontFamily: typography.fonts.regular,
              },
            ]}
            numberOfLines={1}
          >
            {step.address}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Navigation step controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.navBtn,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
            },
          ]}
          onPress={onPrevStep}
          disabled={activeStepIndex === 0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.navBtnText,
              {
                color:
                  activeStepIndex === 0 ? colors.textSecondary : colors.text,
                fontFamily: typography.fonts.medium,
              },
            ]}
          >
            ← Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navBtn,
            styles.navBtnPrimary,
            {
              backgroundColor: colors.primary,
              borderRadius: borderRadius.md,
            },
          ]}
          onPress={onNextStep}
          disabled={activeStepIndex >= totalSteps - 1}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.navBtnTextPrimary,
              { fontFamily: typography.fonts.bold },
            ]}
          >
            {activeStepIndex >= totalSteps - 1
              ? 'Llegada al Destino'
              : 'Siguiente Paso →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navCard: {
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  navTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  turnIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnInfo: {
    flex: 1,
  },
  turnInstruction: {
    fontSize: 14,
  },
  turnMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  stepPlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  stepImage: {
    width: 48,
    height: 48,
    marginRight: 10,
  },
  stepInfo: {
    flex: 1,
  },
  stepBadge: {
    fontSize: 11,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 14,
  },
  stepAddress: {
    fontSize: 11,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  navBtnPrimary: {
    flex: 1.5,
    borderWidth: 0,
  },
  navBtnText: {
    fontSize: 13,
  },
  navBtnTextPrimary: {
    color: '#FFF',
    fontSize: 13,
  },
});
