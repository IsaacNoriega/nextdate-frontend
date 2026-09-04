import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import {
  SparklesIcon,
  UtensilsIcon,
  HeartIcon,
  TreeIcon,
  TheaterIcon,
  CloseIcon,
} from '../ui/icons';

export interface CategoryOption {
  id: string;
  label: string;
  iconType: 'all' | 'romantic' | 'nature' | 'gastro' | 'culture';
}

export interface BudgetOption {
  id: string;
  label: string;
}

export const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'ALL', label: 'Todas', iconType: 'all' },
  { id: 'ROMANTIC', label: 'Románticas', iconType: 'romantic' },
  { id: 'GASTRO', label: 'Gastronomía', iconType: 'gastro' },
  { id: 'OUTDOOR', label: 'Naturaleza', iconType: 'nature' },
  { id: 'CULTURE', label: 'Cultura', iconType: 'culture' },
];

export const DEFAULT_BUDGET_OPTIONS: BudgetOption[] = [
  { id: 'ALL', label: 'Todos' },
  { id: '$', label: '$' },
  { id: '$$', label: '$$' },
  { id: '$$$', label: '$$$' },
  { id: '$$$$', label: '$$$$' },
];

interface ExploreCategoryFiltersProps {
  categories?: CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  budgetOptions?: BudgetOption[];
  selectedBudget: string;
  onSelectBudget: (budgetId: string) => void;
  totalResultsCount?: number;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

export default function ExploreCategoryFilters({
  categories = DEFAULT_CATEGORY_OPTIONS,
  selectedCategory,
  onSelectCategory,
  budgetOptions = DEFAULT_BUDGET_OPTIONS,
  selectedBudget,
  onSelectBudget,
  totalResultsCount,
  hasActiveFilters = false,
  onResetFilters,
}: ExploreCategoryFiltersProps) {
  const { colors, typography, borderRadius } = useTheme();

  const renderCategoryIcon = (iconType: string, isSelected: boolean) => {
    const iconColor = isSelected ? colors.primaryContrast : colors.text;
    switch (iconType) {
      case 'all':
        return <SparklesIcon size={14} color={iconColor} />;
      case 'romantic':
        return <HeartIcon size={14} color={iconColor} />;
      case 'gastro':
        return <UtensilsIcon size={14} color={iconColor} />;
      case 'nature':
        return <TreeIcon size={14} color={iconColor} />;
      case 'culture':
        return <TheaterIcon size={14} color={iconColor} />;
      default:
        return <SparklesIcon size={14} color={iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Categories Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: borderRadius.round,
                },
              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.75}
            >
              {renderCategoryIcon(cat.iconType, isSelected)}
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isSelected ? colors.primaryContrast : colors.text,
                    fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Budget Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, styles.budgetScroll]}
      >
        {budgetOptions.map((b) => {
          const isSelected = selectedBudget === b.id;
          return (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.budgetChip,
                {
                  backgroundColor: isSelected
                    ? colors.primary + '16'
                    : 'transparent',
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: borderRadius.sm,
                },
              ]}
              onPress={() => onSelectBudget(b.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.budgetText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium,
                  },
                ]}
              >
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active filters / Results count indicator */}
      {(hasActiveFilters || typeof totalResultsCount === 'number') && (
        <View style={styles.resultsInfoRow}>
          <Text style={[styles.resultsCountText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
            {typeof totalResultsCount === 'number'
              ? `${totalResultsCount} ${totalResultsCount === 1 ? 'experiencia' : 'experiencias'}`
              : ''}
          </Text>

          {hasActiveFilters && onResetFilters && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={onResetFilters}
              activeOpacity={0.7}
            >
              <CloseIcon size={12} color={colors.accent || colors.primary} />
              <Text
                style={[
                  styles.resetText,
                  { color: colors.accent || colors.primary, fontFamily: typography.fonts.medium },
                ]}
              >
                Restablecer filtros
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  budgetScroll: {
    paddingTop: 6,
    paddingBottom: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
  },
  budgetChip: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderWidth: 1,
  },
  budgetText: {
    fontSize: 11,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 2,
  },
  resultsCountText: {
    fontSize: 11,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  resetText: {
    fontSize: 11,
  },
});
