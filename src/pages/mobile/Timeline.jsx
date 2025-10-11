import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGameStoreMobile from '../../store/index_mobile';

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
        
        if (currentGameId) {
          await fetchGameTimeline(currentGameId, token || null);
        }
      } catch (error) {
        console.error('加载时间轴失败:', error);
      }
    };

    loadTimeline();
  }, [gameId, token, fetchGameTimeline, fetchCurrentGame]);

  // 处理API数据，转换为前端显示格式
  const processTimelineEvents = (apiEvents) => {
    if (!Array.isArray(apiEvents)) return [];
    
    return apiEvents.map((event, index) => ({
      id: event.turn?.id || index + 1,
      year: event.turn?.year || `第${index + 1}轮`,
      option_test: event.user_option?.text || '历史事件',
      status: event.turn?.status === 'completed' ? 'completed' : 
              event.turn?.status === 'active' ? 'active' : 'pending',
      icon: '🗳️',
      result: event.result || null,
      title: event.turn?.question_text || event.title || '历史事件',
      description: event.description || '事件描述'
    }));
  };

  // 模拟API返回的假数据
  const mockApiData = {
    "status": true,
    "data": {
      "history": [
        {
          "turn": {
            "id": 0,
            "year": "2050",
            "question_text": "假数据：反思问题1",
            "status": "completed"
          },
          "user_option": {
            "text": "假数据：反思问题 1 支持严格的环境保护法规"
          }
        },
        {
          "turn": {
            "id": 1,
            "year": "2051",
            "question_text": "假数据：关于经济发展策略的投票",
            "status": "completed"
          },
          "user_option": {
            "text": "假数据：优先发展绿色经济"
          }
        },
        {
          "turn": {
            "id": 2,
            "year": "2052",
            "question_text": "假数据：关于技术发展的投票",
            "status": "active"
          },
          "user_option": {
            "text": "假数据：推进人工智能技术发展"
          }
        },
        {
          "turn": {
            "id": 3,
            "year": "2053",
            "question_text": "假数据：关于社会政策的投票",
            "status": "pending"
          },
          "user_option": {
            "text": "假数据：加强社会公平保障"
          }
        },
        {
          "turn": {
            "id": 4,
            "year": "2054",
            "question_text": "假数据：反思问题2",
            "status": "pending"
          },
          "user_option": {
            "text": "假数据：推广数字化教育"
          }
        }
      ]
    }
  };

  // 使用API数据或模拟数据
  const timelineEvents = timeline.events.length > 0 
    ? processTimelineEvents(timeline.events)
    : processTimelineEvents(mockApiData.data.history);

  // 加载状态
  if (timeline.loading) {
    return (
      <div className="h-screen overflow-y-auto bg-black relative">
        <div className="relative z-10 min-h-screen p-4">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-center text-3xl font-extrabold tracking-wider text-cyan-300 mb-3">
              History Overview
            </h1>
            <div className="border-2 border-cyan-400 rounded-xl bg-black/80 backdrop-blur-sm p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
                <p className="text-cyan-300 text-lg">加载历史数据中...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (timeline.error) {
    return (
      <div className="h-screen overflow-y-auto bg-black relative">
        <div className="relative z-10 min-h-screen p-4">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-center text-3xl font-extrabold tracking-wider text-cyan-300 mb-3">
              History Overview
            </h1>
            <div className="border-2 border-red-400 rounded-xl bg-black/80 backdrop-blur-sm p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <p className="text-red-400 text-lg mb-2">加载失败</p>
                <p className="text-gray-400 text-sm text-center">{timeline.error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-black relative">
      {/* 主要内容区域（与 PersonalSummary 相同布局与卡片风格） */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="w-full max-w-sm mx-auto">
          {/* 顶部标题和刷新按钮 */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-extrabold tracking-wider text-cyan-300">
              History Overview
            </h1>
            <button
              onClick={() => {
                const currentGameId = gameId || (timeline.events.length > 0 ? 'current' : null);
                if (currentGameId) {
                  fetchGameTimeline(currentGameId, token || null);
                }
              }}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-sm text-white"
              disabled={timeline.loading}
            >
              {timeline.loading ? '加载中...' : '刷新'}
            </button>
          </div>
          
          {/* 调试信息 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-gray-400">
              <p>游戏ID: {gameId || '未设置'}</p>
              <p>Token: {token ? '已设置' : '未设置'}</p>
              <p>事件数量: {timeline.events.length}</p>
              <p>数据源: {timeline.events.length > 0 ? 'API' : '模拟数据'}</p>
            </div>
          )}

          {/* 主要卡片（同 PersonalSummary 风格） */}
          <div className="border-2 border-cyan-400 rounded-xl bg-black/80 backdrop-blur-sm p-4">
            {/* DaisyUI 时间轴 */}
            <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
              {timelineEvents.map((event, index) => (
                <li key={event.id}>
                  {/* 交叉布局：偶数时间在左、选项在右；奇数相反 */}
                  {index % 2 === 0 ? (
                    <>
                      <div className="timeline-start md:text-end">
                        <time className="font-mono italic text-cyan-300 text-base md:text-lg">
                          {event.year}
                        </time>
                      </div>
                      <div className="timeline-middle">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`h-5 w-5 ${event.status === 'completed' ? 'text-green-500' : event.status === 'active' ? 'text-yellow-500' : 'text-gray-400'}`}
                        >
                          <circle cx="10" cy="10" r="8" />
                        </svg>
                      </div>
                      <div className="timeline-end md:mb-8">
                        <div className="bg-neutral-200 text-black/80 rounded px-3 py-2 text-sm font-semibold inline-block shadow-sm">
                          {event.option_test}
                        </div>
                        {event.result && (
                          <div className="text-[10px] text-cyan-300 bg-slate-800/70 border border-cyan-500/30 px-2 py-1 rounded inline-block mt-2">
                            {event.result}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="timeline-start md:text-end">
                        <div className="bg-neutral-200 text-black/80 rounded px-3 py-2 text-sm font-semibold inline-block shadow-sm">
                          {event.option_test}
                        </div>
                        {event.result && (
                          <div className="text-[10px] text-cyan-300 bg-slate-800/70 border border-cyan-500/30 px-2 py-1 rounded inline-block mt-2">
                            {event.result}
                          </div>
                        )}
                      </div>
                      <div className="timeline-middle">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`h-5 w-5 ${event.status === 'completed' ? 'text-green-500' : event.status === 'active' ? 'text-yellow-500' : 'text-gray-400'}`}
                        >
                          <circle cx="10" cy="10" r="8" />
                        </svg>
                      </div>
                      <div className="timeline-end md:mb-8">
                        <time className="font-mono italic text-cyan-300 text-base md:text-lg">
                          {event.year}
                        </time>
                      </div>
                    </>
                  )}

                  <hr className="bg-cyan-400/40" />
                </li>
              ))}
            </ul>

          </div>

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