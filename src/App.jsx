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
  // 路由 & 授权（首次手势后才允许播放）
  const location = useLocation();
  const authorizedRef = useRef(false);
  // 仅在大屏（screen）路由下播放：'/' 或 /game/:id/(lobby|intro|game|reflection|gameover)
  const isScreenRoute = /^\/$|^\/game\/[^/]+\/(lobby|intro|game|reflection|gameover)$/.test(location.pathname);

  // 订阅全局游戏状态
  const gameState = useGameStoreScreen(s => s.gameMeta.state);
  const turnIndex = useGameStoreScreen(s => s.turn.index);

  // 准备多轨实例（不自动播放，按需触发）
  // 默认音量
  const BASE_GAME_VOL = 0.5;
  const BASE_INTRO_VOL = 0.5;

  const { play: playMenu, stop: stopMenu } = useBgm(BGM_URLS.menu, false, false, 0.5, true);
  const { play: playIntro, stop: stopIntro, setVolume: setIntroVol } = useBgm(BGM_URLS.intro, false, false, BASE_INTRO_VOL, false);
  const { play: playGame, stop: stopGame, setVolume: setGameVol } = useBgm(BGM_URLS.game, false, false, BASE_GAME_VOL, true);
  const { play: playOver, stop: stopOver } = useBgm(BGM_URLS.gameover, false, false, 0.6, true);

  // 捕获首次用户手势，解锁播放权限
  useEffect(() => {
    const onFirstGesture = () => {
      authorizedRef.current = true;
      // 移除监听
      window.removeEventListener('pointerdown', onFirstGesture, true);
    };
    window.addEventListener('pointerdown', onFirstGesture, true);
    return () => window.removeEventListener('pointerdown', onFirstGesture, true);
  }, []);

  // 基于游戏状态/路由切换 BGM 策略
  useEffect(() => {
    if (!authorizedRef.current) return; // 未授权时不触发播放
    if (!isScreenRoute) {
      // 非大屏路由（即手机端）一律静音
      try { stopMenu(); } catch (err) { void err; }
      try { stopIntro(); } catch (err) { void err; }
      try { stopGame(); } catch (err) { void err; }
      try { stopOver(); } catch (err) { void err; }
      return;
    }

    // 先停止所有，后按策略播放目标曲目（避免叠音）
    const stopAll = () => {
      try { stopMenu(); } catch (err) { void err; }
      try { stopIntro(); } catch (err) { void err; }
      try { stopGame(); } catch (err) { void err; }
      try { stopOver(); } catch (err) { void err; }
    };

    // 在 ongoing 阶段仅停止非 game 轨，避免 game 每次 state/turn 变更被打断
    const stopNonGame = () => {
      try { stopMenu(); } catch (err) { void err; }
      try { stopOver(); } catch (err) { void err; }
      // intro 是否停止由 turnIndex 决定
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
        // 仅在 Intro 播放 intro，不播放 game
        try { stopGame(); } catch (err) { void err; }
        try { setIntroVol(Math.min(1, BASE_INTRO_VOL * 3)); } catch (err) { void err; }
        try { playIntro(); } catch (err) { void err; }
      } else if (typeof turnIndex === 'number' && turnIndex > 0) {
        // 非 Intro：只保留 game，恢复默认体积并确保 intro 停止
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