# 📌 NextDate Frontend — Registro de Avance y Contexto de Desarrollo

Este archivo sirve como registro vivo de las actividades realizadas, decisiones de diseño, estado de branches y tareas completadas/pendientes durante el desarrollo del frontend de **NextDate**.

---

## 🔀 Estado de Branches Git

- **Branch actual**: `feature/map-view`
- **Branches anteriores**: `feature/user-profile`, `feature/community-feed`, `feature/ai-itineraries`, `feature/explore-places`, `feature/onboarding-profile` (Pushed a origin)
- **Branch base**: `main`
- **Propósito**: Implementación completa del Módulo 7: Mapa Interactivo de Citas, Buscador Estilo Google Maps e Itinerarios In-App.

---

## 📋 Roadmap por Módulos

### 🟢 Módulo 1: Autenticación y Onboarding (`feature/auth-views`)
- [x] Ajustar proyecto a versión estable **Expo SDK 54**.
- [x] Rediseñar raíz (`app/index.tsx`) con estética ultra-minimalista.
- [x] Implementar pantalla de Login (`app/(auth)/login.tsx`).
- [x] Implementar pantalla de Registro (`app/(auth)/register.tsx`).
- [x] Implementar pantalla de Olvidé mi Contraseña (`app/(auth)/forgot-password.tsx`).
- [x] Implementar pantalla de Restablecer Contraseña (`app/(auth)/reset-password.tsx`).

### 🟢 Módulo 2: Onboarding de Perfil (`feature/onboarding-profile`)
- [x] Crear rama de trabajo `feature/onboarding-profile`.
- [x] Diseñar e implementar flujo por pasos de Onboarding (`app/(onboarding)/setup-profile.tsx`):
  - [x] Paso 1: Datos personales (Username, Fecha de Nacimiento con Modal Nativo de Calendario, Género centrado, Bio).
  - [x] Paso 2: Selección de Intereses/Categorías (`PlaceCategory` multiselect).
  - [x] Paso 3: Presupuesto (`PriceRange`) y Preferencia dietética (`DietaryPreference`).
  - [x] Paso 4: Coordenadas de Ubicación GPS (`latitude`, `longitude`) y Resumen antes de `createProfile`.
- [x] Integrar `@react-native-community/datetimepicker` y Modal flotante centrado para Fecha de Nacimiento.
- [x] Reemplazar `SafeAreaView` por `react-native-safe-area-context` en todas las pantallas.
- [x] Alineación centrada de textos e iconos SVG en todos los botones primarios, secundarios y redes sociales.

### 🟢 Módulo 3: Exploración y Descubrimiento (`feature/explore-places`)
- [x] Crear rama de trabajo `feature/explore-places`.
- [x] Diseñar e implementar pantalla de Exploración (`app/explore.tsx`):
  - [x] Filtros por búsqueda, categorías (`PlaceCategory`) y rango de precios (`PriceRange`).
  - [x] Tarjetas de lugares con botón *"Planear Cita"* ubicado abajo a la derecha.
  - [x] Vista completa nativa con botón de cierre **"X"** superior (`top: 36px`).
  - [x] Sección de mapa de ubicación interactivo con pin GPS.
  - [x] Calificador interactivo de 5 estrellas (*Rate Plan*) colocado debajo del mapa.
  - [x] Componente reutilizable Floating Pill Bottom Navigation Bar (`src/components/ui/bottom-bar.tsx`).

### 🟢 Módulo 4: NextDate AI & Itinerarios (`feature/ai-itineraries`)
- [x] Crear rama de trabajo `feature/ai-itineraries`.
- [x] Implementar pantalla de Asistente de Citas Conversacional (`app/generator.tsx`):
  - [x] Chat en tiempo real con saludo de bienvenida e indicador de estado en línea.
  - [x] Entrada flotante estilo píldora para enviar prompts en lenguaje natural.
  - [x] Respuestas de la IA integradas sin bordes pesados con compatibilidad `✨ 98%`.
  - [x] Cronograma en formato Stepper Vertical Interactivo con nodos numéricos y línea conectora.
  - [x] Detalle de paso modal a pantalla completa con mapa, rate del plan y botón de cierre **"X"** a `top: 36px`.
  - [x] Botón ultra-premium en cápsula centrada *"✨ Guardar este Itinerario Mágico"* que cambia a `✓ ¡Itinerario Guardado con Éxito!`.

