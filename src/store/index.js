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
  // - startYear/endYear ← game.start_year / game.end_year
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
    startYear: null,
    endYear: null,
  },

  // 回合与阶段
  // 映射自 $Turn
  // - id ← turn.id；gameId ← turn.game.id
  // - index ← turn.index（约定 0 为 intro）
  // - status ← turn.status（0 intro / 1 voting / 2 result）→ phase 文本
  // - questionText/options ← 对应字段（options 内含 attrs 影响值）
  // - year/attrs ← turn.year / turn.attrs（优先用于世界态势图）
  turn: {
    id: null,
    gameId: null,
    index: 0, // 0 表示 intro，对应后端第 0 轮
    status: 0, // 0 表示 intro，1 表示 voting，2 表示 result
    year: null,
    phase: 'intro', // intro | voting | result
    statusRaw: null, // 保留后端原始 status，目前只有0
    questionText: null,
    options: [],
    attrs: [],
    total_players: 0,
    total_choices: 0,
    timeLeft: null, // 倒计时剩余秒数（前端计算）
    turnEndsAt: null, // 回合结束时间戳（从后端获取，如果后端提供的话）
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

  // 时间轴数据
  timeline: {
    events: [], // 历史事件列表
    loading: false,
    error: null,
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
          startYear: game?.start_year ?? state.gameMeta.startYear,
          endYear: game?.end_year ?? state.gameMeta.endYear,
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
          startYear: game?.start_year ?? state.gameMeta.startYear,
          endYear: game?.end_year ?? state.gameMeta.endYear,
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
      
      console.info('[Store] 📊 获取到回合数据:', {
        hasData: !!data,
        hasTurn: !!turn,
        turnKeys: turn ? Object.keys(turn) : [],
        questionText: turn?.question_text,
        optionsCount: turn?.options?.length || 0,
        turnIndex: turn?.index,
        currentTurnEndsAt: turn?.turnEndsAt,
        oldTurnEndsAt: get().turn.turnEndsAt
      });
      
      // 检查回合数据是否有效
      if (!turn || typeof turn.index !== 'number') {
        console.warn('[Store] ⚠️ 回合数据无效:', turn);
        return null;
      }
      
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
        // 优先使用 turn.attrs（若后端提供），否则从所有选项聚合 $Attributes 平均值用于可视化
        const attrOrder = state.world.categories || ['Memory Equality', 'Technical Control', 'Society Cohesion', 'Autonomy Control'];

        // 规范化后端字段名到前端展示名
        const normalizeAttrName = (raw) => {
          switch (raw) {
            case 'TechnologicalControl': return 'Technical Control';
            case 'SocialCohesion': return 'Society Cohesion';
            case 'MemoryEquity': return 'Memory Equality';
            case 'PersonalAgency': return 'Autonomy Control';
            default: return raw; // 兼容旧字段名（已与展示名一致）
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
          options: Array.isArray(turn?.options) ? turn.options : state.turn.options,
          attrs: Array.isArray(turnLevelAttrs) ? turnLevelAttrs : state.turn.attrs,
          total_players: typeof turn?.total_players === 'number' ? turn.total_players : state.turn.total_players,
          total_choices: typeof turn?.total_choices === 'number' ? turn.total_choices : state.turn.total_choices,
          // 新回合时将结束时间设为 5 秒后，或者如果当前时间已过期也重新设置
          turnEndsAt: (() => {
            const newIndex = typeof turn?.index === 'number' ? turn.index : null;
            const oldIndex = state.turn.index;
            const isNewTurn = newIndex !== null && newIndex !== oldIndex;
            const isExpired = state.turn.turnEndsAt && new Date(state.turn.turnEndsAt) <= new Date();
            const hasNoTime = !state.turn.turnEndsAt;
            
            console.info('[Store] 🕐 时间设置逻辑:', {
              newIndex,
              oldIndex,
              isNewTurn,
              isExpired,
              hasNoTime,
              currentTime: new Date().toISOString(),
              oldTurnEndsAt: state.turn.turnEndsAt
            });
            
            // 修复：当时间过期时，无论是否是新回合都要重置时间
            if (isNewTurn || isExpired || hasNoTime) {
              const newTime = new Date(Date.now() + 10000).toISOString();
              console.info('[Store] ⏰ 设置新的结束时间:', newTime);
              return newTime;
            }
            
            console.info('[Store] ⏰ 保持原有时间:', state.turn.turnEndsAt);
            return state.turn.turnEndsAt;
          })(),
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
      // 只有在非 waiting 状态时才请求 turn
      get().gameMeta.state !== 'waiting' ? get().fetchCurrentTurn(gameId) : Promise.resolve(),
    ]);

    // 已存在轮询则跳过
    const existing = get()._pollerId;
    if (existing) return;

    const id = setInterval(async () => {
      const gid = get().gameMeta.id;
      if (!gid) return;
      
      // 检查游戏状态，只有在非 waiting 状态时才请求 turn
      const gameState = get().gameMeta.state;
      
      // 如果游戏状态是 waiting，只请求 gameDetail
      if (gameState === 'waiting') {
        await Promise.allSettled([
          get().fetchGameDetail(gid),
        ]);
        return;
      }
      
      // 非 waiting 状态：检查当前倒计时状态
      const { turn } = get();
      const timeLeft = get().calculateTimeLeft();
      
      // 如果倒计时已过期，优先处理倒计时结束逻辑
      if (timeLeft === 0 && turn?.turnEndsAt) {
        console.info('[Store] 🔄 轮询检测到倒计时过期，触发处理...');
        await get().handleCountdownEnd();
      }
      
      // 正常轮询获取数据（包括 turn）
      await Promise.allSettled([
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


  // 加入游戏：创建玩家并更新玩家总数
  joinGame: async (gameId, token = null) => {
    console.info('[Store] 🎮 开始加入游戏...', { gameId, hasToken: !!token });
    try {
      const data = await gameApi.joinGame(gameId, token);
      console.info('[Store] 📡 API 调用成功，获取到玩家数据:', data?.player);
      
      // 保存玩家信息到 localStorage
      if (typeof localStorage !== 'undefined' && data?.player) {
        localStorage.setItem('authToken', data.player.auth_token);
        localStorage.setItem('playerId', data.player.id);
        console.info('[Store] 💾 已保存玩家信息到 localStorage:', {
          playerId: data.player.id,
          hasAuthToken: !!data.player.auth_token
        });
      }

      // 更新玩家总数
      const oldTotal = get().players.total;
      set((state) => ({
        players: {
          ...state.players,
          total: state.players.total + 1,
          joined: state.players.joined + 1,
        },
      }));

      console.info('[Store] ✅ 玩家加入成功！', {
        旧玩家数: oldTotal,
        新玩家数: get().players.total,
        已加入数: get().players.joined
      });
      return data;
    } catch (err) {
      console.error('[Store] ❌ 加入游戏失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '加入游戏失败' } }));
      throw err;
    }
  },

  // 创建游戏：创建新游戏并启动（按照API文档的标准新  
  createNewGame: async (token = null) => {
    console.info('[Store] 🚀 开始创建并启动新游戏...', { hasToken: !!token });
    try {
      // 1) 获取当前游戏，检查是否需要归档
      let current = await get().fetchCurrentGame();
      let currentId = current?.id || get().gameMeta.id;
      const currentState = current?.state || get().gameMeta.state;

      // 2) 如果当前游戏存在且不是已归档状态，先归档它
      if (currentId && currentState !== 'archived') {
        console.info('[Store] 📦 归档当前游戏以触发后端新建 waiting 游戏', { currentId, currentState });
        try {
          await gameApi.archiveGame(currentId, token);
          console.info('[Store] ✅ 游戏归档成功');
          // 本地标记为 archived
          set((state) => ({
            gameMeta: { ...state.gameMeta, state: 'archived', statusCode: 2, endedAt: new Date().toISOString() },
          }));
        } catch (archiveError) {
          console.warn('[Store] ⚠️ 归档游戏失败，继续尝试获取新游戏:', archiveError.message);
        }
      }

      // 3) 拉取"当前游戏"（此时会自动新建一个 waiting 的新游戏并返回）
      console.info('[Store] 🔄 获取当前游戏（后端会自动创建新游戏）...');
      const fresh = await get().fetchCurrentGame();
      const newGameId = fresh?.id || get().gameMeta.id;
      if (!newGameId) throw new Error('未能获取到新游戏ID');

      console.info('[Store] 📋 新游戏ID:', newGameId);

      return true;
    } catch (err) {
      console.error('[Store] ❌ 创建并启动游戏失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '创建并启动游戏失败' } }));
      return false;
    }
  },

  // 开始游戏：调用后端并将前端状态置为 ongoing
  // API: POST /api/game/{game_id}/start/
  // 前置条件：Game.status 必须是 WAITING；必要时可传入管理员 token
  startGame: async (maybeGameId = null, token = null) => {
    try {
      let gameId = maybeGameId || get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] 🔍 未找到 gameId，尝试获取当前游戏...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] 📋 获取到 gameId:', gameId);
      }
      if (!gameId) throw new Error('未获取到 gameId');

      console.info('[Store] 📡 调用 startGame API...', { gameId });
      await gameApi.startGame(gameId, token);
      console.info('[Store] ✅ startGame API 调用成功');

      const oldState = get().gameMeta.state;
      set((state) => ({
        gameMeta: {
          ...state.gameMeta,
          state: 'ongoing',
          statusCode: 1,
          startedAt: state.gameMeta.startedAt || new Date().toISOString(),
        },
      }));

      console.info('[Store] ✅ 游戏状态已更新！', {
        旧状态: oldState,
        新状态: 'ongoing',
        开始时间: get().gameMeta.startedAt
      });
      return true;
    } catch (err) {
      console.error('[Store] ❌ 开始游戏失败:', err);
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
  // 检查玩家数量后启动游戏
  startGameWithPlayerCheck: async (token = null, minPlayers = 1) => {
    console.info('[Store] 🚀 检查玩家数量后启动游戏...', { hasToken: !!token, minPlayers });
    try {
      // 1) 获取当前游戏信息
      let gameId = get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] 🔍 未找到 gameId，尝试获取当前游戏...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] 📋 获取到 gameId:', gameId);
      }
      if (!gameId) throw new Error('未获取到 gameId');

      // 2) 获取游戏详情以检查玩家数量
      console.info('[Store] 📊 检查玩家数量...');
      const gameDetail = await get().fetchGameDetail(gameId);
      const currentPlayers = gameDetail?.players_count || get().players.total || 0;
      
      console.info('[Store] 👥 当前玩家数量:', currentPlayers, '最少需要:', minPlayers);

      // 3) 检查玩家数量是否满足要求
      if (currentPlayers < minPlayers) {
        const errorMsg = `玩家数量不足，当前: ${currentPlayers}，最少需要: ${minPlayers}`;
        console.warn('[Store] ⚠️', errorMsg);
        set((state) => ({ ui: { ...state.ui, error: errorMsg } }));
        return false;
      }

      // 4) 玩家数量满足要求，启动游戏
      console.info('[Store] ✅ 玩家数量满足要求，开始启动游戏...');
      const started = await get().startGame(token);
      
      if (started) {
        console.info('[Store] ✅ 游戏启动成功！', {
          游戏ID: gameId,
          玩家数量: currentPlayers,
          最少要求: minPlayers
        });
      }
      
      return started;
    } catch (err) {
      console.error('[Store] ❌ 检查玩家数量后启动游戏失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '检查玩家数量后启动游戏失败' } }));
      return false;
    }
  },

  // 初始化/开启当前回合（主持/管理员动作）
  initCurrentTurn: async (token = null) => {
    console.info('[Store] 🎯 开始初始化当前回合...', { hasToken: !!token });
    try {
      let gameId = get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] 🔍 未找到 gameId，尝试获取当前游戏...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] 📋 获取到 gameId:', gameId);
      }
      if (!gameId) throw new Error('未获取到 gameId');

      // 检查游戏状态
      const gameState = get().gameMeta.state;
      const gameStatusCode = get().gameMeta.statusCode;
      console.info('[Store] 🎮 当前游戏状态:', { state: gameState, statusCode: gameStatusCode });
      
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
      console.info('[Store] 🔄 刷新当前回合数据...');
      const turnResult = await get().fetchCurrentTurn(gameId, token);
      console.info('[Store] ✅ 当前回合数据已刷新:', turnResult);
      
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
      let gameId = get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] 🔍 未找到 gameId，尝试获取当前游戏...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] 📋 获取到 gameId:', gameId);
      }
      if (!gameId) throw new Error('未获取到 gameId');

      console.info('[Store] 📡 调用 submitTurn API...', { gameId });
      await gameApi.submitTurn(gameId, token);
      console.info('[Store] ✅ submitTurn API 调用成功');

      // 成功后刷新当前回合
      console.info('[Store] 🔄 刷新当前回合数据...');
      await get().fetchCurrentTurn(gameId, token);
      console.info('[Store] ✅ 当前回合数据已刷新');
      return true;
    } catch (err) {
      console.error('[Store] ❌ 提交回合失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '提交回合失败' } }));
      return false;
    }
  },

    // 提交玩家选择（提交投票选项）
  submitPlayerChoice: async (optionId, token = null) => {//player的token
    console.info('[Store] 🗳️ 开始提交玩家选择...', { optionId, hasToken: !!token });
    try {
      let gameId = get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] 🔍 未找到 gameId，尝试获取当前游戏...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] 📋 获取到 gameId:', gameId);
      }
      if (!gameId) throw new Error('未获取到 gameId');

      const auth = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null);
      if (!auth) throw new Error('未获取到 token');
      
      console.info('[Store] 📡 调用 submitChoice API...', { gameId, optionId });
      await gameApi.submitChoice(gameId, optionId, auth);
      console.info('[Store] ✅ submitChoice API 调用成功');

      // 乐观更新：立即增加 voted 计数
      const oldVoted = get().players.voted;
      set((state) => ({
        players: {
          ...state.players,
          voted: Math.min(state.players.voted + 1, state.players.total)
        },
      }));

      console.info('[Store] ✅ 提交选择成功！', {
        选项ID: optionId,
        旧投票数: oldVoted,
        新投票数: get().players.voted,
        总玩家数: get().players.total
      });
      return true;
    } catch (err) {
      console.error('[Store] ❌ 提交选择失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '提交选择失败' } }));
      return false;
    }
  },

  // 智能进入下一回合：根据当前状态自动选择 initCurrentTurn 或 submitCurrentTurn
  // 策略：
  // - 如果 turnsCount = 0：使用 initCurrentTurn（创建第一个回合）
  // - 如果 turnsCount > 0：使用 submitCurrentTurn（进入下一回合）
  // 用途：统一的"进入下一回合"接口，适用于 Intro 和 Dashboard
  advanceTurn: async (maybeGameId = null, token = null) => {
    try {
      let gameId = maybeGameId || get().gameMeta.id;
      if (!gameId) throw new Error('未获取到 gameId');

      // 先刷新一次游戏数据，确保 turnsCount 是最新的
      await get().fetchGameDetail(gameId);
      
      const turnsCount = get().gameMeta.turnsCount;
      const gameState = get().gameMeta.state;

      console.log(`[Store] 当前游戏状态: state=${gameState}, turnsCount=${turnsCount}`);

      // 根据 turnsCount 决定调用哪个 API
      if (turnsCount === 0) {
        // 没有回合 → 初始化第一个回合
        console.log('[Store] 当前没有回合 (turnsCount=0)，调用 initCurrentTurn 创建第一个回合');
        return await get().initCurrentTurn(token);
      } else {
        // 已有回合 → 提交当前回合，进入下一回合
        console.log(`[Store] 已有 ${turnsCount} 个回合，调用 submitCurrentTurn 进入下一回合`);
        return await get().submitCurrentTurn(token);
      }
    } catch (err) {
      console.error('[Store] advanceTurn 失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '进入下一回合失败' } }));
      return false;
    }
  },

  // 倒计时结束：无论投票状态如何，都提交回合
  // 当回合索引达到最后一轮（= maxRounds - 1）时，将游戏状态设为 finished
  handleCountdownEnd: async (token = null) => {
    console.info('[Store] ⏰ 倒计时结束');
    try {
      // 刷新一次最新回合
      const gameId = get().gameMeta.id || (await get().fetchCurrentGame())?.id;
      if (!gameId) return false;
      
      const turn = await get().fetchCurrentTurn(gameId, token);
      if (!turn) {
        console.warn('[Store] ⚠️ 回合不存在，跳过倒计时处理');
        return false;
      }

      const currentIndex = turn?.index || 0;
      const maxRounds = get().gameMeta.maxRounds || 0;
      console.info(`[Store] 当前回合索引: ${currentIndex}`);

      // 如果是最后一轮（index = maxRounds - 1），倒计时结束后将游戏状态设为 finished
      if (Number.isFinite(maxRounds) && maxRounds > 0 && currentIndex === maxRounds - 1) {
        console.info('[Store] 🏁 最后一轮倒计时结束，将游戏状态设为 finished');
        
        // 先提交当前回合
        const submitSuccess = await get().submitCurrentTurn(token);
        
        if (submitSuccess) {
          // 调用后端 API 将游戏状态设为 finished
          try {
            await gameApi.finishGame(gameId, token);
            console.info('[Store] ✅ 游戏已标记为 finished');
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
        }
        
        return submitSuccess;
      }

      // 保护：若超过最后一轮索引，则不再处理
      if (Number.isFinite(maxRounds) && maxRounds > 0 && currentIndex >= maxRounds) {
        console.info('[Store] ⏹️ 游戏结束，已超过最后索引', currentIndex, '>=', maxRounds);
        return false;
      }
      
      // 倒计时结束，直接提交回合（不检查是否所有玩家都已投票）
      console.info('[Store] ⏰ 倒计时结束，提交当前回合');
      return await get().submitCurrentTurn(token);
    } catch (err) {
      console.error('[Store] ❌ 倒计时处理失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '倒计时处理失败' } }));
      return false;
    }
  },

  // 计算剩余时间（基于 turnEndsAt）
  calculateTimeLeft: () => {
    const { turn } = get();
    
    if (turn.turnEndsAt) {
      const now = Date.now();
      const endsAt = new Date(turn.turnEndsAt).getTime();
      const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
      return remaining;
    }
    
    return 0;
  },

  // 更新倒计时：计算剩余时间并更新 store
  updateCountdown: () => {
    const remaining = get().calculateTimeLeft();
    
    set((state) => ({
      turn: { ...state.turn, timeLeft: remaining }
    }));
    
    return remaining;
  },

  // 获取游戏时间轴历史
  // API: GET /api/game/{game_id}/player/history/
  // 用途：获取游戏的历史事件，用于Timeline页面展示
  fetchGameTimeline: async (gameId, token = null) => {
    console.info('[Store] 📜 开始获取游戏时间轴...', { gameId, hasToken: !!token });
    
    set((state) => ({
      timeline: { ...state.timeline, loading: true, error: null }
    }));

    try {
      const data = await gameApi.getGameTimeline(gameId, token);
      console.info('[Store] 📡 时间轴API调用成功:', data);
      
      // 处理API返回的数据格式: { status: true, data: { history: [...] } }
      const events = Array.isArray(data?.history) ? data.history : [];
      
      set((state) => ({
        timeline: {
          ...state.timeline,
          events: events,
          loading: false,
          error: null
        }
      }));

      console.info('[Store] ✅ 时间轴数据已更新:', { eventsCount: events.length });
      return events;
    } catch (err) {
      console.error('[Store] ❌ 获取时间轴失败:', err);
      
      set((state) => ({
        timeline: {
          ...state.timeline,
          loading: false,
          error: err?.message || '获取时间轴失败'
        }
      }));
      
      throw err;
    }
  },
}));


export default useGameStore;


