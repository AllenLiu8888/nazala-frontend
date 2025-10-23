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
    <div className="h-screen overflow-y-auto relative pt-4 pb-28">
      {/* Main content area (full page natural scrolling) */}
      <div className="relative z-10 min-h-screen p-4 pt-6 flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto space-y-6">
          {/* Top title */}
          <h1 className="font-pixel text-center text-4xl font-extrabold tracking-wider text-cyan-300 mb-3">
          DECISION LOG
          </h1>
          
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

          {/* Bottom navigation area */}
          <div className="mt-6 flex justify-center">
            <div 
              className="relative cursor-pointer group w-fit"
              onClick={() => navigate(`/game/${gameId}/summary`)}
            >
              {/* Tech line container */}
              <div className="relative bg-black/20 border-l-2 border-cyan-400 px-6 py-3 group-hover:border-cyan-300 group-hover:bg-black/30 group-active:scale-95 transition-all duration-300 rounded-r-lg">
                
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 group-hover:border-cyan-300 transition-colors duration-300"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 group-hover:border-cyan-300 transition-colors duration-300"></div>
                
                {/* Content */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Tech indicator */}
                    <div className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all duration-300">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </div>
                    <span className="text-cyan-300 font-mono text-base font-semibold group-hover:text-cyan-200 transition-colors duration-300">
                    RETURN TO IDENTITY ARCHIVE
                    </span>
                  </div>
                </div>
                
                {/* Subtle glow line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400/30 group-hover:bg-cyan-400/50 transition-colors duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;