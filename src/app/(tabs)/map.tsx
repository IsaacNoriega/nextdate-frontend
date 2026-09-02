import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../hooks/useUserLocation';
import LeafletMap, { MapWaypoint } from '../../components/map/leaflet-map';
import NavigationOverlay from '../../components/map/navigation-overlay';
import ItinerarySelectorModal from '../../components/map/itinerary-selector-modal';
import StepDetailModal from '../../components/generator/step-detail-modal';
import { getItinerariesByUserIdApi } from '../../services/itineraryService';
import {
  RouteStep,
  SavedItineraryOption,
  STATIC_ITINERARIES,
} from '../../mocks/map.mock';

export default function MapScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const { user } = useAuth();
  const userLoc = useUserLocation();

  const [itineraries, setItineraries] =
    useState<SavedItineraryOption[]>(STATIC_ITINERARIES);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(
    'itin-1'
  );
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [showSelectorModal, setShowSelectorModal] = useState<boolean>(false);
  const [selectedStepDetail, setSelectedStepDetail] = useState<RouteStep | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadItineraries() {
      setLoading(true);
      const currentUserId = user?.id || '00000000-0000-0000-0000-000000000001';

      try {
        const apiData = await getItinerariesByUserIdApi(currentUserId);
        if (apiData && apiData.length > 0) {
          const mapped: SavedItineraryOption[] = apiData.map((itin: any) => ({
            id: itin.id,
            title: itin.title,
            tagline: itin.description || 'Itinerario de cita de NextDate',
            totalDistance: '2.5 km',
            totalTime: '15 min',
            matchScore: 98,
            steps: itin.items.map((item: any, idx: number) => ({
              stepNumber: item.sequenceOrder || idx + 1,
              time: `${19 + idx}:00`,
              title: item.notes || `Paso ${item.sequenceOrder}`,
              placeName: item.place ? item.place.name : 'Lugar Recomendado',
              categoryEmoji:
                item.place?.category === 'FOOD_DRINK'
                  ? '🍷'
                  : item.place?.category === 'CULTURE'
                  ? '🎭'
                  : '✨',
              address: item.place?.address || 'Guadalajara, Jal.',
              description:
                item.place?.description ||
                'Disfruta de esta experiencia recomendada.',
              imageUrl:
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
              estimatedCost: `$${item.transitTimeToNext || 50} USD`,
              turnInstruction: `Dirígete hacia ${
                item.place ? item.place.name : 'el siguiente punto'
              }`,
              distanceRemaining: '800m',
              eta: '10 min',
              lat: item.place?.latitude || 20.6745,
              lng: item.place?.longitude || -103.3702,
            })),
          }));
          setItineraries(mapped);
          if (mapped.length > 0) {
            setSelectedItineraryId(mapped[0].id);
          }
        }
      } catch (err) {
        // Fallback a los datos mock estáticos
      } finally {
        setLoading(false);
      }
    }
    loadItineraries();
  }, [user?.id]);

  const currentItinerary =
    itineraries.find((i) => i.id === selectedItineraryId) || itineraries[0];
  const activeStep = currentItinerary?.steps[activeStepIndex] || null;

  const mapWaypoints: MapWaypoint[] = (currentItinerary?.steps || []).map(
    (step) => ({
      lat: step.lat,
      lng: step.lng,
      title: step.title,
      placeName: step.placeName,
      stepNumber: step.stepNumber,
    })
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header flotante */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.selectorBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: borderRadius.lg,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => setShowSelectorModal(true)}
        >
          <View style={styles.selectorInfo}>
            <Text
              style={[
                styles.selectorTitle,
                { color: colors.text, fontFamily: typography.fonts.bold },
              ]}
              numberOfLines={1}
            >
              {currentItinerary?.title || 'Seleccionar Itinerario'}
            </Text>
            <Text
              style={[
                styles.selectorSubtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fonts.regular,
                },
              ]}
            >
              {currentItinerary?.steps.length || 0} paradas • {currentItinerary?.totalDistance}
            </Text>
          </View>
          <Svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.textSecondary}
            strokeWidth={2}
          >
            <Path d="M6 9l6 6 6-6" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Mapa Completo con Leaflet / WebView */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <LeafletMap
            waypoints={mapWaypoints}
            activeStepIndex={activeStepIndex}
            onSelectWaypoint={(idx) => setActiveStepIndex(idx)}
            showRoutingMachine={true}
            userLocation={{ lat: userLoc.lat, lng: userLoc.lng }}
            isDark={isDark}
          />
        )}
      </View>

      {/* Overlay Flotante de Navegación */}
      {activeStep && (
        <View style={styles.overlayWrapper}>
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
      )}

      {/* Selector Modal de Itinerarios */}
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

      {/* Modal de Detalle de Paso */}
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
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  selectorInfo: {
    flex: 1,
    marginRight: 10,
  },
  selectorTitle: {
    fontSize: 15,
  },
  selectorSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 20,
  },
});
