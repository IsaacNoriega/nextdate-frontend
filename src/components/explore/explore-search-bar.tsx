import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SearchIcon, CloseIcon } from '../ui/icons';

interface ExploreSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function ExploreSearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar experiencias, lugares o palabras clave...',
  onClear,
}: ExploreSearchBarProps) {
  const { colors, typography, borderRadius } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.card,
            borderColor: isFocused ? colors.primary : colors.border,
            borderRadius: borderRadius.md,
          },
        ]}
      >
        <SearchIcon
          size={16}
          color={isFocused ? colors.primary : colors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={[styles.input, { color: colors.text, fontFamily: typography.fonts.regular }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
            <CloseIcon size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  input: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
});
