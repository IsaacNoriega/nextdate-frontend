export type FeedCategory = 'ALL' | 'ROMANTIC' | 'OUTDOOR' | 'GASTRO' | 'CULTURE';

export interface SharedExperienceItem {
  id: string;
  authorName: string;
  partnerName: string;
  authorAvatar: string;
  timeAgo: string;
  planTitle: string;
  placeName: string;
  location?: string;
  budget?: string;
  gastroTags?: string[];
  rating: number;
  likesCount: number;
  commentsCount: number;
  imageUrl: string;
  imageUrls?: string[];
  reviewText: string;
  category: FeedCategory;
  latitude?: number;
  longitude?: number;
}

export const GASTRO_PREFERENCES = [
  'Italiana & Pasta',
  'Mexicana & Tacos',
  'Sushi & Asiática',
  'Cocteles & Bar',
  'Postres & Café',
  'Cortes de Carne',
  'Mariscos',
  'Vegetariana/Vegana',
  'Comida Fusión',
  'Brunch & Hamburguesas',
];

export const BUDGET_OPTIONS = [
  { id: '$', label: '$ Económico', desc: '< $300 MXN' },
  { id: '$$', label: '$$ Moderado', desc: '$300 - $700 MXN' },
  { id: '$$$', label: '$$$ Elevado', desc: '$700 - $1,500 MXN' },
  { id: '$$$$', label: '$$$$ Lujo', desc: '> $1,500 MXN' },
];

export const DEFAULT_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=80',
];

export const FEED_CATEGORIES: { id: FeedCategory; label: string }[] = [
  { id: 'ALL', label: 'Todas' },
  { id: 'ROMANTIC', label: 'Románticas' },
  { id: 'OUTDOOR', label: 'Naturaleza' },
  { id: 'GASTRO', label: 'Gastronomía' },
  { id: 'CULTURE', label: 'Cultura' },
];

export const INITIAL_COMMUNITY_POSTS: SharedExperienceItem[] = [
  {
    id: 'exp-mock-1',
    authorName: 'Sofía & Mateo',
    partnerName: 'Mateo',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    timeAgo: 'Hace 2 horas',
    planTitle: 'Noche romántica en Chapultepec',
    placeName: 'Trattoria & Jazz Bar',
    location: 'Colonia Americana, GDL',
    budget: '$$',
    gastroTags: ['Italiana & Pasta', 'Cocteles & Bar'],
    rating: 5,
    likesCount: 24,
    commentsCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    reviewText: 'La mejor pasta artesanal y un ambiente increíble con luces tenues y música en vivo. Muy recomendado para parejas.',
    category: 'ROMANTIC',
  },
  {
    id: 'exp-mock-2',
    authorName: 'Carlos & Fer',
    partnerName: 'Fer',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timeAgo: 'Ayer',
    planTitle: 'Paseo al atardecer y gelato',
    placeName: 'Parque Metropolitano & Heladería',
    location: 'Zapopan, Jal.',
    budget: '$',
    gastroTags: ['Postres & Café'],
    rating: 5,
    likesCount: 18,
    commentsCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    reviewText: 'Plan perfecto para una tarde relajada, caminata alrededor del lago y helado artesanal de pistache.',
    category: 'OUTDOOR',
  },
];
