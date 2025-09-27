import { create } from 'zustand';
import { gameApi } from '../services/gameApi';

export const useGameStore = create((set, get) => ({
  // 元数据：与整局游戏相关
  gameMeta: {
    id: null,
    state: 'waiting', // waiting | ongoing | archived （由后端 status 数值映射）
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
  turn: {
    index: 0, // 0 表示 intro，对应后端第 0 轮
    year: null,
    phase: 'intro', // intro | voting | result
    questionText: null,
    options: [],
  },

  // 玩家状态汇总
  players: {
    joined: 0,
    total: 0,
    voted: 0,
  },

  // 世界/可视化所需数据
  world: {
    radarData: [],
    narrative: '',
  },

  // UI 辅助状态
  ui: {
    loading: false,
    error: null,
  },

  // 轮询句柄（内部使用）
  _pollerId: null,

  // setters（便于逐步接线时手动注入/测试）
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
  fetchCurrentGame: async () => {
    set((state) => ({ ui: { ...state.ui, loading: true, error: null } }));
    try {
      const data = await gameApi.getCurrentGame();
      const game = data?.game ?? data;
      // 后端 status 数值 -> 文本
      const toStateText = (code) => {
        switch (code) {
          case 0: return 'waiting';
          case 1: return 'ongoing';
          case 2: return 'archived';
          default: return 'waiting';
        }
      };

      set((state) => ({
        gameMeta: {
          ...state.gameMeta,
          id: game?.id ?? state.gameMeta.id,
          statusCode: game?.status ?? state.gameMeta.statusCode,
          state: game?.state ?? toStateText(game?.status) ?? state.gameMeta.state,
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
  fetchGameDetail: async (gameId) => {
    try {
      const data = await gameApi.getGameDetail(gameId);
      const game = data?.game ?? data;
      set((state) => ({
        gameMeta: {
          ...state.gameMeta,
          id: game?.id ?? state.gameMeta.id,
          statusCode: game?.status ?? state.gameMeta.statusCode,
          state: game?.state ?? state.gameMeta.state,
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
      set((state) => ({
        turn: {
          ...state.turn,
          index: typeof turn?.index === 'number' ? turn.index : state.turn.index,
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
      }));
      return turn;
    } catch (err) {
      set((state) => ({ ui: { ...state.ui, error: err?.message || '获取当前回合失败' } }));
      return null;
    }
  },

  // 启动轮询：每 2s 并行拉取 detail + currentTurn（不断线）
  startPolling: async () => {
    let gameId = get().gameMeta.id;
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
      const gid = get().gameMeta.id;
      if (!gid) return;
      Promise.allSettled([
        get().fetchGameDetail(gid),
        get().fetchCurrentTurn(gid),
      ]);
    }, 2000);

    set(() => ({ _pollerId: id }));
  },

  // 停止轮询
  stopPolling: () => {
    const id = get()._pollerId;
    if (id) {
      clearInterval(id);
      set(() => ({ _pollerId: null }));
    }
  },

  // 开始游戏：调用后端并将前端状态置为 ongoing
  startGame: async (token = null) => {
    try {
      let gameId = get().gameMeta.id;
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
}));

export default useGameStore;


