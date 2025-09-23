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
      time: '2050',
      options: 'a right',
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
        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
          {timelineEvents.map((event, index) => (
            <li key={event.id}>
              <div className="timeline-middle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-5 w-5 ${event.status === 'completed' ? 'text-green-500' : event.status === 'active' ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className={`${index % 2 === 0 ? 'timeline-start mb-10 md:text-end' : 'timeline-end md:mb-10'}`}>
                <time className="font-mono italic text-cyan-400">{event.time}</time>
                <div className="text-lg font-black text-cyan-300 flex items-center gap-2">
                  <span>{event.icon}</span>
                  {event.title}
                </div>
                <p className="text-gray-300 text-sm">
                  {event.description}
                </p>
                {event.result && (
                  <div className="text-xs text-cyan-300 bg-slate-700 px-2 py-1 rounded inline-block mt-2">
                    {event.result}
                  </div>
                )}
              </div>
              <hr className="bg-cyan-400 opacity-30" />
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