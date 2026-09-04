import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import {
  MapPinIcon,
  StarIcon,
  CompassIcon,
  CloseIcon,
  WandIcon,
  TagIcon,
} from '../ui/icons';
import {
  calculateDistanceInKm,
  formatDistance,
  estimateTravelTime,
  openExternalMaps,
} from './map-utils';

export interface SavedPlaceItem {
  id: string;
  name: string;
  category?: string;
  address?: string;
  imageUrl?: string;
  rating?: number;
  priceRange?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
}

interface MapSavedPlaceCardProps {
  place: SavedPlaceItem;
  userLat?: number;
  userLng?: number;
  isRoutingActive: boolean;
  onStartRoute: () => void;
  onPlanWithAi: () => void;
  onClose?: () => void;
}

export default function MapSavedPlaceCard({
  place,
  userLat,
  userLng,
  isRoutingActive,
  onStartRoute,
  onPlanWithAi,
  onClose,
}: MapSavedPlaceCardProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  const targetLat = place.latitude ?? place.lat ?? 0;
  const targetLng = place.longitude ?? place.lng ?? 0;

  const distanceInKm =
    userLat && userLng && targetLat && targetLng
      ? calculateDistanceInKm(userLat, userLng, targetLat, targetLng)
      : 0;

  const distanceText = formatDistance(distanceInKm);
  const travelTimeText = estimateTravelTime(distanceInKm);

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
        },
      ]}
    >
      {/* Top row: Thumb + Meta + Close */}
      <View style={styles.topRow}>
        {place.imageUrl ? (
          <Image
            source={{ uri: place.imageUrl }}
            style={[styles.thumbnail, { borderRadius: borderRadius.md }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.thumbnailPlaceholder,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <MapPinIcon size={20} color={colors.primary} />
          </View>
        )}

        <View style={styles.placeInfo}>
          <View style={styles.headerTitleRow}>
            <Text
              style={[styles.placeTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}
              numberOfLines={1}
            >
              {place.name}
            </Text>

            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <CloseIcon size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Badges & Distance */}
          <View style={styles.metaBadgesRow}>
            {place.rating ? (
              <View style={styles.ratingBadge}>
                <StarIcon size={11} color="#FFD700" fill="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                  {place.rating}
                </Text>
              </View>
            ) : null}

            {place.priceRange ? (
              <Text style={[styles.priceText, { color: colors.textSecondary, fontFamily: typography.fonts.bold }]}>
                {place.priceRange}
              </Text>
            ) : null}

            <Text style={[styles.distanceText, { color: colors.accent || colors.primary, fontFamily: typography.fonts.bold }]}>
              {distanceText}
            </Text>

            <Text style={[styles.timeText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
              • {travelTimeText}
            </Text>
          </View>

          {place.address ? (
            <Text
              style={[styles.addressText, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}
              numberOfLines={1}
            >
              {place.address}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {/* Button 1: Start In-App Navigation / Trace Route */}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            {
              backgroundColor: isRoutingActive ? '#30D158' : colors.primary,
              borderRadius: borderRadius.md,
            },
          ]}
          onPress={onStartRoute}
          activeOpacity={0.85}
        >
          <CompassIcon size={14} color={colors.primaryContrast} strokeWidth={2.2} />
          <Text
            style={[
              styles.primaryBtnText,
              { color: colors.primaryContrast, fontFamily: typography.fonts.bold },
            ]}
          >
            {isRoutingActive ? 'Ruta activa' : 'Trazar ruta'}
          </Text>
        </TouchableOpacity>

        {/* Button 2: Open External Native GPS (Google Maps / Apple Maps) */}
        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            {
              borderColor: colors.border,
              borderRadius: borderRadius.md,
            },
          ]}
          onPress={() => openExternalMaps(targetLat, targetLng, place.name)}
          activeOpacity={0.75}
        >
          <MapPinIcon size={13} color={colors.text} />
          <Text style={[styles.secondaryBtnText, { color: colors.text, fontFamily: typography.fonts.medium }]}>
            GPS Externo
          </Text>
        </TouchableOpacity>

        {/* Button 3: Plan with AI */}
        <TouchableOpacity
          style={[
            styles.iconOnlyBtn,
            {
              borderColor: colors.border,
              borderRadius: borderRadius.md,
            },
          ]}
          onPress={onPlanWithAi}
          activeOpacity={0.75}
        >
          <WandIcon size={14} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  placeTitle: {
    fontSize: 15,
    flex: 1,
    marginRight: 6,
  },
  closeBtn: {
    padding: 2,
  },
  metaBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
  },
  priceText: {
    fontSize: 11,
  },
  distanceText: {
    fontSize: 11,
  },
  timeText: {
    fontSize: 11,
  },
  addressText: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  primaryBtnText: {
    fontSize: 12,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 12,
  },
  iconOnlyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
