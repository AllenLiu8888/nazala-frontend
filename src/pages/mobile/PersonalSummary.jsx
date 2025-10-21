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

          <h1 className="font-pixel text-center text-4xl font-extrabold tracking-wider text-cyan-300 mb-3">
          IDENTITY SYNTHESIS COMPLETE
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
              <p className="text-cyan-200">Base on your choices, you are</p>
              <h3 className="font-pixel text-3xl font-extrabold tracking-wider text-cyan-300 mt-2">
                {personalData.personality || 'Memory Sentinel'}
              </h3>
            </div>

            <div className="mt-2 text-sm leading-5 text-cyan-200 space-y-2">
              <p>
                {personalData.description || "You live in a world where memories are traded like coins, yet you refuse to let truth be corrupted. Fairness is your compass; you believe that every memory must remain unaltered to keep society honest."}
              </p>
            </div>


          </div>
            {/* Bottom navigation area */}
            <div className="mt-6 flex justify-center">
              <div 
                className="relative cursor-pointer group w-fit"
                onClick={goTimelinePage}
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
                      ACCESS DECISION RECORDS
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

export default PersonalSummary;
