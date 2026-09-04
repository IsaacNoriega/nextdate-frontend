import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import {
  getProfileByUserIdApi,
  updateProfileApi,
  DietaryPreference,
  PriceRange,
  PlaceCategory,
} from '../services/profileService';

const INTEREST_OPTIONS: { id: PlaceCategory; label: string; desc: string }[] = [
  { id: 'FOOD_DRINK', label: 'Gastronomía', desc: 'Restaurantes, catas, cafeterías y bares' },
  { id: 'CULTURE', label: 'Cultura & Arte', desc: 'Museos, teatros, conciertos y galerías' },
  { id: 'NATURE', label: 'Naturaleza', desc: 'Parques, miradores, senderismo y aire libre' },
  { id: 'ENTERTAINMENT', label: 'Entretenimiento', desc: 'Cine, bolos, juegos y experiencias interactivas' },
  { id: 'SHOPPING', label: 'Compras', desc: 'Boutiques, bazares de diseño y plazas' },
  { id: 'SPORTS', label: 'Deportes & Activo', desc: 'Ciclismo, escalada, pádel y aventura' },
  { id: 'OTHER', label: 'Otros Planes', desc: 'Planes sorpresa y citas alternativas' },
];

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

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
];

export default function EditProfileModalScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: 'profile' | 'preferences' | 'budget' | 'interests';
    profileId?: string;
    userId?: string;
  }>();

  const mode = params.mode || 'profile';

  // State
  const [profileId, setProfileId] = useState<string>(params.profileId || '');
  const [username, setUsername] = useState('Usuario NextDate');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [preferredPriceRange, setPreferredPriceRange] = useState<PriceRange>('MODERATE');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('NONE');
  const [interests, setInterests] = useState<PlaceCategory[]>(['FOOD_DRINK', 'CULTURE']);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(true);

  // Cargar datos actuales del perfil del usuario
  useEffect(() => {
    async function loadCurrentProfile() {
      const targetUserId = params.userId || user?.id;
      if (!targetUserId) {
        setFetchingInitial(false);
        return;
      }

      try {
        const existingProfile = await getProfileByUserIdApi(targetUserId);
        if (existingProfile) {
          setProfileId(existingProfile.id);
          setUsername(existingProfile.username || '');
          setBio(existingProfile.bio || '');
          setAvatarUrl(existingProfile.avatarUrl || '');
          setPreferredPriceRange(existingProfile.preferredPriceRange || 'MODERATE');
          setDietaryPreference(existingProfile.dietaryPreference || 'NONE');
          if (existingProfile.interests && existingProfile.interests.length > 0) {
            setInterests(existingProfile.interests);
          }
        }
      } catch (err) {
        console.warn('Error cargando perfil actual:', err);
      } finally {
        setFetchingInitial(false);
      }
    }

    loadCurrentProfile();
  }, [params.userId, user?.id]);

  // Selección de foto desde la galería
  const handlePickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a tus fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const selectedImage = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setAvatarUrl(selectedImage);
    }
  };

  const toggleInterest = (category: PlaceCategory) => {
    if (interests.includes(category)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== category));
      } else {
        Alert.alert('Aviso', 'Debes mantener al menos una categoría de interés.');
      }
    } else {
      setInterests([...interests, category]);
    }
  };

  const handleSave = async () => {
    const targetUserId = params.userId || user?.id;
    if (!targetUserId || !profileId) {
      Alert.alert('Error', 'No se encontró la información del perfil para guardar.');
      return;
    }

    setLoading(true);
    try {
      await updateProfileApi({
        id: profileId,
        userId: targetUserId,
        username: username.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        preferredPriceRange,
        dietaryPreference,
        interests,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        router.back();
      }, 700);
    } catch (err: any) {
      console.error('Error actualizando perfil:', err);
      Alert.alert('Error', err?.message || 'No se pudieron guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    profile: 'Editar Perfil',
    preferences: 'Preferencias Gastronómicas',
    budget: 'Rango de Presupuesto',
    interests: 'Intereses para Citas',
  };

  const currentDisplayAvatar =
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'NextDate')}&background=E11D48&color=fff&size=256`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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

        {fetchingInitial ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Mode: Profile */}
            {mode === 'profile' && (
              <View style={styles.section}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: currentDisplayAvatar }} style={styles.avatarPreview} />
                    <TouchableOpacity
                      style={[styles.cameraBadge, { backgroundColor: colors.primary }]}
                      activeOpacity={0.85}
                      onPress={handlePickAvatar}
                    >
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={2.2}>
                        <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <Path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                      </Svg>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.pickPhotoBtn,
                      {
                        borderColor: colors.primary,
                        borderRadius: borderRadius.round,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={handlePickAvatar}
                  >
                    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <Circle cx="12" cy="13" r="4" />
                    </Svg>
                    <Text
                      style={[
                        styles.pickPhotoBtnText,
                        { color: colors.primary, fontFamily: typography.fonts.bold },
                      ]}
                    >
                      Cambiar Foto de Perfil
                    </Text>
                  </TouchableOpacity>

                  {/* Presets de Foto */}
                  <View style={styles.presetsContainer}>
                    <Text
                      style={[
                        styles.presetsTitle,
                        { color: colors.textSecondary, fontFamily: typography.fonts.medium },
                      ]}
                    >
                      O elige un avatar predeterminado:
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
                    >
                      {AVATAR_PRESETS.map((url, idx) => {
                        const isSelected = avatarUrl === url;
                        return (
                          <TouchableOpacity
                            key={idx}
                            activeOpacity={0.8}
                            onPress={() => setAvatarUrl(url)}
                            style={[
                              styles.presetThumbWrap,
                              {
                                borderColor: isSelected ? colors.primary : 'transparent',
                                borderWidth: isSelected ? 3 : 1,
                              },
                            ]}
                          >
                            <Image source={{ uri: url }} style={styles.presetThumb} />
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>

                {/* Form Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    Nombre de Usuario
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        borderRadius: borderRadius.md,
                        fontFamily: typography.fonts.regular,
                      },
                    ]}
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
                    style={[
                      styles.textArea,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        borderRadius: borderRadius.md,
                        fontFamily: typography.fonts.regular,
                      },
                    ]}
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
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.textSecondary, fontFamily: typography.fonts.regular },
                  ]}
                >
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
                            borderRadius: borderRadius.round,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setDietaryPreference(d.id)}
                      >
                        {isSelected && (
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={3}>
                            <Path d="M20 6L9 17l-5-5" />
                          </Svg>
                        )}
                        <Text
                          style={[
                            styles.dietChipText,
                            {
                              color: isSelected ? colors.primaryContrast : colors.text,
                              fontFamily: typography.fonts.medium,
                            },
                          ]}
                        >
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
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.textSecondary, fontFamily: typography.fonts.regular },
                  ]}
                >
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
                            borderWidth: isSelected ? 2 : 1,
                            backgroundColor: isSelected ? colors.primary + '12' : colors.card,
                            borderRadius: borderRadius.md,
                          },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setPreferredPriceRange(pr.id)}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text
                            style={[
                              styles.priceLabel,
                              { color: isSelected ? colors.primary : colors.text, fontFamily: typography.fonts.bold },
                            ]}
                          >
                            {pr.label}
                          </Text>
                          {isSelected && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2.5}>
                                <Path d="M20 6L9 17l-5-5" />
                              </Svg>
                              <Text style={{ color: colors.primary, fontSize: 13, fontFamily: typography.fonts.bold }}>
                                Seleccionado
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.priceDesc,
                            { color: colors.textSecondary, fontFamily: typography.fonts.regular },
                          ]}
                        >
                          {pr.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Mode: Interests */}
            {mode === 'interests' && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.textSecondary, fontFamily: typography.fonts.regular },
                  ]}
                >
                  Elige las categorías de actividades y citas que más disfrutas. Tu feed de Explorar se adaptará automáticamente a estas selecciones.
                </Text>

                <View style={styles.priceList}>
                  {INTEREST_OPTIONS.map((opt) => {
                    const isSelected = interests.includes(opt.id);
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.priceOption,
                          {
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderWidth: isSelected ? 2 : 1,
                            backgroundColor: isSelected ? colors.primary + '12' : colors.card,
                            borderRadius: borderRadius.md,
                          },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleInterest(opt.id)}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text
                            style={[
                              styles.priceLabel,
                              { color: isSelected ? colors.primary : colors.text, fontFamily: typography.fonts.bold },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {isSelected && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2.5}>
                                <Path d="M20 6L9 17l-5-5" />
                              </Svg>
                              <Text style={{ color: colors.primary, fontSize: 13, fontFamily: typography.fonts.bold }}>
                                Activo
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.priceDesc,
                            { color: colors.textSecondary, fontFamily: typography.fonts.regular },
                          ]}
                        >
                          {opt.desc}
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
                  borderRadius: borderRadius.md,
                },
              ]}
              activeOpacity={0.9}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {savedSuccess && (
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={2.5}>
                      <Path d="M20 6L9 17l-5-5" />
                    </Svg>
                  )}
                  <Text
                    style={[
                      styles.saveBtnText,
                      { color: colors.primaryContrast, fontFamily: typography.fonts.bold },
                    ]}
                  >
                    {savedSuccess ? '¡Guardado correctamente!' : 'Guardar Cambios'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarPreview: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  pickPhotoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  pickPhotoBtnText: {
    fontSize: 13,
  },
  presetsContainer: {
    width: '100%',
    marginTop: 6,
  },
  presetsTitle: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  presetThumbWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  presetThumb: {
    width: '100%',
    height: '100%',
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
