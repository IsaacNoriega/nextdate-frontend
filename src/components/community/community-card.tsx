import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Svg, { Path, Star } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface CommunityCardProps {
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
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
}

export default function CommunityCard({
  authorName,
  partnerName,
  authorAvatar,
  timeAgo,
  planTitle,
  placeName,
  rating,
  likesCount,
  commentsCount,
  imageUrl,
  reviewText,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
}: CommunityCardProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  return (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
      
      {/* Header (Avatar & Names & Time) */}
      <View style={styles.postHeader}>
        <Image source={{ uri: authorAvatar }} style={styles.avatarImage} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.authorName, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            {authorName} & {partnerName}
          </Text>
          <Text style={[styles.postTime, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
            {timeAgo}
          </Text>
        </View>

        <View style={[styles.ratingBadge, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="#FFD700">
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </Svg>
          <Text style={[styles.ratingNumber, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            {rating}
          </Text>
        </View>
      </View>

      {/* Plan Title */}
      <Text style={[styles.planTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
        {planTitle}
      </Text>

      {/* Location tag */}
      <TouchableOpacity activeOpacity={0.8} style={styles.placeTag}>
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2}>
          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        </Svg>
        <Text style={[styles.placeTagText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
          {placeName}
        </Text>
      </TouchableOpacity>

      {/* Main Image */}
      <Image source={{ uri: imageUrl }} style={[styles.postImage, { borderRadius: borderRadius.md }]} />

      {/* Review Text */}
      <Text style={[styles.reviewText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
        "{reviewText}"
      </Text>

      {/* Action Bar */}
      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.actionItem} 
          activeOpacity={0.7}
          onPress={onToggleLike}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill={isLiked ? '#FF3B30' : 'none'} stroke={isLiked ? '#FF3B30' : colors.textSecondary} strokeWidth={2}>
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Svg>
          <Text style={[styles.actionText, { color: isLiked ? '#FF3B30' : colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            {likesCount + (isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
            <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </Svg>
          <Text style={[styles.actionText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            {commentsCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.savePlanPill, 
            { 
              backgroundColor: isSaved ? '#30D158' : colors.primary,
              borderRadius: borderRadius.round 
            }
          ]} 
          activeOpacity={0.88}
          onPress={onToggleSave}
        >
          {isSaved ? (
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2.5}>
              <Path d="M20 6L9 17l-5-5" />
            </Svg>
          ) : (
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.primaryContrast} strokeWidth={2}>
              <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </Svg>
          )}
          <Text style={[styles.savePlanPillText, { color: colors.primaryContrast, fontFamily: typography.fonts.bold }]}>
            {isSaved ? 'Guardado' : 'Guardar Plan'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
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
    marginBottom: 10,
    gap: 10,
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  authorName: {
    fontSize: 14,
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
    borderRadius: 12,
  },
  ratingNumber: {
    fontSize: 12,
  },
  planTitleText: {
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 4,
  },
  placeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  placeTagText: {
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 220,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
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
    fontSize: 13,
  },
  savePlanPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  savePlanPillText: {
    fontSize: 12,
  },
});
