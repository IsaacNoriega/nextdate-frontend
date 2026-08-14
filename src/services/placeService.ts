import { fetchGraphQL } from './api';
import { PlaceCategory, PriceRange } from './profileService';

export interface Place {
  id: string;
  name: string;
  description?: string;
  category: PlaceCategory;
  priceRange: PriceRange;
  address?: string;
  latitude: number;
  longitude: number;
  active: boolean;
  createdAt: string;
}

// 1. Obtener lugar por ID
const PLACE_BY_ID_QUERY = `
  query PlaceById($id: ID!) {
    placeById(id: $id) {
      id
      name
      description
      category
      priceRange
      address
      latitude
      longitude
      active
      createdAt
    }
  }
`;

export async function getPlaceByIdApi(id: string): Promise<Place | null> {
  const data = await fetchGraphQL<{ placeById: Place | null }>(PLACE_BY_ID_QUERY, { id });
  return data.placeById;
}

// 2. Obtener lugares cercanos con filtros de geolocalización y categoría
const NEARBY_PLACES_QUERY = `
  query NearbyPlaces($longitude: Float!, $latitude: Float!, $radiusInKm: Float!, $category: PlaceCategory) {
    nearbyPlaces(longitude: $longitude, latitude: $latitude, radiusInKm: $radiusInKm, category: $category) {
      id
      name
      description
      category
      priceRange
      address
      latitude
      longitude
      active
      createdAt
    }
  }
`;

export async function getNearbyPlacesApi(
  longitude: number,
  latitude: number,
  radiusInKm: number = 20.0,
  category?: PlaceCategory
): Promise<Place[]> {
  const data = await fetchGraphQL<{ nearbyPlaces: Place[] }>(NEARBY_PLACES_QUERY, {
    longitude,
    latitude,
    radiusInKm,
    category: category || null,
  });
  return data.nearbyPlaces;
}
