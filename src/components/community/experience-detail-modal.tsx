import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import {
  CloseIcon,
  MapPinIcon,
  StarIcon,
  BookmarkIcon,
  WandIcon,
  CompassIcon,
  TagIcon,
  PhotoIcon,
} from '../ui/icons';
import { SharedExperienceItem } from '../../mocks/community.mock';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExperienceDetailModalProps {
  visible: boolean;
  item: SharedExperienceItem | null;
  isSaved: boolean;
  onClose: () => void;
  onPlanWithAi: (item: SharedExperienceItem) => void;
  onToggleSave: (item: SharedExperienceItem) => void;
  onViewOnMap?: (item: SharedExperienceItem) => void;
}

export default function ExperienceDetailModal({
  visible,
  item,
  isSaved,
  onClose,
  onPlanWithAi,
  onToggleSave,
  onViewOnMap,
}: ExperienceDetailModalProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!item) return null;

  // Extraer todas las fotos disponibles
  const allImages =
    item.imageUrls && item.imageUrls.length > 0
      ? item.imageUrls
      : item.imageUrl
      ? [item.imageUrl]
      : [];

  const handleClose = () => {
    setActivePhotoIndex(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
            },
          ]}
        >
          {/* Header indicator */}
          <View style={styles.topBar}>
            <View
              style={[
                styles.dragIndicator,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  borderRadius: borderRadius.round,
                },
              ]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <CloseIcon size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Galería / Carrusel de Todas las Fotos */}
            {allImages.length > 0 && (
              <View style={styles.galleryWrapper}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const slideIndex = Math.round(
                      e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40)
                    );
                    setActivePhotoIndex(slideIndex);
                  }}
                  contentContainerStyle={{ gap: 0 }}
                >
                  {allImages.map((imgUri, idx) => (
                    <View key={idx} style={[styles.slideContainer, { width: SCREEN_WIDTH - 40 }]}>
                      <Image
                        source={{ uri: imgUri }}
                        style={[styles.bannerImage, { borderRadius: borderRadius.lg }]}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>

                {/* Badge con el contador de fotos */}
                {allImages.length > 1 && (
                  <View
                    style={[
                      styles.photoCounterBadge,
                      {
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        borderRadius: borderRadius.round,
                      },
                    ]}
                  >
                    <PhotoIcon size={11} color="#FFFFFF" />
                    <Text style={[styles.photoCounterText, { fontFamily: typography.fonts.bold }]}>
                      {activePhotoIndex + 1}/{allImages.length}
                    </Text>
                  </View>
                )}

                {/* Tiras de miniaturas rápidas si hay más de 1 foto */}
                {allImages.length > 1 && (
                  <View style={styles.thumbStrip}>
                    {allImages.map((thumbUri, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.thumbWrap,
                          {
                            borderColor: activePhotoIndex === idx ? colors.primary : 'transparent',
                            borderWidth: activePhotoIndex === idx ? 2 : 1,
                            borderRadius: borderRadius.sm,
                          },
                        ]}
                        onPress={() => setActivePhotoIndex(idx)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: thumbUri }}
                          style={[styles.thumbImage, { borderRadius: borderRadius.sm - 2 }]}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Fila del autor con foto de perfil */}
            <View style={styles.authorRow}>
              <Image
                source={{
                  uri:
                    item.authorAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      item.authorName || 'NextDate'
                    )}&background=000000&color=fff`,
                }}
                style={[styles.authorAvatar, { borderRadius: 18 }]}
              />
              <View style={styles.authorMeta}>
                <Text style={[styles.authorName, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {item.authorName}
                </Text>
                <Text style={[styles.authorTime, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {item.timeAgo || 'Reciente'}
                </Text>
              </View>

              <View
                style={[
                  styles.ratingBadge,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    borderRadius: borderRadius.sm,
                  },
                ]}
              >
                <StarIcon size={13} color="#FFD700" fill="#FFD700" />
                <Text style={[styles.badgeText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {item.rating || 5}
                </Text>
              </View>

              {item.budget && (
                <View
                  style={[
                    styles.budgetBadge,
                    {
                      backgroundColor: colors.primary + '14',
                      borderRadius: borderRadius.sm,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                    {item.budget}
                  </Text>
                </View>
              )}
            </View>

            {/* Título de la Cita */}
            <Text style={[styles.title, { color: colors.text, fontFamily: typography.fonts.bold }]}>
              {item.planTitle}
            </Text>

            {/* Lugar y Ubicación */}
            <View style={styles.placeRow}>
              <MapPinIcon size={14} color={colors.accent || colors.primary} />
              <Text
                style={[styles.placeText, { color: colors.text, fontFamily: typography.fonts.medium }]}
              >
                {item.placeName}
                {item.location ? ` • ${item.location}` : ''}
              </Text>
            </View>

            {/* Reseña / Experiencia */}
            {item.reviewText ? (
              <View
                style={[
                  styles.quoteBox,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.reviewContent,
                    { color: colors.text, fontFamily: typography.fonts.regular },
                  ]}
                >
                  {item.reviewText}
                </Text>
              </View>
            ) : null}

            {/* Tags */}
            {item.gastroTags && item.gastroTags.length > 0 ? (
              <View style={styles.tagsContainer}>
                {item.gastroTags.map((tag, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                        borderRadius: borderRadius.round,
                      },
                    ]}
                  >
                    <TagIcon size={11} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.tagText,
                        { color: colors.textSecondary, fontFamily: typography.fonts.medium },
                      ]}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Botones de Acción */}
            <View style={styles.buttonsWrapper}>
              {/* Botón 1: Diseñar Cita con IA */}
              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.md,
                  },
                ]}
                activeOpacity={0.88}
                onPress={() => onPlanWithAi(item)}
              >
                <WandIcon size={16} color={colors.primaryContrast} strokeWidth={2.2} />
                <Text
                  style={[
                    styles.primaryActionButtonText,
                    { color: colors.primaryContrast, fontFamily: typography.fonts.bold },
                  ]}
                >
                  Diseñar cita con IA en este lugar
                </Text>
              </TouchableOpacity>

              {/* Botón 2: Ver en el Mapa */}
              {onViewOnMap && (
                <TouchableOpacity
                  style={[
                    styles.secondaryActionButton,
                    {
                      borderColor: colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => onViewOnMap(item)}
                >
                  <CompassIcon size={15} color={colors.text} />
                  <Text
                    style={[
                      styles.secondaryActionButtonText,
                      { color: colors.text, fontFamily: typography.fonts.medium },
                    ]}
                  >
                    Ver en el mapa interactivo
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botón 3: Guardar en Favoritos */}
              <TouchableOpacity
                style={[
                  styles.secondaryActionButton,
                  {
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => onToggleSave(item)}
              >
                <BookmarkIcon
                  size={15}
                  color={isSaved ? (colors.accent || colors.primary) : colors.text}
                  fill={isSaved ? (colors.accent || colors.primary) : 'none'}
                />
                <Text
                  style={[
                    styles.secondaryActionButtonText,
                    {
                      color: isSaved ? (colors.accent || colors.primary) : colors.text,
                      fontFamily: typography.fonts.medium,
                    },
                  ]}
                >
                  {isSaved ? 'Quitar de guardados' : 'Guardar en mis planes favoritos'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: '85%',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
  },
  dragIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 4,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  galleryWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 210,
  },
  photoCounterBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  thumbStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  thumbWrap: {
    padding: 1,
  },
  thumbImage: {
    width: 44,
    height: 44,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  authorAvatar: {
    width: 36,
    height: 36,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
  },
  authorTime: {
    fontSize: 11,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  budgetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
    marginBottom: 6,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
  },
  placeText: {
    fontSize: 13,
  },
  quoteBox: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  reviewContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
  },
  buttonsWrapper: {
    gap: 10,
    paddingTop: 6,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  primaryActionButtonText: {
    fontSize: 13,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderWidth: 1,
  },
  secondaryActionButtonText: {
    fontSize: 13,
  },
});
