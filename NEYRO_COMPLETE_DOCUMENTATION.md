# Neyro - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [State Management](#state-management)
8. [Services](#services)
9. [Web App Features](#web-app-features)
10. [Mobile App Features](#mobile-app-features)
11. [API Integration](#api-integration)
12. [Development Guide](#development-guide)
13. [Deployment](#deployment)

---

## Overview

**Neyro** is an AI-powered productivity platform that helps users organize their life using the PARA method (Projects, Areas, Resources, Archive) and GTD (Getting Things Done) principles. It automatically organizes thoughts, notes, and research into action-ready structures while allowing collaboration and productivity tracking.

### Core Philosophy
- **Capture First, Organize Later**: Get ideas out of your head instantly
- **AI Organization**: Structure happens automatically
- **Action-Oriented**: Always know what to do next
- **PARA + GTD at Core**: Proven systems, intelligently applied

---

## Architecture

### Monorepo Structure
```
neyro/
├── apps/
│   ├── mobile/          # React Native + Expo app
│   └── web/              # Next.js web app
├── package.json          # Root workspace config
└── tsconfig.json         # Shared TypeScript config
```

### Data Flow
1. **Local-First**: SQLite database (via Drizzle ORM) for offline-first experience
2. **Cloud Sync**: Supabase for cross-device synchronization
3. **State Management**: Zustand stores for reactive UI updates
4. **AI Processing**: Google Gemini API for classification and smart features

---

## Features

### Core Features (Both Platforms)

#### 1. Inbox
- **Purpose**: Universal capture point for all inputs
- **Types Supported**: Text, Images, Voice, Checklists
- **AI Classification**: Automatically suggests where items should go
- **Quick Capture**: Fast input with keyboard shortcuts
- **Processing**: Manual or AI-assisted classification into Projects/Areas/Resources/Archive

#### 2. Projects
- **Status Types**: Active, Paused, Completed
- **Project Management**: 
  - Title, Description, Outcome
  - Task lists with progress tracking
  - Notes and resources
  - Health scoring
- **Task System**:
  - Add, toggle, delete tasks
  - Task notes and preparation status
  - Resource links
  - Due dates

#### 3. Areas
- **Life Areas**: Ongoing responsibilities (Health, Finance, Career, etc.)
- **Health Scoring**: 1-5 rating system
- **Area Management**: Track and maintain balance across life areas

#### 4. Resources
- **Folder Structure**: Hierarchical organization
- **Types**: Links, PDFs, Images, Audio, Notes
- **Note Editor**: Rich text notes attached to resources
- **Resource Management**: Archive, restore, delete

#### 5. Archive
- **Completed Projects**: Historical record of finished work
- **Paused Projects**: Inactive projects
- **Archived Resources**: Reference materials
- **Restore/Delete**: Reactivate or permanently remove

#### 6. Focus Mode
- **Timer**: Pomodoro-style focus sessions
- **Project/Task Selection**: Focus on specific work
- **Session Logging**: Track time spent
- **Calendar Integration**: Optional sync to calendar
- **Context Switch Shield**: Prevents accidental exits

#### 7. Weekly Review
- **4-Step Process**:
  1. Intro: Overview and time estimate
  2. Clear Inbox: Process unprocessed items
  3. Review Projects: Mark completed or pause inactive
  4. Assess Areas: Rate life areas 1-5
  5. Summary: Completion confirmation
- **Guided Flow**: Step-by-step review process

#### 8. Statistics
- **Streaks**: Current and longest focus streaks
- **Time Tracking**: Today, this week, all-time focus minutes
- **Daily Goal Progress**: Progress toward daily focus goal
- **Weekly Chart**: Visual representation of last 7 days
- **Most Active Project**: Project with most focus time

#### 9. History
- **Focus Sessions**: Complete history of all sessions
- **Filtering**: All, Today, Week, Month
- **Session Details**: Project, duration, date, notes

#### 10. Schedule
- **AI-Powered Planning**: Generate weekly schedules
- **Scheduled Sessions**: Plan focus time in advance
- **Session Management**: Edit, complete, delete sessions
- **Time Blocking**: Allocate time for projects

#### 11. Community/Network
- **Connections**: Connect with other users
- **Collaboration**: Share areas and resources
- **Social Features**: View group activity (mobile)

#### 12. Settings
- **Account**: Profile management
- **Notifications**: Configure preferences
- **Focus Settings**: Daily goal, calendar integration
- **Appearance**: Theme preferences
- **Data Export**: Download all user data

---

## Tech Stack

### Mobile App (React Native + Expo)
- **Framework**: React Native with Expo Router
- **State Management**: Zustand
- **Database**: SQLite via Drizzle ORM
- **Styling**: React Native StyleSheet + ThemeContext
- **Navigation**: Expo Router (file-based routing)
- **AI**: Google Generative AI (Gemini)
- **Cloud Sync**: Supabase

### Web App (Next.js)
- **Framework**: Next.js 16 (App Router)
- **State Management**: Zustand (shared with mobile)
- **Database**: SQLite via Drizzle ORM (browser IndexedDB)
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components + Lucide icons
- **Animations**: Framer Motion
- **AI**: Google Generative AI (Gemini)

### Shared
- **ORM**: Drizzle ORM
- **Type System**: TypeScript
- **Package Manager**: npm workspaces

---

## Project Structure

### Mobile App (`apps/mobile/`)
```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── inbox/         # Inbox screens
│   │   ├── projects/      # Project screens
│   │   ├── areas/          # Area screens
│   │   ├── resources/      # Resource screens
│   │   ├── community/      # Community screen
│   │   └── menu/           # Menu/Settings
│   ├── focus.tsx          # Focus mode screen
│   ├── review.tsx         # Weekly review screen
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   ├── context/           # React contexts (Theme, etc.)
│   ├── database/          # Database schema & client
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic services
│   ├── store/             # Zustand stores
│   └── utils/             # Utility functions
├── assets/                 # Images, fonts, etc.
└── package.json
```

### Web App (`apps/web/`)
```
web/
├── app/                    # Next.js App Router
│   ├── (app)/             # Main app routes (protected)
│   │   ├── page.tsx       # Dashboard
│   │   ├── inbox/         # Inbox page
│   │   ├── projects/      # Projects pages
│   │   ├── areas/         # Areas pages
│   │   ├── resources/     # Resources page
│   │   ├── archive/       # Archive page
│   │   ├── focus/         # Focus mode page
│   │   ├── review/        # Weekly review page
│   │   ├── stats/         # Statistics page
│   │   ├── history/       # History page
│   │   ├── schedule/      # Schedule page
│   │   ├── community/     # Community page
│   │   ├── settings/      # Settings page
│   │   └── layout.tsx     # App layout
│   ├── (landing)/         # Landing page
│   ├── auth/              # Authentication pages
│   └── layout.tsx         # Root layout
├── components/             # Shared components
│   ├── AppSidebar.tsx     # Main navigation sidebar
│   ├── QuickCaptureModal.tsx  # Quick capture modal
│   └── ui/                # UI components
├── context/               # React contexts
├── lib/                   # Utilities
└── package.json
```

---

## Database Schema

### Core Tables

#### `inbox_items`
- `id`: Primary key
- `content`: Text content
- `type`: 'text' | 'image' | 'voice' | 'checklist'
- `mediaUrl`: Optional media URL
- `isProcessed`: Boolean flag
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

#### `projects`
- `id`: Primary key
- `title`: Project name
- `description`: Project description
- `outcome`: Desired outcome
- `status`: 'active' | 'paused' | 'completed'
- `areaId`: Optional area association
- `healthScore`: 1-5 health rating
- `completedAt`: Completion timestamp
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### `areas`
- `id`: Primary key
- `title`: Area name
- `emoji`: Optional emoji
- `healthScore`: 1-5 health rating
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### `resources`
- `id`: Primary key
- `title`: Resource name
- `type`: 'link' | 'pdf' | 'image' | 'audio' | 'note'
- `isFolder`: Boolean flag
- `parentId`: Parent folder ID
- `sourceUrl`: Resource URL
- `summary`: AI-generated summary
- `isArchived`: Archive flag
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### `tasks`
- `id`: Primary key
- `title`: Task name
- `notes`: Task notes
- `parentType`: 'project' | 'area'
- `parentId`: Parent ID
- `status`: 'todo' | 'done'
- `isCompleted`: Boolean flag
- `dueDate`: Optional due date
- `completedAt`: Completion timestamp
- `preparedContent`: AI-prepared content
- `preparationStatus`: 'idle' | 'preparing' | 'ready'
- `resourceLinks`: JSON array of links
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### `notes`
- `id`: Primary key
- `title`: Note title
- `content`: Note content
- `parentType`: 'resource' | 'project' | 'area'
- `parentId`: Parent ID
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### `focus_sessions`
- `id`: Primary key
- `projectId`: Optional project ID
- `focusArea`: Focus area name
- `durationMinutes`: Session duration
- `date`: Date (YYYY-MM-DD)
- `notes`: Session notes
- `completedAt`: Completion timestamp
- `updatedAt`: Update timestamp

#### `scheduled_sessions`
- `id`: Primary key
- `date`: Date (YYYY-MM-DD)
- `startTime`: Start time (HH:MM AM/PM)
- `durationMinutes`: Duration
- `focus`: Focus description
- `notes`: Session notes
- `projectIds`: JSON array of project IDs
- `isCompleted`: Completion flag
- `type`: 'deep_work' | 'shallow_work'
- `energyLevel`: 'high' | 'medium' | 'low'
- `isPrimeTime`: Boolean flag
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

---

## State Management

### Zustand Stores

#### `useNeyroStore` (Main Store)
**Location**: `apps/mobile/src/store/useNeyroStore.ts`

**State**:
- `inbox`: InboxItem[]
- `activeProjects`: Project[]
- `pausedProjects`: Project[]
- `completedProjects`: Project[]
- `areas`: Area[]
- `resources`: Resource[]
- `notes`: Note[]
- `tasks`: Task[]
- `isLoading`: boolean
- `captureVisible`: boolean

**Actions**:
- `loadData()`: Load all data from database
- `addToInbox()`: Add item to inbox
- `deleteInboxItem()`: Remove inbox item
- `classifyItem()`: Move item to Project/Area/Resource/Archive
- `addProject()`: Create new project
- `updateProject()`: Update project
- `deleteProject()`: Delete project
- `addArea()`: Create new area
- `updateAreaScore()`: Update area health score
- `deleteArea()`: Delete area
- `addResource()`: Create new resource
- `updateResource()`: Update resource
- `deleteResource()`: Delete resource
- `saveNote()`: Save note to parent
- `addTask()`: Add task to project/area
- `toggleTask()`: Toggle task completion
- `deleteTask()`: Delete task

#### `useTimerStore` (Focus Timer)
**Location**: `apps/mobile/src/store/timerStore.ts`

**State**:
- `status`: 'idle' | 'running' | 'paused'
- `elapsed`: number (seconds)
- `startTime`: number | null
- `selectedProjectId`: string | null
- `selectedTaskId`: string | null

**Actions**:
- `start()`: Start timer
- `stop()`: Pause timer
- `reset()`: Reset timer
- `setSelectedProject()`: Set focus project
- `setSelectedTask()`: Set focus task

---

## Services

### ClassifierService
**Purpose**: AI-powered classification of inbox items

**Methods**:
- `classify(content: string)`: Classify content into Project/Area/Resource/Archive
- Returns: `{ destination, confidence, reasoning, targetId? }`

### AIChatService
**Purpose**: Conversational AI interface

**Features**:
- Tool calling (addToInbox, createProject, getSchedule, startFocusSession)
- Voice input support
- Context-aware responses

### SyncService
**Purpose**: Synchronize local data with Supabase

**Methods**:
- `sync()`: Full bidirectional sync
- `push()`: Push local changes to cloud
- `pull()`: Pull cloud changes to local

### PredictiveAnalyticsService
**Purpose**: Predict project completion and burnout risk

**Methods**:
- `predictCompletionDate(projectId)`: Predict when project will complete
- `detectBurnoutRisk()`: Detect overcommitment

### AgenticService
**Purpose**: AI agent workflows for task preparation

**Methods**:
- `prepareTask(taskId)`: Pre-research and draft outline for task

### CollaborationService
**Purpose**: User collaboration features

**Methods**:
- `shareArea()`: Share area with another user
- `sendFocusCommand()`: Send focus command to connected user
- `updateLocation()`: Update user location (mobile)

### SubscriptionService
**Purpose**: Handle subscription tiers

**Tiers**:
- `free`: Basic features
- `musician`: Enhanced AI features
- `virtuoso`: Full feature access

---

## Web App Features

### Implemented Pages

1. **Dashboard** (`/`)
   - Overview of active projects
   - Recent activity
   - Quick actions
   - Status cards

2. **Inbox** (`/inbox`)
   - Grid/List view toggle
   - Filter by type (all, text, image, voice, checklist)
   - Search functionality
   - AI classification modal
   - Quick capture floating bar

3. **Projects** (`/projects`)
   - List of all projects
   - Filter by status (active, paused, completed)
   - Project cards with health indicators

4. **Project Detail** (`/projects/[id]`)
   - Project information
   - Task list with add/toggle/delete
   - Notes section
   - Progress tracking
   - AI task preparation

5. **Areas** (`/areas`)
   - List of all areas
   - Health score display
   - Area cards

6. **Area Detail** (`/areas/[id]`)
   - Area information
   - Health score editor (1-5)
   - Associated projects
   - Notes

7. **Resources** (`/resources`)
   - Folder structure
   - Resource list
   - Add resources
   - Note editor

8. **Archive** (`/archive`)
   - Completed projects
   - Paused projects
   - Archived resources
   - Restore/Delete actions

9. **Focus Mode** (`/focus`)
   - Timer interface
   - Project/Task selector
   - Start/Pause/Resume/Save controls
   - Session logging

10. **Weekly Review** (`/review`)
    - 4-step guided process
    - Inbox processing
    - Project review
    - Area assessment
    - Summary

11. **Statistics** (`/stats`)
    - Current/Longest streak
    - Today/Week/All-time focus time
    - Weekly chart
    - Most active project
    - Daily goal progress

12. **History** (`/history`)
    - All focus sessions
    - Filter by time period
    - Session details

13. **Schedule** (`/schedule`)
    - AI-generated weekly schedule
    - Scheduled sessions
    - Complete/Delete actions

14. **Community** (`/community`)
    - User connections
    - Add connections
    - Connection management

15. **Settings** (`/settings`)
    - Account settings
    - Notification preferences
    - Focus settings (daily goal, calendar sync)
    - Appearance
    - Data export

### Components

#### AppSidebar
- Main navigation
- Quick capture button
- User profile
- Navigation links

#### QuickCaptureModal
- Multi-type capture (text, checklist, image, voice)
- Keyboard shortcuts (Cmd/Ctrl + Enter)
- Type selector

#### Card
- Reusable card component
- Consistent styling

#### LoadingState
- Loading indicator
- Customizable message

#### EmptyState
- Empty state display
- Optional action button

---

## Mobile App Features

### Tab Navigation
1. **Home**: Dashboard overview
2. **Inbox**: Capture and process items
3. **Capture**: Quick capture button (opens modal)
4. **Network**: Community/connections
5. **Menu**: Settings and additional features

### Screens
- All core features from web app
- Mobile-optimized UI
- Native features (camera, microphone, location)
- Push notifications

---

## API Integration

### Google Gemini API
- **Classification**: Classify inbox items
- **Chat**: Conversational AI
- **Task Preparation**: Pre-research tasks
- **Resource Summarization**: Summarize resources

### Supabase
- **Authentication**: User auth
- **Database Sync**: Cloud database
- **Real-time**: Real-time collaboration
- **Storage**: File storage

---

## Development Guide

### Prerequisites
- Node.js 18+
- npm
- Expo CLI (for mobile)
- Supabase account (for cloud features)

### Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Mobile App**
```bash
cd apps/mobile
npm install
npx expo start
```

3. **Web App**
```bash
cd apps/web
npm install
npm run dev
```

### Environment Variables

**Mobile** (`.env` or `app.json`):
- `EXPO_PUBLIC_GEMINI_API_KEY`: Google Gemini API key
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

**Web** (`.env.local`):
- `NEXT_PUBLIC_GEMINI_API_KEY`: Google Gemini API key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

### Database Migrations

**Mobile**:
```bash
cd apps/mobile
npx drizzle-kit generate
npx drizzle-kit migrate
```

**Web**:
Database is auto-initialized on first load (IndexedDB)

### Running Tests

**Mobile**:
```bash
cd apps/mobile
npm test
```

**Web**:
```bash
cd apps/web
npm test
```

---

## Deployment

### Mobile App

1. **Build for Production**
```bash
cd apps/mobile
eas build --platform ios --profile production
eas build --platform android --profile production
```

2. **Submit to Stores**
```bash
eas submit --platform ios
eas submit --platform android
```

### Web App

1. **Build**
```bash
cd apps/web
npm run build
```

2. **Deploy**
- Vercel (recommended)
- Netlify
- Self-hosted

### Supabase Setup

1. Create Supabase project
2. Run migrations (see `apps/mobile/supabase_migration.sql`)
3. Configure authentication
4. Set up storage buckets (if needed)

---

## Future Enhancements

### Planned Features
- [ ] Shared Projects (multi-user collaboration)
- [ ] iPad Layout (optimized tablet experience)
- [ ] Advanced Analytics (detailed productivity insights)
- [ ] Integrations (Calendar, Email, etc.)
- [ ] Mobile Widgets (iOS/Android widgets)
- [ ] Voice Commands (voice-controlled capture)
- [ ] AI Suggestions (proactive recommendations)

### Known Limitations
- Web app uses IndexedDB (limited storage)
- Real-time sync requires Supabase connection
- AI features require API key
- Some mobile features not available on web

---

## Support & Resources

### Documentation
- Mobile: `apps/mobile/README.md`
- Web: `apps/web/README.md`
- Status: `apps/mobile/NEYRO_STATUS.md`
- Overview: `apps/mobile/NEYRO_OVERVIEW.md`

### Key Files Reference
- Store: `apps/mobile/src/store/useNeyroStore.ts`
- Schema: `apps/mobile/src/database/schema.ts`
- Services: `apps/mobile/src/services/`
- Components: `apps/web/components/` and `apps/mobile/src/components/`

---

## Version History

### v1.0 (Current)
- ✅ Complete feature set on both platforms
- ✅ AI classification
- ✅ Focus mode with timer
- ✅ Weekly review
- ✅ Statistics and history
- ✅ Schedule generation
- ✅ Community features
- ✅ Settings and preferences

---

**Last Updated**: 2024
**Maintained By**: Neyro Team
