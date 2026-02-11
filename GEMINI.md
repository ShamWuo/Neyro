# Project: Neyro

## Project Overview

Neyro is an AI-powered platform designed to organize your life into an "action-ready structure" using PARA (Projects, Areas, Resources, Archive) and GTD (Getting Things Done) methodologies. It aims to reduce mental overhead by intelligently classifying information, surfacing relevant tasks, and fostering a "thinking system" rather than just a notes or to-do app. The project is structured as a monorepo containing distinct mobile and web applications.

### Core Functionality
- **Low-friction capture:** Quickly input ideas and information.
- **AI organization:** Automatic classification into Projects, Areas, Resources, or Archive.
- **Action-oriented:** Always provides clear next steps.
- **Collaboration:** Allows viewing group activity, screen time, and past locations on mobile.

### Key Technologies
- **Monorepo:** Manages both mobile and web applications within a single repository.
- **TypeScript:** Primary programming language across the entire project for type safety.
- **Database:** Drizzle ORM for database schema definition and interactions, with Supabase indicated as the backend.
- **State Management:** Zustand for efficient state management in both applications.
- **AI Integration:** Utilizes `@google/generative-ai` for core AI capabilities.

#### Mobile Application (`apps/mobile`)
- **Framework:** Expo & React Native for cross-platform mobile development.
- **Routing:** Expo Router for navigation.
- **UI:** Integrates various Expo modules (e.g., `expo-sqlite`, `expo-crypto`, `expo-auth-session`, `@expo/vector-icons`).
- **Testing:** Jest and React Native Testing Library.

#### Web Application (`apps/web`)
- **Framework:** Next.js & React for server-side rendered and static web applications.
- **Styling:** Tailwind CSS for utility-first styling.
- **Animations:** Framer Motion for declarative animations.
- **Build System:** Webpack (configured via `next.config.ts`) with specific aliases for monorepo support.

## Building and Running

The project consists of two main applications: `mobile` and `web`.

### Mobile Application (`apps/mobile`)

Navigate to the `apps/mobile` directory to run these commands.

-   **Start Development Server (with tunnel):**
    ```bash
    npm start # or expo start --tunnel
    ```
-   **Run on Android Emulator/Device:**
    ```bash
    npm run android # or expo start --android
    ```
-   **Run on iOS Simulator/Device:**
    ```bash
    npm run ios # or expo start --ios
    ```
-   **Run Web Version of Mobile App:**
    ```bash
    npm run web # or expo start --web
    ```
-   **Run Linter:**
    ```bash
    npm run lint
    ```
-   **Run Tests:**
    ```bash
    npm test
    ```
-   **Generate Drizzle Migrations:**
    ```bash
    npm run db:generate
    ```
-   **Push Drizzle Schema to Database:**
    ```bash
    npm run db:push
    ```
-   **Build Android App (Production Profile):**
    ```bash
    npm run build:android
    ```
-   **Build iOS App (Production Profile):**
    ```bash
    npm run build:ios
    ```

### Web Application (`apps/web`)

Navigate to the `apps/web` directory to run these commands.

-   **Start Development Server:**
    ```bash
    npm run dev
    ```
-   **Build for Production:**
    ```bash
    npm run build
    ```
-   **Start Production Server:**
    ```bash
    npm run start
    ```
-   **Run Linter:**
    ```bash
    npm run lint
    ```

## Development Conventions

-   **TypeScript First:** All new code should be written in TypeScript.
-   **Monorepo Best Practices:** Changes should consider impacts on both mobile and web applications, especially when modifying shared types or logic.
-   **Drizzle ORM:** Database schema changes and queries should be managed through Drizzle ORM.
-   **Zustand:** Prefer Zustand for local and global state management.
-   **Consistent File Structure:** Adhere to the existing `src` directory structure (e.g., `components`, `context`, `hooks`, `services`, `types`, `utils`).
-   **AI Integration:** Leverage the `@google/generative-ai` library for AI features, ensuring API key management is handled securely via environment variables (`EXPO_PUBLIC_GEMINI_API_KEY`).
-   **Environment Variables:** Sensitive information and configuration differences across environments should be managed using environment variables (e.g., `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
-   **Web Transpilation:** `next.config.ts` handles transpilation of shared packages (like `neyro-mobile`) and Expo modules for web compatibility.

## Current Gemini Agent Context
- When adding or updating a church, the church list needs to be updated in multiple files: `types/index.ts`, `components/forms/registration/contact-info-step.tsx`, `app/page.tsx`, `app/admin/users/page.tsx`, `app/admin/reports/page.tsx`, `app/admin/registrations/[id]/page.tsx`, `components/admin/edit-registration-modal.tsx`, and `lib/validations/registration.ts`.
