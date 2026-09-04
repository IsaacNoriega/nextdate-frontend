import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SparklesIcon, FilterIcon } from '../ui/icons';

interface ExplorePreferencesBarProps {
  interestLabels: string[];
  budgetLabel?: string;
  isFilteredByProfile: boolean;
  onToggleProfileFilter?: () => void;
  onEditProfilePress: () => void;
}

export default function ExplorePreferencesBar({
  interestLabels,
  budgetLabel,
  isFilteredByProfile,
  onToggleProfileFilter,
  onEditProfilePress,
}: ExplorePreferencesBarProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  const summaryText = [
    interestLabels.slice(0, 3).join(', '),
    budgetLabel?.split(' ')[0], // '$', '$$', etc.
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.minimalPill,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            borderColor: colors.border,
            borderRadius: borderRadius.round,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.contentRow}
          onPress={onEditProfilePress}
          activeOpacity={0.7}
        >
          <SparklesIcon size={13} color={colors.primary} />
          <Text
            style={[
              styles.summaryText,
              { color: colors.text, fontFamily: typography.fonts.medium },
            ]}
            numberOfLines={1}
          >
            {isFilteredByProfile
              ? `Para ti: ${summaryText || 'Tus preferencias'}`
              : 'Explorando todas las categorías'}
          </Text>

          <Text
            style={[
              styles.editLink,
              { color: colors.accent || colors.primary, fontFamily: typography.fonts.bold },
            ]}
          >
            Editar
          </Text>
        </TouchableOpacity>

        {onToggleProfileFilter && (
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              {
                backgroundColor: isFilteredByProfile
                  ? colors.primary + '14'
                  : 'transparent',
                borderColor: isFilteredByProfile ? colors.primary + '30' : colors.border,
                borderRadius: borderRadius.round,
              },
            ]}
            onPress={onToggleProfileFilter}
            activeOpacity={0.7}
          >
            <FilterIcon size={10} color={isFilteredByProfile ? colors.primary : colors.textSecondary} />
            <Text
              style={[
                styles.toggleText,
                {
                  color: isFilteredByProfile ? colors.primary : colors.textSecondary,
                  fontFamily: isFilteredByProfile ? typography.fonts.bold : typography.fonts.regular,
                },
              ]}
            >
              {isFilteredByProfile ? 'Perfil' : 'Todo'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  minimalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 5,
    borderWidth: 1,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
  },
  editLink: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 10,
  },
});
