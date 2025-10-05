// import { useParams } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

const Timeline = () => {
  // const { gameId } = useParams();
  // const navigate = useNavigate();

  // const goVotingPage = () => {
  //   const currentGameId = gameId || 'demo-game';
  //   navigate(`/game/${currentGameId}/voting`);
  // };

  // 模拟时间轴数据
  const timelineEvents = [
    {
      id: 1,
      time: '反思',
      options: 'a right',
      status: 'completed',
      icon: '🚀'
    },
    {
      id: 2,
      time: '2050',
      title: 'Implement stricter privacy laws and limit sharing of personal data.',
      description: '关于环境保护政策的投票',
      status: 'completed',
      icon: '🗳️',
      result: '支持率: 75%'
    },
    {
      id: 3,
      time: '2051',
      title: 'Encourage more open sharing of personal data to foster community trust.',
      description: '环境保护政策正式实施，影响全球生态',
      status: 'completed',
      icon: '📋'
    },
    {
      id: 4,
      time: '2052',
      title: 'Develop advanced memory tech to enhance collective memory accuracy.',
      description: '关于经济发展策略的投票',
      status: 'active',
      icon: '🗳️',
      result: '投票进行中...'
    },
    {
      id: 5,
      time: '2053',
      title: 'Promote digital literacy to empower individuals in the new tech landscape.',
      description: '全球气候异常，需要紧急应对',
      status: 'pending',
      icon: '⚡'
    },
    {
      id: 6,
      time: '2054',
      title: 'Promote digital literacy to empower individuals in the new tech landscape.',
      description: '关于紧急应对措施的投票',
      status: 'pending',
      icon: '🗳️'
    },
    {
      id: 7,
      time: '2055',
      title: 'Promote digital literacy to empower individuals in the new tech landscape.',
      description: '游戏结束，查看最终影响',
      status: 'pending',
      icon: '🏁'
    },
    {
      id: 7,
      time: '2056',
      title: 'Promote digital literacy to empower individuals in the new tech landscape.',
      description: '游戏结束，查看最终影响',
      status: 'pending',
      icon: '🏁'
    },
    {
      id: 7,
      time: '2057',
      title: 'Promote digital literacy to empower individuals in the new tech landscape.',
      description: '游戏结束，查看最终影响',
      status: 'pending',
      icon: '🏁'
    },
    {
      id: 7,
      time: '2058',
      title: 'Promote digital literacy to empower individuals in the new tech landscape.',
      description: '游戏结束，查看最终影响',
      status: 'pending',
      icon: '🏁'
    },
    {
      id: 7,
      time: '2059',
      title: 'Promote digital literacy to empower individuals in the new tech landscape.',
      description: '游戏结束，查看最终影响',
      status: 'pending',
      icon: '🏁'
    },
    {
      id: 7,
      time: '2060',
      title: 'Promote digital literacy to empower individuals in the new tech landscape.',
      description: '游戏结束，查看最终影响',
      status: 'pending',
      icon: '🏁'
      },
    {
      id: 7,
      time: '反思',
      title: 'Promote digital literacy to empower individuals in the new tech landscape.',
      description: '游戏结束，查看最终影响',
      status: 'pending',
      icon: '🏁'
      }
  ];


  return (
    <div className="h-screen overflow-y-auto bg-black relative">
      {/* 主要内容区域（与 PersonalSummary 相同布局与卡片风格） */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="w-full max-w-sm mx-auto">
          {/* 顶部标题 */}
          <h1 className="text-center text-3xl font-extrabold tracking-wider text-cyan-300 mb-3">
            History Overview
          </h1>

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
                          {event.time}
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
                          {event.options || event.title}
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
                          {event.options || event.title}
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
                          {event.time}
                        </time>
                      </div>
                    </>
                  )}

                  <hr className="bg-cyan-400/40" />
                </li>
              ))}
            </ul>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;