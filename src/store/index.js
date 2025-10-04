import { create } from 'zustand';
import { gameApi } from '../services/gameApi';

export const useGameStore = create((set, get) => ({
  // 元数据：与整局游戏相关
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
  turn: {
    index: 0, // 0 表示 intro，对应后端第 0 轮
    year: null,
    phase: 'intro', // intro | voting | result
    statusRaw: null, // 保留后端原始 status，目前只有0
    questionText: null,
    options: [],
    total_players: 0,
    total_choices: 0,
    turnEndsAt: new Date().toISOString(),    // 回合结束时间
    timeLeft: 0,         // 剩余秒数
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
      set((state) => ({
        turn: {
          ...state.turn,
          index: typeof turn?.index === 'number' ? turn.index : state.turn.index,
          year: state.turn.year, // 如后端未来提供年份可替换
          phase: toPhaseText(turn?.status),
          statusRaw: (turn?.status !== undefined ? turn.status : state.turn.statusRaw),
          questionText: turn?.question_text ?? state.turn.questionText,
          options: Array.isArray(turn?.options) ? turn.options : state.turn.options,
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
              const newTime = new Date(Date.now() + 5000).toISOString();
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
      }));
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

    const id = setInterval(async () => {
      const gid = get().gameMeta.id;
      if (!gid) return;
      
      // 检查当前倒计时状态
      const { turn } = get();
      const timeLeft = get().calculateTimeLeft();
      
      // 如果倒计时已过期，优先处理倒计时结束逻辑
      if (timeLeft === 0 && turn?.turnEndsAt) {
        console.info('[Store] 🔄 轮询检测到倒计时过期，触发处理...');
        await get().handleCountdownEnd();
      }
      
      // 正常轮询获取数据
      await Promise.allSettled([
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
  startGame: async (token = null) => {
    console.info('[Store] 🚀 开始启动游戏...', { hasToken: !!token });
    try {
      let gameId = get().gameMeta.id;
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

  // 倒计时结束：检查投票状态并处理，这里我应该只要检查turn的status是ture就行了吧？
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

      // 限制只处理12个回合 (0-11)
      if (turn?.index > 11) {
        console.info('[Store] ⏹️ 游戏结束，已超过12个回合', turn.index);
        // 将游戏状态设为已归档
        set((state) => ({
          gameMeta: {
            ...state.gameMeta,
            state: 'archived',
            statusCode: 2,
            endedAt: new Date().toISOString(),
          }
        }));
        return false;
      }
      
      // 只能在所有玩家已投票时提交，避免后端报错；之后要根据turn.statusRaw来判断
      const choices = typeof turn?.total_choices === 'number' ? turn.total_choices : get().players.voted;
      const total = typeof turn?.total_players === 'number' ? turn.total_players : get().players.total;
      const canSubmit = total > 0 && choices >= total;
      
      if (canSubmit) {
        console.info('[Store] ✅ 可以提交当前回合 (all players voted)');
        return await get().submitCurrentTurn(token);
      }
      
      console.info('[Store] ❌ 不能提交当前回合');
      return false;
    } catch (err) {
      console.error('[Store] ❌ 倒计时处理失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '倒计时处理失败' } }));
      return false;
    }
  },

  // 计算剩余时间
  calculateTimeLeft: () => {
    const { turn } = get();
    if (!turn?.turnEndsAt) return 0;
    
    const now = new Date();
    const endTime = new Date(turn.turnEndsAt);
    return Math.max(0, Math.floor((endTime - now) / 1000));
  },

  // 更新倒计时
  updateCountdown: () => {
    const { turn, gameMeta } = get();
    
    // 如果游戏已结束，停止倒计时
    if (gameMeta.state === 'archived' || turn?.index >= 10) {
      return 0;
    }
    
    const timeLeft = get().calculateTimeLeft();
    const oldTimeLeft = turn.timeLeft;
    
    set((state) => ({
      turn: { ...state.turn, timeLeft }
    }));
    
    // 只在时间变化时打印日志
    if (timeLeft !== oldTimeLeft) {
      console.info('[Store] ⏱️ 倒计时更新:', {
        剩余时间: timeLeft,
        回合阶段: get().turn.phase,
        回合索引: get().turn.index,
        结束时间: get().turn.turnEndsAt,
        当前时间: new Date().toISOString()
      });
    }
    
    // 时间到了，处理倒计时结束（异步处理，不阻塞UI）
    if (timeLeft === 0 && oldTimeLeft > 0) {
      console.info('[Store] ⏰ 倒计时归零，触发处理逻辑');
      // 使用 setTimeout 确保异步处理，避免阻塞UI更新
      setTimeout(() => {
        get().handleCountdownEnd();
      }, 100);
    }
    
    return timeLeft;
  },
}));


export default useGameStore;


