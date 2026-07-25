import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks/useTheme';

// Enums del backend GraphQL
type Gender = 'MALE' | 'FEMALE' | 'OTHER';
type PlaceCategory = 'FOOD_DRINK' | 'CULTURE' | 'NATURE' | 'ENTERTAINMENT' | 'SHOPPING' | 'SPORTS' | 'OTHER';
type PriceRange = 'CHEAP' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY';
type DietaryPreference = 'NONE' | 'VEGETARIAN' | 'VEGAN' | 'GLUTEN_FREE' | 'DAIRY_FREE' | 'PESCATARIAN' | 'OTHER';

const CATEGORIES: { id: PlaceCategory; label: string; icon: string }[] = [
  { id: 'FOOD_DRINK', label: 'Gastronomía & Bares', icon: '🍷' },
  { id: 'CULTURE', label: 'Cultura & Arte', icon: '🎭' },
  { id: 'NATURE', label: 'Naturaleza & Aire Libre', icon: '🌿' },
  { id: 'ENTERTAINMENT', label: 'Entretenimiento', icon: '🎬' },
  { id: 'SHOPPING', label: 'Compras', icon: '🛍️' },
  { id: 'SPORTS', label: 'Deportes & Aventura', icon: '⚽' },
  { id: 'OTHER', label: 'Otros', icon: '✨' },
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

export default function SetupProfileScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Estado del Stepper (Pasos 1 a 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Datos del formulario para createProfile(input: CreateProfileInput!)
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [date, setDate] = useState<Date>(new Date(1998, 9, 20));
  const [showNativePicker, setShowNativePicker] = useState(false);
  const [gender, setGender] = useState<Gender>('OTHER');
  const [interests, setInterests] = useState<PlaceCategory[]>(['FOOD_DRINK', 'CULTURE']);
  const [preferredPriceRange, setPreferredPriceRange] = useState<PriceRange>('MODERATE');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('NONE');
  const [latitude, setLatitude] = useState<number>(20.6736);
  const [longitude, setLongitude] = useState<number>(-103.344);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const birthdateFormatted = date.toISOString().split('T')[0];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowNativePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const toggleInterest = (category: PlaceCategory) => {
    if (interests.includes(category)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== category));
      }
    } else {
      setInterests([...interests, category]);
    }
  };

  const handleNextStep = () => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!username.trim()) {
        setErrorMessage('Por favor ingresa tu nombre de usuario.');
        return;
      }
    }

    if (currentStep === 2 && interests.length === 0) {
      setErrorMessage('Selecciona al menos un interés.');
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteProfile();
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      if (router.canGoBack()) router.back();
      else router.replace('/');
    }
  };

  const handleCompleteProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Simulación de la mutation GraphQL createProfile(input: CreateProfileInput!)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace('/explore');
    } catch (err: any) {
      setErrorMessage('Ocurrió un error al guardar el perfil. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header con Flecha Limpia sin Círculo */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handlePrevStep}
              activeOpacity={0.7}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M19 12H5M12 19l-7-7 7-7" />
              </Svg>
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View style={styles.progressBars}>
                {[1, 2, 3, 4].map((step) => (
                  <View 
                    key={step} 
                    style={[
                      styles.progressBar, 
                      { backgroundColor: step <= currentStep ? colors.primary : colors.border }
                    ]} 
                  />
                ))}
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                Paso {currentStep} de 4
              </Text>
            </View>
          </View>

          <View style={[styles.formWrapper, { maxWidth: width > 430 ? 440 : '100%', alignSelf: 'center' }]}>
            
            {/* Banner de Errores */}
            {errorMessage ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.notification + '15', borderColor: colors.notification }]}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.notification} strokeWidth={2} style={{ marginRight: 8 }}>
                  <Path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </Svg>
                <Text style={[styles.errorBannerText, { color: colors.notification, fontFamily: typography.fonts.medium }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* PASO 1: Información Básica */}
            {currentStep === 1 && (
              <View>
                <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Información Personal
                </Text>
                <Text style={[styles.stepSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  Cuéntanos un poco sobre ti para personalizar tu experiencia.
                </Text>

                {/* Username Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    Nombre de Usuario
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.card }]}
                    placeholder="Ej. alex_morgan"
                    placeholderTextColor={colors.textSecondary}
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>

                {/* Birthdate Input Nativo */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    Fecha de Nacimiento
                  </Text>

                  {Platform.OS === 'web' ? (
                    <input 
                      type="date"
                      value={birthdateFormatted}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const [y, m, d] = val.split('-').map(Number);
                          setDate(new Date(y, m - 1, d));
                        }
                      }}
                      style={{
                        height: '52px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: `${borderRadius.md}px`,
                        backgroundColor: colors.card,
                        color: colors.text,
                        padding: '0 16px',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        width: '100%',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    />
                  ) : (
                    <TouchableOpacity 
                      style={[styles.dateSelectorButton, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}
                      activeOpacity={0.8}
                      onPress={() => setShowNativePicker(true)}
                    >
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2} style={{ marginRight: 12 }}>
                        <Path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" />
                      </Svg>
                      <Text style={[styles.dateSelectorText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                        {birthdateFormatted}
                      </Text>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                        <Path d="M6 9l6 6 6-6" />
                      </Svg>
                    </TouchableOpacity>
                  )}

                  {/* Native DateTimePicker en iOS / Android */}
                  {Platform.OS !== 'web' && (showNativePicker || Platform.OS === 'ios') && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                {/* Gender Selector con Centrado Perfecto */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    Género
                  </Text>
                  <View style={styles.genderOptions}>
                    {[
                      { id: 'MALE', label: 'Hombre' },
                      { id: 'FEMALE', label: 'Mujer' },
                      { id: 'OTHER', label: 'Otro / Prefiero no decir' }
                    ].map((g) => (
                      <TouchableOpacity
                        key={g.id}
                        style={[
                          styles.genderChip,
                          { 
                            borderColor: gender === g.id ? colors.primary : colors.border,
                            backgroundColor: gender === g.id ? colors.primary : colors.card,
                            borderRadius: borderRadius.md
                          }
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setGender(g.id as Gender)}
                      >
                        <Text style={[
                          styles.genderChipText,
                          { color: gender === g.id ? colors.primaryContrast : colors.text, fontFamily: typography.fonts.medium }
                        ]}>
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Bio Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    Bio / Breve Descripción
                  </Text>
                  <TextInput
                    style={[styles.textArea, { color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.card }]}
                    placeholder="Apasionado del café, los libros y las caminatas al atardecer..."
                    placeholderTextColor={colors.textSecondary}
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            )}

            {/* PASO 2: Intereses */}
            {currentStep === 2 && (
              <View>
                <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Tus Intereses
                </Text>
                <Text style={[styles.stepSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  Selecciona los tipos de lugares y actividades que más disfrutas.
                </Text>

                <View style={styles.categoriesGrid}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = interests.includes(cat.id);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryCard,
                          {
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary + '10' : colors.card,
                            borderRadius: borderRadius.lg
                          }
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleInterest(cat.id)}
                      >
                        <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                        <Text style={[
                          styles.categoryTitle,
                          { color: colors.text, fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium }
                        ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* PASO 3: Presupuesto & Dieta */}
            {currentStep === 3 && (
              <View>
                <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Preferencias de Citas
                </Text>
                <Text style={[styles.stepSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  Personaliza tu rango de precios predeterminado y requerimientos dietéticos.
                </Text>

                {/* Price Range */}
                <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Rango de Presupuesto
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

                {/* Dietary Preference */}
                <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 24 }]}>
                  Preferencia Alimenticia
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

            {/* PASO 4: Ubicación GPS y Confirmación */}
            {currentStep === 4 && (
              <View>
                <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Ubicación & Confirmación
                </Text>
                <Text style={[styles.stepSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  Usamos tu ubicación para mostrarte los mejores lugares y rutas de cita cercanos.
                </Text>

                <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <View style={[styles.locationIconBox, { backgroundColor: colors.primary + '12' }]}>
                    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </Svg>
                  </View>
                  <Text style={[styles.locationTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Ubicación Detectada
                  </Text>
                  <Text style={[styles.locationCoords, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    Latitud: {latitude} | Longitud: {longitude}
                  </Text>
                </View>

                {/* Resumen del Perfil */}
                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <Text style={[styles.summaryHeader, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Resumen de tu Perfil
                  </Text>
                  <Text style={[styles.summaryItem, { color: colors.textSecondary }]}>
                    👤 Username: <Text style={{ color: colors.text }}>@{username}</Text>
                  </Text>
                  <Text style={[styles.summaryItem, { color: colors.textSecondary }]}>
                    📅 Nacimiento: <Text style={{ color: colors.text }}>{birthdateFormatted}</Text>
                  </Text>
                  <Text style={[styles.summaryItem, { color: colors.textSecondary }]}>
                    ✨ Intereses: <Text style={{ color: colors.text }}>{interests.length} categorías seleccionadas</Text>
                  </Text>
                  <Text style={[styles.summaryItem, { color: colors.textSecondary }]}>
                    💳 Presupuesto: <Text style={{ color: colors.text }}>{preferredPriceRange}</Text>
                  </Text>
                  <Text style={[styles.summaryItem, { color: colors.textSecondary }]}>
                    🥗 Dieta: <Text style={{ color: colors.text }}>{dietaryPreference}</Text>
                  </Text>
                </View>
              </View>
            )}

            {/* Next / Submit Button */}
            <TouchableOpacity 
              style={[
                styles.nextButton, 
                { backgroundColor: colors.primary, borderRadius: borderRadius.md },
                loading && { opacity: 0.7 }
              ]}
              activeOpacity={0.9}
              onPress={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryContrast} />
              ) : (
                <Text style={[styles.nextButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                  {currentStep === 4 ? 'Completar Perfil y Comenzar' : 'Siguiente Paso'}
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressBars: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepText: {
    fontSize: 12,
  },
  formWrapper: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  dateSelectorButton: {
    height: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
  },
  dateSelectorText: {
    flex: 1,
    fontSize: 15,
  },
  textArea: {
    height: 90,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  genderOptions: {
    gap: 10,
  },
  genderChip: {
    height: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    paddingHorizontal: 16,
  },
  genderChipText: {
    fontSize: 14,
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    marginBottom: 12,
  },
  priceList: {
    gap: 10,
  },
  priceOption: {
    padding: 14,
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
    gap: 8,
  },
  dietChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  dietChipText: {
    fontSize: 13,
  },
  locationCard: {
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justify: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 13,
  },
  summaryCard: {
    padding: 18,
    borderWidth: 1,
    gap: 8,
    marginBottom: 24,
  },
  summaryHeader: {
    fontSize: 15,
    marginBottom: 6,
  },
  summaryItem: {
    fontSize: 13,
  },
  nextButton: {
    height: 54,
    alignItems: 'center',
    justify: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  nextButtonText: {
    fontSize: 16,
  },
});
