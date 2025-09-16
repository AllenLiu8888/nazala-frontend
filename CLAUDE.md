# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NaZaLa is a multiplayer turn-based game built with React + Vite where players make choices that affect four core world attributes. The frontend connects to a Django backend API for game state management and uses LLM-generated content for dynamic gameplay.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend Integration
- Backend API runs on `http://127.0.0.1:8000` (configured in `.env`)
- API authentication uses Bearer tokens obtained when players join games
- See `src/services/API_Documentation.md` for complete API reference

## Architecture Overview

### Route Structure
The app uses React Router with two main user flows:

**Large Screen (Admin/Host):**
- `/` or `/screen/home` - HomePage
- `/screen/intro` - GameIntro
- `/screen/game` - GameDashboard (main game interface)
- `/screen/gameover` - GameOver

**Mobile (Players):**
- `/game/:gameId/waiting` - WaitingPage (after scanning QR)
- `/game/:gameId/voting` - VotingPage (make choices)
- `/game/:gameId/history` - History (view past decisions)

### Key Components

**State Management:**
- `src/context/GameProvider.jsx` - Global game state using React Context + Zustand
- `src/context/CreateGameContext.js` - Context definition
- `src/hooks/useGameContext.js` - Hook for accessing game state

**API Layer:**
- `src/services/http.js` - HTTP client with authentication
- `src/services/gameApi.js` - Game API endpoints wrapper
- Authentication tokens stored and passed via headers

**Component Structure:**
```
src/components/
├── dashboard/
│   ├── header/ - Round info, world status
│   ├── main/ - Charts, voting options, story content
│   └── footer/ - Progress indicators, user states
└── shared/ - QRCode and reusable components
```

### Core Game Concepts

**Four Game Attributes:**
- Memory Equality
- Technical Control
- Society Cohesion
- Autonomy Control

**Game Flow:**
1. Admin starts game on large screen
2. Players scan QR code to join on mobile
3. Game progresses through multiple turns
4. Each turn: question → player choices → attribute changes
5. Real-time updates via polling (see API docs)

## Tech Stack

- **Frontend:** React 19 + Vite + React Router 7
- **Styling:** TailwindCSS 4 + Sass
- **Charts:** ApexCharts, Recharts, React Circular Progressbar
- **Real-time:** Socket.io-client (WebSockets)
- **Animation:** Framer Motion
- **QR Codes:** qrcode.react
- **HTTP:** Axios

## Development Notes

### Code Style
- Uses modern React patterns (hooks, functional components)
- ESLint configured with React hooks rules
- Mixed Chinese/English comments throughout codebase
- No TypeScript - plain JavaScript with .jsx extensions

### Mobile-First Considerations
- App designed for dual-screen experience (large screen + mobile)
- Responsive design using TailwindCSS
- Mobile pages are simplified single-purpose interfaces

### API Integration Pattern
```javascript
// Standard pattern used throughout app
try {
  const data = await gameApi.someEndpoint(params);
  // Update local state
} catch (error) {
  // Handle error
}
```

### Background Image
- App uses Cloudinary-hosted background image with opacity overlay
- Configured in `App.jsx` with Tailwind classes

## File Structure Notes

- `src/pages/` - Route components split by screen type (mobile/screen)
- `src/constants/` - Game constants and configuration
- All major components are in `src/components/` organized by UI section
- Service layer cleanly separated in `src/services/`