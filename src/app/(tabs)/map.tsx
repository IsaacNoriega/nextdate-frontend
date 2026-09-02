import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../hooks/useUserLocation';
import LeafletMap, { MapWaypoint } from '../../components/map/leaflet-map';
import NavigationOverlay from '../../components/map/navigation-overlay';
import ItinerarySelectorModal from '../../components/map/itinerary-selector-modal';
import StepDetailModal from '../../components/generator/step-detail-modal';
import { getItinerariesByUserIdApi } from '../../services/itineraryService';
import { RouteStep, SavedItineraryOption } from '../../mocks/map.mock';

export default function MapScreen() {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const { user } = useAuth();
  const userLoc = useUserLocation();
  const router = useRouter();

  const [itineraries, setItineraries] = useState<SavedItineraryOption[]>([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showSelectorModal, setShowSelectorModal] = useState<boolean>(false);
  const [selectedStepDetail, setSelectedStepDetail] = useState<RouteStep | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadItineraries() {
      if (!user?.id) {
        setItineraries([]);
        setSelectedItineraryId(null);
        return;
      }
      setLoading(true);

      try {
        const apiData = await getItinerariesByUserIdApi(user.id);
        if (apiData && apiData.length > 0) {
          const mapped: SavedItineraryOption[] = apiData.map((itin: any) => ({
            id: itin.id,
            title: itin.title,
            tagline: itin.description || 'Itinerario de cita de NextDate',
            totalDistance: `${(itin.items?.length || 1) * 0.8} km`,
            totalTime: `${itin.items?.reduce((acc: number, cur: any) => acc + (cur.durationInMinutes || 45), 0)} min`,
            matchScore: 98,
            steps: (itin.items || []).map((item: any, idx: number) => ({
              stepNumber: item.sequenceOrder || idx + 1,
              time: `${19 + idx}:00`,
              title: item.notes || `Paso ${item.sequenceOrder || idx + 1}`,
              placeName: item.place ? item.place.name : 'Lugar Recomendado',
              categoryEmoji:
                item.place?.category === 'FOOD_DRINK'
                  ? '🍷'
                  : item.place?.category === 'CULTURE'
                  ? '🎭'
                  : '✨',
              address: item.place?.address || 'Ubicación seleccionada',
              description:
                item.place?.description ||
                'Disfruta de esta experiencia recomendada.',
              imageUrl:
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
          setSelectedItineraryId(mapped[0].id);
        } else {
          setItineraries([]);
          setSelectedItineraryId(null);
        }
      } catch (err) {
        setItineraries([]);
        setSelectedItineraryId(null);
      } finally {
        setLoading(false);
      }
    }
    loadItineraries();
  }, [user?.id]);

  const currentItinerary =
    itineraries.find((i) => i.id === selectedItineraryId) || null;
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
        {itineraries.length > 0 ? (
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
        ) : (
          <View
            style={[
              styles.selectorBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <View style={styles.selectorInfo}>
              <Text
                style={[
                  styles.selectorTitle,
                  { color: colors.text, fontFamily: typography.fonts.bold },
                ]}
              >
                📍 Tu Ubicación Actual
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
                {userLoc.formattedAddress || 'Buscando GPS...'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => userLoc.requestUserLocation()}
              style={{ padding: 6 }}
              activeOpacity={0.7}
            >
              <Svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.primary}
                strokeWidth={2}
              >
                <Path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                <Circle cx="12" cy="12" r="4" />
              </Svg>
            </TouchableOpacity>
          </View>
        )}
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
            showRoutingMachine={mapWaypoints.length >= 2}
            userLocation={{ lat: userLoc.lat, lng: userLoc.lng }}
            isDark={isDark}
          />
        )}
      </View>

      {/* Si hay itinerario activo, Overlay de Navegación */}
      {currentItinerary && activeStep ? (
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
      ) : (
        /* Empty State Floating Card */
        <View style={styles.emptyOverlayWrapper}>
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
            <Text
              style={[
                styles.emptyCardTitle,
                { color: colors.text, fontFamily: typography.fonts.bold },
              ]}
            >
              Sin planes guardados aún
            </Text>
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
              <Text
                style={[
                  styles.emptyCardBtnText,
                  { color: colors.primaryContrast, fontFamily: typography.fonts.bold },
                ]}
              >
                ✨ Crear Plan con IA
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Selector Modal de Itinerarios */}
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
  emptyOverlayWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  emptyCard: {
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyCardTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  emptyCardText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  emptyCardBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardBtnText: {
    fontSize: 14,
  },
});
