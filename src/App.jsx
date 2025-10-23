import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { GameProvider } from './context/GameProvider';
import useGameStoreScreen from './store/index_screen';
import { useBgm, BGM_URLS } from './hooks/useBgm';
// import { Outlet, useLoaderData } from 'react-router-dom';

// export async function loader() {
//   return {
//     return fetch('/api/games');
//   }
// }


// function App() {
//   return (
//     <div className="h-screen bg-gradient-to-br from-gray-900 to-black">
//       <Outlet />
//     </div>
//   );
// }


function App() {
  // Routing & authorization (permit playback only after first user gesture)
  const location = useLocation();
  const authorizedRef = useRef(false);
  // Play only on screen routes: '/' or /game/:id/(lobby|intro|game|reflection|gameover)
  const isScreenRoute = /^\/$|^\/game\/[^/]+\/(lobby|intro|game|reflection|gameover)$/.test(location.pathname);

  // Subscribe to global game state
  const gameState = useGameStoreScreen(s => s.gameMeta.state);
  const turnIndex = useGameStoreScreen(s => s.turn.index);

  // Prepare multi-track instances (no auto play, trigger on demand)
  // Default volume
  const BASE_GAME_VOL = 0.5;
  const BASE_INTRO_VOL = 0.5;

  const { play: playMenu, stop: stopMenu } = useBgm(BGM_URLS.menu, false, false, 0.5, true);
  const { play: playIntro, stop: stopIntro, setVolume: setIntroVol } = useBgm(BGM_URLS.intro, false, false, BASE_INTRO_VOL, false);
  const { play: playGame, stop: stopGame, setVolume: setGameVol } = useBgm(BGM_URLS.game, false, false, BASE_GAME_VOL, true);
  const { play: playOver, stop: stopOver } = useBgm(BGM_URLS.gameover, false, false, 0.6, true);

  // Capture first user gesture to unlock autoplay permissions
  useEffect(() => {
    const onFirstGesture = () => {
      authorizedRef.current = true;
      // Remove listener
      window.removeEventListener('pointerdown', onFirstGesture, true);
    };
    window.addEventListener('pointerdown', onFirstGesture, true);
    return () => window.removeEventListener('pointerdown', onFirstGesture, true);
  }, []);

  // BGM strategy based on game state/route changes
  useEffect(() => {
    if (!authorizedRef.current) return; // do not play before authorized
    if (!isScreenRoute) {
      // Non-screen routes (i.e., mobile) should be muted
      try { stopMenu(); } catch (err) { void err; }
      try { stopIntro(); } catch (err) { void err; }
      try { stopGame(); } catch (err) { void err; }
      try { stopOver(); } catch (err) { void err; }
      return;
    }

    // Stop all first, then play target track to avoid overlap
    const stopAll = () => {
      try { stopMenu(); } catch (err) { void err; }
      try { stopIntro(); } catch (err) { void err; }
      try { stopGame(); } catch (err) { void err; }
      try { stopOver(); } catch (err) { void err; }
    };

    // In ongoing phase, stop non-game tracks only to avoid interruptions on game track
    const stopNonGame = () => {
      try { stopMenu(); } catch (err) { void err; }
      try { stopOver(); } catch (err) { void err; }
      // Whether to stop intro is determined by turnIndex
    };

    if (gameState === 'archived') {
      stopAll();
      return;
    }

    if (gameState === 'waiting') {
      stopAll();
      try { playMenu(); } catch (err) { void err; }
      return;
    }

    if (gameState === 'ongoing') {
      stopNonGame();

      if (typeof turnIndex === 'number' && turnIndex === 0) {
        // In Intro, play intro only, not game; set volume to 1.0 (double base 0.5)
        try { stopGame(); } catch (err) { void err; }
        try { setIntroVol(1); } catch (err) { void err; }
        try { playIntro(); } catch (err) { void err; }
      } else if (typeof turnIndex === 'number' && turnIndex > 0) {
        // Non-Intro: keep game only, restore default volume and ensure intro stops
        try { stopIntro(); } catch (err) { void err; }
        try { setGameVol(BASE_GAME_VOL); } catch (err) { void err; }
        try { playGame(); } catch (err) { void err; }
      }
      return;
    }

    if (gameState === 'finished') {
      stopAll();
      try { playOver(); } catch (err) { void err; }
      return;
    }
  }, [location.pathname, isScreenRoute, gameState, turnIndex, playMenu, stopMenu, playIntro, stopIntro, playGame, stopGame, playOver, stopOver, setGameVol, setIntroVol]);

  return (
    <GameProvider>
      <div className="fixed inset-0 box-border overflow-hidden bg-center bg-black/60 bg-blend-multiply bg-cover bg-[url(https://res.cloudinary.com/dd9dbngmy/image/upload/v1757129097/iPhone_16_Pro_Max_-_9_mz4y4t.svg)] md:bg-[url(https://res.cloudinary.com/dd9dbngmy/image/upload/v1757131038/screen_ymm9yw.svg)]">
        <Outlet />
      </div>
    </GameProvider>
  );
}


export default App