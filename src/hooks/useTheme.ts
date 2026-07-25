import { useColorScheme } from 'react-native';
import { theme } from '../theme/theme';

export function useTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  
  const currentColors = theme.colors[colorScheme];

  return {
    colors: currentColors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    colorScheme,
    isDark: colorScheme === 'dark',
  };
}
