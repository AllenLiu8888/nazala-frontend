// Zustand global game state (screen/mobile share prefix /game/:gameId)
// Purpose: Orchestrate the full flow "fetch from backend → write to global state → component subscription and render"
// Usage: In components, subscribe with selectors, e.g., useGameStore(s => s.turn.index)
import { create } from 'zustand';
import { gameApi } from '../services/gameApi';
import { CONFIG, toPhaseText, updateGameMetaFromApi, getGameId, storage } from './common_tools';

// Create global store; set writes/merges state, get reads latest state (avoid stale closures)
export const useGameStoreMobile = create((set, get) => ({
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
    options: [],
    attrs: [],
    total_players: 0,
    total_choices: 0,
    timeLeft: null, // Remaining seconds in countdown (computed on frontend)
    turnEndsAt: null, // Turn end timestamp (from backend if provided)
  },

  // Player state summary
  // Mostly derived from $Turn.total_players / total_choices
  players: {
    joined: 0,
    total: 0,
    voted: 0,
  },

  // World/visualization data
  // If needed for radar and narrative, extend in fetchGameDetail/fetchCurrentTurn
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

  // UI auxiliary state
  // loading: in-flight; error: last error message (non-blocking)
  ui: {
    loading: false,
    error: null,
  },

  // UI configuration (mobile presentation)
  uiConfig: {
    showValues: true, // Whether to show attribute value badges for options
  },

  // Polling handle (internal)
  // Ensures only one global setInterval exists; helps stopPolling cleanup
  _votePollerId: null,

  // Setters (handy for incremental wiring/manual injection/testing)
  // Only perform partial merges to avoid overwriting entire objects
  setGameMeta: (partial) => set((state) => ({
    gameMeta: { ...state.gameMeta, ...partial },
  })),
  setTurn: (partial) => set((state) => ({
    turn: { ...state.turn, ...partial },
  })),
  setUiConfig: (partial) => set((state) => ({
    uiConfig: { ...state.uiConfig, ...partial },
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
        console.warn('[Store] Invalid turn data:', turn);
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
          gameMeta: {
            ...state.gameMeta,
            ...updateGameMetaFromApi(turn.game, state.gameMeta)
          },
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
            // For a new turn, set end time to TURN_DURATION_MS later; also reset if expired
            turnEndsAt: (() => {
              const newIndex = typeof turn?.index === 'number' ? turn.index : null;
              const oldIndex = state.turn.index;
              const isNewTurn = newIndex !== null && newIndex !== oldIndex;
              const isExpired = state.turn.turnEndsAt && new Date(state.turn.turnEndsAt) <= new Date();
              const hasNoTime = !state.turn.turnEndsAt;
              // Fix: when expired, reset regardless of new turn
              if (isNewTurn || isExpired || hasNoTime) {
                const newTime = new Date(Date.now() + CONFIG.TURN_DURATION_MS).toISOString();
                return newTime;
              }
              
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
      console.warn('[Store] Failed to get current turn:', err.message);
      
      // If "Game is not ongoing" error, game state is not ongoing
      if (err.message.includes('Game is not ongoing')) {
        console.info('[Store] Game not ongoing, cannot get current turn');
        return null;
      }
      
      // If "Current turn already exists" error, backend has a turn but data may be problematic
      if (err.message.includes('Current turn already exists')) {
        console.info('[Store] Backend indicates turn exists, but fetch failed; likely data issue');
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

  // Vote-specific polling: only fetch currentTurn
  startPollingForVote: async (providedGameId = null) => {
    // Skip if polling already exists
    const existing = get()._votePollerId;
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
      get().fetchGameDetail(gameId),
      get().fetchCurrentTurn(gameId),
    ]);

    const id = setInterval(async () => {
      const gid = get().gameMeta.id;
      if (!gid) return;
      await Promise.allSettled([
          get().fetchCurrentTurn(gid),
          get().fetchGameDetail(gameId),
      ]);
      console.log("Vote fetchCurrentTurn");
    }, CONFIG.POLLING_INTERVAL_MS);

    set(() => ({ _votePollerId: id }));
  },

  // Stop polling
  // Clear setInterval to avoid memory leaks and duplicate requests
  stopPolling: () => {
    const id = get()._votePollerId;
    if (id) {
      clearInterval(id);
      set(() => ({ _votePollerId: null }));
    }
  },

  submitPlayerChoice: async (optionId, token = null) => { // player's token
    try {
      const gameId = await getGameId(get);

      const auth = token || storage.getAuthToken();
      if (!auth) throw new Error('Failed to obtain token');
            
      await gameApi.submitChoice(gameId, optionId, auth);

      // Optimistic update: increment voted count immediately
      set((state) => ({
        players: {
          ...state.players,
          voted: Math.min(state.players.voted + 1, state.players.total)
        },
      }));
      return true;
    } catch (err) {
      console.error('[Store] Failed to submit choice:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to submit choice' } }));
      return false;
    }
  },

  fetchGameTimeline: async (gameId, token = null) => {
    console.info('[Store] Start fetching timeline...', { gameId, hasToken: !!token });
    
    set((state) => ({
      timeline: { ...state.timeline, loading: true, error: null }
    }));

    try {
      const data = await gameApi.getGameTimeline(gameId, token);
      console.info('[Store] Timeline API success:', data);
      
      // Support multiple response shapes
      // http.js already unwraps to data.data; tolerate these:
      // 1) { history: [...] }
      // 2) [...]
      // 3) { data: { history: [...] } }
      let events = [];
      if (Array.isArray(data?.history)) {
        events = data.history;
      } else if (Array.isArray(data)) {
        events = data;
      } else if (Array.isArray(data?.data?.history)) {
        events = data.data.history;
      }
      
      set((state) => ({
        timeline: {
          ...state.timeline,
          events: events,
          loading: false,
          error: null
        }
      }));

      console.info('[Store] Timeline updated:', { eventsCount: events.length });
      return events;
    } catch (err) {
      console.error('[Store] Failed to fetch timeline:', err);
      
      set((state) => ({
        timeline: {
          ...state.timeline,
          loading: false,
          error: err?.message || 'Failed to fetch timeline'
        }
      }));
      
      throw err;
    }
  },

  // Fetch player's final result and profile
  // API: GET /api/player/result
  // Purpose: retrieve player's final game result for PersonalSummary page
  fetchPlayerResult: async (gameId, token = null) => {
    console.info('[Store] Start fetching player result...', { gameId, hasToken: !!token });
    
    set((state) => ({
      ui: { ...state.ui, loading: true, error: null }
    }));

    try {
      const auth = token || storage.getAuthToken();
      if (!auth) throw new Error('Failed to obtain auth token');

      const response = await gameApi.getPlayerResult(gameId, auth);
      console.info('[Store] Player result API success:', response);
      
      // Handle API response shape
      // Per http.js, API returns the data part, so response is already the data
      if (response && (response.attribute_totals || response.profile || response.top_attributes)) {
        const { attribute_totals, profile, top_attributes } = response;
        
        // Transform API data to match frontend needs
        const transformedData = {
          choices: (top_attributes || []).map(attr => attr.name),
          personality: profile.title,
          description: profile.description,
          rawData: response,
          portraitUrl: profile.portrait_url
        };
        
        set((state) => ({
          ui: { ...state.ui, loading: false, error: null }
        }));

        console.info('[Store] Player result processed:', transformedData);
        return transformedData;
      } else {
        console.error('[Store] API response format error, response:', response);
        throw new Error('API response format error: missing required fields');
      }
    } catch (err) {
      console.error('[Store] Failed to get player result:', err);
      
      set((state) => ({
        ui: { ...state.ui, loading: false, error: err?.message || 'Failed to get player result' }
      }));
      
      throw err;
    }
  },
}));

export default useGameStoreMobile;
