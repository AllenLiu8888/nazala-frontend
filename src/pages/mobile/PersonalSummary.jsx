import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SmallRadarChart from '../../components/mobile/SmallRadarChart.jsx';

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
    <div className="h-screen overflow-y-auto bg-black relative">
      {/* 网格背景 - 顶部 */}
      <div className="absolute top-0 left-0 right-0 h-16">
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
      <div className="absolute bottom-0 left-0 right-0 h-16">
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

      {/* 主要内容区域（整页自然滚动） */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="w-full max-w-sm mx-auto">
          {/* 顶部标题 */}
          <h1 className="text-center text-3xl font-extrabold tracking-wider text-cyan-300 mb-3">
            Game Over
          </h1>

          {/* 主要卡片 */}
          <div className="border-2 border-cyan-400 rounded-xl bg-black/80 backdrop-blur-sm p-4">
            {/* 雷达图（小尺寸组件） */}
            <div className="flex justify-center">
              <SmallRadarChart />
            </div>

            {/* 叙事文本（收紧段落间距与行高） */}
            <div className="text-cyan-200 text-[12px] leading-[18px] space-y-1 mb-2">
              <p>
                The chamber releases a final surge of light. Your chosen memory vanishes, leaving a hollow echo in your mind. On the giant screen, the crowd reacts—some cheer your sacrifice, others whisper doubts.
              </p>
              <p>
                Outside, society tilts: new rules form, trust shifts, and the balance of power bends to your decision. You step back into the world changed, carrying both the loss and the weight of its consequence. Game Over—your choice has written history.
              </p>
            </div>

            {/* Personality 区块 */}
            <div className="mb-4">
              <h2 className="text-white text-lg font-bold text-center">Personality</h2>
              <p className="text-[11px] text-gray-300 text-center mt-2 leading-5">
                This is the final world we have created. Based on your outstanding contributions in xxx and xxx, you embody more of the characteristics of a visionary innovator.
              </p>
            </div>

            {/* 角色形象 */}
            <div className="flex justify-center mb-1">
              <div className="w-36 h-44 rounded-xl border border-cyan-500/70 bg-black/40 flex items-center justify-center overflow-hidden">
                {/* 占位图片，可替换为实际资源 */}
                <img
                  src="https://placehold.co/160x200/png"
                  alt="character"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 角色称号与说明 */}
            <div className="text-center text-white">
              <p className="text-[11px] text-gray-300">Base on your choices, you are</p>
              <h3 className="text-xl font-extrabold text-cyan-300 mt-1">
                {personalData.personality || 'Memory Sentinel'}
              </h3>
            </div>

            <div className="mt-2 text-[12px] leading-5 text-gray-200 space-y-2">
              <p>
                You live in a world where memories are traded like coins, yet you refuse to let truth be corrupted. Fairness is your compass; you believe that every memory must remain unaltered to keep society honest.
              </p>
              <p>
                At the same time, you guard your own mind with fierce independence—no one has the right to decide what you remember or forget. This rare balance makes you both protector and rebel.
              </p>
              <p>
                Justice without freedom is hollow, and freedom without justice is fragile. You stand as a constant in the shifting memory market, a figure of resilience and clarity. When others sell fragments of themselves, you remain whole.
              </p>
            </div>

            {/* 特征列表 */}
            <div className="mt-3">
              <ul className="text-[11px] space-y-1 text-gray-300">
                {personalData.traits.map((trait, index) => (
                  <li key={index}>• {trait}</li>
                ))}
              </ul>
            </div>


            {/* 底部按钮区域 */}
            <div className="mt-4">
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
    </div>
  );
};

export default PersonalSummary;
