import React, { useState, useRef, useEffect } from 'react';
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
  Platform,
  Animated,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import PlaceCard from '../../components/places/place-card';
import MapPreview from '../../components/ui/map-preview';
import StarRating from '../../components/ui/star-rating';
import { getNearbyPlacesApi } from '../../services/placeService';
import { PlaceCategory as ApiCategory } from '../../services/profileService';

type PlaceCategory = 'ALL' | 'FOOD_DRINK' | 'CULTURE' | 'NATURE' | 'ENTERTAINMENT' | 'SHOPPING' | 'SPORTS';
type PriceRange = 'ALL' | 'CHEAP' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY';

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
  { id: 'FOOD_DRINK', label: 'Gastronomía', icon: '🍷' },
  { id: 'CULTURE', label: 'Cultura', icon: '🎭' },
  { id: 'NATURE', label: 'Naturaleza', icon: '🌿' },
  { id: 'ENTERTAINMENT', label: 'Ocio', icon: '🎬' },
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
    name: 'Terraza Luna Gastro Bar',
    category: 'FOOD_DRINK',
    categoryLabel: 'Gastronomía',
    emoji: '🍷',
    address: 'Av. Chapultepec Sur 340, Colonia Americana',
    latitude: 20.6745,
    longitude: -103.3702,
    priceRange: 'MODERATE',
    priceSymbol: '$$',
    rating: 4.8,
    reviewsCount: 142,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    distance: '1.2 km',
    description: 'Ambiente íntimo con vista panorámica, especialidad en coctelería de autor y platillos para compartir.'
  },
  {
    id: '2',
    name: 'Teatro Diana & Galería',
    category: 'CULTURE',
    categoryLabel: 'Cultura',
    emoji: '🎭',
    address: 'Av. 16 de Septiembre 710, Centro',
    latitude: 20.6689,
    longitude: -103.3508,
    priceRange: 'EXPENSIVE',
    priceSymbol: '$$$',
    rating: 4.6,
    reviewsCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
    distance: '2.5 km',
    description: 'Espacio cultural icónico con cartelera de obras de teatro, conciertos acústicos y exposición de arte local.'
  },
  {
    id: '3',
    name: 'Bosque Colomos - Jardín Japonés',
    category: 'NATURE',
    categoryLabel: 'Naturaleza',
    emoji: '🌿',
    address: 'El Chaco 3200, Providencia',
    latitude: 20.7042,
    longitude: -103.3951,
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
  const { colors, typography, borderRadius, isDark } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('ALL');
  const [selectedPrice, setSelectedPrice] = useState<PriceRange>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [placesList, setPlacesList] = useState<Place[]>(MOCK_PLACES);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(false);

  useEffect(() => {
    async function loadPlaces() {
      setLoadingPlaces(true);
      try {
        const catFilter = selectedCategory !== 'ALL' ? (selectedCategory as ApiCategory) : undefined;
        const apiPlaces = await getNearbyPlacesApi(-103.3702, 20.6745, 50.0, catFilter);
        if (apiPlaces && apiPlaces.length > 0) {
          const mappedPlaces: Place[] = apiPlaces.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category as PlaceCategory,
            categoryLabel: p.category,
            emoji: '✨',
            address: p.address || 'Ubicación seleccionada',
            latitude: p.latitude,
            longitude: p.longitude,
            priceRange: p.priceRange as PriceRange,
            priceSymbol: p.priceRange === 'CHEAP' ? '$' : p.priceRange === 'MODERATE' ? '$$' : '$$$',
            rating: 4.8,
            reviewsCount: 120,
            imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
            distance: '1.5 km',
            description: p.description || 'Lugar recomendado en NextDate.'
          }));
          setPlacesList(mappedPlaces);
        } else {
          setPlacesList(MOCK_PLACES);
        }
      } catch (err) {
        setPlacesList(MOCK_PLACES);
      } finally {
        setLoadingPlaces(false);
      }
    }
    loadPlaces();
  }, [selectedCategory]);

  // Swipe gesture right-to-left to close modal
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 25 && gestureState.dx < 0;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40 || gestureState.vx < -0.4) {
          setSelectedPlace(null);
        }
      },
    })
  ).current;

  // Estado del Rating del Plan
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const openPlaceDetails = (place: Place) => {
    setSelectedPlace(place);
    setUserRating(0);
    setRatingSubmitted(false);
  };

  // Filtrado dinámico
  const filteredPlaces = placesList.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || place.category === selectedCategory;
    const matchesPrice = selectedPrice === 'ALL' || place.priceRange === selectedPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const activeFiltersCount = (selectedCategory !== 'ALL' ? 1 : 0) + (selectedPrice !== 'ALL' ? 1 : 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.mainWrapper}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Explorar
            </Text>
            <TouchableOpacity style={styles.locationRow} activeOpacity={0.8}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill={colors.primary} stroke={colors.primary} strokeWidth={0}>
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <Path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill={colors.background} />
              </Svg>
              <Text style={[styles.locationText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                Guadalajara, Jal.
              </Text>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2.5}>
                <Path d="M6 9l6 6 6-6" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar + Filter Trigger Button */}
        <View style={styles.searchContainer}>
          <View style={[
            styles.searchBox,
            {
              backgroundColor: colors.card,
              borderColor: isSearchFocused ? colors.primary : colors.border,
              borderRadius: borderRadius.md,
            }
          ]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={isSearchFocused ? colors.primary : colors.textSecondary} strokeWidth={2} style={{ marginRight: 10 }}>
              <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </Svg>
            <TextInput
              style={[styles.searchInput, { color: colors.text, fontFamily: typography.fonts.regular }]}
              placeholder="Buscar lugares, restaurantes..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <View style={[styles.clearIcon, { backgroundColor: colors.textSecondary }]}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={3}>
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            style={[
              styles.filterTriggerBtn,
              {
                backgroundColor: (selectedCategory !== 'ALL' || selectedPrice !== 'ALL') ? colors.primary : colors.card,
                borderColor: (selectedCategory !== 'ALL' || selectedPrice !== 'ALL') ? colors.primary : colors.border,
                borderRadius: borderRadius.md,
              }
            ]}
            activeOpacity={0.8}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <Svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke={(selectedCategory !== 'ALL' || selectedPrice !== 'ALL') ? colors.primaryContrast : colors.text}
              strokeWidth={2}
            >
              <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </Svg>
            {(selectedCategory !== 'ALL' || selectedPrice !== 'ALL') && (
              <View style={[styles.activeFilterDot, { backgroundColor: colors.primaryContrast }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filters Pill Bar (only visible when filters are applied) */}
        {(selectedCategory !== 'ALL' || selectedPrice !== 'ALL') ? (
          <View style={styles.activeFiltersBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
              {selectedCategory !== 'ALL' && (() => {
                const catObj = CATEGORIES.find(c => c.id === selectedCategory);
                return (
                  <TouchableOpacity
                    style={[styles.appliedFilterPill, { backgroundColor: colors.primary, borderRadius: borderRadius.round }]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedCategory('ALL')}
                  >
                    <Text style={[styles.appliedFilterPillText, { color: colors.primaryContrast, fontFamily: typography.fonts.medium }]}>
                      {catObj?.label}
                    </Text>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2.5}>
                      <Path d="M18 6L6 18M6 6l12 12" />
                    </Svg>
                  </TouchableOpacity>
                );
              })()}

              {selectedPrice !== 'ALL' && (() => {
                const prObj = PRICE_FILTERS.find(p => p.id === selectedPrice);
                return (
                  <TouchableOpacity
                    style={[styles.appliedFilterPill, { backgroundColor: colors.primary, borderRadius: borderRadius.round }]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPrice('ALL')}
                  >
                    <Text style={[styles.appliedFilterPillText, { color: colors.primaryContrast, fontFamily: typography.fonts.medium }]}>
                      Precio: {prObj?.label}
                    </Text>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2.5}>
                      <Path d="M18 6L6 18M6 6l12 12" />
                    </Svg>
                  </TouchableOpacity>
                );
              })()}

              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={() => { setSelectedCategory('ALL'); setSelectedPrice('ALL'); }}
              >
                <Text style={[styles.clearAllText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                  Limpiar todo
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : null}

        {/* Results summary bar */}
        <View style={styles.resultsSummaryBar}>
          <Text style={[styles.resultsCount, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            {filteredPlaces.length} {filteredPlaces.length === 1 ? 'lugar disponible' : 'lugares disponibles'}
          </Text>
        </View>

        {/* Places list */}
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PlaceCard
              name={item.name}
              categoryLabel={item.categoryLabel}
              priceSymbol={item.priceSymbol}
              address={item.address}
              distance={item.distance}
              rating={item.rating}
              reviewsCount={item.reviewsCount}
              imageUrl={item.imageUrl}
              onPress={() => openPlaceDetails(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                No se encontraron lugares
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                Intenta cambiar los filtros o buscar algo diferente.
              </Text>
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: colors.border, borderRadius: borderRadius.md }]}
                onPress={() => { setSelectedCategory('ALL'); setSelectedPrice('ALL'); setSearchQuery(''); }}
              >
                <Text style={[styles.resetButtonText, { color: colors.primary, fontFamily: typography.fonts.medium }]}>
                  Limpiar filtros
                </Text>
              </TouchableOpacity>
            </View>
          }
        />

      </View>

      {/* Place detail modal */}
      <Modal
        visible={!!selectedPlace}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedPlace(null)}
      >
        <SafeAreaView 
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
          {...panResponder.panHandlers}
        >
          {selectedPlace ? (
            <View style={{ flex: 1 }}>
              {/* Hero image */}
              <View style={styles.heroContainer}>
                <Image source={{ uri: selectedPlace.imageUrl }} style={styles.heroImage} />

                {/* Close button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPlace(null)}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>

                {/* Badge on image */}
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {selectedPlace.categoryLabel}
                  </Text>
                </View>
              </View>

              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                {/* Title & price */}
                <View style={styles.modalTitleRow}>
                  <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {selectedPlace.name}
                  </Text>
                  <View style={[styles.modalPriceBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.modalPriceText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      {selectedPlace.priceSymbol}
                    </Text>
                  </View>
                </View>

                {/* Meta row */}
                <View style={styles.modalMetaRow}>
                  <View style={[styles.modalMetaChip, { backgroundColor: colors.card }]}>
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="#FFD700">
                      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </Svg>
                    <Text style={[styles.modalMetaChipText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      {selectedPlace.rating}
                    </Text>
                    <Text style={[styles.modalMetaChipSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                      ({selectedPlace.reviewsCount})
                    </Text>
                  </View>
                  <View style={[styles.modalMetaChip, { backgroundColor: colors.card }]}>
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </Svg>
                    <Text style={[styles.modalMetaChipText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                      {selectedPlace.distance}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Acerca del lugar
                  </Text>
                  <Text style={[styles.descText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                    {selectedPlace.description}
                  </Text>
                </View>

                {/* Map */}
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Ubicación
                  </Text>
                  <View style={styles.addressRow}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </Svg>
                    <Text style={[styles.addressDetailText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                      {selectedPlace.address}
                    </Text>
                  </View>
                  <MapPreview
                    placeName={selectedPlace.name}
                    subtitle={`Lat: ${selectedPlace.latitude} | Long: ${selectedPlace.longitude}`}
                  />
                </View>

                {/* Rating section */}
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    Califica este lugar
                  </Text>
                  <StarRating
                    rating={userRating}
                    onRatingChange={setUserRating}
                    onSubmit={() => setRatingSubmitted(true)}
                    isSubmitted={ratingSubmitted}
                  />
                </View>

                {/* CTA */}
                <TouchableOpacity
                  style={[styles.ctaButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  activeOpacity={0.9}
                  onPress={() => setSelectedPlace(null)}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill={colors.primaryContrast}>
                    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </Svg>
                  <Text style={[styles.ctaText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                    Planear Cita Aquí
                  </Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* Categories & Price Filter Bottom Sheet Modal */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.filterModalOverlay}
          activeOpacity={1}
          onPress={() => setIsFilterModalOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.filterSheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
              }
            ]}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandleBar}>
              <View style={[styles.sheetHandlePill, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
            </View>

            {/* Header with Title and Reset Action */}
            <View style={styles.filterSheetHeader}>
              <Text style={[styles.filterSheetTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Filtros de Búsqueda
              </Text>
              {(selectedCategory !== 'ALL' || selectedPrice !== 'ALL') ? (
                <TouchableOpacity
                  onPress={() => { setSelectedCategory('ALL'); setSelectedPrice('ALL'); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resetFilterText, { color: colors.primary, fontFamily: typography.fonts.medium }]}>
                    Restablecer
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsFilterModalOpen(false)} style={styles.filterCloseBtn}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterSheetBody}>
              {/* Category Section */}
              <View style={styles.filterSectionGroup}>
                <Text style={[styles.filterGroupTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Categoría de Cita
                </Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const strokeColor = isSelected ? colors.primaryContrast : colors.text;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryGridItem,
                          {
                            backgroundColor: isSelected ? colors.primary : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderRadius: borderRadius.round,
                          }
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                        activeOpacity={0.8}
                      >
                        <View style={{ marginRight: 6 }}>
                          {cat.id === 'ALL' && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </Svg>
                          )}
                          {cat.id === 'FOOD_DRINK' && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                              <Path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
                            </Svg>
                          )}
                          {cat.id === 'CULTURE' && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                              <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
                            </Svg>
                          )}
                          {cat.id === 'NATURE' && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                              <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                              <Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                            </Svg>
                          )}
                          {cat.id === 'ENTERTAINMENT' && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                              <Path d="M19.82 2H4.18C2.97 2 2 2.97 2 4.18v15.64C2 21.03 2.97 22 4.18 22h15.64c1.21 0 2.18-.97 2.18-2.18V4.18C22 2.97 21.03 2 19.82 2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
                            </Svg>
                          )}
                          {cat.id === 'SHOPPING' && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                              <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
                            </Svg>
                          )}
                          {cat.id === 'SPORTS' && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                              <Circle cx="12" cy="12" r="10" />
                              <Path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
                            </Svg>
                          )}
                        </View>
                        <Text style={[
                          styles.categoryGridText,
                          {
                            color: isSelected ? colors.primaryContrast : colors.text,
                            fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium,
                          }
                        ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Price Range Section */}
              <View style={styles.filterSectionGroup}>
                <Text style={[styles.filterGroupTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  Rango de Presupuesto
                </Text>
                <View style={styles.priceRowGrid}>
                  {PRICE_FILTERS.map((pr) => {
                    const isSelected = selectedPrice === pr.id;
                    return (
                      <TouchableOpacity
                        key={pr.id}
                        style={[
                          styles.priceGridItem,
                          {
                            backgroundColor: isSelected ? colors.primary : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderRadius: borderRadius.md,
                          }
                        ]}
                        onPress={() => setSelectedPrice(pr.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.priceGridText,
                          {
                            color: isSelected ? colors.primaryContrast : colors.text,
                            fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium,
                          }
                        ]}>
                          {pr.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Bottom Sticky Action Footer */}
            <View style={styles.filterSheetFooter}>
              <TouchableOpacity
                style={[styles.applyFilterBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                activeOpacity={0.9}
                onPress={() => setIsFilterModalOpen(false)}
              >
                <Text style={[styles.applyFilterBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                  Ver {filteredPlaces.length} {filteredPlaces.length === 1 ? 'Lugar' : 'Lugares'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
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
    paddingTop: 8,
  },

  // Header
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    height: 46,
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
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Categories
  categoriesSection: {
    marginBottom: 14,
  },
  categoriesScroll: {
    gap: 8,
    paddingRight: 12,
    paddingVertical: 4,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 6,
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 13,
  },

  // Price filters
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  priceScroll: {
    gap: 6,
  },
  priceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  priceChipText: {
    fontSize: 12,
  },
  resultsCount: {
    fontSize: 12,
    marginLeft: 12,
  },

  activeFiltersBar: {
    marginBottom: 10,
  },
  activeFiltersScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appliedFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  appliedFilterPillText: {
    fontSize: 12,
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 12,
  },

  // List
  listContent: {
    paddingBottom: 110,
    gap: 18,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 14,
  },

  // Modal
  modalContainer: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.select({ android: 36, default: 20 }),
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  modalTitle: {
    fontSize: 24,
    lineHeight: 30,
    flex: 1,
  },
  modalPriceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalPriceText: {
    fontSize: 14,
  },
  modalMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modalMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalMetaChipText: {
    fontSize: 13,
  },
  modalMetaChipSub: {
    fontSize: 12,
  },

  // Section cards
  sectionCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  addressDetailText: {
    fontSize: 13,
    flex: 1,
  },

  // CTA
  ctaButton: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  ctaText: {
    fontSize: 16,
  },

  // Overlay Drawer Panel Styles
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalBackdrop: {
    width: '12%',
    height: '100%',
  },
  drawerPanel: {
    flex: 1,
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  // Filter Trigger Button & Summary Bar
  drawerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  filterTriggerBtn: {
    width: 48,
    height: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeFilterDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  resultsSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  clearFiltersLink: {
    fontSize: 13,
  },

  // Filter Sheet Modal Styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    width: '100%',
    maxHeight: '82%',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 16,
  },
  sheetHandleBar: {
    width: '100%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandlePill: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
  filterSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },
  filterSheetTitle: {
    fontSize: 19,
    letterSpacing: -0.3,
  },
  resetFilterText: {
    fontSize: 13,
    paddingHorizontal: 4,
  },
  filterCloseBtn: {
    padding: 6,
  },
  filterSheetBody: {
    paddingBottom: 16,
  },
  filterSectionGroup: {
    marginBottom: 20,
  },
  filterGroupTitle: {
    fontSize: 14,
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  categoryGridText: {
    fontSize: 13,
  },
  priceRowGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  priceGridItem: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  priceGridText: {
    fontSize: 14,
  },
  filterSheetFooter: {
    paddingTop: 12,
  },
  applyFilterBtn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFilterBtnText: {
    fontSize: 15,
  },
});
