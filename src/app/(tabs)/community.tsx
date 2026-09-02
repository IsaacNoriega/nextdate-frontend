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
  INITIAL_COMMUNITY_POSTS,
  DEFAULT_PRESET_IMAGES,
} from '../../mocks/community.mock';

export default function CommunityScreen() {
  const { colors, typography, borderRadius } = useTheme();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>('ALL');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [experiencesList, setExperiencesList] =
    useState<SharedExperienceItem[]>(INITIAL_COMMUNITY_POSTS);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function loadExperiences() {
      setLoading(true);
      try {
        const apiData = await getSharedExperiencesApi();
        if (apiData && apiData.length > 0) {
          const mapped: SharedExperienceItem[] = apiData.map((exp: any) => ({
            id: exp.id,
            authorName: 'Pareja NextDate',
            partnerName: 'Pareja',
            authorAvatar:
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            timeAgo: 'Hace un momento',
            planTitle: exp.title,
            placeName: exp.itinerary ? exp.itinerary.title : 'Cita Romántica',
            rating: exp.rating || 5,
            likesCount: 12,
            commentsCount: 2,
            imageUrl:
              exp.imageUrls && exp.imageUrls.length > 0
                ? exp.imageUrls[0]
                : DEFAULT_PRESET_IMAGES[0],
            reviewText:
              exp.description || exp.tips || 'Una gran experiencia en pareja.',
            category: 'ROMANTIC',
          }));
          setExperiencesList(mapped);
        }
      } catch (err) {
        // Fallback a los datos mock iniciales
      } finally {
        setLoading(false);
      }
    }
    loadExperiences();
  }, []);

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShareSubmit = async (payload: CreateExperiencePayload) => {
    setPublishing(true);
    const currentUserId = user?.id || '00000000-0000-0000-0000-000000000001';

    try {
      await shareExperienceApi({
        userId: currentUserId,
        itineraryId: '00000000-0000-0000-0000-000000000001',
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
        imageUrls: [payload.imageUrl],
      });
    } catch (err) {
      console.log('Fallo API, publicando localmente:', err);
    } finally {
      const newExp: SharedExperienceItem = {
        id: `exp-${Date.now()}`,
        authorName: 'Tú',
        partnerName: 'Pareja',
        authorAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        timeAgo: 'Ahora mismo',
        planTitle: payload.title,
        placeName: payload.place || 'Lugar recomendado',
        location: payload.location,
        budget: payload.budget,
        gastroTags: payload.selectedGastro,
        rating: payload.rating,
        likesCount: 0,
        commentsCount: 0,
        imageUrl: payload.imageUrl,
        reviewText: payload.reviewText || '¡Gran cita recomendada!',
        category: 'ROMANTIC',
      };

      setExperiencesList((prev) => [newExp, ...prev]);
      setPublishing(false);
      setShowShareModal(false);
      Alert.alert('¡Publicado!', 'Tu experiencia ha sido compartida con la comunidad.');
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
