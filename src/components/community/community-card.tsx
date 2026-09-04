import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import {
  HeartIcon,
  StarIcon,
  MapPinIcon,
  BookmarkIcon,
  MessageSquareIcon,
  TagIcon,
} from '../ui/icons';

export interface CommunityCardProps {
  authorName: string;
  partnerName?: string;
  authorAvatar?: string;
  timeAgo?: string;
  planTitle: string;
  placeName?: string;
  budget?: string;
  gastroTags?: string[];
  rating?: number;
  likesCount?: number;
  commentsCount?: number;
  imageUrl?: string;
  reviewText?: string;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onPress?: () => void;
}

export default function CommunityCard({
  authorName,
  partnerName,
  authorAvatar,
  timeAgo = 'Reciente',
  planTitle,
  placeName,
  budget,
  gastroTags,
  rating = 5,
  likesCount = 0,
  commentsCount = 0,
  imageUrl,
  reviewText,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onPress,
}: CommunityCardProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  const displayName = partnerName ? `${authorName} y ${partnerName}` : authorName;
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    authorName || 'NextDate'
  )}&background=000000&color=fff`;

  return (
    <TouchableOpacity
      style={[
        styles.postCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
        },
      ]}
      activeOpacity={0.94}
      onPress={onPress}
    >
      {/* Header: Author Avatar, Names, Time & Rating */}
      <View style={styles.postHeader}>
        <Image
          source={{ uri: authorAvatar || avatarFallback }}
          style={styles.avatarImage}
        />
        <View style={styles.authorInfo}>
          <Text
            style={[styles.authorName, { color: colors.text, fontFamily: typography.fonts.bold }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text
            style={[styles.postTime, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}
          >
            {timeAgo}
          </Text>
        </View>

        <View
          style={[
            styles.ratingBadge,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              borderRadius: borderRadius.round,
            },
          ]}
        >
          <StarIcon size={12} color="#FFD700" fill="#FFD700" />
          <Text
            style={[styles.ratingNumber, { color: colors.text, fontFamily: typography.fonts.bold }]}
          >
            {rating}
          </Text>
        </View>
      </View>

      {/* Main Image with floating badges */}
      {imageUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={[styles.postImage, { borderRadius: borderRadius.md }]}
            resizeMode="cover"
          />

          {/* Floating budget pill */}
          {budget ? (
            <View
              style={[
                styles.floatingBudgetBadge,
                {
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  borderRadius: borderRadius.round,
                },
              ]}
            >
              <Text style={[styles.floatingBudgetText, { fontFamily: typography.fonts.bold }]}>
                {budget}
              </Text>
            </View>
          ) : null}

          {/* Floating heart like button */}
          <TouchableOpacity
            style={[
              styles.floatingLikeBtn,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                borderRadius: borderRadius.round,
              },
            ]}
            onPress={onToggleLike}
            activeOpacity={0.8}
          >
            <HeartIcon
              size={16}
              color={isLiked ? '#FF3B30' : '#FFFFFF'}
              fill={isLiked ? '#FF3B30' : 'none'}
            />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Plan Title */}
      <Text
        style={[styles.planTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}
        numberOfLines={2}
      >
        {planTitle}
      </Text>

      {/* Place / Venue Pill */}
      {placeName ? (
        <View style={styles.placeTagsRow}>
          <View style={styles.placeTag}>
            <MapPinIcon size={13} color={colors.accent || colors.primary} />
            <Text
              style={[
                styles.placeTagText,
                { color: colors.accent || colors.primary, fontFamily: typography.fonts.medium },
              ]}
              numberOfLines={1}
            >
              {placeName}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Gastro / Vibe Tags */}
      {gastroTags && gastroTags.length > 0 ? (
        <View style={styles.cardGastroTagsRow}>
          {gastroTags.map((tag, idx) => (
            <View
              key={idx}
              style={[
                styles.cardGastroTag,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderRadius: borderRadius.round,
                },
              ]}
            >
              <TagIcon size={10} color={colors.textSecondary} />
              <Text
                style={[
                  styles.cardGastroTagText,
                  { color: colors.textSecondary, fontFamily: typography.fonts.medium },
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Review Text block */}
      {reviewText ? (
        <View
          style={[
            styles.reviewContainer,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderColor: colors.border,
              borderRadius: borderRadius.sm,
            },
          ]}
        >
          <Text
            style={[styles.reviewText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}
            numberOfLines={3}
          >
            "{reviewText}"
          </Text>
        </View>
      ) : null}

      {/* Actions Row */}
      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.actionItem}
          activeOpacity={0.7}
          onPress={onToggleLike}
        >
          <HeartIcon
            size={16}
            color={isLiked ? '#FF3B30' : colors.textSecondary}
            fill={isLiked ? '#FF3B30' : 'none'}
          />
          <Text
            style={[
              styles.actionText,
              {
                color: isLiked ? '#FF3B30' : colors.textSecondary,
                fontFamily: typography.fonts.medium,
              },
            ]}
          >
            {likesCount + (isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionItem}>
          <MessageSquareIcon size={15} color={colors.textSecondary} />
          <Text
            style={[styles.actionText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}
          >
            {commentsCount}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.savePlanPill,
            {
              backgroundColor: isSaved
                ? isDark
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.08)'
                : colors.primary,
              borderRadius: borderRadius.round,
            },
          ]}
          activeOpacity={0.85}
          onPress={onToggleSave}
        >
          <BookmarkIcon
            size={13}
            color={isSaved ? colors.text : colors.primaryContrast}
            fill={isSaved ? colors.text : 'none'}
          />
          <Text
            style={[
              styles.savePlanPillText,
              {
                color: isSaved ? colors.text : colors.primaryContrast,
                fontFamily: typography.fonts.bold,
              },
            ]}
          >
            {isSaved ? 'Guardado' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  postCard: {
    padding: 16,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
  },
  postTime: {
    fontSize: 11,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingNumber: {
    fontSize: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  floatingBudgetBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  floatingBudgetText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  floatingLikeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitleText: {
    fontSize: 16,
    lineHeight: 21,
    marginBottom: 6,
  },
  placeTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  placeTagText: {
    fontSize: 12,
  },
  cardGastroTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  cardGastroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cardGastroTagText: {
    fontSize: 11,
  },
  reviewContainer: {
    padding: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 12,
    lineHeight: 18,
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
    gap: 5,
  },
  actionText: {
    fontSize: 12,
  },
  savePlanPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  savePlanPillText: {
    fontSize: 11,
  },
});