### 🟢 Módulo 5: Feed de la Comunidad & Experiencias (`feature/community-feed`)
- [x] Crear rama de trabajo `feature/community-feed`.
- [x] Implementar pantalla de Feed de la Comunidad (`app/community.tsx`):
  - [x] Header con título y botón `+ Publicar` alineado a la extrema derecha (`marginLeft: 'auto'`).
  - [x] Filtros horizontales por categorías de citas (Todas, Románticas, Naturaleza, Gastronomía, Cultura).
  - [x] Tarjetas de experiencias con avatar del autor, rating, foto a pantalla completa y reseña.
  - [x] Interacciones de Me Gusta (corazón rojo animado), comentarios y Guardar Plan en Mis Citas.
  - [x] Modal para publicar nueva experiencia con selector de estrellas y formulario.

### 🟢 Módulo 6: Perfil del Usuario & Planes Guardados (`feature/user-profile`)
- [x] Crear rama de trabajo `feature/user-profile`.
- [x] Implementar pantalla de Perfil (`app/profile.tsx`):
  - [x] Avatar de usuario con badge VIP, nombre, handle y vínculo de pareja.
  - [x] Métricas de pareja (Planes guardados, citas completadas, rating promedio).
  - [x] Pestaña de Planes Guardados con itinerarios y acceso directo a ejecución.
  - [x] Pestaña de Preferencias y Configuración con botón de Cerrar Sesión.

### 🟢 Módulo 7: Mapa Interactivo de Citas & Navegación (`feature/map-view`)
- [x] Crear rama de trabajo `feature/map-view`.
- [x] Implementar pantalla de Mapa de Navegación (`app/map.tsx`):
  - [x] Buscador superior estilo Google Maps con desplegable para elegir itinerarios guardados.
  - [x] Estado inicial sin selección con lienzo limpio e indicación de búsqueda.
  - [x] Trazado de ruta vectorial en el mapa conectando pines de pasos `(1)`, `(2)`, `(3)`.
  - [x] Motor de Navegación In-App en vivo con banners de giro a giro en tiempo real.
  - [x] Fondo vectorial realista con avenidas, río, bosque central y punto GPS de usuario.

---

## 📝 Registro de Cambios (Log de Ejecución)

### [2026-07-25]
- **Mapa de Citas In-App (`src/app/map.tsx`)**:
  - Implementada pantalla completa de Mapa Interactivo con buscador de itinerarios y navegador en vivo.

### [2026-08-14]
- **Backend Refactoring & Code Cleanup (`feature/backend-code-cleanup`)**:
  - **Manejo Centralizado de Excepciones**: Creado `GlobalGraphQLControllerAdvice.java` para unificar el tratamiento de `IllegalArgumentException` y `RuntimeException` en todas las consultas GraphQL.
  - **Refactorización de DTOs**: Eliminada la conversión manual redundante de cadenas `String` a Enums en `ProfileGraphQLController`, utilizando los tipos Enum nativos de Java (`Gender`, `DietaryPreference`, `PriceRange`, `PlaceCategory`).
  - **Configuración de CORS**: Añadidos los orígenes locales del frontend móvil (`http://localhost:8081`, `http://localhost:19006`, `http://localhost:3000`) en `application.yaml`.

- **Integración de APIs Frontend <-> Backend (`feature/api-integration`)**:
  - **Cliente API Centralizado**: Creado `src/services/api.ts` con cliente `fetchGraphQL` para ejecutar queries y mutaciones hacia Spring Boot (`http://localhost:8080/graphql`).
  - **Módulo de Autenticación (`authService.ts`)**: Conectadas pantallas de Login, Registro, Solicitud de Recuperación y Restablecimiento de Contraseña con mutaciones `login`, `registerUser`, `requestPasswordReset`, `resetPassword`.
  - **Módulo de Perfil & Onboarding (`profileService.ts`)**: Conectadas pantallas de Onboarding (`setup-profile.tsx`), Perfil (`profile.tsx`) y Edición de Perfil (`edit-profile.tsx`) con `createProfile`, `getProfileByUserId` y `updateProfile`.
  - **Módulo de Lugares & Exploración (`placeService.ts`)**: Conectada la pantalla `explore.tsx` para cargar y filtrar lugares geolocalizados en tiempo real mediante `nearbyPlaces`.
  - **Módulo NextDate AI (`itineraryService.ts`)**: Conectado el asistente conversacional `generator.tsx` con el motor de recomendaciones IA `recommendItinerary`.
  - **Módulo Comunidad (`communityService.ts`)**: Conectado el feed `community.tsx` para obtener e interactuar con experiencias de la comunidad usando `sharedExperiences` y `shareExperience`.

