import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  useWindowDimensions,
  FlatList,
  Modal,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

type PlaceCategory = 'ALL' | 'FOOD_DRINK' | 'CULTURE' | 'NATURE' | 'ENTERTAINMENT' | 'SHOPPING' | 'SPORTS';
type PriceRange = 'ALL' | 'CHEAP' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY';
type ActiveTab = 'explore' | 'map' | 'ai' | 'community' | 'profile';

interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  emoji: string;
  address: string;
  latitude: number;
  longitude: number;
  priceRange: PriceRange;
  priceSymbol: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  distance: string;
  description: string;
}

const CATEGORIES: { id: PlaceCategory; label: string; icon: string }[] = [
  { id: 'ALL', label: 'Todos', icon: '✨' },
  { id: 'FOOD_DRINK', label: 'Gastronomía & Bares', icon: '🍷' },
  { id: 'CULTURE', label: 'Cultura & Arte', icon: '🎭' },
  { id: 'NATURE', label: 'Naturaleza', icon: '🌿' },
  { id: 'ENTERTAINMENT', label: 'Entretenimiento', icon: '🎬' },
  { id: 'SHOPPING', label: 'Compras', icon: '🛍️' },
  { id: 'SPORTS', label: 'Deportes', icon: '⚽' },
];

const PRICE_FILTERS: { id: PriceRange; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'CHEAP', label: '$' },
  { id: 'MODERATE', label: '$$' },
  { id: 'EXPENSIVE', label: '$$$' },
  { id: 'LUXURY', label: '$$$$' },
];

const MOCK_PLACES: Place[] = [
  {
    id: '1',
    name: 'Terraza Luna & Bar Gastro',
    category: 'FOOD_DRINK',
    categoryLabel: 'Gastronomía & Bares',
    emoji: '🍷',
    address: 'Av. Chapultepec Norte 340, Americana',
    latitude: 20.6741,
    longitude: -103.3682,
    priceRange: 'MODERATE',
    priceSymbol: '$$',
    rating: 4.8,
    reviewsCount: 124,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    distance: '1.2 km',
    description: 'Vista panorámica de la ciudad con coctelería de autor y bocadillos artesanales para veladas románticas.'
  },
  {
    id: '2',
    name: 'Museo de Arte Moderno & Jardín',
    category: 'CULTURE',
    categoryLabel: 'Cultura & Arte',
    emoji: '🎭',
    address: 'Calle López Cotilla 1420',
    latitude: 20.6725,
    longitude: -103.3611,
    priceRange: 'CHEAP',
    priceSymbol: '$',
    rating: 4.9,
    reviewsCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&auto=format&fit=crop&q=80',
    distance: '2.5 km',
    description: 'Exposiciones de arte contemporáneo y un tranquilo jardín botánico ideal para platicar.'
  },
  {
    id: '3',
    name: 'Bosque Mirador & Picnic Spot',
    category: 'NATURE',
    categoryLabel: 'Naturaleza',
    emoji: '🌿',
    address: 'Camino al Mirador s/n',
    latitude: 20.7102,
    longitude: -103.3745,
    priceRange: 'CHEAP',
    priceSymbol: '$',
    rating: 4.7,
    reviewsCount: 210,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    distance: '4.1 km',
    description: 'Área natural protegida con vistas espectaculares al atardecer y senderos rodeados de pinos.'
  },
  {
    id: '4',
    name: 'Cine Boutique & Speakeasy',
    category: 'ENTERTAINMENT',
    categoryLabel: 'Entretenimiento',
    emoji: '🎬',
    address: 'Plaza Andares Nivel 3',
    latitude: 20.7099,
    longitude: -103.4121,
    priceRange: 'EXPENSIVE',
    priceSymbol: '$$$',
    rating: 4.9,
    reviewsCount: 312,
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    distance: '3.8 km',
    description: 'Salas VIP exclusivas con sillones reclinables y servicio gourmet a la mesa.'
  }
];

