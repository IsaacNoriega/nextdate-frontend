# 📌 NextDate Frontend — Registro de Avance y Contexto de Desarrollo

Este archivo sirve como registro vivo de las actividades realizadas, decisiones de diseño, estado de branches y tareas completadas/pendientes durante el desarrollo del frontend de **NextDate**.

---

## 🔀 Estado de Branches Git

- **Branch actual**: `feature/onboarding-profile`
- **Branch anterior**: `feature/auth-views` (Merged/Pushed a origin)
- **Branch base**: `main`
- **Propósito**: Implementación completa del Módulo 2 de Onboarding y Creación de Perfil de Usuario.

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
  - [x] Paso 1: Datos personales (Username, Fecha de Nacimiento, Género, Bio).
  - [x] Paso 2: Selección de Intereses/Categorías (`PlaceCategory` multiselect).
  - [x] Paso 3: Presupuesto (`PriceRange`) y Preferencia dietética (`DietaryPreference`).
  - [x] Paso 4: Coordenadas de Ubicación GPS (`latitude`, `longitude`) y Resumen antes de `createProfile`.

### ⏳ Módulo 3: Exploración y Descubrimiento (`(tabs)/explore`)
- [ ] Vista de Mapa Interactivo & Lista de Lugares Cercanos.
- [ ] Detalle de Lugar (`place/[id]`).

### ⏳ Módulo 4: NextDate AI & Itinerarios (`(tabs)/generator`, `itineraries`)
- [ ] Asistente por Prompt AI (`recommendItinerary`).
- [ ] Diseñador y Ejecución de Cita (`itinerary/[id]`).

### ⏳ Módulo 5: Feed de la Comunidad & Perfil (`(tabs)/feed`, `profile`)
- [ ] Feed de Citas Compartidas (`sharedExperiences`).
- [ ] Formulario de Reseña y Fotos (`experience/share`).
- [ ] Mi Perfil y Edición.

---

## 📝 Registro de Cambios (Log de Ejecución)

### [2026-07-24 / 2026-07-25]
- **Onboarding de Perfil (`src/app/(onboarding)/setup-profile.tsx`)**:
  - Implementado Stepper de 4 pasos con indicador visual de progreso.
  - Integrado con la mutation GraphQL `createProfile(input: CreateProfileInput!)`.
  - Mapeo completo de enums (`Gender`, `PlaceCategory`, `PriceRange`, `DietaryPreference`).
