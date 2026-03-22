# Neyro - AI-Powered Productivity for the Neurodivergent

Neyro is a "Second Brain" application designed specifically for neurodivergent minds (ADHD, Autism, etc.). It moves beyond simple task lists to offer **context-aware**, **energy-based**, and **agentic** productivity support.

## 🌟 Key Features

### 1. Adaptive AI & Personalization
- **Style Mirroring**: The AI learns your communication style from your notes and mimics it in drafts.
- **Auto-Sorting**: "Dump" thoughts into the Inbox, and Neyro classifies them into Projects, Areas, or Resources automatically.
- **Negative Constraints**: Define what you *don't* want (e.g., "Don't schedule deep work after 2 PM").

### 2. Agentic Workflows
- **Task Preparation**: Tap the "Sparkles" icon on any task to have an agent pre-research and draft an outline for you.
- **Smart Drafting**: Generate emails or documents based on your rough bullet points.

### 3. Predictive Analytics
- **Burnout Buffer**: Detects when you're overcommitting and warns you before you crash.
- **Energy-Based Scheduling**: Schedules demanding tasks during your self-defined "Prime Time".
- **Project Velocity**: Tracks your real completion rate to predict actual deadlines.

### 4. "The Forest" (Visual Connectivity)
- Visualize your projects and areas as a living ecosystem.
- See at a glance what is thriving (active/green) and what is withering (stagnant).

### 5. Focus Mode Shield
- A dedicated timer that protects your flow state.
- **Context Switch Shield**: Prevents accidental exits by asking "Are you sure?" and offering a "Quick Capture" buffer instead.

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Database**: SQLite (via Drizzle ORM) - Local-First Architecture
- **State Management**: Zustand
- **AI Integration**: Mocked Service Architecture (Ready for Gemini/OpenAI integration)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go app on your phone (or Simulator)

### Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Run the App**:
    ```bash
    npx expo start
    ```

3.  **Scan QR Code**: Use your Android/iOS device to scan the code from the terminal.

## 📂 Project Structure

- `app/`: Expo Router screens (file-based routing).
- `src/components/`: Reusable UI components.
- `src/database/`: Drizzle schema, migrations, and client.
- `src/services/`: Business logic (AI, Analytics, Collaboration).
- `src/store/`: Zustand stores (`useNeyroStore`, `useUIStore`).

## 🤝 Collaboration (Phase 5)

- **Share Areas**: Invite others to specific Areas of your life.
- **PARA Templates**: Publish your project structures for the community.

---

*Built with ❤️ by the Neyro Team.*
