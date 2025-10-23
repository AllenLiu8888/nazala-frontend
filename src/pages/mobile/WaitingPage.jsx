import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gameApi } from '../../services/gameApi';
import { GAME_STATUS } from '../../constants/constants';
import useGameStoreMobile from '../../store/index_mobile';

const WaitingPage = () => {
  // Get real gameId from URL parameters
  const { gameId } = useParams();
  const navigate = useNavigate();
  const hasInitialized = useRef(false);
  const setUiConfig = useGameStoreMobile(s => s.setUiConfig);

  const gameStatusCode = useGameStoreMobile(s => s.gameMeta.statusCode);

  // Automatically create/get user
  const createPlayer = async (gameId) => {
    try {
      // Get existing authToken (if any)
      const existingToken = localStorage.getItem('authToken');
      
      // Call API directly, let backend decide whether to return existing user or create new user
      const result = await gameApi.joinGame(gameId, existingToken);
      localStorage.setItem('authToken', result.player.auth_token);
      localStorage.setItem('playerId', result.player.id);
      // 加入成功后，立即刷新一次 gameDetail，促使大屏人数尽快更新
      try { await useGameStoreMobile.getState().fetchGameDetail(gameId); } catch { /* no-op */ }
      
    } catch (error) {
      console.error(' Failed to handle user:', error, gameId);
    }
  };

  const goVotingPage = () => {
    navigate(`/game/${gameId}/voting`);
  };

  // Automatically create user when page loads
  useEffect(() => {
    if (!gameId) {
      console.error('GameId not found, cannot initialize');
      return;
    }
    
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // 如果切换到不同的 gameId，清理旧的玩家身份，避免复用到其他游戏
      try {
        const lastGameId = localStorage.getItem('gameId');
        if (lastGameId !== String(gameId)) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('playerId');
          localStorage.setItem('gameId', String(gameId));
        }
      } catch { /* no-op */ }
      // Parse query string for sv flag (show values)
      try {
        const url = new URL(window.location.href);
        const sv = url.searchParams.get('sv');
        if (sv === '0' || sv === '1') {
          setUiConfig({ showValues: sv === '1' });
        }
      } catch { /* no-op */ }
      createPlayer(gameId);
    }
  }, [gameId]);

  // Regularly check game status
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!gameId) {
      console.error('GameId not found, cannot check game status');
      return;
    }
    // Check immediately once
    // checkGameStarted();
    useGameStoreMobile.getState().fetchGameDetail(gameId);

    // Set timer to check every 3 seconds
    const interval = setInterval(() => {
      useGameStoreMobile.getState().fetchGameDetail(gameId);
      // checkGameStarted();
    }, 3000);

    // Clean up timer
    return () => clearInterval(interval);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
      if (gameStatusCode == GAME_STATUS.IN_PROGRESS) {
        console.log('Conditions met, preparing to redirect');
        navigate(`/game/${gameId}/voting`);
      } else if (gameStatusCode == GAME_STATUS.COMPLETED) {
        console.log('Game completed, redirecting to summary page');
        navigate(`/game/${gameId}/summary`);
      } else if (gameStatusCode == GAME_STATUS.ARCHIVED) {
        console.log('Game archived');
      }
  }, [gameStatusCode]);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
          {/* Main content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Double layer rotation */}
        <div className="relative w-16 h-16 mb-12"> 
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-cyan-300" ></div> 

          <div className="animate-spin rounded-full h-12 w-12 border-2 border-b-transparent absolute top-2 left-2 border-cyan-300" ></div> 

        </div>

           {/* Waiting text */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-cyan-300"
              onClick={goVotingPage}
            >
              {gameStatusCode === GAME_STATUS.ARCHIVED ? 'Game not started' : 'Waiting for players to join...'}
            </h1>


          </div>
         </div>
       </div>
    </>
  );
};

export default WaitingPage;