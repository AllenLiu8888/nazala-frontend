import { GAME_STATUS } from '../constants/constants';

// Configuration constants
export const CONFIG = {
  TURN_DURATION_MS: 10000,     // Turn countdown duration: 10 seconds
  POLLING_INTERVAL_MS: 2000,    // Polling interval: 2 seconds
  LAST_TURN_INDEX: 11,          // Index of the last round (12th round, i.e., Reflection)
  MAX_TURN_INDEX: 11,           // Maximum round index (0–11, total 12 rounds)
};


// Utility: status code mapping
// Convert backend status code to frontend text state
export const toStateText = (code) => {
  switch (code) {
    case GAME_STATUS.WAITING: return 'waiting';
    case GAME_STATUS.IN_PROGRESS: return 'ongoing';
    case GAME_STATUS.COMPLETED: return 'finished';
    case GAME_STATUS.ARCHIVED: return 'archived';
    default: return 'waiting';
  }
};

// Convert turn status code to phase text
export const toPhaseText = (code) => {
  switch (code) {
    case 0: return 'intro';
    case 1: return 'voting';
    case 2: return 'result';
    default: return 'intro';
  }
};


// Utility: update game metadata
// Normalize mapping from backend Game object to frontend gameMeta
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

// Utility: retrieve gameId
// Unified logic to obtain gameId: from parameter, store, or via fetchCurrentGame
// @param get - Zustand store get function
// @param providedId - Optional game ID parameter
// @param shouldFetch - Whether to fetch current game when missing (default true)
export const getGameId = async (get, providedId = null, shouldFetch = true) => {
  let gameId = providedId || get().gameMeta.id;

  if (!gameId && shouldFetch) {
    try {
      const current = await get().fetchCurrentGame();
      gameId = current?.id || get().gameMeta.id;
    } catch (err) {
      console.warn('[Store] Failed to get current game:', err.message);
      gameId = get().gameMeta.id;
    }
  }
  if (!gameId) {
    throw new Error('Failed to obtain gameId');
  }
  return gameId;
};


// Utility: localStorage access helpers
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