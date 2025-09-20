import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const PersonalSummary = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [personalData, setPersonalData] = useState(null);

  const goTimelinePage = () => {
    const currentGameId = gameId || 'demo-game';
    navigate(`/game/${currentGameId}/timeline`);
  };
  
  // 模拟个人数据
  useEffect(() => {
    // 这里将来会从后端获取数据
    const mockData = {
      choices: ['a right', 'a resource', 'a responsibility'],
      personality: 'Idealistic Protector',
      description: 'you are someone who values freedom and believes in protecting individual rights while considering the collective good',
      traits: [
        'Values personal autonomy',
        'Considers long-term consequences',
        'Balances individual and collective needs',
        'Seeks sustainable solutions'
      ],
      score: {
        idealism: 85,
        pragmatism: 65,
        collectivism: 70,
        individualism: 80
      }
    };
    
    // 立即设置数据，不再模拟网络延迟
    setPersonalData(mockData);
  }, []);

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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 网格背景 - 顶部 */}
      <div className="absolute top-0 left-0 right-0 h-32">
        <div className="w-full h-full opacity-30">
          <svg viewBox="0 0 400 100" className="w-full h-full">
            <defs>
              <pattern id="grid-top" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#03ffff" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-top)" />
            {/* 透视效果线条 */}
            {Array.from({length: 21}, (_, i) => (
              <line 
                key={i} 
                x1={i * 20} 
                y1="0" 
                x2={200} 
                y2="100" 
                stroke="#03ffff" 
                strokeWidth="0.3" 
                opacity="0.5"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 网格背景 - 底部 */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <div className="w-full h-full opacity-30">
          <svg viewBox="0 0 400 100" className="w-full h-full">
            <defs>
              <pattern id="grid-bottom" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 100 L 0 100 0 80" fill="none" stroke="#03ffff" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-bottom)" />
            {/* 透视效果线条 */}
            {Array.from({length: 21}, (_, i) => (
              <line 
                key={i} 
                x1={i * 20} 
                y1="100" 
                x2={200} 
                y2="0" 
                stroke="#03ffff" 
                strokeWidth="0.3" 
                opacity="0.5"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* 主要卡片 */}
          <div className="border-2 border-cyan-400 rounded-lg bg-black bg-opacity-80 backdrop-blur-sm p-6">
            
            {/* 图表/可视化区域 */}
            <div className="h-48 bg-gray-300 rounded mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-cyan-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">
                    {Math.round((personalData.score.idealism + personalData.score.individualism) / 2)}%
                  </span>
                </div>
                <p className="text-gray-600 text-sm">Your Alignment Score</p>
              </div>
            </div>

            {/* 个人评估文本 */}
            <div className="text-white space-y-4">
              <h2 className="text-lg font-bold">
                Based on your choices,
              </h2>
              <h3 className="text-xl font-bold text-cyan-300">
                you are {personalData.personality}
              </h3>
              <p className="text-sm leading-relaxed">
                {personalData.description}
              </p>
              
              {/* 特征列表 */}
              <div className="mt-4">
                <ul className="text-xs space-y-1 text-gray-300">
                  {personalData.traits.map((trait, index) => (
                    <li key={index}>• {trait}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 底部按钮区域 */}
            <div className="mt-6">
              <button 
                className="w-full bg-gray-400 text-black py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors duration-200"
                onClick={goTimelinePage}
              >
                view timeline
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default PersonalSummary;
