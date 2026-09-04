import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { MapPinIcon, StarIcon, BookmarkIcon } from '../ui/icons';
import { SavedPlaceItem } from './map-saved-place-card';
import { calculateDistanceInKm, formatDistance } from './map-utils';

interface MapSavedPlacesCarouselProps {
  places: SavedPlaceItem[];
  selectedPlaceId?: string | null;
  onSelectPlace: (place: SavedPlaceItem) => void;
  userLat?: number;
  userLng?: number;
}

export default function MapSavedPlacesCarousel({
  places,
  selectedPlaceId,
  onSelectPlace,
  userLat,
  userLng,
}: MapSavedPlacesCarouselProps) {
  const { colors, typography, borderRadius, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {places.map((place) => {
          const isSelected = place.id === selectedPlaceId;
          const targetLat = place.latitude ?? place.lat ?? 0;
          const targetLng = place.longitude ?? place.lng ?? 0;

          const distanceInKm =
            userLat && userLng && targetLat && targetLng
              ? calculateDistanceInKm(userLat, userLng, targetLat, targetLng)
              : 0;

          const distanceText = formatDistance(distanceInKm);

          return (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.placeChip,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? '#2C2C2E'
                      : '#FFFFFF'
                    : isDark
                    ? 'rgba(28, 28, 30, 0.92)'
                    : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  borderRadius: borderRadius.lg,
                },
              ]}
              onPress={() => onSelectPlace(place)}
              activeOpacity={0.8}
            >
              {place.imageUrl ? (
                <Image
                  source={{ uri: place.imageUrl }}
                  style={[styles.thumb, { borderRadius: borderRadius.md }]}
                />
              ) : (
                <View
                  style={[
                    styles.thumbPlaceholder,
                    {
                      backgroundColor: colors.primary + '14',
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <BookmarkIcon size={14} color={colors.primary} />
                </View>
              )}

              <View style={styles.infoCol}>
                <Text
                  style={[
                    styles.name,
                    {
                      color: colors.text,
                      fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {place.name}
                </Text>

                <View style={styles.metaRow}>
                  {place.rating ? (
                    <View style={styles.ratingBadge}>
                      <StarIcon size={10} color="#FFD700" fill="#FFD700" />
                      <Text style={[styles.ratingText, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                        {place.rating}
                      </Text>
                    </View>
                  ) : null}

                  <Text
                    style={[
                      styles.distanceText,
                      { color: colors.accent || colors.primary, fontFamily: typography.fonts.medium },
                    ]}
                  >
                    {distanceText}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  placeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    minWidth: 160,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  thumb: {
    width: 38,
    height: 38,
  },
  thumbPlaceholder: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 12,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
  },
  distanceText: {
    fontSize: 10,
  },
});
