import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import CommunityCard from '../../components/community/community-card';
import StarRating from '../../components/ui/star-rating';

type FeedCategory = 'ALL' | 'ROMANTIC' | 'OUTDOOR' | 'GASTRO' | 'CULTURE';

interface SharedExperience {
  id: string;
  authorName: string;
  partnerName: string;
  authorAvatar: string;
  timeAgo: string;
  planTitle: string;
  placeName: string;
  rating: number;
  likesCount: number;
  commentsCount: number;
  imageUrl: string;
  reviewText: string;
  category: FeedCategory;
}

const FEED_CATEGORIES: { id: FeedCategory; label: string; icon: string }[] = [
  { id: 'ALL', label: 'Todas', icon: '✨' },
  { id: 'ROMANTIC', label: 'Románticas', icon: '🍷' },
  { id: 'OUTDOOR', label: 'Naturaleza', icon: '🌿' },
  { id: 'GASTRO', label: 'Gastronomía', icon: '🍝' },
  { id: 'CULTURE', label: 'Cultura', icon: '🎭' },
];

const MOCK_EXPERIENCES: SharedExperience[] = [
  {
    id: 'exp-1',
    authorName: 'Isaac',
    partnerName: 'Valeria',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timeAgo: 'Hace 2 horas',
    planTitle: 'Atardecer inolvidable & Cócteles',
    placeName: 'Terraza Luna Gastro Bar',
    rating: 5.0,
    likesCount: 42,
    commentsCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    reviewText: 'Celebramos nuestro aniversario aquí. Los cócteles de autor de la casa son 10/10 y la vista del atardecer con velitas en la mesa es insuperable. ¡Totalmente recomendado!',
    category: 'ROMANTIC'
  },
  {
    id: 'exp-2',
    authorName: 'Carlos',
    partnerName: 'Sofia',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timeAgo: 'Hace 5 horas',
    planTitle: 'Noche Italiana & Jazz en vivo',
    placeName: 'Trattoria Barrio Americana',
    rating: 4.9,
    likesCount: 29,
    commentsCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    reviewText: 'Primera cita usando el itinerario sugerido por la IA de NextDate. ¡Superó las expectativas! Pasta fresca deliciosa y música en vivo muy romántica.',
    category: 'GASTRO'
  },
  {
    id: 'exp-3',
    authorName: 'Andrea',
    partnerName: 'Mateo',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    timeAgo: 'Ayer',
    planTitle: 'Picnic al Atardecer & Gelato',
    placeName: 'Bosque Mirador & Jardín',
    rating: 4.8,
    likesCount: 64,
    commentsCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    reviewText: 'Llevamos una manta, compró helado artesanal y vimos la puesta de sol desde la cima. Un plan súper romántico y de bajo presupuesto.',
    category: 'OUTDOOR'
  }
];

export default function CommunityScreen() {
  const { colors, typography, borderRadius } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>('ALL');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredExperiences = MOCK_EXPERIENCES.filter((exp) => {
    return selectedCategory === 'ALL' || exp.category === selectedCategory;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.mainWrapper}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Comunidad
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
              Experiencia e historias reales de parejas
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.shareBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.round }]}
            activeOpacity={0.88}
            onPress={() => setShowShareModal(true)}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2.5}>
              <Path d="M12 5v14M5 12h14" />
            </Svg>
            <Text style={[styles.shareBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
              Publicar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtro Horizontal de Categorías */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {FEED_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const strokeColor = isSelected ? colors.primaryContrast : colors.text;
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
                  <View style={{ marginRight: 6 }}>
                    {cat.id === 'ALL' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </Svg>
                    )}
                    {cat.id === 'ROMANTIC' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </Svg>
                    )}
                    {cat.id === 'OUTDOOR' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                        <Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                      </Svg>
                    )}
                    {cat.id === 'GASTRO' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
                      </Svg>
                    )}
                    {cat.id === 'CULTURE' && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                        <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
                      </Svg>
                    )}
                  </View>
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

        {/* Feed */}
        <FlatList
          data={filteredExperiences}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedScroll}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isLiked = !!likedPosts[item.id];
            const isSaved = !!savedPosts[item.id];

            return (
              <CommunityCard
                authorName={item.authorName}
                partnerName={item.partnerName}
                authorAvatar={item.authorAvatar}
                timeAgo={item.timeAgo}
                planTitle={item.planTitle}
                placeName={item.placeName}
                rating={item.rating}
                likesCount={item.likesCount}
                commentsCount={item.commentsCount}
                imageUrl={item.imageUrl}
                reviewText={item.reviewText}
                isLiked={isLiked}
                isSaved={isSaved}
                onToggleLike={() => toggleLike(item.id)}
                onToggleSave={() => toggleSave(item.id)}
              />
            );
          }}
        />

      </View>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowShareModal(false)}
      >
        <SafeAreaView style={[styles.modalArea, { backgroundColor: colors.background }]}>
          <View style={{ flex: 1 }}>
            
            {/* Header */}
            <View style={styles.modalTopBar}>
              <Text style={[styles.modalTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Compartir cita
              </Text>
              
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                activeOpacity={0.8}
                onPress={() => setShowShareModal(false)}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                  <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                Título de tu cita
              </Text>
              <TextInput
                style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                placeholder="Ej. Aniversario sorpresa en la terraza..."
                placeholderTextColor={colors.textSecondary}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium, marginTop: 14 }]}>
                Lugar visitado
              </Text>
              <TextInput
                style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                placeholder="Ej. Terraza Luna Gastro Bar"
                placeholderTextColor={colors.textSecondary}
                value={newPlace}
                onChangeText={setNewPlace}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium, marginTop: 14 }]}>
                Tu reseña o historia
              </Text>
              <TextInput
                style={[styles.inputField, styles.textAreaField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                placeholder="Cuéntanos qué fue lo que más les gustó y qué recomiendan a otras parejas..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={newReview}
                onChangeText={setNewReview}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium, marginTop: 14 }]}>
                Calificación
              </Text>
              <View style={[styles.starRatingWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                <StarRating
                  rating={newRating}
                  onRatingChange={setNewRating}
                />
              </View>

              {/* Publish CTA */}
              <TouchableOpacity 
                style={[styles.publishBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
                activeOpacity={0.9}
                onPress={() => {
                  setShowShareModal(false);
                  setNewTitle('');
                  setNewPlace('');
                  setNewReview('');
                }}
              >
                <Text style={[styles.publishBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
                  Publicar experiencia
                </Text>
              </TouchableOpacity>

            </ScrollView>

          </View>
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
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
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
  categoryChipText: {
    fontSize: 13,
  },
  feedScroll: {
    paddingBottom: 110,
    gap: 18,
  },

  /* MODAL */
  modalArea: {
    flex: 1,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 14,
    marginTop: 8,
  },
  modalTitleText: {
    fontSize: 20,
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  inputField: {
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
  },
  textAreaField: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  starRatingWrap: {
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  publishBtn: {
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnText: {
    fontSize: 15,
  },
});
