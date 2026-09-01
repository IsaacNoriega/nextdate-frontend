export interface RouteStep {
  stepNumber: number;
  time: string;
  title: string;
  placeName: string;
  categoryEmoji: string;
  address: string;
  description: string;
  imageUrl: string;
  estimatedCost?: string;
  turnInstruction: string;
  distanceRemaining: string;
  eta: string;
  lat: number;
  lng: number;
}

export interface SavedItineraryOption {
  id: string;
  title: string;
  tagline: string;
  totalDistance: string;
  totalTime: string;
  matchScore: number;
  steps: RouteStep[];
}

export const STATIC_ITINERARIES: SavedItineraryOption[] = [
  {
    id: 'itin-1',
    title: 'Noche Mágica en la Americana',
    tagline: 'Coctelería de autor, cena gourmet y caminata bajo las estrellas.',
    totalDistance: '2.4 km',
    totalTime: '12 min',
    matchScore: 98,
    steps: [
      {
        stepNumber: 1,
        time: '18:30',
        title: 'Cócteles de Autor al Atardecer',
        placeName: 'Terraza Luna Gastro Bar',
        categoryEmoji: '🍸',
        address: 'Av. Chapultepec Sur 340, Americana',
        description: 'Coctelería artesanal y bocadillos con vista panorámica de la ciudad.',
        imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=80',
        estimatedCost: '$350 MXN',
        turnInstruction: 'Inicia en Av. Chapultepec Sur en dirección sur.',
        distanceRemaining: '500m',
        eta: '2 min',
        lat: 20.6745,
        lng: -103.3702,
      },
      {
        stepNumber: 2,
        time: '19:45',
        title: 'Cena a la Luz de las Velas',
        placeName: 'Trattoria Barrio Americana',
        categoryEmoji: '🍝',
        address: 'Calle López Cotilla 1420, Americana',
        description: 'Pasta artesanal italiana, vino tinto de la casa y ambiente romántico.',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        estimatedCost: '$480 MXN',
        turnInstruction: 'Continúa recto durante 600m por Calle López Cotilla.',
        distanceRemaining: '1.1 km',
        eta: '5 min',
        lat: 20.6725,
        lng: -103.3654,
      },
      {
        stepNumber: 3,
        time: '21:15',
        title: 'Postre & Paseo Nocturno',
        placeName: 'Jardín Botánico & Gelato',
        categoryEmoji: '🍦',
        address: 'Camino del Jardín s/n',
        description: 'Gelato artesanal italiano y paseo tranquilo bajo las estrellas.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        estimatedCost: '$120 MXN',
        turnInstruction: 'Gira a la izquierda al final de la avenida.',
        distanceRemaining: '950m',
        eta: '4 min',
        lat: 20.6708,
        lng: -103.3612,
      },
    ],
  },
];
