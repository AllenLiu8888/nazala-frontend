// Zustand 全局游戏状态（screen/mobile 共用前缀 /game/:gameId）
// 作用：集中管理"从后端取数 → 写入全局状态 → 组件订阅渲染"的完整链路
// 消费方式：组件中使用选择器订阅所需字段，如：useGameStore(s => s.turn.index)
import { create } from 'zustand';
import { gameApi } from '../services/gameApi';
import { CONFIG, toPhaseText, updateGameMetaFromApi, getGameId } from './common_tools';

// 创建全局 store；set 用于写入/合并状态，get 用于读取最新状态（避免闭包过期）
export const useGameStoreScreen = create((set, get) => ({
  // 元数据：与整局游戏相关
  // 映射自 $Game（见 src/services/API_Documentation.md）
  // - id ← game.id
  // - state ← game.status（0 waiting / 1 ongoing / 10 finished / 20 archived）
  // - maxRounds ← game.max_turns；turnsCount ← game.turns_count；playersCount ← game.players_count
  // - joinToken/startedAt/endedAt 同名映射
  gameMeta: {
    id: null,
    state: 'waiting', // waiting | ongoing | archived （由后端 status 数值映射）//状态
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
    statusRaw: null, // 保留后端原始 status，目前只有0
    questionText: null,
    storyText: null,
    options: [],
    attrs: [],
    total_players: 0,
    total_choices: 0,
  },

  // 玩家状态汇总
  // 主要从 $Turn.total_players / total_choices 推导
  players: {
    joined: 0,
    total: 0,
    voted: 0,
  },

  // 世界/可视化所需数据
  world: {
    // 雷达图数据（按固定顺序聚合 $Attributes 平均值）
    categories: ['Memory Equality', 'Technical Control', 'Society Cohesion', 'Autonomy Control'],
    radarData: [],
    narrative: '',
  },

  // 时间轴数据
  timeline: {
    events: [], // 历史事件列表
    loading: false,
    error: null,
  },

  // 结局内容
  ending: {
    text: '',
    loading: false,
    error: null,
  },

  // UI 辅助状态
  // loading：请求中；error：最近一次错误信息（不断线策略）
  ui: {
    loading: false,
    error: null,
    generating: false,
  },

  // 轮询句柄（内部使用）
  _lobbyPollerId: null,
  _introPollerId: null,
  _dashboardPollerId: null,

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
  setTimeline: (partial) => set((state) => ({
    timeline: { ...state.timeline, ...partial },
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

      set((state) => ({
        gameMeta: updateGameMetaFromApi(game, state.gameMeta),
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

      set((state) => ({
        gameMeta: updateGameMetaFromApi(game, state.gameMeta),
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
    
      // 检查回合数据是否有效
      if (!turn || typeof turn.index !== 'number') {
        return null;
      }

      set((state) => {
        const attrOrder = state.world.categories || ['Memory Equality', 'Technical Control', 'Society Cohesion', 'Autonomy Control'];

        // 规范化后端字段名到前端展示名
        const normalizeAttrName = (raw) => {
          switch (raw) {
            case 'TechnologicalControl': return 'Technical Control';
            case 'SocialCohesion': return 'Society Cohesion';
            case 'MemoryEquity': return 'Memory Equality';
            case 'PersonalAgency': return 'Autonomy Control';
            default: return raw;
          }
        };

        const turnLevelAttrs = Array.isArray(turn?.attrs) ? turn.attrs : null;

        const computeFromOptions = () => {
          const totals = Object.create(null);
          const counts = Object.create(null);
          if (Array.isArray(turn?.options)) {
            for (const opt of turn.options) {
              const attrs = Array.isArray(opt?.attrs) ? opt.attrs : [];
              for (const a of attrs) {
                if (!a || typeof a.value !== 'number' || !a.name) continue;
                const name = normalizeAttrName(a.name);
                totals[name] = (totals[name] || 0) + a.value;
                counts[name] = (counts[name] || 0) + 1;
              }
            }
          }
          return attrOrder.map((name) => (counts[name] ? totals[name] / counts[name] : 0));
        };

        const computeFromTurnAttrs = () => {
          const nameToValue = Object.create(null);
          for (const a of turnLevelAttrs) {
            if (!a || typeof a.value !== 'number' || !a.name) continue;
            const name = normalizeAttrName(a.name);
            nameToValue[name] = a.value;
          }
          return attrOrder.map((name) => (typeof nameToValue[name] === 'number' ? nameToValue[name] : 0));
        };

        const radarValues = turnLevelAttrs ? computeFromTurnAttrs() : computeFromOptions();

        return ({
          turn: {
            ...state.turn,
            id: turn?.id ?? state.turn.id,
            gameId: (turn?.game?.id ?? gameId ?? state.turn.gameId),
            index: typeof turn?.index === 'number' ? turn.index : state.turn.index,
            status: typeof turn?.status === 'number' ? turn.status : state.turn.status,
            year: (typeof turn?.year === 'number' ? turn.year : state.turn.year),
            phase: toPhaseText(turn?.status),
            statusRaw: (turn?.status !== undefined ? turn.status : state.turn.statusRaw),
            questionText: turn?.question_text ?? state.turn.questionText,
            storyText: turn?.story ?? state.turn.storyText,
            options: Array.isArray(turn?.options) ? turn.options : state.turn.options,
            attrs: Array.isArray(turnLevelAttrs) ? turnLevelAttrs : state.turn.attrs,
            total_players: typeof turn?.total_players === 'number' ? turn.total_players : state.turn.total_players,
            total_choices: typeof turn?.total_choices === 'number' ? turn.total_choices : state.turn.total_choices,
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
            radarData: radarValues,
          },
        });
      });
      return turn;
    } catch (err) {
      console.warn('[Store] ⚠️ 获取当前回合失败:', err.message);
      
      // 如果是"回合已存在"错误，说明后端有回合但可能数据有问题
      if (err.message.includes('Current turn already exists')) {
        console.info('[Store] ℹ️ 后端提示回合已存在，但获取失败，可能是数据问题');
        return null;
      }
      
      // 如果是"回合不存在"错误，不设置错误状态
      if (err.message.includes('Current turn does not exist')) {
        return null;
      }
      
      // 其他错误才设置错误状态
      set((state) => ({ ui: { ...state.ui, error: err?.message || '获取当前回合失败' } }));
      return null;
    }
  },

  // Lobby 专用轮询：仅拉取 gameDetail（不请求 turn）
  startPollingForLobby: async (providedGameId = null) => {
    // 已存在轮询则跳过
    const existing = get()._lobbyPollerId;
    if (existing) return;

    let gameId;
    try {
      gameId = await getGameId(get, providedGameId, true);
    } catch {
      return;
    }

    // 立即拉一次，失败也不阻塞
    await Promise.allSettled([
      get().fetchGameDetail(gameId),
    ]);

    const id = setInterval(async () => {
      const gid = get().gameMeta.id;
      if (!gid) return;
      await Promise.allSettled([
        get().fetchGameDetail(gid),
      ]);
      console.log("Lobby fetchGameDetail");
    }, CONFIG.POLLING_INTERVAL_MS);

    set(() => ({ _lobbyPollerId: id }));
  },

  // Intro 专用轮询：仅拉取 currentTurn, 供外部调用方获知当前 turn 是否全部玩家已提交,
  startPollingForIntro: async (providedGameId = null) => {
    // 已存在轮询则跳过
    const existing = get()._introPollerId;
    if (existing) return;

    let gameId;
    try {
      gameId = await getGameId(get, providedGameId, true);
    } catch {
      return;
    }

    // 立即拉一次，失败也不阻塞
    await Promise.allSettled([
      get().fetchCurrentTurn(gameId),
    ]);

    const id = setInterval(async () => {
      const gid = get().gameMeta.id;
      if (!gid) return;

      await Promise.allSettled([
        get().fetchCurrentTurn(gid),
      ]);
      console.log("Intro fetchCurrentTurn");
    }, CONFIG.POLLING_INTERVAL_MS);

    set(() => ({ _introPollerId: id }));
  },

  // Dashboard 专用轮询：仅拉取 currentTurn, 供外部调用方获知当前 turn 是否全部玩家已提交,
  startPollingForDashboard: async (providedGameId = null) => {
    // 已存在轮询则跳过
    const existing = get()._dashboardPollerId;
    if (existing) return;

    let gameId;
    try {
      gameId = await getGameId(get, providedGameId, true);
    } catch {
      return;
    }

    // 立即拉一次，失败也不阻塞
    await Promise.allSettled([
      get().fetchCurrentTurn(gameId),
    ]);

    const id = setInterval(async () => {
      const gid = get().gameMeta.id;
      if (!gid) return;

      await Promise.allSettled([
        get().fetchCurrentTurn(gid),
      ]);
      console.log("Dashboard fetchCurrentTurn");
    }, CONFIG.POLLING_INTERVAL_MS);

    set(() => ({ _dashboardPollerId: id }));
  },

  // 停止轮询
  // 清理 setInterval，避免内存泄漏与重复请求
  stopLobbyPolling: () => {
    const id = get()._lobbyPollerId;
    if (id) {
      clearInterval(id);
      set(() => ({ _lobbyPollerId: null }));
    }
  },

  stopIntroPolling: () => {
    const id = get()._introPollerId;
    if (id) {
      clearInterval(id);
      set(() => ({ _introPollerId: null }));
    }
  },

  stopDashboardPolling: () => {
    const id = get()._dashboardPollerId;
    if (id) {
      clearInterval(id);
      set(() => ({ _dashboardPollerId: null }));
    }
  },

  // 开始游戏：调用后端并将前端状态置为 ongoing
  // API: POST /api/game/{game_id}/start/
  // 前置条件：Game.status 必须是 WAITING；必要时可传入管理员 token
  startGame: async (maybeGameId = null, token = null) => {
    try {
      const gameId = await getGameId(get, maybeGameId);
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
      console.error('[Store] ❌ 开始游戏失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '开始游戏失败' } }));
      return false;
    }
  },

  // 初始化/开启当前回合（主持/管理员动作）
  initCurrentTurn: async (token = null) => {
    try {
      const gameId = await getGameId(get);

      // 检查游戏状态
      const gameState = get().gameMeta.state;
      const gameStatusCode = get().gameMeta.statusCode;
      
      if (gameState !== 'ongoing' && gameStatusCode !== 1) {
        throw new Error(`游戏状态不正确，无法创建回合。当前状态: ${gameState} (${gameStatusCode})`);
      }
      
      console.info('[Store] 📡 调用 initTurn API...', { gameId, hasToken: !!token });
      try {
        const initResult = await gameApi.initTurn(gameId, token);
        console.info('[Store] ✅ initTurn API 调用成功:', initResult);
      } catch (initErr) {
        // 如果是"回合已存在"错误，说明回合已经存在，直接尝试获取
        if (initErr.message.includes('Current turn already exists')) {
          console.info('[Store] ℹ️ 回合已存在，直接获取回合数据...');
        } else {
          // 其他错误才抛出
          throw initErr;
        }
      }

      // 刷新当前回合
      const turnResult = await get().fetchCurrentTurn(gameId, token);
      
      // 检查回合数据是否有效
      if (!turnResult || typeof turnResult.index !== 'number') {
        throw new Error('获取回合数据失败或数据无效');
      }
      
      return true;
    } catch (err) {
      console.error('[Store] ❌ 初始化回合失败:', err);
      console.error('[Store] ❌ 错误详情:', {
        message: err.message,
        status: err.status,
        code: err.code
      });
      set((state) => ({ ui: { ...state.ui, error: err?.message || '初始化回合失败' } }));
      return false;
    }
  },

  // 提交/结束当前回合（主持/管理员动作）
  submitCurrentTurn: async (token = null) => {
    console.info('[Store] 📤 开始提交当前回合...', { hasToken: !!token });
    try {
      set((state) => ({ ui: { ...state.ui, generating: true } }));
      const gameId = await getGameId(get);
      await gameApi.submitTurn(gameId, token);
      // 成功后刷新当前回合
      await get().fetchCurrentTurn(gameId, token);
      set((state) => ({ ui: { ...state.ui, generating: false } }));
      return true;
    } catch (err) {
      console.error('[Store] ❌ 提交回合失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '提交回合失败', generating: false } }));
      return false;
    }
  },

  finishGame: async () => {
    let gameId;
    try {
      gameId = await getGameId(get, null, true);
    } catch {
      return;
    }

    // 调用后端 API 将游戏状态设为 finished
    try {
      await gameApi.finishGame(gameId, null);
    } catch (err) {
      console.error('[Store] ❌ 调用 finishGame API 失败:', err);
    }
    
    // 更新前端状态
    set((state) => ({
      gameMeta: {
        ...state.gameMeta,
        state: 'finished',
        statusCode: 10,
        endedAt: new Date().toISOString(),
      }
    }));
  },

  // 获取结局文案
  fetchGameEnding: async (maybeGameId = null, token = null) => {
    set((state) => ({ ending: { ...state.ending, loading: true, error: null } }));
    try {
      const gameId = await getGameId(get, maybeGameId, true);
      const res = await gameApi.getGameEnding(gameId, token);
      const text = res?.ending || res?.text || res?.data || '';
      set((state) => ({ ending: { ...state.ending, loading: false, text } }));
      return text;
    } catch (err) {
      set((state) => ({ ending: { ...state.ending, loading: false, error: err?.message || '获取结局失败' } }));
      return '';
    }
  },

  // 归档游戏：调用后端并将前端状态置为 archived
  // API: POST /api/game/{game_id}/archive/
  // 前置条件：Game.status 必须是 FINISHED；必要时可传入管理员 token
  archiveGame: async (maybeGameId = null, token = null) => {
    try {
      const gameId = await getGameId(get, maybeGameId, false);

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

export default useGameStoreScreen;
