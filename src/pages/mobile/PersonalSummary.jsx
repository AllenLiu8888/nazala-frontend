import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RadarChart from '../../components/dashboard/main/RadarCBefore.jsx';
import { useGameStoreMobile } from '../../store/index_mobile';

const PersonalSummary = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [personalData, setPersonalData] = useState(null);
  
  // Method to get from store
  const { fetchPlayerResult } = useGameStoreMobile();

  const goTimelinePage = () => {
    const currentGameId = gameId || 'demo-game';
    navigate(`/game/${currentGameId}/timeline`);
  };
  
  // Get player result data
  useEffect(() => {
    if (!gameId) return; // If no gameId, don't execute request
    
    const loadPlayerResult = async () => {
      try {
        const result = await fetchPlayerResult(gameId);
        setPersonalData(result);
        console.log('PersonalSummary: Get player result data', result);
      } catch (error) {
        console.error('Failed to get player result:', error);
        // If API call fails, use mock data as fallback
        const mockData = {
          personality: 'Mock Personality',
          description: 'Mock personality description',
          portraitUrl: 'https://placehold.co/160x200/png'
        };
        setPersonalData(mockData);
      }
    };

    loadPlayerResult();
  }, [gameId, fetchPlayerResult]);

  if (!personalData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-cyan-400"></div>
          <p className="text-cyan-300 mt-4">Analyzing your choices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto relative pt-4 pb-28">
      {/* Main content area (full page natural scrolling) */}
      <div className="relative z-10 min-h-screen p-4 pt-6 flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto space-y-6">
          {/* Top title */}
          <h1 className="font-pixel text-center text-5xl font-extrabold tracking-wider text-cyan-300 mb-3">
            ENDING
          </h1>

          {/* Radar chart */}
          <div className="border-2 border-cyan-400 rounded-xl bg-black/80 backdrop-blur-sm space-y-4 flex justify-center">
            <div className="w-full max-w-xs bg-black/60">
              <div className="aspect-square">
                <RadarChart size={500} maxRadius={120} labelRadius={210} labelYOffset={180} labelWidth={120} labelHeight={40} />
              </div>
            </div>
          </div>

          <h1 className="font-pixel text-center text-5xl font-extrabold tracking-wider text-cyan-300 mb-3">
            PERSONALITY
          </h1>
          {/* Main card */}
          <div className="border-2 border-cyan-400 rounded-xl bg-black/80 backdrop-blur-sm p-4 space-y-4 px-8 pb-10">
            {/* Personality section */}
            <div className="mt-2">
              <p className="text-sm text-cyan-200 text-start mt-3 leading-5">
                This is the final world we have created. Based on your outstanding contributions in {personalData.choices.join(' and ')}, you embody more of the characteristics of a visionary innovator.
              </p>
            </div>

            {/* Character image */}
            <div className="flex justify-center my-3">
              <div className="w-40 h-52 rounded-xl border border-cyan-500/70 bg-black/40 flex items-center justify-center overflow-hidden">
                {/* Use character avatar returned by API */}
                <img
                  src={personalData.portraitUrl || "https://placehold.co/160x200/png"}
                  alt="character"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If API image fails to load, use placeholder image
                    e.target.src = "https://placehold.co/160x200/png";
                  }}
                />
              </div>
            </div>

            {/* Character title and description */}
            <div className="text-center text-white pt-6">
              <p className="text- text-cyan-200">Base on your choices, you are</p>
              <h3 className="text-2xl font-extrabold text-cyan-300 mt-2">
                {personalData.personality || 'Memory Sentinel'}
              </h3>
            </div>

            <div className="mt-2 text-sm leading-5 text-cyan-200 space-y-2">
              <p>
                {personalData.description || "You live in a world where memories are traded like coins, yet you refuse to let truth be corrupted. Fairness is your compass; you believe that every memory must remain unaltered to keep society honest."}
              </p>
            </div>


          </div>
            {/* Bottom button area */}
            <div className="mt-6">
              <button
                className="w-full bg-cyan-400 text-black py-2 rounded text-sm font-semibold hover:bg-cyan-300 transition-colors duration-200"
                onClick={goTimelinePage}
              >
                View timeline
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalSummary;
