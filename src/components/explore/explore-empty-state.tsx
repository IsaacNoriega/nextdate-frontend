import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { CompassIcon, SearchIcon, PlusIcon, CloseIcon } from '../ui/icons';

interface ExploreEmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters?: () => void;
  onSharePress?: () => void;
}

export default function ExploreEmptyState({
  hasActiveFilters,
  onResetFilters,
  onSharePress,
}: ExploreEmptyStateProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            borderRadius: borderRadius.round,
          },
        ]}
      >
        {hasActiveFilters ? (
          <SearchIcon size={28} color={colors.textSecondary} />
        ) : (
          <CompassIcon size={28} color={colors.textSecondary} />
        )}
      </View>

      <Text style={[styles.title, { color: colors.text, fontFamily: typography.fonts.bold }]}>
        {hasActiveFilters
          ? 'No hay experiencias con estos filtros'
          : 'Aún no hay experiencias compartidas'}
      </Text>

      <Text
        style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}
      >
        {hasActiveFilters
          ? 'Prueba modificando los términos de búsqueda, la categoría o el rango de precio seleccionado.'
          : 'Sé la primera persona en compartir una recomendación de cita romántica con la comunidad.'}
      </Text>

      <View style={styles.actionsContainer}>
        {hasActiveFilters && onResetFilters && (
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
            onPress={onResetFilters}
            activeOpacity={0.75}
          >
            <CloseIcon size={14} color={colors.text} />
            <Text style={[styles.secondaryBtnText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
              Restablecer filtros
            </Text>
          </TouchableOpacity>
        )}

        {onSharePress && (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.md,
              },
            ]}
            onPress={onSharePress}
            activeOpacity={0.85}
          >
            <PlusIcon size={14} color={colors.primaryContrast} strokeWidth={2.5} />
            <Text
              style={[
                styles.primaryBtnText,
                { color: colors.primaryContrast, fontFamily: typography.fonts.bold },
              ]}
            >
              Compartir Experiencia
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  iconCircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 300,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryBtnText: {
    fontSize: 13,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
  },
});
