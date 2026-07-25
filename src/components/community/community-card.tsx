import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
  const { colors, typography, borderRadius } = useTheme();

  return (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
      
      {/* Header de la Publicación (Avatar & Nombres) */}
      <View style={styles.postHeader}>
        <Image source={{ uri: authorAvatar }} style={styles.avatarImage} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.authorName, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            {authorName} & {partnerName} 💕
          </Text>
          <Text style={[styles.postTime, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
            {timeAgo}
          </Text>
        </View>

        <View style={styles.ratingBadge}>
          <Text style={{ fontSize: 12, marginRight: 2 }}>⭐</Text>
          <Text style={[styles.ratingNumber, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            {rating}
          </Text>
        </View>
      </View>

      {/* Título de la Cita */}
      <Text style={[styles.planTitleText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
        {planTitle}
      </Text>

      {/* Tag de Lugar visitado */}
      <TouchableOpacity activeOpacity={0.8} style={styles.placeTag}>
        <Text style={[styles.placeTagText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
          📍 {placeName}
        </Text>
      </TouchableOpacity>

      {/* Foto a pantalla completa de la cita */}
      <Image source={{ uri: imageUrl }} style={styles.postImage} />

      {/* Texto de Reseña */}
      <Text style={[styles.reviewText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
        "{reviewText}"
      </Text>

      {/* Barra de Acciones Social */}
      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
        
        <TouchableOpacity 
          style={styles.actionItem} 
          activeOpacity={0.7}
          onPress={onToggleLike}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill={isLiked ? '#FF3B30' : 'none'} stroke={isLiked ? '#FF3B30' : colors.textSecondary} strokeWidth={2}>
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Svg>
          <Text style={[styles.actionText, { color: isLiked ? '#FF3B30' : colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            {likesCount + (isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2}>
            <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </Svg>
          <Text style={[styles.actionText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
            {commentsCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.savePlanPill, { backgroundColor: isSaved ? '#34C759' : colors.primary + '18' }]} 
          activeOpacity={0.8}
          onPress={onToggleSave}
        >
          <Text style={[styles.savePlanPillText, { color: isSaved ? '#FFFFFF' : colors.primary, fontFamily: typography.fonts.bold }]}>
            {isSaved ? '✓ Plan Guardado' : '💾 Guardar Plan'}
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
});
