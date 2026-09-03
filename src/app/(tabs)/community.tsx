import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import CommunityCard from '../../components/community/community-card';
import CategoryFilterBar from '../../components/community/category-filter-bar';
import ShareExperienceModal, {
  CreateExperiencePayload,
} from '../../components/community/share-experience-modal';
import {
  getSharedExperiencesApi,
  shareExperienceApi,
} from '../../services/communityService';
import {
  FeedCategory,
  SharedExperienceItem,
} from '../../mocks/community.mock';

export default function CommunityScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>('ALL');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [experiencesList, setExperiencesList] = useState<SharedExperienceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadExperiences = async () => {
    setLoading(true);
    try {
      const apiData = await getSharedExperiencesApi();
      if (apiData && Array.isArray(apiData)) {
        const mapped: SharedExperienceItem[] = apiData.map((exp: any) => {
          const dateStr = exp.createdAt
            ? new Date(exp.createdAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
              })
            : '';

          return {
            id: exp.id,
            authorName: exp.userId ? `Usuario (${exp.userId.slice(0, 4)})` : 'Comunidad',
            partnerName: '',
            authorAvatar: '',
            timeAgo: dateStr,
            planTitle: exp.title,
            placeName: exp.itinerary?.title || exp.tips || 'Cita Recomendada',
            location: exp.tips || undefined,
            rating: exp.rating || 5,
            likesCount: 0,
            commentsCount: 0,
            imageUrl:
              exp.imageUrls && exp.imageUrls.length > 0
                ? exp.imageUrls[0]
                : '',
            reviewText:
              exp.description || '',
            category: 'ALL',
            budget: exp.actualCost ? `$${exp.actualCost} MXN` : undefined,
          };
        });
        setExperiencesList(mapped);
      } else {
        setExperiencesList([]);
      }
    } catch (err) {
      console.warn('Error al cargar experiencias:', err);
      setExperiencesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShareSubmit = async (payload: CreateExperiencePayload) => {
    if (!user) {
      Alert.alert(
        'Iniciar Sesión',
        'Debes iniciar sesión con tu cuenta para poder compartir experiencias con la comunidad.'
      );
      return;
    }

    setPublishing(true);

    try {
      // Intentamos asociar con un itinerario existente del usuario si está disponible
      let itineraryIdToUse = payload.selectedItineraryId;
      
      if (!itineraryIdToUse) {
        Alert.alert(
          'Itinerario requerido',
          'Para publicar una experiencia, debes seleccionar o haber creado un itinerario primero.'
        );
        setPublishing(false);
        return;
      }

      await shareExperienceApi({
        userId: user.id,
        itineraryId: itineraryIdToUse,
        title: payload.title,
        description: payload.reviewText || undefined,
        tips: payload.location,
        actualCost:
          payload.budget === '$'
            ? 250
            : payload.budget === '$$'
            ? 500
            : payload.budget === '$$$'
            ? 1000
            : 2000,
        rating: payload.rating,
        imageUrls: payload.imageUrl ? [payload.imageUrl] : [],
      });

      setShowShareModal(false);
      Alert.alert('¡Publicado!', 'Tu experiencia ha sido compartida con éxito.');
      await loadExperiences();
    } catch (err: any) {
      console.error('Error al compartir experiencia:', err);
      Alert.alert('Error', err?.message || 'No se pudo publicar la experiencia. Intenta de nuevo.');
    } finally {
      setPublishing(false);
    }
  };

  const filteredExperiences = experiencesList.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.text, fontFamily: typography.fonts.bold },
            ]}
          >
            Comunidad
          </Text>
          <Text
            style={[
              styles.headerSub,
              {
                color: colors.textSecondary,
                fontFamily: typography.fonts.regular,
              },
            ]}
          >
            Experiencias e historias reales de parejas
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.shareBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: borderRadius.round,
            },
          ]}
          activeOpacity={0.88}
          onPress={() => setShowShareModal(true)}
        >
          <Svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primaryContrast}
            strokeWidth={2.5}
          >
            <Path d="M12 5v14M5 12h14" />
          </Svg>
          <Text
            style={[
              styles.shareBtnText,
              {
                color: colors.primaryContrast,
                fontFamily: typography.fonts.bold,
              },
            ]}
          >
            Publicar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Filtros */}
      <CategoryFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Feed de Experiencias */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredExperiences}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommunityCard
              {...item}
              isLiked={!!likedPosts[item.id]}
              isSaved={!!savedPosts[item.id]}
              onToggleLike={() => toggleLike(item.id)}
              onToggleSave={() => toggleSave(item.id)}
            />
          )}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fonts.medium,
                  },
                ]}
              >
                No hay experiencias disponibles en esta categoría.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal Modular de Publicación */}
      <ShareExperienceModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSubmit={handleShareSubmit}
        publishing={publishing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 24,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  shareBtnText: {
    fontSize: 13,
  },
  feedContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
