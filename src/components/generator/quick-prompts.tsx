import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { QUICK_PROMPTS } from '../../mocks/generator.mock';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export default function QuickPrompts({ onSelectPrompt, disabled = false }: QuickPromptsProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_PROMPTS.map((prompt, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.promptChip,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderColor: colors.border,
                borderRadius: borderRadius.round,
              },
            ]}
            onPress={() => onSelectPrompt(prompt)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={[styles.promptText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
              ✨ {prompt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  promptChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  promptText: {
    fontSize: 12,
  },
});
