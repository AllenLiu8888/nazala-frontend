// Zustand 全局游戏状态（screen/mobile 共用前缀 /game/:gameId）
// 作用：集中管理“从后端取数 → 写入全局状态 → 组件订阅渲染”的完整链路
// 消费方式：组件中使用选择器订阅所需字段，如：useGameStore(s => s.turn.index)
import { create } from 'zustand';
import { gameApi } from '../services/gameApi';

// 创建全局 store；set 用于写入/合并状态，get 用于读取最新状态（避免闭包过期）
export const useGameStore = create((set, get) => ({
  // 元数据：与整局游戏相关
  // 映射自 $Game（见 src/services/API_Documentation.md）
  // - id ← game.id
  // - state ← game.status（0 waiting / 1 ongoing / 10 finished / 20 archived）
  // - maxRounds ← game.max_turns；turnsCount ← game.turns_count；playersCount ← game.players_count
  // - joinToken/startedAt/endedAt 同名映射
  gameMeta: {
    id: null,
    state: 'waiting', // waiting | ongoing | finished | archived （由后端 status 数值映射）
    statusCode: null, // 后端原始数值状态，便于排查
    totalRounds: 0,   // 总回合数，来自 max_turns（后备 turns_count）
    maxRounds: 0,     // = max_turns
    turnsCount: 0,    // 已创建/进行的回合数 = turns_count
    playersCount: 0,  // = players_count
    joinToken: null,  // = join_token（如需要）
    startedAt: null,
    endedAt: null,
  },

  // 回合与阶段
  // 映射自 $Turn
  // - id ← turn.id；gameId ← turn.game.id
  // - index ← turn.index（约定 0 为 intro）
  // - status ← turn.status（0 intro / 1 voting / 2 result）→ phase 文本
  // - questionText/options ← 对应字段（options 内含 attrs 影响值）
  turn: {
    id: null,
    gameId: null,
    index: 0, // 0 表示 intro，对应后端第 0 轮
    status: 0, // 0 表示 intro，1 表示 voting，2 表示 result
    year: 2075, // 目前常量，如后端提供可替换
    phase: 'intro', // intro | voting | result
    questionText: null,
    options: [],
  },

  // 玩家状态汇总
  // 主要从 $Turn.total_players / total_choices 推导
  players: {
    joined: 0,
    total: 0,
    voted: 0,
  },

  // 世界/可视化所需数据
  // 如需展示雷达图与叙事，可在 fetchGameDetail/fetchCurrentTurn 后续扩展写入
  world: {
    // 雷达图数据（按固定顺序聚合 $Attributes 平均值）
    categories: ['Memory Equality', 'Technical Control', 'Society Cohesion', 'Autonomy Control'],
    radarData: [],
    narrative: '',
  },

  // UI 辅助状态
  // loading：请求中；error：最近一次错误信息（不断线策略）
  ui: {
    loading: false,
    error: null,
  },

  // 轮询句柄（内部使用）
  // 用于确保全局只存在一个 setInterval，便于 stopPolling 清理
  _pollerId: null,

  // setters（便于逐步接线时手动注入/测试）
  // 仅进行“局部合并更新”（partial），避免整对象被覆盖
  setGameMeta: (partial) => set((state) => ({
    gameMeta: { ...state.gameMeta, ...partial },
  })),
  setTurn: (partial) => set((state) => ({
    turn: { ...state.turn, ...partial },
  })),
  setPlayers: (partial) => set((state) => ({
    players: { ...state.players, ...partial },
  })),
  setWorld: (partial) => set((state) => ({
    world: { ...state.world, ...partial },
  })),
  clearError: () => set((state) => ({
    ui: { ...state.ui, error: null },
  })),

  // 基础行为：获取当前游戏（最小可用）
  // API: GET /api/game/current/
  // 步骤：置 loading → 请求 → 映射 $Game → 写入 gameMeta → 关闭 loading；错误记录到 ui.error 并抛出
  fetchCurrentGame: async () => {
    set((state) => ({ ui: { ...state.ui, loading: true, error: null } }));
    try {
      const data = await gameApi.getCurrentGame();
      const game = data?.game ?? data;
      // 后端 status 数值 -> 文本（参考 API_Documentation.md）
      const toStateText = (code) => {
        switch (code) {
          case 0: return 'waiting';
          case 1: return 'ongoing';
          case 10: return 'finished';
          case 20: return 'archived';
          default: return 'waiting';
        }
      };

      set((state) => ({
        gameMeta: {
          ...state.gameMeta,
          id: game?.id ?? state.gameMeta.id,
          statusCode: game?.status ?? state.gameMeta.statusCode,
          state: toStateText(game?.status ?? state.gameMeta.statusCode),
          // 后端字段映射
          maxRounds: game?.max_turns ?? state.gameMeta.maxRounds,
          turnsCount: game?.turns_count ?? state.gameMeta.turnsCount,
          playersCount: game?.players_count ?? state.gameMeta.playersCount,
          joinToken: game?.join_token ?? state.gameMeta.joinToken,
          startedAt: game?.started_at ?? state.gameMeta.startedAt,
          endedAt: game?.ended_at ?? state.gameMeta.endedAt,
          // totalRounds 以 max_turns 为主，退化到 turns_count
          totalRounds: (game?.max_turns ?? game?.turns_count ?? state.gameMeta.totalRounds),
        },
        ui: { ...state.ui, loading: false, error: null },
      }));

      return game;
    } catch (err) {
      set((state) => ({ ui: { ...state.ui, loading: false, error: err?.message || '请求失败' } }));
      throw err;
    }
  },

  // 获取游戏详情（用于玩家统计、世界信息等）
  // API: GET /api/game/{game_id}/detail/
  // 用途：刷新统计字段（playersCount/turnsCount/maxRounds 等）；可扩展 world 可视化数据
  fetchGameDetail: async (gameId) => {
    try {
      const data = await gameApi.getGameDetail(gameId);
      const game = data?.game ?? data;
      // 与 fetchCurrentGame 一致的状态映射
      const toStateText = (code) => {
        switch (code) {
          case 0: return 'waiting';
          case 1: return 'ongoing';
          case 10: return 'finished';
          case 20: return 'archived';
          default: return 'waiting';
        }
      };
      set((state) => ({
        gameMeta: {
          ...state.gameMeta,
          id: game?.id ?? state.gameMeta.id,
          statusCode: game?.status ?? state.gameMeta.statusCode,
          state: toStateText(game?.status ?? state.gameMeta.statusCode),
          maxRounds: game?.max_turns ?? state.gameMeta.maxRounds,
          turnsCount: game?.turns_count ?? state.gameMeta.turnsCount,
          playersCount: game?.players_count ?? state.gameMeta.playersCount,
          joinToken: game?.join_token ?? state.gameMeta.joinToken,
          startedAt: game?.started_at ?? state.gameMeta.startedAt,
          endedAt: game?.ended_at ?? state.gameMeta.endedAt,
          totalRounds: (game?.max_turns ?? game?.turns_count ?? state.gameMeta.totalRounds),
        },
      }));
      return game;
    } catch (err) {
      set((state) => ({ ui: { ...state.ui, error: err?.message || '获取游戏详情失败' } }));
      return null;
    }
  },

  // 获取当前回合（用于回合、投票进度等）
  // API: GET /api/game/{game_id}/turn/current
  // 用途：驱动大屏 Round/DecisionProgress/UserStates 等组件随回合与投票进度实时更新
  fetchCurrentTurn: async (gameId, token = null) => {
    try {
      const data = await gameApi.getCurrentTurn(gameId, token);
      const turn = data?.turn ?? data;
      // turn.status 数值 -> 阶段文本（0=intro, 1=voting, 2=result）
      const toPhaseText = (code) => {
        switch (code) {
          case 0: return 'intro';
          case 1: return 'voting';
          case 2: return 'result';
          default: return 'intro';
        }
      };
      set((state) => {
        // 从所有选项聚合 $Attributes 平均值，用于可视化
        const attrOrder = state.world.categories || ['Memory Equality', 'Technical Control', 'Society Cohesion', 'Autonomy Control'];
        const totals = Object.create(null);
        const counts = Object.create(null);
        if (Array.isArray(turn?.options)) {
          for (const opt of turn.options) {
            const attrs = Array.isArray(opt?.attrs) ? opt.attrs : [];
            for (const a of attrs) {
              if (!a || typeof a.value !== 'number' || !a.name) continue;
              totals[a.name] = (totals[a.name] || 0) + a.value;
              counts[a.name] = (counts[a.name] || 0) + 1;
            }
          }
        }
        const averaged = attrOrder.map((name) => {
          if (counts[name]) return totals[name] / counts[name];
          // 若后端数据缺失该维度，使用 0 填充
          return 0;
        });
        return ({
        turn: {
          ...state.turn,
          id: turn?.id ?? state.turn.id,
          gameId: (turn?.game?.id ?? gameId ?? state.turn.gameId),
          index: typeof turn?.index === 'number' ? turn.index : state.turn.index,
          status: typeof turn?.status === 'number' ? turn.status : state.turn.status,
          year: state.turn.year, // 如后端未来提供年份可替换
          phase: toPhaseText(turn?.status),
          questionText: turn?.question_text ?? state.turn.questionText,
          options: Array.isArray(turn?.options) ? turn.options : state.turn.options,
          
        },
        players: {
          ...state.players,
          total: typeof turn?.total_players === 'number' ? turn.total_players : state.players.total,
          voted: typeof turn?.total_choices === 'number' ? turn.total_choices : state.players.voted,
          joined: typeof turn?.total_players === 'number' ? turn.total_players : state.players.joined,
        },
          world: {
            ...state.world,
            categories: attrOrder,
            radarData: averaged,
          },
        });
      });
      return turn;
    } catch (err) {
      set((state) => ({ ui: { ...state.ui, error: err?.message || '获取当前回合失败' } }));
      return null;
    }
  },

  // 启动轮询：每 2s 并行拉取 detail + currentTurn（不断线）
  // 目的：让大屏实时反映玩家加入/投票/回合推进；失败写 ui.error 但不停止
  // 策略：Promise.allSettled 并行请求；用 _pollerId 确保仅一个 interval；卸载时 stopPolling 清理
  startPolling: async (providedGameId = null) => {
    let gameId = providedGameId || get().gameMeta.id;
    if (!gameId) {
      try {
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
      } catch {
        gameId = get().gameMeta.id;
      }
    }
    if (!gameId) return;

    // 立即拉一次，失败也不阻塞
    await Promise.allSettled([
      get().fetchGameDetail(gameId),
      get().fetchCurrentTurn(gameId),
    ]);

    // 已存在轮询则跳过
    const existing = get()._pollerId;
    if (existing) return;

    const id = setInterval(() => {
      const gid = providedGameId || get().gameMeta.id;
      if (!gid) return;
      Promise.allSettled([
        get().fetchGameDetail(gid),
        get().fetchCurrentTurn(gid),
      ]);
    }, 2000);

    set(() => ({ _pollerId: id }));
  },

  // 停止轮询
  // 清理 setInterval，避免内存泄漏与重复请求
  stopPolling: () => {
    const id = get()._pollerId;
    if (id) {
      clearInterval(id);
      set(() => ({ _pollerId: null }));
    }
  },

  // 开始游戏：调用后端并将前端状态置为 ongoing
  // API: POST /api/game/{game_id}/start/
  // 前置条件：Game.status 必须是 WAITING；必要时可传入管理员 token
  startGame: async (maybeGameId = null, token = null) => {
    try {
      let gameId = maybeGameId || get().gameMeta.id;
      if (!gameId) {
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
      }
      if (!gameId) throw new Error('未获取到 gameId');

      await gameApi.startGame(gameId, token);

      set((state) => ({
        gameMeta: {
          ...state.gameMeta,
          state: 'ongoing',
          statusCode: 1,
          startedAt: state.gameMeta.startedAt || new Date().toISOString(),
        },
      }));

      return true;
    } catch (err) {
      set((state) => ({ ui: { ...state.ui, error: err?.message || '开始游戏失败' } }));
      return false;
    }
  },

  // 归档游戏：调用后端并将前端状态置为 archived
  // API: POST /api/game/{game_id}/archive/
  // 前置条件：Game.status 必须是 FINISHED；必要时可传入管理员 token
  archiveGame: async (maybeGameId = null, token = null) => {
    try {
      let gameId = maybeGameId || get().gameMeta.id;
      if (!gameId) throw new Error('未获取到 gameId');

      await gameApi.archiveGame(gameId, token);

      set((state) => ({
        gameMeta: {
          ...state.gameMeta,
          state: 'archived',
          statusCode: 20,
          endedAt: state.gameMeta.endedAt || new Date().toISOString(),
        },
      }));

      return true;
    } catch (err) {
      set((state) => ({ ui: { ...state.ui, error: err?.message || '归档游戏失败' } }));
      return false;
    }
  },
}));

export default useGameStore;


