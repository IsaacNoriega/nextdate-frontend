import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../hooks/useUserLocation';
import { storageService } from '../../services/storage';
import {
  getSharedExperiencesApi,
  shareExperienceApi,
  SharedExperience,
} from '../../services/communityService';
import { createPlaceApi } from '../../services/placeService';
import CommunityCard from '../../components/community/community-card';
import ShareExperienceModal, {
  CreateExperiencePayload,
} from '../../components/community/share-experience-modal';
import {
  INITIAL_COMMUNITY_POSTS,
  SharedExperienceItem,
  FEED_CATEGORIES,
  FeedCategory,
  BUDGET_OPTIONS,
} from '../../mocks/community.mock';

export default function ExploreScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const { user } = useAuth();
  const userLoc = useUserLocation();
  const router = useRouter();

  const [experiences, setExperiences] = useState<SharedExperienceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>('ALL');
  const [selectedBudget, setSelectedBudget] = useState<string>('ALL');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Estados de interacción
  const [likesMap, setLikesMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);

  // Modal de opciones para armar plan con IA
  const [selectedPost, setSelectedPost] = useState<SharedExperienceItem | null>(null);

  // Cargar experiencias comunitarias y combinarlas con mocks
  const loadFeed = useCallback(async () => {
    try {
      const apiExps = await getSharedExperiencesApi();
      const savedPlaces = await storageService.getSavedPlaces();
      const savedIds: Record<string, boolean> = {};
      (savedPlaces || []).forEach((p: any) => {
        if (p.id) savedIds[p.id] = true;
      });
      setSavedMap(savedIds);

      if (apiExps && apiExps.length > 0) {
        const formattedApiPosts: SharedExperienceItem[] = apiExps.map((exp: SharedExperience) => {
          // Extraer presupuesto estimado
          const cost = exp.actualCost || 0;
          const budgetLabel =
            cost <= 300 ? '$' : cost <= 700 ? '$$' : cost <= 1500 ? '$$$' : '$$$$';

          // Asignar categoría basada en título o contenido
          let category: FeedCategory = 'GASTRO';
          const text = `${exp.title} ${exp.description || ''} ${exp.tips || ''}`.toLowerCase();
          if (text.includes('parque') || text.includes('bosque') || text.includes('aire libre')) {
            category = 'OUTDOOR';
          } else if (text.includes('museo') || text.includes('teatro') || text.includes('arte')) {
            category = 'CULTURE';
          } else if (text.includes('cita') || text.includes('romántic') || text.includes('noche')) {
            category = 'ROMANTIC';
          }

          return {
            id: exp.id,
            authorName: exp.userId === user?.id ? (user?.email?.split('@')[0] || 'Tú') : 'Pareja NextDate',
            partnerName: '',
            authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              exp.title || 'NextDate'
            )}&background=E11D48&color=fff`,
            timeAgo: 'Reciente',
            planTitle: exp.title,
            placeName: exp.tips || exp.title || 'Lugar Recomendado',
            location: userLoc.formattedAddress || 'Guadalajara, Jalisco',
            budget: budgetLabel,
            gastroTags: [category === 'GASTRO' ? 'Gastronomía' : category === 'ROMANTIC' ? 'Romántico' : 'Experiencia'],
            rating: exp.rating || 5,
            likesCount: 12,
            commentsCount: 2,
            imageUrl:
              exp.imageUrls && exp.imageUrls.length > 0
                ? exp.imageUrls[0]
                : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
            reviewText: exp.description || '¡Una experiencia inolvidable para compartir en pareja!',
            category,
          };
        });

        // Combinar con los posts de demostración locales
        setExperiences([...formattedApiPosts, ...INITIAL_COMMUNITY_POSTS]);
      } else {
        setExperiences(INITIAL_COMMUNITY_POSTS);
      }
    } catch (err) {
      console.warn('Cargando posts locales de la comunidad:', err);
      setExperiences(INITIAL_COMMUNITY_POSTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, user?.email, userLoc.formattedAddress]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const toggleLike = (postId: string) => {
    setLikesMap((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleSave = async (post: SharedExperienceItem) => {
    const isAlreadySaved = savedMap[post.id];
    if (isAlreadySaved) {
      await storageService.removeSavedPlace(post.id);
      setSavedMap((prev) => ({ ...prev, [post.id]: false }));
    } else {
      await storageService.savePlace({
        id: post.id,
        name: post.placeName || post.planTitle,
        category: post.category,
        address: post.location || userLoc.formattedAddress,
        imageUrl: post.imageUrl,
        rating: post.rating,
        priceRange: post.budget || '$$',
        description: post.reviewText,
      });
      setSavedMap((prev) => ({ ...prev, [post.id]: true }));
    }
  };

  const handleCreateItineraryFromPost = (post: SharedExperienceItem) => {
    // Redirigir al Generador de IA con el prompt sugerido
    setSelectedPost(null);
    router.push({
      pathname: '/(tabs)/generator',
      params: {
        presetPrompt: `Arma un plan de cita romántica que incluya ${post.placeName || post.planTitle} en ${userLoc.city || 'la ciudad'}.`,
      },
    });
  };

  const handleUploadSubmit = async (payload: CreateExperiencePayload) => {
    if (!user?.id) {
      Alert.alert('Acceso requerido', 'Inicia sesión para compartir una experiencia.');
      return;
    }
    setPublishing(true);
    try {
      const placeName = payload.place || payload.title;

      await createPlaceApi({
        name: placeName,
        description: payload.reviewText || `Lugar compartido: ${placeName}`,
        category: payload.selectedGastro.length > 0 ? 'FOOD_DRINK' : 'ENTERTAINMENT',
        priceRange: payload.budget === '$' ? 'CHEAP' : payload.budget === '$$$' ? 'EXPENSIVE' : payload.budget === '$$$$' ? 'LUXURY' : 'MODERATE',
        address: payload.location,
        latitude: payload.latitude ?? userLoc.lat,
        longitude: payload.longitude ?? userLoc.lng,
      }).catch((err) => {
        console.warn('Aviso registrando lugar en catálogo:', err);
      });

      await shareExperienceApi({
        userId: user.id,
        title: payload.title,
        description: payload.reviewText,
        tips: payload.location || payload.place,
        rating: payload.rating,
        actualCost: payload.budget === '$' ? 150 : payload.budget === '$$$' ? 800 : payload.budget === '$$$$' ? 2000 : 400,
        itineraryId: undefined,
        imageUrls: payload.imageUrl ? [payload.imageUrl] : [],
      });

      setShowShareModal(false);
      Alert.alert('¡Publicado!', 'Tu experiencia ha sido compartida y ya aparece en el feed.');
      loadFeed();
    } catch (e: any) {
      console.error('Error al compartir experiencia:', e);
      Alert.alert('Error', e.message || 'No se pudo guardar la experiencia.');
    } finally {
      setPublishing(false);
    }
  };

  // Filtrado de experiencias por categoría, presupuesto y búsqueda
  const filteredExperiences = experiences.filter((item) => {
    const matchesSearch =
      item.planTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.placeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesBudget = selectedBudget === 'ALL' || item.budget === selectedBudget;

    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.mainWrapper}>
        
        {/* Header Superior */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Explorar Citas
            </Text>
            <TouchableOpacity 
              style={styles.locationRow} 
              activeOpacity={0.8}
              onPress={() => userLoc.requestUserLocation()}
            >
              <Svg width={13} height={13} viewBox="0 0 24 24" fill={colors.primary}>
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <Path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill={colors.background} />
              </Svg>
              <Text style={[styles.locationText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]} numberOfLines={1}>
                {userLoc.loading ? 'Detectando...' : userLoc.formattedAddress || 'Tu Ciudad'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón Publicar en Header */}
          <TouchableOpacity
            style={[styles.headerShareBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.round }]}
            activeOpacity={0.85}
            onPress={() => setShowShareModal(true)}
          >
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
              <Path d="M12 5v14M5 12h14" />
            </Svg>
            <Text style={[styles.headerShareBtnText, { fontFamily: typography.fonts.bold }]}>
              Compartir
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barra de Búsqueda */}
        <View style={styles.searchBarContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.card,
                borderColor: isSearchFocused ? colors.primary : colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={isSearchFocused ? colors.primary : colors.textSecondary} strokeWidth={2} style={{ marginRight: 8 }}>
              <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </Svg>
            <TextInput
              style={[styles.searchInput, { color: colors.text, fontFamily: typography.fonts.regular }]}
              placeholder={`Buscar planes o lugares en ${userLoc.city || 'tu ciudad'}...`}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                  <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtros de Categorías */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {FEED_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.round,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
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

          {/* Filtros de Presupuesto */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoryScroll, { paddingTop: 4 }]}>
            <TouchableOpacity
              style={[
                styles.budgetChip,
                {
                  backgroundColor: selectedBudget === 'ALL' ? colors.primary + '18' : 'transparent',
                  borderColor: selectedBudget === 'ALL' ? colors.primary : colors.border,
                  borderRadius: borderRadius.sm,
                },
              ]}
              onPress={() => setSelectedBudget('ALL')}
            >
              <Text style={[styles.budgetChipText, { color: selectedBudget === 'ALL' ? colors.primary : colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                Todos los precios
              </Text>
            </TouchableOpacity>

            {BUDGET_OPTIONS.map((opt) => {
              const isSelected = selectedBudget === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.budgetChip,
                    {
                      backgroundColor: isSelected ? colors.primary + '18' : 'transparent',
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.sm,
                    },
                  ]}
                  onPress={() => setSelectedBudget(isSelected ? 'ALL' : opt.id)}
                >
                  <Text style={[styles.budgetChipText, { color: isSelected ? colors.primary : colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                    {opt.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Feed de Publicaciones Comunitarias */}
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
              Cargando experiencias en tu ciudad...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredExperiences}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.96}
                onPress={() => setSelectedPost(item)}
              >
                <CommunityCard
                  authorName={item.authorName}
                  partnerName={item.partnerName}
                  authorAvatar={item.authorAvatar}
                  timeAgo={item.timeAgo}
                  planTitle={item.planTitle}
                  placeName={item.placeName}
                  budget={item.budget}
                  gastroTags={item.gastroTags}
                  rating={item.rating}
                  likesCount={item.likesCount}
                  commentsCount={item.commentsCount}
                  imageUrl={item.imageUrl}
                  reviewText={item.reviewText}
                  isLiked={!!likesMap[item.id]}
                  isSaved={!!savedMap[item.id]}
                  onToggleLike={() => toggleLike(item.id)}
                  onToggleSave={() => toggleSave(item)}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyFeed}>
                <Svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={1.5} style={{ marginBottom: 12 }}>
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <Circle cx="12" cy="10" r="3" />
                </Svg>
                <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  No hay experiencias con estos filtros
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  Sé el primero en compartir un lugar o cambia de categoría.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  onPress={() => setShowShareModal(true)}
                >
                  <Text style={[styles.emptyBtnText, { fontFamily: typography.fonts.bold }]}>
                    Compartir una Cita
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Modal de Acción al tocar una Experiencia */}
        {selectedPost && (
          <Modal visible={!!selectedPost} transparent animationType="fade" onRequestClose={() => setSelectedPost(null)}>
            <TouchableOpacity style={styles.actionModalOverlay} activeOpacity={1} onPress={() => setSelectedPost(null)}>
              <View style={[styles.actionModalCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Text style={[styles.actionModalTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {selectedPost.planTitle}
                </Text>
                <Text style={[styles.actionModalSubtitle, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  📍 {selectedPost.placeName} • {selectedPost.location}
                </Text>

                <TouchableOpacity
                  style={[styles.actionModalPrimaryBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                  onPress={() => handleCreateItineraryFromPost(selectedPost)}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth={2}>
                    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </Svg>
                  <Text style={[styles.actionModalPrimaryBtnText, { fontFamily: typography.fonts.bold }]}>
                    Diseñar cita con IA en este lugar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionModalSecondaryBtn, { borderColor: colors.border, borderRadius: borderRadius.md }]}
                  onPress={() => {
                    toggleSave(selectedPost);
                    setSelectedPost(null);
                  }}
                >
                  <Text style={[styles.actionModalSecondaryBtnText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
                    {savedMap[selectedPost.id] ? 'Quitar de guardados' : 'Guardar en mis planes favoritos'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Modal para Compartir Experiencia */}
        <ShareExperienceModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          onSubmit={handleUploadSubmit}
          publishing={publishing}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainWrapper: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 12, maxWidth: 180 },
  headerShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  headerShareBtnText: { color: '#FFFFFF', fontSize: 13 },
  searchBarContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  filtersWrapper: { paddingBottom: 10 },
  categoryScroll: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  filterChipText: { fontSize: 12 },
  budgetChip: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  budgetChipText: { fontSize: 11 },
  feedContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 6 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13 },
  emptyFeed: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, textAlign: 'center', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  emptyBtn: { paddingHorizontal: 18, paddingVertical: 10 },
  emptyBtnText: { color: '#FFF', fontSize: 13 },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  actionModalCard: { width: '100%', maxWidth: 360, padding: 20, borderWidth: 1 },
  actionModalTitle: { fontSize: 17, marginBottom: 4 },
  actionModalSubtitle: { fontSize: 13, marginBottom: 18 },
  actionModalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 10,
  },
  actionModalPrimaryBtnText: { color: '#FFFFFF', fontSize: 13 },
  actionModalSecondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
  },
  actionModalSecondaryBtnText: { fontSize: 13 },
});
