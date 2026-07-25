# 📱 NextDate Frontend — Expo App & Especificación de Pantallas

Este proyecto es una aplicación universal desarrollada con **React Native**, **Expo** y **Expo Router**, integrada con el backend de **NextDate** mediante **GraphQL**.

---

## 🚀 Inicio Rápido (Get Started)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
npx expo start
```

Opciones de ejecución:
- [Desarrollo en Android (Emulador)](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Desarrollo en iOS (Simulador)](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go App](https://expo.dev/go)

---

## 📐 1. Mapeo de Datos y Tipos del Backend (Enums & Models)

### Enums GraphQL (`schema.graphqls`)
- **`PlaceCategory`**: `FOOD_DRINK`, `CULTURE`, `NATURE`, `ENTERTAINMENT`, `SHOPPING`, `SPORTS`, `OTHER`
- **`PriceRange`**: `CHEAP`, `MODERATE`, `EXPENSIVE`, `LUXURY`
- **`DietaryPreference`**: `NONE`, `VEGETARIAN`, `VEGAN`, `GLUTEN_FREE`, `DAIRY_FREE`, `PESCATARIAN`, `OTHER`
- **`TransportType`**: `WALKING`, `DRIVING`, `TRANSIT`, `CYCLING`, `NONE`
- **`Gender`**: `MALE`, `FEMALE`, `OTHER`

---

## 🗺️ 2. Mapa de Navegación y Rutas (Expo Router)

```text
app/
├── (auth)/
│   ├── login.tsx            # Iniciar Sesión
│   ├── register.tsx         # Registro de Usuario
│   ├── forgot-password.tsx  # Solicitud de reestablecer contraseña
│   └── reset-password.tsx   # Ingreso de token y nueva contraseña
├── (onboarding)/
│   └── setup-profile.tsx    # Configuración inicial del perfil de usuario
├── (tabs)/
│   ├── _layout.tsx          # Tab Bar Navigation (5 Pestañas)
│   ├── explore.tsx          # Tab 1: Explorar Lugares y Mapa
│   ├── generator.tsx        # Tab 2: Generador de Citas AI (NextDate AI)
│   ├── itineraries.tsx      # Tab 3: Mis Citas / Itinerarios
│   ├── feed.tsx             # Tab 4: Experiencias de la Comunidad
│   └── profile.tsx          # Tab 5: Mi Perfil
├── place/
│   ├── [id].tsx             # Detalle de un Lugar
│   └── create.tsx           # Registrar nuevo lugar (Opcional/Comunidad)
├── itinerary/
│   ├── [id].tsx             # Detalle / Modo Ejecución de Cita (Timeline)
│   └── create.tsx           # Editor / Creador manual de itinerario
├── experience/
│   ├── [id].tsx             # Detalle de una Experiencia Compartida
│   └── share.tsx            # Publicar reseña y fotos de cita completada
└── profile/
    └── edit.tsx             # Editar preferencias del perfil
