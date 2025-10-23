// Zustand global game state (screen/mobile share prefix /game/:gameId)
// Purpose: Orchestrate the full flow "fetch from backend → write to global state → component subscription and render"
// Usage: In components, subscribe with selectors, e.g., useGameStore(s => s.turn.index)
import { create } from 'zustand';
import { gameApi } from '../services/gameApi';
import { CONFIG, toPhaseText, updateGameMetaFromApi, getGameId } from './common_tools';

// Create global store; set writes/merges state, get reads latest state (avoid stale closures)
export const useGameStoreScreen = create((set, get) => ({
  // Metadata: game-level information
  // Mapped from $Game (see src/services/API_Documentation.md)
  // - id ← game.id
  // - state ← game.status（0 waiting / 1 ongoing / 10 finished / 20 archived）
  // - maxRounds ← game.max_turns; turnsCount ← game.turns_count; playersCount ← game.players_count
  // - joinToken/startedAt/endedAt map by name
  gameMeta: {
    id: null,
    state: 'waiting', // waiting | ongoing | archived (mapped from backend status)
    statusCode: null, // Raw backend status code, helpful for debugging
    totalRounds: 0,   // Total rounds, from max_turns (fallback to turns_count)
    maxRounds: 0,     // = max_turns
    turnsCount: 0,    // Rounds created/progressed = turns_count
    playersCount: 0,  // = players_count
    joinToken: null,  // = join_token (if needed)
    startedAt: null,
    endedAt: null,
  },

  // Turn and phase
  // Mapped from $Turn
  // - id ← turn.id; gameId ← turn.game.id
  // - index ← turn.index (convention: 0 is intro)
  // - status ← turn.status (0 intro / 1 voting / 2 result) → phase text
  // - questionText/options ← respective fields (options contain attrs values)
  turn: {
    id: null,
    gameId: null,
    index: 0, // 0 means intro, corresponds to backend round 0
    status: 0, // 0 intro, 1 voting, 2 result
    year: 2075, // Currently a constant; replace if provided by backend
    phase: 'intro', // intro | voting | result
    statusRaw: null, // Keep raw backend status; currently only 0
    questionText: null,
    storyText: null,
    options: [],
    attrs: [],
    total_players: 0,
    total_choices: 0,
  },

  // Player state summary
  // Mostly derived from $Turn.total_players / total_choices
  players: {
    joined: 0,
    total: 0,
    voted: 0,
  },

  // World/visualization data
  world: {
    // Radar chart data (aggregate $Attributes averages in fixed order)
    categories: ['Memory Equality', 'Technical Control', 'Society Cohesion', 'Autonomy Control'],
    radarData: [],
    narrative: '',
  },

  // Timeline data
  timeline: {
    events: [], // Historical events list
    loading: false,
    error: null,
  },

  // Ending content
  ending: {
    text: '',
    loading: false,
    error: null,
  },

  // UI auxiliary state
  // loading: in-flight; error: last error message (non-blocking)
  ui: {
    loading: false,
    error: null,
    generating: false,
  },

  // UI configuration (presentation-only)
  uiConfig: {
    showValues: true, // Whether to show attribute value badges for options
  },

  // Polling handles (internal use)
  _lobbyPollerId: null,
  _introPollerId: null,
  _dashboardPollerId: null,

  // Setters (handy for incremental wiring/manual injection/testing)
  // Only perform partial merges to avoid overwriting entire objects
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
  setUiConfig: (partial) => set((state) => ({
    uiConfig: { ...state.uiConfig, ...partial },
  })),

  // Basic action: fetch current game (minimal viable)
  // API: GET /api/game/current/
  // Steps: set loading → request → map $Game → write to gameMeta → unset loading; record error to ui.error and rethrow
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
      set((state) => ({ ui: { ...state.ui, loading: false, error: err?.message || 'Request failed' } }));
      throw err;
    }
  },

  // Fetch game detail (for player stats, world info, etc.)
  // API: GET /api/game/{game_id}/detail/
  // Purpose: refresh statistics (playersCount/turnsCount/maxRounds, etc.); extensible world visualization data
  fetchGameDetail: async (gameId) => {
    try {
      const data = await gameApi.getGameDetail(gameId);
      const game = data?.game ?? data;

      set((state) => ({
        gameMeta: updateGameMetaFromApi(game, state.gameMeta),
      }));
      return game;
    } catch (err) {
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to get game detail' } }));
      return null;
    }
  },

  // Fetch current turn (for round/voting progress, etc.)
  // API: GET /api/game/{game_id}/turn/current
  // Purpose: drive big screen components (Round/DecisionProgress/UserStates) to update with turn & voting progress in real time
  fetchCurrentTurn: async (gameId, token = null) => {
    try {
      const data = await gameApi.getCurrentTurn(gameId, token);
      const turn = data?.turn ?? data;
    
      // Validate turn data
      if (!turn || typeof turn.index !== 'number') {
        return null;
      }

      set((state) => {
        const attrOrder = state.world.categories || ['Memory Equality', 'Technical Control', 'Society Cohesion', 'Autonomy Control'];

        // Normalize backend attribute names to frontend display names
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
      console.warn('[Store] Failed to get current turn:', err.message);
      
      // If "Current turn already exists" error, backend has a turn but data may be problematic
      if (err.message.includes('Current turn already exists')) {
        console.info('[Store] Backend indicates current turn exists, but fetch failed; likely data issue');
        return null;
      }
      
      // If "Current turn does not exist" error, do not set error state
      if (err.message.includes('Current turn does not exist')) {
        return null;
      }
      
      // Only set error state for other errors
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to get current turn' } }));
      return null;
    }
  },

  // Lobby-specific polling: only fetch gameDetail (no turn request)
  startPollingForLobby: async (providedGameId = null) => {
    // Skip if polling already exists
    const existing = get()._lobbyPollerId;
    if (existing) return;

    let gameId;
    try {
      gameId = await getGameId(get, providedGameId, true);
    } catch {
      return;
    }

    // Pull immediately once; failures do not block
    await Promise.allSettled([
      get().fetchGameDetail(gameId),
    ]);

    const fallbackId = gameId; // Use initially provided gameId as fallback
    const id = setInterval(async () => {
      const gid = get().gameMeta.id || fallbackId;
      if (!gid) return;
      await Promise.allSettled([
        get().fetchGameDetail(gid),
      ]);
      console.log("Lobby fetchGameDetail");
    }, CONFIG.POLLING_INTERVAL_MS);

    set(() => ({ _lobbyPollerId: id }));
  },

  // Intro-specific polling: only fetch currentTurn, for external callers to know whether all players have submitted
  startPollingForIntro: async (providedGameId = null) => {
    // Skip if polling already exists
    const existing = get()._introPollerId;
    if (existing) return;

    let gameId;
    try {
      gameId = await getGameId(get, providedGameId, true);
    } catch {
      return;
    }

    // Pull immediately once; failures do not block
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

  // Dashboard-specific polling: only fetch currentTurn, for external callers to know whether all players have submitted
  startPollingForDashboard: async (providedGameId = null) => {
    // Skip if polling already exists
    const existing = get()._dashboardPollerId;
    if (existing) return;

    let gameId;
    try {
      gameId = await getGameId(get, providedGameId, true);
    } catch {
      return;
    }

    // Pull immediately once; failures do not block
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

  // Stop polling
  // Clear setInterval to avoid memory leaks and duplicate requests
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

  // Start game: call backend and set frontend state to ongoing
  // API: POST /api/game/{game_id}/start/
  // Preconditions: Game.status must be WAITING; admin token optional
  startGame: async (maybeGameId = null, token = null, options = {}) => {
    try {
      const gameId = await getGameId(get, maybeGameId);
      const payload = {};
      if (typeof options.max_turns === 'number' && options.max_turns > 0) {
        payload.max_turns = options.max_turns;
      }
      if (typeof options.show_values === 'boolean') {
        payload.show_values = options.show_values;
      }
      await gameApi.startGame(gameId, token, Object.keys(payload).length ? payload : null);
      set((state) => ({
        gameMeta: {
          ...state.gameMeta,
          state: 'ongoing',
          statusCode: 1,
          startedAt: state.gameMeta.startedAt || new Date().toISOString(),
        },
      }));
      // Important: refresh game detail immediately after starting to get applied max_turns
      try { await get().fetchGameDetail(gameId); } catch { /* no-op */ }
      return true;
    } catch (err) {
      console.error('[Store] Failed to start game:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || '开始游戏失败' } }));
      return false;
    }
  },

  // Initialize/start current turn (host/admin action)
  initCurrentTurn: async (token = null) => {
    try {
      const gameId = await getGameId(get);

      // Check game state
      const gameState = get().gameMeta.state;
      const gameStatusCode = get().gameMeta.statusCode;
      
      if (gameState !== 'ongoing' && gameStatusCode !== 1) {
        throw new Error(`Invalid game state; cannot create turn. Current state: ${gameState} (${gameStatusCode})`);
      }
      
      console.info('[Store] Calling initTurn API...', { gameId, hasToken: !!token });
      try {
        const initResult = await gameApi.initTurn(gameId, token);
        console.info('[Store] initTurn API success:', initResult);
      } catch (initErr) {
        // If "Current turn already exists", the turn already exists; try fetching it
        if (initErr.message.includes('Current turn already exists')) {
        console.info('[Store] Turn already exists, fetching data...');
        } else {
          // Rethrow other errors
          throw initErr;
        }
      }

      // Refresh current turn
      const turnResult = await get().fetchCurrentTurn(gameId, token);
      
      // Validate turn data
      if (!turnResult || typeof turnResult.index !== 'number') {
        throw new Error('Failed to get turn data or data invalid');
      }
      
      return true;
    } catch (err) {
      console.error('[Store] Failed to initialize turn:', err);
      console.error('[Store] Error detail:', {
        message: err.message,
        status: err.status,
        code: err.code
      });
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to initialize turn' } }));
      return false;
    }
  },

  // Submit/finish current turn (host/admin action)
  submitCurrentTurn: async (token = null) => {
    console.info('[Store] Start submitting current turn...', { hasToken: !!token });
    try {
      set((state) => ({ ui: { ...state.ui, generating: true } }));
      const gameId = await getGameId(get);
      await gameApi.submitTurn(gameId, token);
      // On success, refresh current turn
      await get().fetchCurrentTurn(gameId, token);
      set((state) => ({ ui: { ...state.ui, generating: false } }));
      return true;
    } catch (err) {
      console.error('[Store] Failed to submit turn:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to submit turn', generating: false } }));
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

    // Call backend API to mark game as finished
    try {
      await gameApi.finishGame(gameId, null);
    } catch (err) {
      console.error('[Store] Failed to call finishGame API:', err);
    }
    
    // Update frontend state
    set((state) => ({
      gameMeta: {
        ...state.gameMeta,
        state: 'finished',
        statusCode: 10,
        endedAt: new Date().toISOString(),
      }
    }));
  },

  // Fetch ending text
  fetchGameEnding: async (maybeGameId = null, token = null) => {
    set((state) => ({ ending: { ...state.ending, loading: true, error: null } }));
    try {
      const gameId = await getGameId(get, maybeGameId, true);
      const res = await gameApi.getGameEnding(gameId, token);
      const text = res?.ending || res?.text || res?.data || '';
      set((state) => ({ ending: { ...state.ending, loading: false, text } }));
      return text;
    } catch (err) {
      set((state) => ({ ending: { ...state.ending, loading: false, error: err?.message || 'Failed to get ending' } }));
      return '';
    }
  },

  // Archive game: call backend and set frontend state to archived
  // API: POST /api/game/{game_id}/archive/
  // Preconditions: Game.status must be FINISHED; admin token optional
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
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to archive game' } }));
      return false;
    }
  },

}));

export default useGameStoreScreen;