export default function ExploreScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('ALL');
  const [selectedPrice, setSelectedPrice] = useState<PriceRange>('ALL');
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Estado del Rating del Plan
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const openPlaceDetails = (place: Place) => {
    setSelectedPlace(place);
    setUserRating(0);
    setRatingSubmitted(false);
  };

  // Filtrado dinámico
  const filteredPlaces = MOCK_PLACES.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          place.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || place.category === selectedCategory;
    const matchesPrice = selectedPrice === 'ALL' || place.priceRange === selectedPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.mainWrapper}>

        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerGreeting, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
              Descubre en
            </Text>
            <TouchableOpacity style={styles.locationChip} activeOpacity={0.8}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              </Svg>
              <Text style={[styles.locationText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Guadalajara, Jal.
              </Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                <Path d="M6 9l6 6 6-6" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Buscador Search Input */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2} style={{ marginRight: 10 }}>
              <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </Svg>
            <TextInput
              style={[styles.searchInput, { color: colors.text, fontFamily: typography.fonts.regular }]}
              placeholder="Buscar restaurantes, parques, eventos..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filtro Horizontal de Categorías */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.round
                    }
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ marginRight: 6 }}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryChipText,
                    { color: isSelected ? colors.primaryContrast : colors.text, fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Filtro Horizontal de Presupuesto */}
        <View style={styles.priceFilterRow}>
          <Text style={[styles.priceFilterLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            Presupuesto:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.priceScroll}>
            {PRICE_FILTERS.map((pr) => {
              const isSelected = selectedPrice === pr.id;
              return (
                <TouchableOpacity
                  key={pr.id}
                  style={[
                    styles.priceFilterChip,
                    {
                      backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.sm
                    }
                  ]}
                  onPress={() => setSelectedPrice(pr.id)}
                >
                  <Text style={[
                    styles.priceFilterText,
                    { color: isSelected ? colors.primary : colors.textSecondary, fontFamily: isSelected ? typography.fonts.bold : typography.fonts.regular }
                  ]}>
                    {pr.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Contenido Principal: Mapa o Lista de Lugares */}
        {activeTab === 'map' ? (
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.5} style={{ marginBottom: 12 }}>
              <Path d="M1 6v13l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v13M16 6v13" />
            </Svg>
            <Text style={[styles.mapPlaceholderTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Mapa Interactivo de Guadalajara
            </Text>
            <Text style={[styles.mapPlaceholderSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
              Mostrando {filteredPlaces.length} lugares en tu zona
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredPlaces}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.placeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}
                activeOpacity={0.9}
                onPress={() => openPlaceDetails(item)}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                
                <View style={styles.cardBody}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardCategory, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                      {item.emoji} {item.categoryLabel}
                    </Text>
                    <Text style={[styles.cardPrice, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                      {item.priceSymbol}
                    </Text>
                  </View>

                  <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {item.name}
                  </Text>

                  <Text style={[styles.cardAddress, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]} numberOfLines={1}>
                    📍 {item.address} • {item.distance}
                  </Text>

                  {/* Footer con Botón Planear Cita ABAJO A LA DERECHA */}
                  <View style={styles.cardFooter}>
                    <View style={styles.ratingBadge}>
                      <Text style={{ fontSize: 13, marginRight: 4 }}>⭐</Text>
                      <Text style={[styles.ratingText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                        {item.rating}
                      </Text>
                      <Text style={[styles.reviewsText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                        ({item.reviewsCount})
                      </Text>
                    </View>

                    <TouchableOpacity 
                      style={[styles.planButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                      onPress={() => openPlaceDetails(item)}
                    >
                      <Text style={[styles.planButtonText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                        Planear Cita
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

      </View>

      {/* FLOATING PILL BOTTOM BAR — CON OPCIONES PROPIAS DE NEXTDATE */}
      <View style={styles.floatingPillWrapper}>
        <View style={styles.floatingPillBar}>
          
          {/* TAB 1: Explorar */}
          <TouchableOpacity 
            style={[styles.pillTabItem, activeTab === 'explore' && styles.activePillCapsule]} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('explore')}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
              <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </Svg>
            <Text style={[styles.pillTabText, activeTab === 'explore' && styles.activePillText]}>
              Explorar
            </Text>
          </TouchableOpacity>

          {/* TAB 2: Mapa */}
          <TouchableOpacity 
            style={[styles.pillTabItem, activeTab === 'map' && styles.activePillCapsule]} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('map')}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
              <Path d="M1 6v13l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v13M16 6v13" />
            </Svg>
            <Text style={[styles.pillTabText, activeTab === 'map' && styles.activePillText]}>
              Mapa
            </Text>
          </TouchableOpacity>

          {/* TAB 3: NextDate AI */}
          <TouchableOpacity 
            style={[styles.pillTabItem, activeTab === 'ai' && styles.activePillCapsule]} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('ai')}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
              <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </Svg>
            <Text style={[styles.pillTabText, activeTab === 'ai' && styles.activePillText]}>
              AI Citas
            </Text>
          </TouchableOpacity>

          {/* TAB 4: Comunidad */}
          <TouchableOpacity 
            style={[styles.pillTabItem, activeTab === 'community' && styles.activePillCapsule]} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('community')}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
              <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <Circle cx="9" cy="7" r="4" />
            </Svg>
            <Text style={[styles.pillTabText, activeTab === 'community' && styles.activePillText]}>
              Comunidad
            </Text>
          </TouchableOpacity>

          {/* TAB 5: Perfil */}
          <TouchableOpacity 
            style={[styles.pillTabItem, activeTab === 'profile' && styles.activePillCapsule]} 
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab('profile');
              router.push('/(onboarding)/setup-profile');
            }}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
              <Circle cx="12" cy="7" r="4" />
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            </Svg>
            <Text style={[styles.pillTabText, activeTab === 'profile' && styles.activePillText]}>
              Perfil
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* PANTALLA COMPLETA NATIVA CON BOTÓN "X", MAPA Y CALIFICADOR DE PLAN (RATE) */}
      <Modal
        visible={!!selectedPlace}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedPlace(null)}
      >
        <SafeAreaView style={[styles.fullScreenContainer, { backgroundColor: colors.background }]}>
          {selectedPlace ? (
            <View style={{ flex: 1 }}>
              {/* Image & Header Overlays */}
              <View style={styles.fullScreenImageContainer}>
                <Image source={{ uri: selectedPlace.imageUrl }} style={styles.fullScreenImage} />
                
                {/* Botón X de Cierre Prominente */}
                <TouchableOpacity 
                  style={styles.closeIconButton}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPlace(null)}
                >
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Contenido de la Pantalla */}
              <ScrollView style={styles.fullScreenScroll} contentContainerStyle={styles.fullScreenScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.fullScreenHeaderRow}>
                  <Text style={[styles.fullScreenCategory, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                    {selectedPlace.emoji} {selectedPlace.categoryLabel}
                  </Text>
                  <Text style={[styles.fullScreenPrice, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                    {selectedPlace.priceSymbol}
                  </Text>
                </View>

                <Text style={[styles.fullScreenTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {selectedPlace.name}
                </Text>

                <View style={styles.fullScreenMetaRow}>
                  <Text style={{ fontSize: 14, marginRight: 4 }}>⭐</Text>
                  <Text style={[styles.fullScreenMetaText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {selectedPlace.rating} ({selectedPlace.reviewsCount} reseñas)
                  </Text>
                  <Text style={[styles.fullScreenDot, { color: colors.textSecondary }]}>•</Text>
                  <Text style={[styles.fullScreenMetaText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    {selectedPlace.distance} de ti
                  </Text>
                </View>

                <Text style={[styles.fullScreenSectionHeader, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Acerca del Lugar
                </Text>
                <Text style={[styles.fullScreenDesc, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {selectedPlace.description}
                </Text>

                {/* SECCIÓN DE CALIFICACIÓN DE PLAN (RATE THE PLAN) */}
                <Text style={[styles.fullScreenSectionHeader, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 24 }]}>
                  Califica este Lugar / Plan
                </Text>
                <View style={[styles.ratingCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <Text style={[styles.ratingCardTitle, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    ¿Qué te pareció la experiencia para una cita?
                  </Text>
                  
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        activeOpacity={0.7}
                        onPress={() => setUserRating(star)}
                        style={styles.starBtn}
                      >
                        <Text style={[styles.starEmoji, { opacity: star <= userRating ? 1 : 0.3 }]}>
                          ⭐
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {userRating > 0 ? (
                    <View style={styles.ratingFeedbackBox}>
                      <Text style={[styles.ratingFeedbackText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                        {userRating === 5 ? '¡Excelente plan de cita! 🌟' : userRating >= 4 ? '¡Muy recomendado! 👍' : 'Buena opción 😊'}
                      </Text>
                      
                      {!ratingSubmitted ? (
                        <TouchableOpacity
                          style={[styles.submitRatingBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                          onPress={() => setRatingSubmitted(true)}
                        >
                          <Text style={[styles.submitRatingText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                            Enviar Calificación
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.ratingSuccessBox}>
                          <Text style={[styles.ratingSuccessText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                            ¡Gracias por calificar este plan! 🙌
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>

                {/* SECCIÓN DEL MAPA DE UBICACIÓN INTERACTIVO */}
                <Text style={[styles.fullScreenSectionHeader, { color: colors.text, fontFamily: typography.fonts.bold, marginTop: 24 }]}>
                  Ubicación en el Mapa
                </Text>
                <Text style={[styles.fullScreenAddressText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  📍 {selectedPlace.address}
                </Text>

                <View style={[styles.interactiveMapCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                  <View style={[styles.mapGridBackground, { backgroundColor: colors.primary + '08' }]}>
                    <View style={[styles.locationPinBox, { backgroundColor: colors.primary }]}>
                      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2}>
                        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </Svg>
                    </View>
                    <Text style={[styles.mapCoordsText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      {selectedPlace.name}
                    </Text>
                    <Text style={[styles.mapSubCoords, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                      Lat: {selectedPlace.latitude} | Long: {selectedPlace.longitude}
                    </Text>
                  </View>
                </View>

                {/* Botón de Acción Principal */}
                <TouchableOpacity 
                  style={[styles.fullScreenActionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedPlace(null);
                  }}
                >
                  <Text style={[styles.fullScreenActionText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    Planear Cita en {selectedPlace.name} ✨
                  </Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerGreeting: {
    fontSize: 12,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    height: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  categoriesSection: {
    marginBottom: 14,
  },
  categoriesScroll: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 13,
  },
  priceFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceFilterLabel: {
    fontSize: 13,
    marginRight: 10,
  },
  priceScroll: {
    gap: 6,
  },
  priceFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  priceFilterText: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 110,
    gap: 16,
  },
  placeCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardBody: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardCategory: {
    fontSize: 12,
  },
  cardPrice: {
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 13,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
  },
  reviewsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  planButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 'auto',
    alignSelf: 'flex-end',
  },
  planButtonText: {
    fontSize: 13,
  },
  mapPlaceholder: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justify: 'center',
    padding: 24,
    marginBottom: 100,
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  mapPlaceholderSub: {
    fontSize: 13,
  },

  /* ESTILOS FLOTANTES DE LA PILL BOTTOM BAR NATIVOS DE NEXTDATE */
  floatingPillWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
    justify: 'center',
  },
  floatingPillBar: {
    height: 68,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E1E22',
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#2A2A30',
  },
  pillTabItem: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 24,
  },
  activePillCapsule: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  pillTabText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 3,
    textAlign: 'center',
    width: '100%',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  fullScreenContainer: {
    flex: 1,
  },
  fullScreenImageContainer: {
    position: 'relative',
    width: '100%',
    height: 260,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeIconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justify: 'center',
    zIndex: 10,
  },
  fullScreenScroll: {
    flex: 1,
  },
  fullScreenScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fullScreenHeaderRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fullScreenCategory: {
    fontSize: 14,
  },
  fullScreenPrice: {
    fontSize: 16,
  },
  fullScreenTitle: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 8,
  },
  fullScreenMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fullScreenMetaText: {
    fontSize: 14,
  },
  fullScreenDot: {
    marginHorizontal: 8,
  },
  fullScreenSectionHeader: {
    fontSize: 18,
    marginBottom: 8,
  },
  fullScreenDesc: {
    fontSize: 15,
    lineHeight: 24,
  },
  ratingCard: {
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
  },
  ratingCardTitle: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starBtn: {
    padding: 4,
  },
  starEmoji: {
    fontSize: 32,
  },
  ratingFeedbackBox: {
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
  },
  ratingFeedbackText: {
    fontSize: 14,
    marginBottom: 12,
  },
  submitRatingBtn: {
    height: 42,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
  },
  submitRatingText: {
    fontSize: 13,
  },
  ratingSuccessBox: {
    paddingVertical: 6,
  },
  ratingSuccessText: {
    fontSize: 13,
  },
  fullScreenAddressText: {
    fontSize: 14,
    marginBottom: 12,
  },
  interactiveMapCard: {
    width: '100%',
    height: 180,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 28,
  },
  mapGridBackground: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
    padding: 16,
  },
  locationPinBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justify: 'center',
    marginBottom: 8,
  },
  mapCoordsText: {
    fontSize: 15,
    marginBottom: 2,
  },
  mapSubCoords: {
    fontSize: 12,
  },
  fullScreenActionBtn: {
    height: 54,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
  },
  fullScreenActionText: {
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
});
