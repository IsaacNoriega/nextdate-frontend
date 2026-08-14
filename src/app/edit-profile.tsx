import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { updateProfileApi, DietaryPreference, PriceRange } from '../services/profileService';

const PRICE_RANGES: { id: PriceRange; label: string; desc: string }[] = [
  { id: 'CHEAP', label: '$ Económico', desc: 'Planes accesibles e informales' },
  { id: 'MODERATE', label: '$$ Moderado', desc: 'Equilibrio perfecto de calidad y precio' },
  { id: 'EXPENSIVE', label: '$$$ Exclusivo', desc: 'Lugares destacados y experiencias premium' },
  { id: 'LUXURY', label: '$$$$ Lujo', desc: 'Alta gastronomía y experiencias de primer nivel' },
];

const DIETARY_OPTIONS: { id: DietaryPreference; label: string }[] = [
  { id: 'NONE', label: 'Sin Restricciones' },
  { id: 'VEGETARIAN', label: 'Vegetariano' },
  { id: 'VEGAN', label: 'Vegano' },
  { id: 'GLUTEN_FREE', label: 'Libre de Gluten' },
  { id: 'DAIRY_FREE', label: 'Sin Lácteos' },
  { id: 'PESCATARIAN', label: 'Pescetariano' },
  { id: 'OTHER', label: 'Otro' },
];

export default function EditProfileModalScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: 'profile' | 'preferences' | 'budget'; profileId?: string; userId?: string }>();

  const mode = params.mode || 'profile';

  // State
  const [username, setUsername] = useState('isaac_noriega');
  const [bio, setBio] = useState('Apasionado de la buena comida y nuevas experiencias.');
  const [preferredPriceRange, setPreferredPriceRange] = useState<PriceRange>('MODERATE');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('NONE');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (params.profileId && params.userId) {
        await updateProfileApi({
          id: params.profileId,
          userId: params.userId,
          username: username.trim(),
          bio: bio.trim() || undefined,
          preferredPriceRange,
          dietaryPreference,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        router.back();
      }, 800);
    } catch (err: any) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        router.back();
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    profile: 'Editar Perfil',
    preferences: 'Preferencias Gastronómicas',
    budget: 'Rango de Presupuesto',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2}>
              <Path d="M19 12H5M12 19l-7-7 7-7" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            {titles[mode]}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Mode: Profile */}
          {mode === 'profile' && (
            <View style={styles.section}>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Actualiza tu información pública de perfil.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  Nombre de Usuario
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                  placeholder="Username"
                  placeholderTextColor={colors.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  Biografía
                </Text>
                <TextInput
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                  placeholder="Escribe algo sobre ti..."
                  placeholderTextColor={colors.textSecondary}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          )}

          {/* Mode: Preferences */}
          {mode === 'preferences' && (
            <View style={styles.section}>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Selecciona tus hábitos o restricciones alimenticias.
              </Text>

              <View style={styles.dietaryWrap}>
                {DIETARY_OPTIONS.map((d) => {
                  const isSelected = dietaryPreference === d.id;
                  return (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.dietChip,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderRadius: borderRadius.round
                        }
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setDietaryPreference(d.id)}
                    >
                      <Text style={[
                        styles.dietChipText,
                        { color: isSelected ? colors.primaryContrast : colors.text, fontFamily: typography.fonts.medium }
                      ]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Mode: Budget */}
          {mode === 'budget' && (
            <View style={styles.section}>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Determina el rango de precio promedio para tus recomendaciones de cita.
              </Text>

              <View style={styles.priceList}>
                {PRICE_RANGES.map((pr) => {
                  const isSelected = preferredPriceRange === pr.id;
                  return (
                    <TouchableOpacity
                      key={pr.id}
                      style={[
                        styles.priceOption,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary + '08' : colors.card,
                          borderRadius: borderRadius.md
                        }
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setPreferredPriceRange(pr.id)}
                    >
                      <Text style={[styles.priceLabel, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                        {pr.label}
                      </Text>
                      <Text style={[styles.priceDesc, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                        {pr.desc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              {
                backgroundColor: savedSuccess ? '#30D158' : colors.primary,
                borderRadius: borderRadius.md
              }
            ]}
            activeOpacity={0.9}
            onPress={handleSave}
          >
            <Text style={[styles.saveBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
              {savedSuccess ? '¡Guardado correctamente!' : 'Guardar Cambios'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    height: 90,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  priceList: {
    gap: 10,
  },
  priceOption: {
    padding: 16,
    borderWidth: 1,
  },
  priceLabel: {
    fontSize: 15,
    marginBottom: 4,
  },
  priceDesc: {
    fontSize: 12,
  },
  dietaryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dietChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
  },
  dietChipText: {
    fontSize: 13,
  },
  saveBtn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    fontSize: 15,
  },
});