```

---

## 🖥️ 3. Especificación Detallada por Pantalla

---

### Módulo 1: Autenticación y Onboarding

#### 1.1 Login (`app/(auth)/login.tsx`)
- **Objetivo**: Autenticar al usuario registrado y almacenar el token JWT.
- **GraphQL Mutation**: `login(input: LoginInput!) : LoginResult`
  - *Input*: `{ email, password }`
  - *Output*: `{ token, user { id, email, active } }`
- **Componentes UI**:
  - Campos de entrada: Email (keyboardType: email-address), Contraseña (secureTextEntry).
  - Botón: "Iniciar Sesión".
  - Enlaces: "¿Olvidaste tu contraseña?" (`/forgot-password`), "Crear Cuenta" (`/register`).
- **Comportamiento**: Al recibir el JWT token, guardarlo en SecureStore / AsyncStorage y redirigir a `(tabs)/explore` (o `(onboarding)/setup-profile` si no tiene perfil).

#### 1.2 Registro (`app/(auth)/register.tsx`)
- **Objetivo**: Crear un nuevo usuario en la plataforma.
- **GraphQL Mutation**: `registerUser(input: RegisterUserInput!) : User`
  - *Input*: `{ email, password }`
  - *Output*: `{ id, email, active }`
- **Componentes UI**:
  - Campos: Email, Contraseña, Confirmar Contraseña.
  - Validaciones de formato de correo y fortaleza de contraseña en cliente.
- **Flujo**: Al registrar exitosamente, realizar `login` automático y redirigir a Onboarding (`setup-profile`).

#### 1.3 Olvidé mi Contraseña & Reset (`app/(auth)/forgot-password.tsx`, `reset-password.tsx`)
- **GraphQL Mutations**:
  - `requestPasswordReset(email: String!) : Boolean!`
  - `resetPassword(input: ResetPasswordInput!) : Boolean!`
- **UI**: Formulario para solicitar el token por email y pantalla para ingresar el token recibido con la nueva contraseña.

#### 1.4 Onboarding — Configuración de Perfil (`app/(onboarding)/setup-profile.tsx`)
- **Objetivo**: Completar las preferencias e información básica del usuario para personalizar la generación de citas.
- **GraphQL Mutation**: `createProfile(input: CreateProfileInput!) : Profile!`
  - *Input*:
    - `userId`: String!
    - `username`: String!
    - `birthdate`: String! (Formato: `"YYYY-MM-DD"`)
    - `gender`: Gender! (`MALE`, `FEMALE`, `OTHER`)
    - `bio`: String
    - `latitude`, `longitude`: Float! (Ubicación actual via Expo Location)
    - `dietaryPreference`: DietaryPreference!
    - `preferredPriceRange`: PriceRange!
    - `interests`: `[PlaceCategory!]!`
- **Componentes UI**:
  - Paso 1: Foto de perfil, Nombre de usuario, Fecha de nacimiento (DatePicker), Género, Bio.
  - Paso 2: Chips multiselect para `interests` (Gastronomía, Cultura, Naturaleza, Entretenimiento, etc.).
  - Paso 3: Selección de `preferredPriceRange` (Cheap, Moderate, Expensive, Luxury) y `dietaryPreference`.
  - Paso 4: Botón para solicitar permisos de Ubicación GPS.

---

### Módulo 2: Exploración y Descubrimiento (Places)

#### 2.1 Explorar / Mapa Interactivo (`app/(tabs)/explore.tsx`)
- **Objetivo**: Descubrir lugares cercanos y explorar opciones para citas.
- **GraphQL Queries**:
  - `nearbyPlaces(latitude: Float!, longitude: Float!, radiusInKm: Float!, category: PlaceCategory) : [Place!]!`
- **Componentes UI**:
  - Selector de vista: **Mapa** vs **Lista**.
  - Barra de búsqueda y Filtros Rápidos (Chips):
    - Categoría (`PlaceCategory`)
    - Radio de distancia (slider: 1 km - 50 km)
  - Marcadores interactivos en mapa (react-native-maps) con Callouts resumen del lugar.
  - Tarjeta de Lugar: Nombre, categoría (badge), rango de precio (`$`, `$$`, `$$$`, `$$$$`), dirección.

#### 2.2 Detalle del Lugar (`app/place/[id].tsx`)
- **Objetivo**: Ver la ficha completa de un lugar y poder agregarlo a una cita.
- **GraphQL Query**: `placeById(id: ID!) : Place`
- **Componentes UI**:
  - Mapa minimizado con la ubicación exacta.
  - Etiqueta de Categoría y Rango de Precio.
  - Dirección completa y descripción del ambiente/lugar.
  - Botón destacado: **"Agregar a una Cita"** (abre modal para añadir a un itinerario borrador).

#### 2.3 Crear / Sugerir Lugar (`app/place/create.tsx`)
- **GraphQL Mutation**: `createPlace(input: CreatePlaceInput!) : Place!`
- **UI**: Formulario con nombre, descripción, categoría (picker), rango de precio (picker), dirección y selector de coordenadas en mapa.

---

### Módulo 3: Creador de Citas & IA (Itineraries & Recommendation)

#### 3.1 Generador inteligente NextDate AI (`app/(tabs)/generator.tsx`)
- **Objetivo**: Crear itinerarios completos y optimizados mediante inteligencia artificial basándose en un prompt en lenguaje natural.
- **GraphQL Mutation**: `recommendItinerary(input: RecommendItineraryInput!): Itinerary!`
  - *Input*: `{ userId: ID!, prompt: String! }`
  - *Output*: `Itinerary` (con `items` ordenados, costo estimado y detalles de transporte)
- **Componentes UI**:
  - Campo de entrada de Prompt amplio (ej. *"Cita tranquila de tarde con café, librería y cena de sushi en zona centro"*).
  - Sugerencias rápidas (Chips): *"Cita Económica"*, *"Cita Romántica de Noche"*, *"Cita al Aire Libre"*.
  - Indicador de Carga Animado (Skeleton / Lottie) durante el proceso de generación de IA.
  - Vista previa del itinerario resultante con opción de **"Guardar Cita"** o **"Personalizar"**.

#### 3.2 Mis Itinerarios / Mis Citas (`app/(tabs)/itineraries.tsx`)
- **Objetivo**: Ver y gestionar todos los itinerarios creados o guardados.
- **GraphQL Query**: `itinerariesByUserId(userId: ID!) : [Itinerary!]!`
- **Componentes UI**:
  - Lista de Tarjetas de Cita: Título, descripción, costo total (`totalCost`), cantidad de lugares/paradas, fecha de creación.
  - Filtro: Activos vs Completados.
  - Botón flotante (+): Crear itinerario manualmente o ir al Generador AI.

#### 3.3 Editor de Itinerario (`app/itinerary/create.tsx`)
- **Objetivo**: Crear o ajustar manualmente una secuencia de paradas para una cita.
- **GraphQL Mutation**: `createItinerary(input: CreateItineraryInput!) : Itinerary!`
  - *Input*: `{ userId, title, description, totalCost, items: [CreateItineraryItemInput!]! }`
  - *Item Input*: `{ placeId, sequenceOrder, durationInMinutes, notes, transportToNext, transitTimeToNext }`
- **Componentes UI**:
  - Lista arrastrable / reordenable de paradas (paradas de la cita).
  - Modal para agregar lugar (buscando de `nearbyPlaces`).
  - Configuración por parada: Tiempo de permanencia (minutos), notas especiales, tipo de transporte hacia la siguiente parada (`WALKING`, `DRIVING`, `TRANSIT`, `CYCLING`).

#### 3.4 Detalle / Vista en Vivo de Cita (`app/itinerary/[id].tsx`)
- **Objetivo**: Guiar a los usuarios durante la cita.
- **GraphQL Query**: `itineraryById(id: ID!) : Itinerary`
- **Componentes UI**:
  - Línea de tiempo (Timeline) con las paradas en orden (`sequenceOrder`).
  - Desglose de tiempos de viaje entre paradas.
  - Mapa integrado mostrando la ruta completa de la cita.
  - Botón flotante: **"Finalizar Cita y Compartir Experiencia"** (`/experience/share`).

---

### Módulo 4: Feed y Comunidad (Shared Experiences)

#### 4.1 Feed de Experiencias Compartidas (`app/(tabs)/feed.tsx`)
- **Objetivo**: Inspirarse con citas reales que otros usuarios han vivido y compartido.
- **GraphQL Query**: `sharedExperiences : [SharedExperience!]!`
- **Componentes UI**:
  - Feed de tarjetas visuales (estilo red social):
    - Usuario creador.
    - Carrusel de fotos (`imageUrls`).
    - Rating con estrellas ⭐ (1 a 5).
    - Título, descripción y tips del usuario.
    - Costo real gastado (`actualCost`).
    - Resumen del itinerario realizado.
  - Botón *"Usar este Itinerario"* (clona la cita a mis itinerarios).

#### 4.2 Publicar Experiencia (`app/experience/share.tsx`)
- **Objetivo**: Subir la reseña y fotos de una cita realizada.
- **GraphQL Mutation**: `shareExperience(input: ShareExperienceInput!): SharedExperience!`
  - *Input*: `{ userId, itineraryId, title, description, tips, actualCost, rating, imageUrls }`
- **Componentes UI**:
  - Selector de Itinerario completado.
  - Calificación en estrellas (1-5).
  - Carga de fotos desde la galería del dispositivo.
  - Campo para ingresar el costo real pagado (`actualCost`).
  - Sección de Tips/Consejos (*"Reservar con 2 días de anticipación", "Llegar 10 min antes"*).

#### 4.3 Detalle de Experiencia (`app/experience/[id].tsx`)
- **UI**: Vista completa de la experiencia compartida con fotos en alta resolución, itinerario desglosado paso a paso y comentarios/tips.

---

### Módulo 5: Perfil de Usuario y Ajustes

#### 5.1 Perfil del Usuario (`app/(tabs)/profile.tsx`)
- **Objetivo**: Consultar los datos del usuario, sus estadísticas y sus publicaciones.
- **GraphQL Queries**:
  - `profileByUserId(userId: ID!) : Profile`
  - `sharedExperiencesByUserId(userId: ID!): [SharedExperience!]!`
- **Componentes UI**:
  - Cabecera: Avatar, Username, Bio, Género, Edad (calculada desde `birthdate`).
  - Badges de Preferencias: Dieta (`dietaryPreference`), Presupuesto (`preferredPriceRange`), Intereses.
  - Pestañas internas:
    - **Mis Experiencias Compartidas**: Grid de fotos de publicaciones pasadas.
    - **Mis Citas Guardadas**.
  - Botón: "Editar Perfil" (`/profile/edit`).

#### 5.2 Editar Perfil (`app/profile/edit.tsx`)
- **GraphQL Mutation**: `updateProfile(input: UpdateProfileInput!) : Profile!`
- **UI**: Permite modificar `username`, `bio`, `dietaryPreference`, `preferredPriceRange`, `interests`, y refrescar coordenadas GPS.

---

## 🛠️ 4. Recomendaciones Técnicas para el Frontend (Expo / React Native)

1. **Cliente GraphQL**: Utilizar **Apollo Client** o **urql** configurado con caché local y soporte para tokens JWT en el header `Authorization: Bearer <token>`.
2. **Navegación**: **Expo Router (File-based Routing)** con layouts desacoplados para Auth, Onboarding, Tabs principales y Modales.
3. **Mapas**: Integrar `react-native-maps` para iOS/Android y web fallbacks.
4. **Almacenamiento de Token**: `expo-secure-store` para mantener persistente la sesión del usuario.
5. **Geolocalización**: `expo-location` para obtener `latitude` y `longitude` en búsquedas de `nearbyPlaces` y `nearbyProfiles`.
