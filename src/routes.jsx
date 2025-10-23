import { createBrowserRouter, Navigate } from 'react-router-dom';
// import { loader } from './App.jsx';

// Screen pages - for admin/host
import HomePage from './pages/screen/HomePage'; // Game home
import GameIntro from './pages/screen/GameIntro'; // Game introduction
import GameLobby from './pages/screen/GameLobby'; // Game lobby
import GameDashboard from './pages/screen/GameDashboard'; // Main screen (Dashboard)
import GameReflection from './pages/screen/GameReflection'; // Reflection page
import GameOver from './pages/screen/GameOver'; // Game over page
import FlowMonitor from './pages/screen/FlowMonitor'; // Visualization flow monitor

// Mobile pages - used by players after scanning QR code
import VotingPage from './pages/mobile/VotingPage'; // Voting page
import WaitingPage from './pages/mobile/WaitingPage'; // Waiting page
import TimelinePage from './pages/mobile/Timeline'; // Player timeline page
import PersonalSummary from './pages/mobile/PersonalSummary'; // Personal summary page

// Create simplified router configuration
import App from './App.jsx';  // Import App component

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,  // App as root layout
    // loader: appLoader, 
    children: [        // All pages are children of App
      {
        index: true,   // Index route
        element: <HomePage />,
      },
      // Merge screen and mobile under the same prefix: /game/:gameId
      // Merge screen and mobile under the same prefix: /game/:gameId
      {
        path: "game/:gameId",
        children: [
          // Screen entry
          { path: "lobby", element: <GameLobby /> },
          { path: "intro", element: <GameIntro /> },
          { path: "game", element: <GameDashboard /> },
          { path: "reflection", element: <GameReflection /> },
          { path: "gameover", element: <GameOver /> },
          // Visualization flow monitor
          { path: "flow", element: <FlowMonitor /> },
          // Mobile pages
          { path: "waiting", element: <WaitingPage /> },
          { path: "voting", element: <VotingPage /> },
          { path: "timeline", element: <TimelinePage /> },
          { path: "summary", element: <PersonalSummary /> },
          // Default to waiting page
          {
            index: true,
            element: <Navigate to="waiting" replace />,
          },
        ]
      }
    ]
  },
  // 404 page - redirect to home
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
