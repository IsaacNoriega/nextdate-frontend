import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  FlatList,
  Modal,
  SafeAreaView as RNSafeAreaView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import BottomBar from '../components/ui/bottom-bar';

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
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>('ALL');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState(false);

  // Formulario para compartir nueva experiencia
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
      
      {/* Header de la Comunidad */}
      <View style={styles.mainWrapper}>
        
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerSub, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
              EXPERIENCIAS REALES
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              Comunidad NextDate
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.shareBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.round }]}
            activeOpacity={0.88}
            onPress={() => setShowShareModal(true)}
          >
            <Text style={[styles.shareBtnText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
              + Publicar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtro Horizontal de Categorías */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {FEED_CATEGORIES.map((cat) => {
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
                  <Text style={{ marginRight: 4, fontSize: 12 }}>{cat.icon}</Text>
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

        {/* FEED DE EXPERIENCIAS */}
        <FlatList
          data={filteredExperiences}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedScroll}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isLiked = !!likedPosts[item.id];
            const isSaved = !!savedPosts[item.id];

            return (
              <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                
                {/* Header de la Publicación (Avatar & Nombres) */}
                <View style={styles.postHeader}>
                  <Image source={{ uri: item.authorAvatar }} style={styles.avatarImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.authorName, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      {item.authorName} & {item.partnerName} 💕
                    </Text>
                    <Text style={[styles.postTime, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                      {item.timeAgo}
                    </Text>
                  </View>

                  <View style={styles.ratingBadge}>
                    <Text style={{ fontSize: 12, marginRight: 2 }}>⭐</Text>
                    <Text style={[styles.ratingNumber, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                      {item.rating}
                    </Text>
                  </View>
                </View>

                {/* Título de la Cita */}
                <Text style={[styles.planTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {item.planTitle}
                </Text>

                {/* Tag de Lugar visitado */}
                <TouchableOpacity activeOpacity={0.8} style={styles.placeTag}>
                  <Text style={[styles.placeTagText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                    📍 {item.placeName}
                  </Text>
                </TouchableOpacity>

                {/* Foto a pantalla completa de la cita */}
                <Image source={{ uri: item.imageUrl }} style={styles.postImage} />

                {/* Texto de Reseña */}
                <Text style={[styles.reviewText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  "{item.reviewText}"
                </Text>

                {/* Barra de Acciones Social */}
                <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                  
                  <TouchableOpacity 
                    style={styles.actionItem} 
                    activeOpacity={0.7}
                    onPress={() => toggleLike(item.id)}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill={isLiked ? '#FF3B30' : 'none'} stroke={isLiked ? '#FF3B30' : colors.textSecondary} strokeWidth={2}>
                      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </Svg>
                    <Text style={[styles.actionText, { color: isLiked ? '#FF3B30' : colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                      {item.likesCount + (isLiked ? 1 : 0)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
                      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </Svg>
                    <Text style={[styles.actionText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                      {item.commentsCount}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.savePlanPill, { backgroundColor: isSaved ? '#34C759' : colors.primary + '18' }]} 
                    activeOpacity={0.8}
                    onPress={() => toggleSave(item.id)}
                  >
                    <Text style={[styles.savePlanPillText, { color: isSaved ? '#FFFFFF' : colors.primary, fontFamily: typography.fonts.bold }]}>
                      {isSaved ? '✓ Plan Guardado' : '💾 Guardar Plan'}
                    </Text>
                  </TouchableOpacity>

                </View>

              </View>
            );
          }}
        />

      </View>

      {/* MODAL PARA PUBLICAR NUEVA EXPERIENCIA CON BOTÓN "X" A top: 36 */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowShareModal(false)}
      >
        <SafeAreaView style={[styles.modalArea, { backgroundColor: colors.background }]}>
          <View style={{ flex: 1 }}>
            
            {/* Header del Modal con X a top: 36 */}
            <View style={styles.modalTopBar}>
              <Text style={[styles.modalTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                Compartir Experiencia de Cita
              </Text>
              
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                activeOpacity={0.8}
                onPress={() => setShowShareModal(false)}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                  <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                Título de tu Cita
              </Text>
              <TextInput
                style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                placeholder="Ej. Aniversario sorpresa en la terraza..."
                placeholderTextColor={colors.textSecondary}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium, marginTop: 14 }]}>
                Lugar Visitado
              </Text>
              <TextInput
                style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                placeholder="Ej. Terraza Luna Gastro Bar"
                placeholderTextColor={colors.textSecondary}
                value={newPlace}
                onChangeText={setNewPlace}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium, marginTop: 14 }]}>
                Tu Reseña / Historia
              </Text>
              <TextInput
                style={[styles.inputField, styles.textAreaField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, fontFamily: typography.fonts.regular }]}
                placeholder="Cuéntanos qué fue lo que más les gustó del lugar y qué les recomiendas a otras parejas..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={newReview}
                onChangeText={setNewReview}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: typography.fonts.medium, marginTop: 14 }]}>
                Califica tu experiencia
              </Text>
              <View style={styles.starsSelectRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setNewRating(star)}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 30, opacity: star <= newRating ? 1 : 0.25 }}>
                      ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Botón de Publicación */}
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
                  Publicar en la Comunidad ✨
                </Text>
              </TouchableOpacity>

            </ScrollView>

          </View>
        </SafeAreaView>
      </Modal>

      {/* FLOATING PILL BOTTOM BAR REUTILIZABLE */}
      <BottomBar activeTab="community" />

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
  headerRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerSub: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
  },
  shareBtn: {
    paddingHorizontal: 16,
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
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 12,
  },
  feedScroll: {
    paddingBottom: 110,
    gap: 18,
  },
  postCard: {
    padding: 16,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    fontSize: 14,
  },
  postTime: {
    fontSize: 11,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 13,
  },
  planTitleText: {
    fontSize: 17,
    marginBottom: 4,
  },
  placeTag: {
    marginBottom: 12,
  },
  placeTagText: {
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
  },
  savePlanPill: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  savePlanPillText: {
    fontSize: 12,
  },

  /* MODAL */
  modalArea: {
    flex: 1,
  },
  modalTopBar: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  modalTitleText: {
    fontSize: 18,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justify: 'center',
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
  starsSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 24,
  },
  publishBtn: {
    height: 52,
    width: '100%',
    alignItems: 'center',
    justify: 'center',
  },
  publishBtnText: {
    fontSize: 15,
  },
});
