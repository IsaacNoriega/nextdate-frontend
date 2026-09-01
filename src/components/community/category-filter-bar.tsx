import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { FeedCategory, FEED_CATEGORIES } from '../../mocks/community.mock';

interface CategoryFilterBarProps {
  selectedCategory: FeedCategory;
  onSelectCategory: (category: FeedCategory) => void;
}

export default function CategoryFilterBar({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterBarProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  return (
    <View style={styles.categoriesWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {FEED_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : isDark
                    ? '#1c1c1e'
                    : '#f2f2f7',
                  borderRadius: borderRadius.round,
                  borderColor: isSelected ? colors.primary : colors.border,
                },

              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isSelected ? '#ffffff' : colors.textSecondary,
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
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesWrapper: {
    paddingVertical: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
  },
});
