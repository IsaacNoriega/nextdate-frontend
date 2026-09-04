import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../hooks/useUserLocation';
import LeafletMap, { MapWaypoint } from '../../components/map/leaflet-map';
import NavigationOverlay from '../../components/map/navigation-overlay';
import ItinerarySelectorModal from '../../components/map/itinerary-selector-modal';
import StepDetailModal from '../../components/generator/step-detail-modal';
import MapHeaderSwitcher, { MapNavigationMode } from '../../components/map/map-header-switcher';
import MapSavedPlaceCard, { SavedPlaceItem } from '../../components/map/map-saved-place-card';
import MapSavedPlacesCarousel from '../../components/map/map-saved-places-carousel';
import {
  SparklesIcon,
  BookmarkIcon,
  CompassIcon,
  ChevronDownIcon,
  WandIcon,
  CompassIcon as TargetIcon,
} from '../../components/ui/icons';
import { getItinerariesByUserIdApi } from '../../services/itineraryService';
import { storageService } from '../../services/storage';
import { RouteStep, SavedItineraryOption } from '../../mocks/map.mock';

export default function MapScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const { user } = useAuth();
  const userLoc = useUserLocation();
  const router = useRouter();

  // Mode: 'itineraries' | 'places'
  const [mode, setMode] = useState<MapNavigationMode>('itineraries');

  // Itineraries state
  const [itineraries, setItineraries] = useState<SavedItineraryOption[]>([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showSelectorModal, setShowSelectorModal] = useState<boolean>(false);
  const [selectedStepDetail, setSelectedStepDetail] = useState<RouteStep | null>(null);

  // Saved places state
  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceItem[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SavedPlaceItem | null>(null);
  const [isPlaceRoutingActive, setIsPlaceRoutingActive] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  // Load all user itineraries & saved places upon screen focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadData() {
        setLoading(true);

        try {
          // 1. Fetch saved places from storage
          const storedPlaces = await storageService.getSavedPlaces<SavedPlaceItem>().catch(() => []);
          if (isMounted) {
            setSavedPlaces(storedPlaces || []);
          }

          // 2. Fetch itineraries from backend API
          if (user?.id) {
            const apiData = await getItinerariesByUserIdApi(user.id).catch(() => []);
            if (isMounted && apiData && apiData.length > 0) {
              const mapped: SavedItineraryOption[] = apiData.map((itin: any) => ({
                id: itin.id,
                title: itin.title,
                tagline: itin.description || 'Itinerario de cita de NextDate',
                totalDistance: `${((itin.items?.length || 1) * 0.8).toFixed(1)} km`,
                totalTime: `${itin.items?.reduce(
                  (acc: number, cur: any) => acc + (cur.durationInMinutes || 45),
                  0
                )} min`,
                matchScore: 98,
                steps: (itin.items || []).map((item: any, idx: number) => ({
                  stepNumber: item.sequenceOrder || idx + 1,
                  time: `${18 + idx * 2}:00`,
                  title: item.notes || `Paso ${item.sequenceOrder || idx + 1}`,
                  placeName: item.place ? item.place.name : 'Lugar Recomendado',
                  categoryEmoji: '',
                  address: item.place?.address || 'Ubicación seleccionada',
                  description:
                    item.place?.description ||
                    'Disfruta de esta experiencia recomendada.',
                  imageUrl:
                    item.place?.imageUrl ||
                    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
                  estimatedCost: `$${item.transitTimeToNext || 50} USD`,
                  turnInstruction: `Dirígete hacia ${
                    item.place ? item.place.name : 'el siguiente punto'
                  }`,
                  distanceRemaining: '500m',
                  eta: `${item.transitTimeToNext || 10} min`,
                  lat: item.place?.latitude || userLoc.lat,
                  lng: item.place?.longitude || userLoc.lng,
                })),
              }));
              setItineraries(mapped);
              if (!selectedItineraryId && mapped.length > 0) {
                setSelectedItineraryId(mapped[0].id);
              }
            } else if (isMounted) {
              setItineraries([]);
              setSelectedItineraryId(null);
            }
          }
        } catch {
          // Graceful error fallback
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }

      loadData();

      return () => {
        isMounted = false;
      };
    }, [user?.id])
  );

  const currentItinerary =
    itineraries.find((i) => i.id === selectedItineraryId) || null;
  const activeStep = currentItinerary?.steps[activeStepIndex] || null;

  // Derive Waypoints based on current mode
  let mapWaypoints: MapWaypoint[] = [];
  let showRoutingMachine = false;

  if (mode === 'itineraries') {
    mapWaypoints = (currentItinerary?.steps || []).map((step) => ({
      lat: step.lat,
      lng: step.lng,
      title: step.title,
      placeName: step.placeName,
      stepNumber: step.stepNumber,
    }));
    showRoutingMachine = mapWaypoints.length >= 2;
  } else {
    // Mode: 'places'
    if (selectedPlace) {
      const targetLat = selectedPlace.latitude ?? selectedPlace.lat ?? userLoc.lat;
      const targetLng = selectedPlace.longitude ?? selectedPlace.lng ?? userLoc.lng;

      mapWaypoints = [
        {
          lat: userLoc.lat,
          lng: userLoc.lng,
          title: 'Tu Ubicación',
          placeName: userLoc.formattedAddress || 'Punto de partida',
          stepNumber: 1,
        },
        {
          lat: targetLat,
          lng: targetLng,
          title: selectedPlace.name,
          placeName: selectedPlace.address || selectedPlace.name,
          stepNumber: 2,
        },
      ];
      showRoutingMachine = isPlaceRoutingActive;
    } else {
      mapWaypoints = savedPlaces.map((place, idx) => ({
        lat: place.latitude ?? place.lat ?? userLoc.lat,
        lng: place.longitude ?? place.lng ?? userLoc.lng,
        title: place.name,
        placeName: place.address || place.name,
        stepNumber: idx + 1,
      }));
      showRoutingMachine = false;
    }
  }

  // Handle clicking pins on Leaflet
  const handleSelectWaypoint = (index: number) => {
    if (mode === 'itineraries') {
      setActiveStepIndex(index);
    } else if (mode === 'places') {
      if (!selectedPlace && savedPlaces[index]) {
        setSelectedPlace(savedPlaces[index]);
        setIsPlaceRoutingActive(true);
      }
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Dynamic Mode Switcher (Citas vs Lugares) */}
      <MapHeaderSwitcher
        mode={mode}
        onModeChange={(newMode) => {
          setMode(newMode);
          if (newMode === 'places') {
            setIsPlaceRoutingActive(false);
          }
        }}
        itinerariesCount={itineraries.length}
        placesCount={savedPlaces.length}
        userAddress={userLoc.formattedAddress || 'Buscando GPS...'}
        onLocationPress={() => userLoc.requestUserLocation()}
      />

      {/* Selector Pill for Itineraries when multiple are saved */}
      {mode === 'itineraries' && currentItinerary && (
        <View style={styles.itineraryPillWrap}>
          <TouchableOpacity
            style={[
              styles.itineraryPill,
              {
                backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: colors.border,
                borderRadius: borderRadius.round,
              },
            ]}
            onPress={() => setShowSelectorModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.itineraryPillInfo}>
              <Text
                style={[
                  styles.itineraryPillTitle,
                  { color: colors.text, fontFamily: typography.fonts.bold },
                ]}
                numberOfLines={1}
              >
                {currentItinerary.title}
              </Text>
              <Text
                style={[
                  styles.itineraryPillMeta,
                  { color: colors.textSecondary, fontFamily: typography.fonts.regular },
                ]}
              >
                {currentItinerary.steps.length} paradas • {currentItinerary.totalDistance}
              </Text>
            </View>
            <ChevronDownIcon size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Floating GPS Re-Center Button */}
      <TouchableOpacity
        style={[
          styles.recenterBtn,
          {
            backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : '#FFFFFF',
            borderColor: colors.border,
            borderRadius: borderRadius.round,
          },
        ]}
        onPress={() => userLoc.requestUserLocation()}
        activeOpacity={0.8}
      >
        <CompassIcon size={18} color={colors.primary} />
      </TouchableOpacity>

      {/* Interactive Map View */}
      <View style={styles.mapContainer}>
        {loading && itineraries.length === 0 && savedPlaces.length === 0 ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <LeafletMap
            waypoints={mapWaypoints}
            activeStepIndex={mode === 'itineraries' ? activeStepIndex : undefined}
            onSelectWaypoint={handleSelectWaypoint}
            showRoutingMachine={showRoutingMachine}
            userLocation={{ lat: userLoc.lat, lng: userLoc.lng }}
            isDark={isDark}
          />
        )}
      </View>

      {/* Bottom Content Depending on Active Mode */}
      {mode === 'itineraries' ? (
        currentItinerary && activeStep ? (
          <View style={styles.overlayWrapper} pointerEvents="box-none">
            <View style={styles.cardMaxWidthWrap}>
              <NavigationOverlay
                step={activeStep}
                activeStepIndex={activeStepIndex}
                totalSteps={currentItinerary.steps.length}
                onNextStep={() =>
                  setActiveStepIndex((prev) =>
                    Math.min(prev + 1, currentItinerary.steps.length - 1)
                  )
                }
                onPrevStep={() => setActiveStepIndex((prev) => Math.max(prev - 1, 0))}
                onOpenDetail={() => setSelectedStepDetail(activeStep)}
              />
            </View>
          </View>
        ) : (
          /* Empty Itineraries State */
          <View style={styles.emptyOverlayWrapper} pointerEvents="box-none">
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                },
              ]}
            >
              <View style={styles.emptyHeaderRow}>
                <SparklesIcon size={18} color={colors.primary} />
                <Text
                  style={[
                    styles.emptyCardTitle,
                    { color: colors.text, fontFamily: typography.fonts.bold },
                  ]}
                >
                  Sin citas guardadas aún
                </Text>
              </View>
              <Text
                style={[
                  styles.emptyCardText,
                  { color: colors.textSecondary, fontFamily: typography.fonts.regular },
                ]}
              >
                Pídele al AI Concierge que diseñe tu próxima cita o explora lugares cercanos para trazarlos en el mapa.
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyCardBtn,
                  { backgroundColor: colors.primary, borderRadius: borderRadius.md },
                ]}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/generator')}
              >
                <WandIcon size={14} color={colors.primaryContrast} />
                <Text
                  style={[
                    styles.emptyCardBtnText,
                    { color: colors.primaryContrast, fontFamily: typography.fonts.bold },
                  ]}
                >
                  Diseñar Cita con IA
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      ) : (
        /* Mode: 'places' */
        <View style={styles.placesBottomWrapper} pointerEvents="box-none">
          {savedPlaces.length > 0 ? (
            <>
              {/* Carousel of saved places */}
              <View style={styles.carouselWrap} pointerEvents="box-none">
                <MapSavedPlacesCarousel
                  places={savedPlaces}
                  selectedPlaceId={selectedPlace?.id}
                  onSelectPlace={(place) => {
                    setSelectedPlace(place);
                    setIsPlaceRoutingActive(true);
                  }}
                  userLat={userLoc.lat}
                  userLng={userLoc.lng}
                />
              </View>

              {/* Selected place full action card */}
              {selectedPlace && (
                <View style={styles.selectedPlaceWrap}>
                  <MapSavedPlaceCard
                    place={selectedPlace}
                    userLat={userLoc.lat}
                    userLng={userLoc.lng}
                    isRoutingActive={isPlaceRoutingActive}
                    onStartRoute={() => setIsPlaceRoutingActive((prev) => !prev)}
                    onPlanWithAi={() =>
                      router.push({
                        pathname: '/(tabs)/generator',
                        params: {
                          prompt: `Planifica una cita especial que incluya visitar ${selectedPlace.name}`,
                        },
                      })
                    }
                    onClose={() => {
                      setSelectedPlace(null);
                      setIsPlaceRoutingActive(false);
                    }}
                  />
                </View>
              )}
            </>
          ) : (
            /* Empty Saved Places State */
            <View style={styles.emptyCardContainer} pointerEvents="box-none">
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                <View style={styles.emptyHeaderRow}>
                  <BookmarkIcon size={18} color={colors.primary} />
                  <Text
                    style={[
                      styles.emptyCardTitle,
                      { color: colors.text, fontFamily: typography.fonts.bold },
                    ]}
                  >
                    Sin lugares guardados aún
                  </Text>
                </View>
                <Text
                  style={[
                    styles.emptyCardText,
                    { color: colors.textSecondary, fontFamily: typography.fonts.regular },
                  ]}
                >
                  Explora la comunidad o descubre nuevos spots en la pestaña de Explorar para agregarlos a tus favoritos y verlos en el mapa.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.emptyCardBtn,
                    { backgroundColor: colors.primary, borderRadius: borderRadius.md },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => router.push('/(tabs)/explore')}
                >
                  <BookmarkIcon size={14} color={colors.primaryContrast} />
                  <Text
                    style={[
                      styles.emptyCardBtnText,
                      { color: colors.primaryContrast, fontFamily: typography.fonts.bold },
                    ]}
                  >
                    Explorar Lugares
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Itineraries Selector Modal */}
      {itineraries.length > 0 && (
        <ItinerarySelectorModal
          visible={showSelectorModal}
          onClose={() => setShowSelectorModal(false)}
          itineraries={itineraries}
          selectedId={selectedItineraryId}
          onSelect={(id) => {
            setSelectedItineraryId(id);
            setActiveStepIndex(0);
          }}
        />
      )}

      {/* Step Detail Modal */}
      <StepDetailModal
        step={
          selectedStepDetail
            ? {
                ...selectedStepDetail,
                latitude: selectedStepDetail.lat,
                longitude: selectedStepDetail.lng,
                duration: '45 min',
                notes: selectedStepDetail.description,
                transportMode: 'WALKING',
                transitTime: selectedStepDetail.eta,
                cost: selectedStepDetail.estimatedCost || '$0.00',
              }
            : null
        }
        onClose={() => setSelectedStepDetail(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itineraryPillWrap: {
    position: 'absolute',
    top: 136,
    left: 16,
    right: 16,
    zIndex: 25,
    alignItems: 'center',
  },
  itineraryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  itineraryPillInfo: {
    marginRight: 10,
  },
  itineraryPillTitle: {
    fontSize: 13,
  },
  itineraryPillMeta: {
    fontSize: 11,
    marginTop: 1,
  },
  recenterBtn: {
    position: 'absolute',
    top: 136,
    right: 16,
    zIndex: 26,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  mapContainer: {
    flex: 1,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayWrapper: {
    position: 'absolute',
    bottom: 104, // Ubicado por encima del navbar flotante (bottom: 24 + height: 64 + 16px gap)
    left: 16,
    right: 16,
    zIndex: 20,
    alignItems: 'center',
  },
  cardMaxWidthWrap: {
    width: '100%',
    maxWidth: 500,
  },
  placesBottomWrapper: {
    position: 'absolute',
    bottom: 104, // Ubicado por encima del navbar flotante
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
  },
  carouselWrap: {
    width: '100%',
    maxWidth: 600,
  },
  selectedPlaceWrap: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  emptyOverlayWrapper: {
    position: 'absolute',
    bottom: 104,
    left: 16,
    right: 16,
    zIndex: 20,
    alignItems: 'center',
  },
  emptyCardContainer: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 16,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 500,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  emptyCardTitle: {
    fontSize: 16,
  },
  emptyCardText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  emptyCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  emptyCardBtnText: {
    fontSize: 14,
  },
});
