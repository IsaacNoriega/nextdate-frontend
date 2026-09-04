import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
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
import {
  getProfileByUserIdApi,
  Profile,
  PlaceCategory,
  PriceRange,
} from '../../services/profileService';
import { SharedExperienceItem, FeedCategory } from '../../mocks/community.mock';
import { PlusIcon } from '../../components/ui/icons';

// Componentes reutilizables
import ExploreHeader from '../../components/explore/explore-header';
import ExplorePreferencesBar from '../../components/explore/explore-preferences-bar';
import ExploreSkeleton from '../../components/explore/explore-skeleton';
import ExploreEmptyState from '../../components/explore/explore-empty-state';
import CommunityCard from '../../components/community/community-card';
import ExperienceDetailModal from '../../components/community/experience-detail-modal';
import ShareExperienceModal, {
  CreateExperiencePayload,
} from '../../components/community/share-experience-modal';

const CATEGORY_NAMES: Record<PlaceCategory, string> = {
  FOOD_DRINK: 'Gastronomía',
  CULTURE: 'Cultura & Arte',
  NATURE: 'Naturaleza',
  ENTERTAINMENT: 'Entretenimiento',
  SHOPPING: 'Compras',
  SPORTS: 'Deportes',
  OTHER: 'Otros',
};

const PRICE_RANGE_TO_SYMBOL: Record<PriceRange, string> = {
  CHEAP: '$',
  MODERATE: '$$',
  EXPENSIVE: '$$$',
  LUXURY: '$$$$',
};

const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  CHEAP: '$ Económico',
  MODERATE: '$$ Moderado',
  EXPENSIVE: '$$$ Exclusivo',
  LUXURY: '$$$$ Lujo',
};

