import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGameStoreMobile from '../../store/index_mobile';
import TimelineComponent from '../../components/mobile/TimelineComponent';

const Timeline = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  
  // Get state from store
  const timeline = useGameStoreMobile(s => s.timeline) || { events: [], loading: false, error: null };
  const fetchGameTimeline = useGameStoreMobile(s => s.fetchGameTimeline);
  const fetchCurrentGame = useGameStoreMobile(s => s.fetchCurrentGame);

  // Initialize token
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Get timeline data
  useEffect(() => {
    const loadTimeline = async () => {
      try {
        let currentGameId = gameId;
        
        // If no gameId, try to get current game
        if (!currentGameId) {
          const currentGame = await fetchCurrentGame();
          currentGameId = currentGame?.id;
        }
        
        if (currentGameId && token) {
          await fetchGameTimeline(currentGameId, token);
        }
      } catch (error) {
        console.error('Failed to load timeline:', error);
      }
    };

    // Only execute request when token exists
    if (token) {
      loadTimeline();
    }
  }, [gameId, token]); // Remove function dependencies to avoid repeated triggers



  return (
    <div className="h-screen overflow-y-auto relative">
      {/* Main content area (same layout and card style as PersonalSummary) */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="w-full max-w-sm mx-auto">
          {/* Top title and refresh button */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-extrabold tracking-wider text-cyan-300">
              History Overview
            </h1>
          </div>
          
          {/* Timeline component */}
          <TimelineComponent
            events={timeline.events}
            loading={timeline.loading}
            error={timeline.error}
            onRefresh={() => {
              if (gameId && token) {
                fetchGameTimeline(gameId, token);
              }
            }}
            showDebugInfo={true}
            gameId={gameId}
            token={token}
          />

          {/* Bottom return button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate(`/game/${gameId}/summary`)}
              className="w-full bg-cyan-400 text-black py-2 rounded text-sm font-semibold hover:bg-cyan-300 transition-colors duration-200"
            >
              go to personal summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;