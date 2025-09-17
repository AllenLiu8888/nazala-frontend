# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NaZaLa is a multiplayer turn-based educational game exploring biotechnology ethics and memory technology implications. Built with React + Vite, players make collective decisions across 10 rounds that shape four world attributes, experiencing how technological choices affect society through immersive collaborative gameplay.

### Educational Mission

- **Core Theme**: "Memory-editable, tradable technology" scenarios
- **Learning Objectives**: Enhance users' sensitivity to biotechnology ethics and social consequences
- **Methodology**: Value Sensitive Design (VSD) focusing on psychological safety, fairness, autonomy, privacy, and transparency
- **Target Experience**: Risk-free virtual environment for exploring complex ethical decisions

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

```text
src/components/
├── dashboard/
│   ├── header/ - Round info, world status
│   ├── main/ - Charts, voting options, story content
│   └── footer/ - Progress indicators, user states
└── shared/ - QRCode and reusable components
```

### Core Game Concepts

**Four Game Attributes:**

- Memory Equality (记忆平等)
- Technical Control (技术控制)
- Society Cohesion (社会凝聚力)
- Autonomy Control (自主控制)

**Game Flow:**

1. Admin starts game on large screen
2. Players scan QR code to join on mobile
3. Game progresses through 10 rounds maximum
4. Each turn: LLM-generated question → player choices → attribute changes
5. Real-time updates via WebSocket and polling (see API docs)

**AI Integration:**

- Local LLM + RAG system generates dynamic scenarios
- BGE-M3 + bge-reranker-v2-m3 for content retrieval
- FAISS vector database for scenario context
- Narrative consistency maintained across rounds

## Tech Stack

**Frontend:** React 19 + Vite + React Router 7

**Styling:** TailwindCSS 4 + Sass

**Charts:** ApexCharts, Recharts, React Circular Progressbar

**Real-time:** Socket.io-client (WebSockets)

**Animation:** Framer Motion

**QR Codes:** qrcode.react

**HTTP:** Axios

## Development Notes

### Code Style

- Uses modern React patterns (hooks, functional components)
- ESLint configured with React hooks rules
- Mixed Chinese/English comments throughout codebase
- No TypeScript - plain JavaScript with .jsx extensions

### Game Design Considerations

- **Dual-Screen Experience**: Large screen visualization + mobile individual choices
- **Collaborative Decision Making**: Multiple players affect shared world state
- **Educational Focus**: Scenarios designed to provoke ethical reflection
- **Accessibility**: Screen reader support, keyboard navigation, color contrast compliance

### Performance Requirements

- Support for ~20 concurrent players
- Real-time synchronization across devices
- Smooth chart animations and visualizations
- Mobile-optimized touch interfaces

### API Integration Pattern

```javascript
// Standard pattern used throughout app
try {
  const data = await gameApi.someEndpoint(params);
  // Update local state
} catch (error) {
  // Handle error with user feedback
}
```

### Background Image

- App uses Cloudinary-hosted background image with opacity overlay
- Configured in `App.jsx` with Tailwind classes

## Project Management Context

### Team Structure

- **Frontend**: React + Vite development (2 person-units)
- **Backend**: Django API development (2 person-units)
- **AI Module**: Local LLM + RAG implementation (2 person-units)
- **UI/UX**: Design and user experience

### Development Timeline

- **Weeks 4-7**: Basic framework and component development
- **Weeks 7-9**: Full interaction logic and AI integration
- **Weeks 9-11**: Multi-user functionality and final polish

### Communication Tools

- **Jira**: Task management with Scrum methodology
- **GitHub**: Code reviews via Pull Requests
- **Slack**: Daily communication and updates
- **Weekly Meetings**: Saturday 1:00 PM progress sync

## File Structure Notes

- `src/pages/` - Route components split by screen type (mobile/screen)
- `src/constants/` - Game constants and configuration
- All major components are in `src/components/` organized by UI section
- Service layer cleanly separated in `src/services/`
- See `README.md` for comprehensive project documentation
