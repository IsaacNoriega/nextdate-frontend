import { fetchGraphQL } from './api';
import { Place } from './placeService';

export type TransportType = 'WALKING' | 'DRIVING' | 'TRANSIT' | 'CYCLING' | 'NONE';

export interface ItineraryItem {
  id: string;
  place: Place;
  sequenceOrder: number;
  durationInMinutes: number;
  notes?: string;
  transportToNext: TransportType;
  transitTimeToNext: number;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  description?: string;
  totalCost: number;
  active: boolean;
  createdAt: string;
  items: ItineraryItem[];
}

// 1. Recomendar Itinerario con IA (NextDate AI Concierge)
const RECOMMEND_ITINERARY_MUTATION = `
  mutation RecommendItinerary($input: RecommendItineraryInput!) {
    recommendItinerary(input: $input) {
      id
      userId
      title
      description
      totalCost
      active
      createdAt
      items {
        id
        sequenceOrder
        durationInMinutes
        notes
        transportToNext
        transitTimeToNext
        place {
          id
          name
          address
          latitude
          longitude
          category
          priceRange
        }
      }
    }
  }
`;

export async function recommendItineraryApi(userId: string, prompt: string): Promise<Itinerary> {
  const data = await fetchGraphQL<{ recommendItinerary: Itinerary }>(RECOMMEND_ITINERARY_MUTATION, {
    input: { userId, prompt },
  });
  return data.recommendItinerary;
}

// 2. Obtener Itinerarios por ID de Usuario
const ITINERARIES_BY_USER_ID_QUERY = `
  query ItinerariesByUserId($userId: ID!) {
    itinerariesByUserId(userId: $userId) {
      id
      userId
      title
      description
      totalCost
      active
      createdAt
      items {
        id
        sequenceOrder
        durationInMinutes
        notes
        transportToNext
        transitTimeToNext
        place {
          id
          name
          address
          latitude
          longitude
          category
          priceRange
        }
      }
    }
  }
`;

export async function getItinerariesByUserIdApi(userId: string): Promise<Itinerary[]> {
  const data = await fetchGraphQL<{ itinerariesByUserId: Itinerary[] }>(ITINERARIES_BY_USER_ID_QUERY, {
    userId,
  });
  return data.itinerariesByUserId;
}
