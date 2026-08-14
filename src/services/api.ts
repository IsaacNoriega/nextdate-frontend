import { Platform } from 'react-native';

// URL del backend GraphQL
// Para Android Emulator se usa 10.0.2.2 o la IP local de tu máquina; para iOS/Web se usa localhost
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/graphql';
  }
  return 'http://localhost:8080/graphql';
};

export const API_URL = getApiUrl();

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function fetchGraphQL<T>(queryOrMutation: string, variables?: Record<string, any>): Promise<T> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: queryOrMutation,
        variables,
      }),
    });

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message || 'Error en el servidor GraphQL');
    }

    if (!json.data) {
      throw new Error('No se recibieron datos del servidor');
    }

    return json.data;
  } catch (error: any) {
    if (error.message && error.message.includes('Network request failed')) {
      throw new Error('No se pudo conectar con el servidor backend (Asegúrate de tener corriendo Spring Boot)');
    }
    throw error;
  }
}
