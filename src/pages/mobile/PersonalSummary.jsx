import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SmallRadarChart from '../../components/mobile/SmallRadarChart.jsx';
import { useGameStoreMobile } from '../../store/index_mobile';

const PersonalSummary = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [personalData, setPersonalData] = useState(null);
  
  // 从store获取方法
  const { fetchPlayerResult } = useGameStoreMobile();

  const goTimelinePage = () => {
    const currentGameId = gameId || 'demo-game';
    navigate(`/game/${currentGameId}/timeline`);
  };
  
  // 获取玩家结果数据
  useEffect(() => {
    const loadPlayerResult = async () => {
      try {
        const result = await fetchPlayerResult(gameId);
        setPersonalData(result);
        console.log('🔍 PersonalSummary: 获取玩家结果数据', result);
      } catch (error) {
        console.error('❌ 获取玩家结果失败:', error);
        // 如果API调用失败，使用模拟数据作为fallback
        const mockData = {
          personality: '人格假数据',
          description: '人格假数据描述',
          portraitUrl: 'https://placehold.co/160x200/png'
        };
        setPersonalData(mockData);
      }
    };

    loadPlayerResult();
  }, [gameId]);

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
    <div className="h-screen overflow-y-auto relative">
      {/* 主要内容区域（整页自然滚动） */}
      <div className="relative z-10 min-h-screen p-4 flex items-center justify-center">
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
            {/* Personality 区块 */}
            <div className="mb-4">
              <h2 className="text-white text-lg font-bold text-center">Personality</h2>
              <p className="text-[11px] text-gray-300 text-center mt-2 leading-5">
                This is the final world we have created. Based on your outstanding contributions in {personalData.choices.join(' and ')}, you embody more of the characteristics of a visionary innovator.
              </p>
            </div>

            {/* 角色形象 */}
            <div className="flex justify-center mb-1">
              <div className="w-36 h-44 rounded-xl border border-cyan-500/70 bg-black/40 flex items-center justify-center overflow-hidden">
                {/* 使用API返回的角色头像 */}
                <img
                  src={personalData.portraitUrl || "https://placehold.co/160x200/png"}
                  alt="character"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 如果API图片加载失败，使用占位图片
                    e.target.src = "https://placehold.co/160x200/png";
                  }}
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
                {personalData.description || "You live in a world where memories are traded like coins, yet you refuse to let truth be corrupted. Fairness is your compass; you believe that every memory must remain unaltered to keep society honest."}
              </p>
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
