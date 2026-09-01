export interface ItineraryStep {
  stepNumber: number;
  time: string;
  title: string;
  placeName: string;
  categoryEmoji: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  duration: string;
  notes: string;
  transportMode: string;
  transitTime: string;
  cost: string;
  estimatedCost?: string;
  imageUrl: string;
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  tagline: string;
  totalDuration?: string;
  totalCost: string;
  matchScore: number;
  steps: ItineraryStep[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  itinerary?: GeneratedItinerary;
  timestamp: string;
}

export const QUICK_PROMPTS = [
  'Cita romántica de aniversario',
  'Día casual al aire libre',
  'Noche de gastronomía y cócteles',
  'Plan relajado de café y arte',
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: '¡Hola! 💫 Soy el Concierge de IA de NextDate. ¿Qué tipo de cita o plan tienen en mente para hoy? (Ej: "Cita tranquila con café y parque", "Cena romántica con coctelería")',
    timestamp: 'Ahora',
  },
];

export const MOCK_GENERATED_ITINERARY: GeneratedItinerary = {
  id: 'rec-itinerary-1',
  title: 'Noche Mágica en la Americana',
  tagline: 'Basado en tus preferencias de ambiente romántico y alta gastronomía',
  totalDuration: '3.5 Horas',
  totalCost: '$120.00 USD',
  matchScore: 98,
  steps: [
    {
      stepNumber: 1,
      time: '19:00 hrs',
      title: 'Coctelería de Autor',
      placeName: 'Terraza Luna Gastro Bar',
      categoryEmoji: '🍷',
      address: 'Av. Chapultepec Sur 340, Americana',
      latitude: 20.6745,
      longitude: -103.3702,
      duration: '60 min',
      notes: 'Reservar mesa en el área exterior para disfrutar la iluminación de la terraza.',
      transportMode: 'WALKING',
      transitTime: '15 min a pie',
      cost: '$40.00',
      estimatedCost: '$40.00 USD',
      description: 'Coctelería artesanal y bocadillos con vista panorámica de la ciudad.',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    },
    {
      stepNumber: 2,
      time: '20:15 hrs',
      title: 'Cena Gastro',
      placeName: 'Restaurante Fuego & Leña',
      categoryEmoji: '🍽️',
      address: 'Calle López Cotilla 1520',
      latitude: 20.6725,
      longitude: -103.3611,
      duration: '90 min',
      notes: 'Probar el menú degustación y pedir maridaje con vino tinto local.',
      transportMode: 'WALKING',
      transitTime: '10 min a pie',
      cost: '$65.00',
      estimatedCost: '$65.00 USD',
      description: 'Pasta artesanal italiana, vino tinto de la casa y ambiente romántico.',
      imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80',
    },
    {
      stepNumber: 3,
      time: '22:00 hrs',
      title: 'Caminata Nocturna & Helado',
      placeName: 'Paseo Chapultepec',
      categoryEmoji: '🍦',
      address: 'Camellón Chapultepec Sur',
      latitude: 20.6710,
      longitude: -103.3690,
      duration: '45 min',
      notes: 'Cierre perfecto disfrutando del clima nocturno y los helados artesanales.',
      transportMode: 'NONE',
      transitTime: 'Lugar final',
      cost: '$15.00',
      estimatedCost: '$15.00 USD',
      description: 'Paseo tranquilo degustando helado italiano artesanal.',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    },
  ],
};
