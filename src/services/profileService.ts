import { fetchGraphQL } from './api';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type PlaceCategory = 'FOOD_DRINK' | 'CULTURE' | 'NATURE' | 'ENTERTAINMENT' | 'SHOPPING' | 'SPORTS' | 'OTHER';
export type PriceRange = 'CHEAP' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY';
export type DietaryPreference = 'NONE' | 'VEGETARIAN' | 'VEGAN' | 'GLUTEN_FREE' | 'DAIRY_FREE' | 'PESCATARIAN' | 'OTHER';

export interface Profile {
  id: string;
  userId: string;
  username: string;
  birthdate: string;
  gender: Gender;
  bio?: string;
  latitude: number;
  longitude: number;
  active: boolean;
  dietaryPreference: DietaryPreference;
  preferredPriceRange: PriceRange;
  interests: PlaceCategory[];
}

export interface CreateProfileInput {
  userId: string;
  username: string;
  birthdate: string;
  gender: Gender;
  bio?: string;
  latitude: number;
  longitude: number;
  dietaryPreference: DietaryPreference;
  preferredPriceRange: PriceRange;
  interests: PlaceCategory[];
}

export interface UpdateProfileInput {
  id: string;
  userId: string;
  username?: string;
  birthdate?: string;
  gender?: Gender;
  bio?: string;
  latitude?: number;
  longitude?: number;
  dietaryPreference?: DietaryPreference;
  preferredPriceRange?: PriceRange;
  interests?: PlaceCategory[];
}

// 1. Obtener perfil por ID de usuario
const PROFILE_BY_USER_ID_QUERY = `
  query ProfileByUserId($userId: ID!) {
    profileByUserId(userId: $userId) {
      id
      userId
      username
      birthdate
      gender
      bio
      latitude
      longitude
      active
      dietaryPreference
      preferredPriceRange
      interests
    }
  }
`;

export async function getProfileByUserIdApi(userId: string): Promise<Profile | null> {
  const data = await fetchGraphQL<{ profileByUserId: Profile | null }>(PROFILE_BY_USER_ID_QUERY, {
    userId,
  });
  return data.profileByUserId;
}

// 2. Crear perfil
const CREATE_PROFILE_MUTATION = `
  mutation CreateProfile($input: CreateProfileInput!) {
    createProfile(input: $input) {
      id
      userId
      username
      birthdate
      gender
      bio
      latitude
      longitude
      active
      dietaryPreference
      preferredPriceRange
      interests
    }
  }
`;

export async function createProfileApi(input: CreateProfileInput): Promise<Profile> {
  const data = await fetchGraphQL<{ createProfile: Profile }>(CREATE_PROFILE_MUTATION, {
    input,
  });
  return data.createProfile;
}

// 3. Actualizar perfil
const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      userId
      username
      birthdate
      gender
      bio
      latitude
      longitude
      active
      dietaryPreference
      preferredPriceRange
      interests
    }
  }
`;

export async function updateProfileApi(input: UpdateProfileInput): Promise<Profile> {
  const data = await fetchGraphQL<{ updateProfile: Profile }>(UPDATE_PROFILE_MUTATION, {
    input,
  });
  return data.updateProfile;
}