export default function ExploreScreen() {
  const { colors, borderRadius, isDark } = useTheme();
  const { user } = useAuth();
  const userLoc = useUserLocation();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<SharedExperienceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isFilteredByProfile, setIsFilteredByProfile] = useState<boolean>(true);

  // Estados de interacción
  const [likesMap, setLikesMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);

  // Modal de detalle de experiencia seleccionada
  const [selectedPost, setSelectedPost] = useState<SharedExperienceItem | null>(null);

  // Carga de datos reales desde el backend
  const loadFeed = useCallback(async () => {
    try {
      const [apiExps, savedPlaces, userProfile] = await Promise.all([
        getSharedExperiencesApi().catch(() => []),
        storageService.getSavedPlaces().catch(() => []),
        user?.id ? getProfileByUserIdApi(user.id).catch(() => null) : Promise.resolve(null),
      ]);

      setProfile(userProfile);

      const savedIds: Record<string, boolean> = {};
      (savedPlaces || []).forEach((p: any) => {
        if (p?.id) savedIds[p.id] = true;
      });
      setSavedMap(savedIds);

      if (apiExps && apiExps.length > 0) {
        // Cargar perfiles de los autores para obtener sus fotos de perfil reales
        const authorUserIds = Array.from(
          new Set(apiExps.map((e: SharedExperience) => e.userId).filter(Boolean))
        );

        const profilesList = await Promise.all(
          authorUserIds.map((id) =>
            id === user?.id && userProfile
              ? Promise.resolve(userProfile)
              : getProfileByUserIdApi(id as string).catch(() => null)
          )
        );

        const profileMap: Record<string, Profile> = {};
        profilesList.forEach((p) => {
          if (p && p.userId) {
            profileMap[p.userId] = p;
          }
        });

        const formattedPosts: SharedExperienceItem[] = apiExps.map((exp: SharedExperience) => {
          const cost = exp.actualCost || 0;
          const budgetLabel =
            cost <= 300 ? '$' : cost <= 700 ? '$$' : cost <= 1500 ? '$$$' : '$$$$';

          // Categorización según el contenido
          let category: FeedCategory = 'GASTRO';
          const text = `${exp.title} ${exp.description || ''} ${exp.tips || ''}`.toLowerCase();
          if (
            text.includes('parque') ||
            text.includes('bosque') ||
            text.includes('aire libre') ||
            text.includes('jardín')
          ) {
            category = 'OUTDOOR';
          } else if (
            text.includes('museo') ||
            text.includes('teatro') ||
            text.includes('arte') ||
            text.includes('galería')
          ) {
            category = 'CULTURE';
          } else if (
            text.includes('cita') ||
            text.includes('romántic') ||
            text.includes('noche') ||
            text.includes('pareja')
          ) {
            category = 'ROMANTIC';
          }

          // Perfil y foto del autor que publicó la experiencia
          const authorProf = profileMap[exp.userId];
          const isCurrentUser = exp.userId === user?.id;
          const author =
            authorProf?.username ||
            (isCurrentUser ? user?.email?.split('@')[0] || 'Tú' : 'Comunidad');

          const authorAvatar =
            authorProf?.avatarUrl ||
            (isCurrentUser && userProfile?.avatarUrl ? userProfile.avatarUrl : '');

          const photoList = exp.imageUrls && exp.imageUrls.length > 0 ? exp.imageUrls : [];

          return {
            id: exp.id,
            authorName: author,
            partnerName: '',
            authorAvatar: authorAvatar,
            timeAgo: 'Reciente',
            planTitle: exp.title,
            placeName: exp.tips || exp.title,
            location: userLoc.formattedAddress || '',
            budget: budgetLabel,
            gastroTags: [
              category === 'GASTRO'
                ? 'Gastronomía'
                : category === 'ROMANTIC'
                ? 'Romántico'
                : category === 'OUTDOOR'
                ? 'Naturaleza'
                : 'Cultura',
            ],
            rating: exp.rating || 5,
            likesCount: 0,
            commentsCount: 0,
            imageUrl: photoList.length > 0 ? photoList[0] : '',
            imageUrls: photoList,
            reviewText: exp.description || '',
            category,
          };
        });

        setExperiences(formattedPosts);
      } else {
        setExperiences([]);
      }
    } catch (err) {
      console.warn('Error al cargar experiencias:', err);
      setExperiences([]);
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
        latitude: post.latitude || userLoc.lat,
        longitude: post.longitude || userLoc.lng,
      });
      setSavedMap((prev) => ({ ...prev, [post.id]: true }));
    }
  };

  const handleCreateItineraryFromPost = (post: SharedExperienceItem) => {
    setSelectedPost(null);
    const targetPlace = post.placeName || post.planTitle;
    const locationCity = userLoc.city ? ` en ${userLoc.city}` : '';
    router.push({
      pathname: '/(tabs)/generator',
      params: {
        presetPrompt: `Arma un plan de cita romántica que incluya ${targetPlace}${locationCity}.`,
      },
    });
  };

  const handleViewOnMap = (post: SharedExperienceItem) => {
    setSelectedPost(null);
    router.push('/(tabs)/map');
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
        priceRange:
          payload.budget === '$'
            ? 'CHEAP'
            : payload.budget === '$$$'
            ? 'EXPENSIVE'
            : payload.budget === '$$$$'
            ? 'LUXURY'
            : 'MODERATE',
        address: payload.location,
        latitude: payload.latitude ?? userLoc.lat,
        longitude: payload.longitude ?? userLoc.lng,
      }).catch((err) => {
        console.warn('Aviso registrando lugar en catálogo:', err);
      });

      const photoUrls =
        payload.imageUrls && payload.imageUrls.length > 0
          ? payload.imageUrls
          : payload.imageUrl
          ? [payload.imageUrl]
          : [];

      await shareExperienceApi({
        userId: user.id,
        title: payload.title,
        description: payload.reviewText,
        tips: payload.location || payload.place,
        rating: payload.rating,
        actualCost:
          payload.budget === '$'
            ? 150
            : payload.budget === '$$$'
            ? 800
            : payload.budget === '$$$$'
            ? 2000
            : 400,
        itineraryId: undefined,
        imageUrls: photoUrls,
      });

      setShowShareModal(false);
      Alert.alert('Publicado', 'Tu experiencia ha sido compartida.');
      loadFeed();
    } catch (e: any) {
      console.error('Error al compartir experiencia:', e);
      Alert.alert('Error', e.message || 'No se pudo guardar la experiencia.');
    } finally {
      setPublishing(false);
    }
  };

  // Preferencias activas del perfil del usuario
  const userInterests =
    profile?.interests && profile.interests.length > 0
      ? profile.interests
      : (['FOOD_DRINK', 'CULTURE'] as PlaceCategory[]);

  const userPriceRange = profile?.preferredPriceRange || 'MODERATE';
  const userBudgetSymbol = PRICE_RANGE_TO_SYMBOL[userPriceRange] || '$$';

  // Etiquetas para la barra informativa
  const activeInterestLabels = userInterests.map((cat) => CATEGORY_NAMES[cat] || cat);
  const activeBudgetLabel = PRICE_RANGE_LABELS[userPriceRange] || '$$ Moderado';

  // Filtrado de experiencias por perfil (activo por defecto)
  const filteredExperiences = experiences.filter((item) => {
    if (isFilteredByProfile) {
      const matchesCategory =
        (item.category === 'GASTRO' && userInterests.includes('FOOD_DRINK')) ||
        (item.category === 'CULTURE' && userInterests.includes('CULTURE')) ||
        (item.category === 'OUTDOOR' && userInterests.includes('NATURE')) ||
        (item.category === 'ROMANTIC' &&
          (userInterests.includes('ENTERTAINMENT') || userInterests.includes('OTHER'))) ||
        userInterests.length === 0;

      const matchesBudget =
        !item.budget ||
        item.budget === userBudgetSymbol ||
        (userPriceRange === 'CHEAP' && item.budget === '$') ||
        (userPriceRange === 'MODERATE' && (item.budget === '$' || item.budget === '$$')) ||
        (userPriceRange === 'EXPENSIVE' &&
          (item.budget === '$' || item.budget === '$$' || item.budget === '$$$')) ||
        userPriceRange === 'LUXURY';

      return matchesCategory && matchesBudget;
    }

    return true;
  });

  const handleEditProfile = () => {
    router.push(
      `/edit-profile?mode=interests&profileId=${profile?.id || ''}&userId=${user?.id || ''}`
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.mainWrapper}>
        {/* Header Reutilizable: Sin botón de compartir arriba */}
        <ExploreHeader
          title="Explorar Citas"
          subtitle="Inspiración para tu próxima cita"
          locationName={userLoc.formattedAddress || userLoc.city}
          isDetectingLocation={userLoc.loading}
          onLocationPress={() => userLoc.requestUserLocation()}
        />

        {/* Barra de Preferencias de Perfil Minimalista */}
        <ExplorePreferencesBar
          interestLabels={activeInterestLabels}
          budgetLabel={activeBudgetLabel}
          isFilteredByProfile={isFilteredByProfile}
          onToggleProfileFilter={() => setIsFilteredByProfile((prev) => !prev)}
          onEditProfilePress={handleEditProfile}
        />

        {/* Feed de Experiencias */}
        {loading ? (
          <ExploreSkeleton />
        ) : (
          <FlatList
            data={filteredExperiences}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={({ item }) => (
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
                onPress={() => setSelectedPost(item)}
              />
            )}
            ListEmptyComponent={() => (
              <ExploreEmptyState
                hasActiveFilters={isFilteredByProfile}
                onResetFilters={() => setIsFilteredByProfile(false)}
                onSharePress={() => setShowShareModal(true)}
              />
            )}
          />
        )}

        {/* Botón Flotante (FAB) de Compartir Cita sobre el Navbar */}
        <TouchableOpacity
          style={[
            styles.fabButton,
            {
              backgroundColor: colors.primary,
              borderRadius: borderRadius.round,
              shadowColor: isDark ? 'rgba(255,255,255,0.3)' : '#000000',
            },
          ]}
          activeOpacity={0.88}
          onPress={() => setShowShareModal(true)}
        >
          <PlusIcon size={24} color={colors.primaryContrast} strokeWidth={2.6} />
        </TouchableOpacity>

        {/* Modal de Detalle con visualización de todas las fotos */}
        <ExperienceDetailModal
          visible={!!selectedPost}
          item={selectedPost}
          isSaved={selectedPost ? !!savedMap[selectedPost.id] : false}
          onClose={() => setSelectedPost(null)}
          onPlanWithAi={handleCreateItineraryFromPost}
          onToggleSave={toggleSave}
          onViewOnMap={handleViewOnMap}
        />

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
  container: {
    flex: 1,
  },
  mainWrapper: {
    flex: 1,
    position: 'relative',
  },
  feedContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90, // Espacio extra para que el FAB no tape la última tarjeta
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 99,
  },
});
