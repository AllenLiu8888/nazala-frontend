# NaZaLa Frontend

NaZaLa Frontend delivers the interactive surfaces for the NaZaLa memory-trading experience. It powers both the large screen that guides visitors through each round and the mobile flow players use after scanning the QR code.

## Features
- Large-screen facilitator views for intro, live round dashboard, and game wrap-up.
- Mobile participant flow covering waiting, voting, and personal history screens.
- Centralised game state via React context with a typed helper hook.
- API abstraction in `src/services` that talks to the NaZaLa backend (configurable base URL).
- Visual components including radar charts, decision timelines, and progress rings built with Tailwind CSS utilities.

## Tech Stack
- React 19, React Router 7
- Vite 7 with the Tailwind CSS v4 plugin
- Axios-based HTTP client and shared game context
- ApexCharts and custom SVG components for data visualisation

## Getting Started
### Prerequisites
- Node.js 20 or later
- npm 10 or later

### Installation
```bash
npm install
```

### Environment Variables
Create `.env.local` (or `.env`) in the project root if you need to point at a backend other than the default `http://127.0.0.1:8000`:
```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```
The HTTP client (`src/services/http.js`) falls back to the local backend when the variable is absent.

### Development Server
```bash
npm run dev
```
The app runs at `http://localhost:5173`. Useful routes during development:
- `http://localhost:5173/` – exhibition home with QR code
- `http://localhost:5173/screen/intro` – large-screen intro/briefing
- `http://localhost:5173/screen/game` – live dashboard view
- `http://localhost:5173/game/demo-game/waiting` – mobile waiting room
- `http://localhost:5173/game/demo-game/voting` – mobile voting screen
- `http://localhost:5173/game/demo-game/summary` – personal summary
- `http://localhost:5173/game/demo-game/timeline` – personal summary

## Build & Quality Checks
```bash
# Production build
npm run build

# Preview the build locally
npm run preview

# Lint the codebase
npm run lint
```

## Project Structure
```text
src/
  App.jsx              # Wraps routes with the shared GameProvider
  routes.jsx           # Declarative route map for screen & mobile paths
  pages/
    screen/            # Large display pages (Home, Intro, Dashboard, GameOver)
    mobile/            # Mobile flow (Waiting, Voting, History)
  components/
    dashboard/         # Reusable UI blocks for charts, timelines, status widgets
    shared/            # Cross-cutting components such as QRCode
  context/             # GameProvider and React context definitions
  hooks/               # Custom hooks (e.g., useGameContext)
  services/            # HTTP client and game API wrapper
  styles/              # Shared style helpers
```

## Backend Integration Notes
The frontend assumes the NaZaLa backend is running and exposes REST endpoints such as `/api/game/current/` and `/api/game/{id}/player/submit/`. Update the base URL via `VITE_API_BASE_URL` or modify `src/services/http.js` if the backend address changes.

## Contributing
1. Fork or create a feature branch.
2. Make your changes and ensure `npm run lint` passes.
3. Open a pull request with context on the behaviour you changed.

## AI Declaration
This project uses AI-assisted tools at times (e.g., code completion, refactor suggestions, documentation) to improve productivity. All AI-generated or AI-suggested changes are reviewed, tested, and amended by human maintainers before adoption. Unless explicitly stated otherwise, AI tools are not provided with sensitive data beyond this repository. 

---
For additional API details, see `src/services/API_Documentation.md`.
