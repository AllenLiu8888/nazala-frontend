import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Timeline = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const goVotingPage = () => {
    const currentGameId = gameId || 'demo-game';
    navigate(`/game/${currentGameId}/voting`);
  };

  // 模拟时间轴数据
  const timelineEvents = [
    {
      id: 1,
      time: '14:30',
      title: '游戏开始',
      description: '所有玩家加入游戏，开始第一轮决策',
      status: 'completed',
      icon: '🚀'
    },
    {
      id: 2,
      time: '14:35',
      title: '第一轮投票',
      description: '关于环境保护政策的投票',
      status: 'completed',
      icon: '🗳️',
      result: '支持率: 75%'
    },
    {
      id: 3,
      time: '14:42',
      title: '政策实施',
      description: '环境保护政策正式实施，影响全球生态',
      status: 'completed',
      icon: '📋'
    },
    {
      id: 4,
      time: '14:48',
      title: '第二轮投票',
      description: '关于经济发展策略的投票',
      status: 'active',
      icon: '🗳️',
      result: '投票进行中...'
    },
    {
      id: 5,
      time: '14:55',
      title: '突发事件',
      description: '全球气候异常，需要紧急应对',
      status: 'pending',
      icon: '⚡'
    },
    {
      id: 6,
      time: '15:02',
      title: '第三轮投票',
      description: '关于紧急应对措施的投票',
      status: 'pending',
      icon: '🗳️'
    },
    {
      id: 7,
      time: '15:10',
      title: '最终结果',
      description: '游戏结束，查看最终影响',
      status: 'pending',
      icon: '🏁'
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'timeline-start timeline-box-success';
      case 'active':
        return 'timeline-start timeline-box-warning';
      case 'pending':
        return 'timeline-start timeline-box-neutral';
      default:
        return 'timeline-start';
    }
  };

  const getIconClass = (status) => {
    switch (status) {
      case 'completed':
        return 'timeline-middle badge badge-success badge-outline';
      case 'active':
        return 'timeline-middle badge badge-warning badge-outline animate-pulse';
      case 'pending':
        return 'timeline-middle badge badge-neutral badge-outline';
      default:
        return 'timeline-middle badge badge-neutral badge-outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* 头部标题 */}
      <div className="text-center pt-8 pb-6">
        <h1 className="text-3xl font-bold mb-2 text-cyan-300">
          游戏时间轴
        </h1>
        <p className="text-gray-300 text-sm">
          追踪你的决策历程
        </p>
      </div>

      {/* DaisyUI 时间轴 */}
      <div className="px-4 pb-20">
        <ul className="timeline timeline-vertical">
          {timelineEvents.map((event, index) => (
            <li key={event.id}>
              {index > 0 && <hr className="bg-cyan-400 opacity-30" />}
              
              <div className="timeline-start timeline-box bg-slate-800 border-cyan-400 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{event.icon}</span>
                    <h3 className="font-bold text-cyan-300">{event.title}</h3>
                  </div>
                  <time className="text-xs text-cyan-400 bg-slate-700 px-2 py-1 rounded">
                    {event.time}
                  </time>
                </div>
                
                <p className="text-gray-300 text-sm mb-2">
                  {event.description}
                </p>
                
                {event.result && (
                  <div className="text-xs text-cyan-300 bg-slate-700 px-2 py-1 rounded inline-block">
                    {event.result}
                  </div>
                )}
              </div>
              
              <div className={getIconClass(event.status)}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              {index < timelineEvents.length - 1 && <hr className="bg-cyan-400 opacity-30" />}
            </li>
          ))}
        </ul>
      </div>

      {/* 底部操作按钮 */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <button 
          className="btn btn-primary bg-cyan-500 hover:bg-cyan-600 border-cyan-500 hover:border-cyan-600"
          onClick={goVotingPage}
        >
          返回投票
        </button>
      </div>
    </div>
  );
};

export default Timeline;