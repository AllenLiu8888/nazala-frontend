import { GAME_STATUS } from '../constants/constants';

// 配置常量
export const CONFIG = {
  TURN_DURATION_MS: 10000,     // 回合倒计时时长：10秒
  POLLING_INTERVAL_MS: 2000,    // 轮询间隔：2秒
  LAST_TURN_INDEX: 11,          // 最后一轮的索引（第12轮，即 Reflection）
  MAX_TURN_INDEX: 11,           // 最大回合索引（0-11共12轮）
};


// 工具函数：状态码映射
// 将后端 status 数值转换为前端文本状态
export const toStateText = (code) => {
  switch (code) {
    case GAME_STATUS.WAITING: return 'waiting';
    case GAME_STATUS.IN_PROGRESS: return 'ongoing';
    case GAME_STATUS.COMPLETED: return 'finished';
    case GAME_STATUS.ARCHIVED: return 'archived';
    default: return 'waiting';
  }
};

// 将回合 status 数值转换为阶段文本
export const toPhaseText = (code) => {
  switch (code) {
    case 0: return 'intro';
    case 1: return 'voting';
    case 2: return 'result';
    default: return 'intro';
  }
};


// 工具函数：更新游戏元数据
// 统一处理从后端 Game 对象到前端 gameMeta 的映射
export const updateGameMetaFromApi = (game, currentState) => {
  return {
    id: game?.id ?? currentState.id,
    statusCode: game?.status ?? currentState.statusCode,
    state: toStateText(game?.status ?? currentState.statusCode),
    maxRounds: game?.max_turns ?? currentState.maxRounds,
    turnsCount: game?.turns_count ?? currentState.turnsCount,
    playersCount: game?.players_count ?? currentState.playersCount,
    joinToken: game?.join_token ?? currentState.joinToken,
    startedAt: game?.started_at ?? currentState.startedAt,
    endedAt: game?.ended_at ?? currentState.endedAt,
    totalRounds: (game?.max_turns ?? game?.turns_count ?? currentState.totalRounds),
  };
};

// 工具函数：获取 gameId
// 统一处理 gameId 获取逻辑：从参数、store 或通过 fetchCurrentGame 获取
// @param get - Zustand store 的 get 函数
// @param providedId - 可选的游戏ID参数
// @param shouldFetch - 是否在未找到时尝试获取当前游戏（默认 true）
export const getGameId = async (get, providedId = null, shouldFetch = true) => {
  let gameId = providedId || get().gameMeta.id;

  if (!gameId && shouldFetch) {
    try {
      const current = await get().fetchCurrentGame();
      gameId = current?.id || get().gameMeta.id;
    } catch (err) {
      console.warn('[Store] ⚠️ 获取当前游戏失败:', err.message);
      gameId = get().gameMeta.id;
    }
  }
  if (!gameId) {
    throw new Error('未获取到 gameId');
  }
  return gameId;
};


// 工具函数：localStorage 访问封装
export const storage = {
  setAuthToken: (token) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },
  getAuthToken: () => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },
  setPlayerId: (id) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('playerId', id);
    }
  },
  getPlayerId: () => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('playerId');
    }
    return null;
  },
  clear: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('playerId');
    }
  }
};