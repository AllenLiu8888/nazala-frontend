import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGameStoreMobile from '../../store/index_mobile';
import TimelineComponent from '../../components/mobile/TimelineComponent';

const Timeline = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  
  // 从 store 获取状态
  const timeline = useGameStoreMobile(s => s.timeline) || { events: [], loading: false, error: null };
  const fetchGameTimeline = useGameStoreMobile(s => s.fetchGameTimeline);
  const fetchCurrentGame = useGameStoreMobile(s => s.fetchCurrentGame);

  // 初始化 token
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // 获取时间轴数据
  useEffect(() => {
    const loadTimeline = async () => {
      try {
        let currentGameId = gameId;
        
        // 如果没有 gameId，尝试获取当前游戏
        if (!currentGameId) {
          const currentGame = await fetchCurrentGame();
          currentGameId = currentGame?.id;
        }
        
        if (currentGameId && token) {
          await fetchGameTimeline(currentGameId, token);
        }
      } catch (error) {
        console.error('加载时间轴失败:', error);
      }
    };

    // 只有当token存在时才执行请求
    if (token) {
      loadTimeline();
    }
  }, [gameId, token]); // 移除函数依赖，避免重复触发



  return (
    <div className="h-screen overflow-y-auto relative">
      {/* 主要内容区域（与 PersonalSummary 相同布局与卡片风格） */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="w-full max-w-sm mx-auto">
          {/* 顶部标题和刷新按钮 */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-extrabold tracking-wider text-cyan-300">
              History Overview
            </h1>
          </div>
          
          {/* 时间轴组件 */}
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

          {/* 底部返回按钮 */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate(`/game/${gameId}/summary`)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              ← 返回个人总结
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;