import { useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import useGameStoreScreen from '../../store/index_screen';

// 动态可视化：按「阶段节点」展示四条泳道（大屏 / 手机 / 后端 / LLM），
// 根据全局状态自动高亮当前节点并滚动到视图中。
export default function FlowMonitor() {
  const { gameId } = useParams();

  // 订阅全局状态
  const gameState = useGameStoreScreen(s => s.gameMeta.state);
  // const statusCode = useGameStoreScreen(s => s.gameMeta.statusCode);
  const playersTotal = useGameStoreScreen(s => s.players.total);
  const playersVoted = useGameStoreScreen(s => s.players.voted);
  const turnIndex = useGameStoreScreen(s => s.turn.index);
  // const phase = useGameStoreScreen(s => s.turn.phase);
  const uiGenerating = useGameStoreScreen(s => s.ui.generating);

  // 启动仪表轮询：并行轮询「游戏详情（状态/人数）」与「当前回合」
  useEffect(() => {
    const {
      startPollingForDashboard,
      stopDashboardPolling,
      startPollingForLobby,
      stopLobbyPolling,
    } = useGameStoreScreen.getState();

    // 轮询回合（用于 round 进度、高亮切换）
    startPollingForDashboard(gameId);
    // 轮询游戏详情（用于 waiting→ongoing、finished、archived 状态切换）
    startPollingForLobby(gameId);

    return () => {
      stopDashboardPolling();
      stopLobbyPolling();
    };
  }, [gameId]);

  // 计算当前阶段与展示节点（列出 Round1-10，Reflection=Round11）
  const { nodes, activeId } = useMemo(() => {
    // 推断阶段
    // 优先级：archived → archived；finished → gameover；
    // waiting → lobby；ongoing & turnIndex=0 → intro；
    // ongoing & 1..10 → 对应 round-n；turnIndex=11 → reflection；
    const inferKey = () => {
      if (gameState === 'archived') return 'archived';
      if (gameState === 'finished') return 'gameover';
      if (gameState === 'waiting') return 'lobby';
      if (gameState === 'ongoing') {
        if (turnIndex === 0) return 'intro';
        if (typeof turnIndex === 'number') {
          if (turnIndex >= 1 && turnIndex <= 10) return `round-${turnIndex}`;
          if (turnIndex === 11) return 'reflection';
        }
        return 'intro';
      }
      return 'unknown';
    };

    const idOf = (k) => `node-${k}`;
    const route = (p) => `/game/${gameId || 'demo-game'}${p}`;
    const mkNode = (key, label, lanes) => ({ id: idOf(key), key, label, lanes });

    const baseNodes = [
      mkNode('home', 'Home', {
        screen: { route: '/', desc: 'Home / Create game' },
        mobile: { route: null, desc: 'No action' },
        backend: { api: [], desc: '—' },
        llm: { desc: 'Idle' },
      }),
      mkNode('lobby', 'Lobby / Waiting', {
        screen: { route: route('/lobby'), desc: 'Show QR, poll player count, host can start' },
        mobile: { route: route('/waiting'), desc: 'Waiting for host to start' },
        backend: { api: ['GET /api/game/{id}/detail/'], desc: 'Fetch player counts and game detail (polling)' },
        llm: { desc: 'Idle' },
      }),
      mkNode('intro', 'Intro (Round 0)', {
        screen: { route: route('/intro'), desc: 'Story background and guidance (Intro BGM)' },
        mobile: { route: route('/voting'), desc: 'Values question (turn index 0)' },
        backend: { api: ['GET /api/game/{id}/turn/current'], desc: 'Fetch current turn (index 0)' },
        llm: { desc: 'Standby' },
      }),
    ];

    const roundNodes = Array.from({ length: 10 }).map((_, i) => {
      const n = i + 1;
      return mkNode(`round-${n}`, `Round ${n}`, {
        screen: { route: route('/game'), desc: `Live voting progress and visuals (${playersVoted}/${playersTotal})` },
        mobile: { route: route('/voting'), desc: 'This round question; after submit, wait for next round' },
        backend: { api: ['GET /api/game/{id}/turn/current', 'POST /api/game/{id}/turn/submit'], desc: 'Fetch turn data; when all submitted, submit turn' },
        llm: { desc: 'Generate story and questions' },
      });
    });

    const tailNodes = [
      mkNode('reflection', 'Reflection (Round 11)', {
        screen: { route: route('/reflection'), desc: 'Reflection page / recap & guidance' },
        mobile: { route: route('/summary'), desc: 'Personal summary (link to /timeline)' },
        backend: { api: ['GET /api/game/{id}/player/summary/', 'GET /api/game/{id}/player/history/'], desc: 'Fetch personal summary and timeline' },
        llm: { desc: 'Idle' },
      }),
      mkNode('gameover', 'Game Over', {
        screen: { route: route('/gameover'), desc: 'End screen / show summary info' },
        mobile: { route: route('/summary'), desc: 'Personal summary / timeline' },
        backend: { api: ['POST /api/game/{id}/finish/'], desc: 'Set game status to finished; can archive afterward' },
        llm: { desc: 'Generate ending' },
      }),
      mkNode('archived', 'Archived', {
        screen: { route: null, desc: 'Archived' },
        mobile: { route: null, desc: 'Reviewable' },
        backend: { api: ['POST /api/game/{id}/archive/'], desc: 'Archive this game' },
        llm: { desc: 'Idle' },
      }),
    ];

    const nodesList = [...baseNodes, ...roundNodes, ...tailNodes];
    const activeKey = inferKey();
    const active = idOf(activeKey);
    return { nodes: nodesList, activeId: active };
  }, [gameId, gameState, playersTotal, playersVoted, turnIndex, uiGenerating]);

  // 自动滚动到当前节点
  const containerRef = useRef(null);
  const activeRef = useRef(null);
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      try {
        activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        // ignore
      }
    }
  }, [activeId]);

  const NodeCard = ({ node }) => {
    const isActive = node.id === activeId;
    return (
      <div
        id={node.id}
        ref={isActive ? activeRef : null}
        className={`relative rounded-lg border border-cyan-400/60 bg-black/40 px-4 py-3 mb-6 transition-colors ${isActive ? 'ring-2 ring-cyan-400 bg-black/20' : ''}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-cyan-800'}`}/>
          <div className="text-cyan-200 font-semibold">{node.label}</div>
          <div className="ml-auto text-xs text-cyan-400/70">{gameState} · turn {String(turnIndex ?? '-')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-stretch">
          <Lane title="Screen" item={node.lanes.screen} />
          <Lane title="Mobile" item={node.lanes.mobile} />
          <Lane title="Backend" item={node.lanes.backend} />
          <Lane title="LLM" item={node.lanes.llm} />
        </div>

        <div className="absolute left-4 right-4 -bottom-3 h-px bg-cyan-400/30"/>
      </div>
    );
  };

  const Lane = ({ title, item }) => {
    const RouteText = () => (
      <div className="mb-1">
        {item?.route ? `Route: ${item.route}` : 'Route: —'}
      </div>
    );

    const ApiList = () => {
      const apis = Array.isArray(item?.api) ? item.api : [];
      const hasApis = apis.length > 0;
      return (
        <div className="mt-1">
          <div>API:</div>
          {hasApis ? (
            <ul className="list-disc ml-4 mt-0.5">
              {apis.map((a, idx) => (
                <li key={idx} className="break-all">{a}</li>
              ))}
            </ul>
          ) : (
            <div>—</div>
          )}
        </div>
      );
    };

    const content = (
      <div className="rounded-md border border-cyan-700/50 bg-black/30 px-3 py-2 min-h-32 h-full flex flex-col text-sm text-cyan-400/80">
        <div className="text-lg text-cyan-100 mb-2">{title}</div>
        {title === 'Backend' ? (
          <ApiList />
        ) : (
          <RouteText />
        )}
        <div className="mt-auto pt-2 text-base text-cyan-100">
          Purpose: {item?.desc || '—'}
        </div>
      </div>
    );
    if (item?.route) {
      return (
        <Link className="no-underline hover:opacity-90" to={item.route}>
          {content}
        </Link>
      );
    }
    return content;
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="h-full w-full overflow-y-auto p-4 md:p-6" ref={containerRef}>
        <div className="mb-4 flex items-center gap-3">
          <div className="text-cyan-300 text-lg font-semibold">Flow Monitor</div>
          <div className="text-cyan-500 text-xs">gameId: {gameId || 'demo-game'}</div>
          <div className="ml-auto text-cyan-500/80 text-xs">players: {playersVoted}/{playersTotal}</div>
        </div>

        <div className="text-cyan-400/80 text-xs mb-4">
          Note: This is a dynamic flow view that auto-aligns and highlights the current stage. Click a card to navigate to its route.
        </div>

        <div className="relative">
          {nodes.map((n) => (
            <NodeCard key={n.id} node={n} />
          ))}
        </div>
      </div>
    </div>
  );
}


