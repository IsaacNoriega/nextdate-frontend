import { fetchGraphQL } from './api';
import { Itinerary } from './itineraryService';

export interface SharedExperience {
  id: string;
  userId: string;
  itinerary: Itinerary;
  title: string;
  description?: string;
  tips?: string;
  actualCost: number;
  rating: number;
  imageUrls: string[];
  createdAt: string;
}

export interface ShareExperienceInput {
  userId: string;
  itineraryId: string;
  title: string;
  description?: string;
  tips?: string;
  actualCost: number;
  rating: number;
  imageUrls: string[];
}

// 1. Obtener todas las experiencias compartidas activas
const SHARED_EXPERIENCES_QUERY = `
  query SharedExperiences {
    sharedExperiences {
      id
      userId
      title
      description
      tips
      actualCost
      rating
      imageUrls
      createdAt
      itinerary {
        id
        title
        description
        totalCost
      }
    }
  }
`;

export async function getSharedExperiencesApi(): Promise<SharedExperience[]> {
  const data = await fetchGraphQL<{ sharedExperiences: SharedExperience[] }>(SHARED_EXPERIENCES_QUERY);
  return data.sharedExperiences;
}

// 2. Publicar nueva experiencia
const SHARE_EXPERIENCE_MUTATION = `
  mutation ShareExperience($input: ShareExperienceInput!) {
    shareExperience(input: $input) {
      id
      userId
      title
      description
      tips
      actualCost
      rating
      imageUrls
      createdAt
    }
  }
`;

export async function shareExperienceApi(input: ShareExperienceInput): Promise<SharedExperience> {
  const data = await fetchGraphQL<{ shareExperience: SharedExperience }>(SHARE_EXPERIENCE_MUTATION, {
    input,
  });
  return data.shareExperience;
}
