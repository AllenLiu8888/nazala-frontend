import React from 'react';

const TimelineComponent = ({ 
  events = [], 
  loading = false, 
  error = null, 
  onRefresh = null,
  showDebugInfo = false,
  gameId = null,
  token = null 
}) => {
  // 处理API数据，转换为前端显示格式
  const processTimelineEvents = (apiEvents) => {
    if (!Array.isArray(apiEvents)) return [];
    
    return apiEvents.map((event, index) => ({
      id: `timeline-${index}-${event.turn?.id || 'no-turn'}`,
      year: event.turn?.year || `第${index + 1}轮`,
      option_test: event.user_option?.text || '历史事件',
      status: event.turn?.status === 'completed' ? 'completed' : 
              event.turn?.status === 'active' ? 'active' : 'pending',
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
  const timelineEvents = events.length > 0 
    ? processTimelineEvents(events)
    : processTimelineEvents(mockApiData.data.history);

  // 加载状态
  if (loading) {
    return (
      <div className="border-2 border-cyan-400 rounded-xl bg-black/80 backdrop-blur-sm p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-cyan-300 text-lg">加载历史数据中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="border-2 border-red-400 rounded-xl bg-black/80 backdrop-blur-sm p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-red-400 text-lg mb-2">加载失败</p>
          <p className="text-gray-400 text-sm text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-cyan-400 rounded-xl bg-black/80 backdrop-blur-sm p-4">


      {/* 移动端优化的时间轴 */}
      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="relative">
            {/* 移动端：垂直堆叠布局 */}
            <div className="md:hidden">
              <div className="flex items-start space-x-3">
                {/* 状态指示器 */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full ${
                    event.status === 'completed' ? 'bg-green-500' : 
                    event.status === 'active' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                
                {/* 内容区域 */}
                <div className="flex-1 min-w-0">
                  {/* 年份 */}
                  <div className="text-cyan-300 font-mono text-sm mb-1">
                    {event.year}
                  </div>
                  
                  {/* 事件描述 */}
                  <div className="bg-neutral-200 text-black/80 rounded px-3 py-2 text-sm font-semibold shadow-sm">
                    {event.option_test}
                  </div>
                  
                  {/* 结果（如果有） */}
                  {event.result && (
                    <div className="text-[10px] text-cyan-300 bg-slate-800/70 border border-cyan-500/30 px-2 py-1 rounded inline-block mt-2">
                      {event.result}
                    </div>
                  )}
                </div>
              </div>
            </div>

           

           
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineComponent;
