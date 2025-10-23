// Zustand global game state (screen/mobile share prefix /game/:gameId)
// Purpose: Orchestrate the full flow "fetch from backend → write to global state → component subscription and render"
// Usage: In components, subscribe with selectors, e.g., useGameStore(s => s.turn.index)
import { create } from 'zustand';
import { gameApi } from '../services/gameApi';

// Create global store; set writes/merges state, get reads latest state (avoid stale closures)
export const useGameStore = create((set, get) => ({
  // Metadata: game-level information
  // Mapped from $Game (see src/services/API_Documentation.md)
  // - id ← game.id
  // - state ← game.status（0 waiting / 1 ongoing / 10 finished / 20 archived）
  // - maxRounds ← game.max_turns; turnsCount ← game.turns_count; playersCount ← game.players_count
  // - joinToken/startedAt/endedAt map by name
  // - startYear/endYear ← game.start_year / game.end_year
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
    startYear: null,
    endYear: null,
  },

  // Turn and phase
  // Mapped from $Turn
  // - id ← turn.id; gameId ← turn.game.id
  // - index ← turn.index (convention: 0 is intro)
  // - status ← turn.status (0 intro / 1 voting / 2 result) → phase text
  // - questionText/options ← respective fields (options contain attrs values)
  // - year/attrs ← turn.year / turn.attrs (prefer for world visualization)
  turn: {
    id: null,
    gameId: null,
    index: 0, // 0 means intro, corresponds to backend round 0
    status: 0, // 0 intro, 1 voting, 2 result
    year: null,
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

  // Polling handle (internal)
  // Ensures only one global setInterval exists; helps stopPolling cleanup
  _pollerId: null,

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

  // Basic action: fetch current game (minimal viable)
  // API: GET /api/game/current/
  // Steps: set loading → request → map $Game → write to gameMeta → unset loading; record error to ui.error and rethrow
  fetchCurrentGame: async () => {
    set((state) => ({ ui: { ...state.ui, loading: true, error: null } }));
    try {
      const data = await gameApi.getCurrentGame();
      const game = data?.game ?? data;
      // Backend status code -> text (see API_Documentation.md)
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
          // Backend field mapping
          maxRounds: game?.max_turns ?? state.gameMeta.maxRounds,
          turnsCount: game?.turns_count ?? state.gameMeta.turnsCount,
          playersCount: game?.players_count ?? state.gameMeta.playersCount,
          joinToken: game?.join_token ?? state.gameMeta.joinToken,
          startedAt: game?.started_at ?? state.gameMeta.startedAt,
          endedAt: game?.ended_at ?? state.gameMeta.endedAt,
          startYear: game?.start_year ?? state.gameMeta.startYear,
          endYear: game?.end_year ?? state.gameMeta.endYear,
          // totalRounds prefers max_turns, falls back to turns_count
          totalRounds: (game?.max_turns ?? game?.turns_count ?? state.gameMeta.totalRounds),
        },
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
      // Same status mapping as in fetchCurrentGame
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
      
      console.info('[Store] Got turn data:', {
        hasData: !!data,
        hasTurn: !!turn,
        turnKeys: turn ? Object.keys(turn) : [],
        questionText: turn?.question_text,
        optionsCount: turn?.options?.length || 0,
        turnIndex: turn?.index,
        currentTurnEndsAt: turn?.turnEndsAt,
        oldTurnEndsAt: get().turn.turnEndsAt
      });
      
      // Validate turn data
      if (!turn || typeof turn.index !== 'number') {
        console.warn('[Store] Invalid turn data:', turn);
        return null;
      }
      
      // turn.status code -> phase text (0=intro, 1=voting, 2=result)
      const toPhaseText = (code) => {
        switch (code) {
          case 0: return 'intro';
          case 1: return 'voting';
          case 2: return 'result';
          default: return 'intro';
        }
      };
      set((state) => {
        // Prefer turn.attrs (if provided); otherwise aggregate $Attributes averages from options for visualization
        const attrOrder = state.world.categories || ['Memory Equality', 'Technical Control', 'Society Cohesion', 'Autonomy Control'];

        // Normalize backend attribute names to frontend display names
        const normalizeAttrName = (raw) => {
          switch (raw) {
            case 'TechnologicalControl': return 'Technical Control';
            case 'SocialCohesion': return 'Society Cohesion';
            case 'MemoryEquity': return 'Memory Equality';
            case 'PersonalAgency': return 'Autonomy Control';
            default: return raw; // Backward compatibility with old names matching display names
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
          // For a new turn, set end time to 10 seconds later, or reset if expired
          turnEndsAt: (() => {
            const newIndex = typeof turn?.index === 'number' ? turn.index : null;
            const oldIndex = state.turn.index;
            const isNewTurn = newIndex !== null && newIndex !== oldIndex;
            const isExpired = state.turn.turnEndsAt && new Date(state.turn.turnEndsAt) <= new Date();
            const hasNoTime = !state.turn.turnEndsAt;
            
            console.info('[Store] Time setting logic:', {
              newIndex,
              oldIndex,
              isNewTurn,
              isExpired,
              hasNoTime,
              currentTime: new Date().toISOString(),
              oldTurnEndsAt: state.turn.turnEndsAt
            });
            
            // Fix: when time expired, reset regardless of whether it is a new turn
            if (isNewTurn || isExpired || hasNoTime) {
              const newTime = new Date(Date.now() + 10000).toISOString();
              console.info('[Store] Set new end time:', newTime);
              return newTime;
            }
            
            console.info('[Store] Keep original end time:', state.turn.turnEndsAt);
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
      console.warn('[Store] Failed to fetch current turn:', err.message);
      
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

  // Start polling: every 2s fetch detail + currentTurn in parallel (keep-alive)
  // Goal: dashboard reflects player join/vote/turn progress in real time; failures write ui.error but do not stop
  // Strategy: use Promise.allSettled for parallel requests; ensure only one interval via _pollerId; clear on unmount via stopPolling
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

    // Pull immediately once; failures do not block
    await Promise.allSettled([
      get().fetchGameDetail(gameId),
      // Only request turn when not in waiting state
      get().gameMeta.state !== 'waiting' ? get().fetchCurrentTurn(gameId) : Promise.resolve(),
    ]);

    // Skip if polling already exists
    const existing = get()._pollerId;
    if (existing) return;

    const id = setInterval(async () => {
      const gid = get().gameMeta.id;
      if (!gid) return;
      
      // Check game state; only request turn when not in waiting
      const gameState = get().gameMeta.state;
      
      // If state is waiting, only request gameDetail
      if (gameState === 'waiting') {
        await Promise.allSettled([
          get().fetchGameDetail(gid),
        ]);
        return;
      }
      
      // Not waiting: check current countdown status
      const { turn } = get();
      const timeLeft = get().calculateTimeLeft();
      
      // If countdown expired, handle countdown end first
      if (timeLeft === 0 && turn?.turnEndsAt) {
        console.info('[Store] Poll detected countdown expiration, handling...');
        await get().handleCountdownEnd();
      }
      
      // Normal polling fetch (including turn)
      await Promise.allSettled([
        get().fetchGameDetail(gid),
        get().fetchCurrentTurn(gid),
      ]);
    }, 2000);

    set(() => ({ _pollerId: id }));
  },

  // Stop polling
  // Clear setInterval to avoid memory leaks and duplicate requests
  stopPolling: () => {
    const id = get()._pollerId;
    if (id) {
      clearInterval(id);
      set(() => ({ _pollerId: null }));
    }
  },


  // Join game: create player and update player count
  joinGame: async (gameId, token = null) => {
    console.info('[Store] 🎮 Start joining game...', { gameId, hasToken: !!token });
    try {
      const data = await gameApi.joinGame(gameId, token);
      console.info('[Store] API success, got player data:', data?.player);
      
      // Save player info to localStorage
      if (typeof localStorage !== 'undefined' && data?.player) {
        localStorage.setItem('authToken', data.player.auth_token);
        localStorage.setItem('playerId', data.player.id);
        console.info('[Store] Saved player info to localStorage:', {
          playerId: data.player.id,
          hasAuthToken: !!data.player.auth_token
        });
      }

      // Update player counts
      const oldTotal = get().players.total;
      set((state) => ({
        players: {
          ...state.players,
          total: state.players.total + 1,
          joined: state.players.joined + 1,
        },
      }));

      console.info('[Store] Player joined successfully!', {
        oldTotal,
        newTotal: get().players.total,
        joined: get().players.joined
      });
      return data;
    } catch (err) {
      console.error('[Store] Failed to join game:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to join game' } }));
      throw err;
    }
  },

  // Create game: create a new game and start it (per API documentation)  
  createNewGame: async (token = null) => {
    console.info('[Store] Start creating and launching new game...', { hasToken: !!token });
    try {
      // 1) Get current game, check if archiving is needed
      let current = await get().fetchCurrentGame();
      let currentId = current?.id || get().gameMeta.id;
      const currentState = current?.state || get().gameMeta.state;

      // 2) If a current game exists and is not archived, archive it first
      if (currentId && currentState !== 'archived') {
        console.info('[Store] Archive current game to trigger backend creation of a waiting game', { currentId, currentState });
        try {
          await gameApi.archiveGame(currentId, token);
          console.info('[Store] Game archived successfully');
          // Mark locally as archived
          set((state) => ({
            gameMeta: { ...state.gameMeta, state: 'archived', statusCode: 2, endedAt: new Date().toISOString() },
          }));
        } catch (archiveError) {
          console.warn('[Store] Failed to archive game, continue to fetch new game:', archiveError.message);
        }
      }

      // 3) Fetch "current game" (backend will auto-create a new waiting game and return it)
      console.info('[Store] Fetch current game (backend will auto-create new game)...');
      const fresh = await get().fetchCurrentGame();
      const newGameId = fresh?.id || get().gameMeta.id;
      if (!newGameId) throw new Error('Failed to obtain new game ID');

      console.info('[Store] New game ID:', newGameId);

      return true;
    } catch (err) {
      console.error('[Store] Failed to create and start game:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to create and start game' } }));
      return false;
    }
  },

  // Start game: call backend and set frontend state to ongoing
  // API: POST /api/game/{game_id}/start/
  // Preconditions: Game.status must be WAITING; admin token optional
  startGame: async (maybeGameId = null, token = null) => {
    try {
      let gameId = maybeGameId || get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] gameId not found, trying to fetch current game...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] Got gameId:', gameId);
      }
      if (!gameId) throw new Error('Failed to obtain gameId');

      console.info('[Store] Calling startGame API...', { gameId });
      await gameApi.startGame(gameId, token);
      console.info('[Store] startGame API success');

      const oldState = get().gameMeta.state;
      set((state) => ({
        gameMeta: {
          ...state.gameMeta,
          state: 'ongoing',
          statusCode: 1,
          startedAt: state.gameMeta.startedAt || new Date().toISOString(),
        },
      }));

      console.info('[Store] Game state updated!', {
        oldState,
        newState: 'ongoing',
        startedAt: get().gameMeta.startedAt
      });
      return true;
    } catch (err) {
      console.error('[Store] Failed to start game:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to start game' } }));
      return false;
    }
  },

  // Archive game: call backend and set frontend state to archived
  // API: POST /api/game/{game_id}/archive/
  // Preconditions: Game.status must be FINISHED; admin token optional
  archiveGame: async (maybeGameId = null, token = null) => {
    try {
      let gameId = maybeGameId || get().gameMeta.id;
      if (!gameId) throw new Error('Failed to obtain gameId');

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
  // Start game with player count check
  startGameWithPlayerCheck: async (token = null, minPlayers = 1) => {
    console.info('[Store] Start game after player count check...', { hasToken: !!token, minPlayers });
    try {
      // 1) Get current game info
      let gameId = get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] gameId not found, trying to fetch current game...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] Got gameId:', gameId);
      }
      if (!gameId) throw new Error('Failed to obtain gameId');

      // 2) Fetch game detail to check player count
      console.info('[Store] 📊 Checking player count...');
      const gameDetail = await get().fetchGameDetail(gameId);
      const currentPlayers = gameDetail?.players_count || get().players.total || 0;
      
      console.info('[Store] Current players:', currentPlayers, 'min required:', minPlayers);

      // 3) Check if player count meets requirement
      if (currentPlayers < minPlayers) {
        const errorMsg = `Insufficient players, current: ${currentPlayers}, minimum required: ${minPlayers}`;
        console.warn('[Store]', errorMsg);
        set((state) => ({ ui: { ...state.ui, error: errorMsg } }));
        return false;
      }

      // 4) Player count satisfied, start game
      console.info('[Store] Player count satisfied, starting game...');
      const started = await get().startGame(token);
      
      if (started) {
        console.info('[Store] Game started successfully!', {
          gameId,
          players: currentPlayers,
          minPlayers
        });
      }
      
      return started;
    } catch (err) {
      console.error('[Store] Failed to start game after player check:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to start game after player check' } }));
      return false;
    }
  },

  // Initialize/start current turn (host/admin action)
  initCurrentTurn: async (token = null) => {
    console.info('[Store] Start initializing current turn...', { hasToken: !!token });
    try {
      let gameId = get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] gameId not found, trying to fetch current game...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] Got gameId:', gameId);
      }
      if (!gameId) throw new Error('Failed to obtain gameId');

      // Check game state
      const gameState = get().gameMeta.state;
      const gameStatusCode = get().gameMeta.statusCode;
      console.info('[Store] 🎮 Current game state:', { state: gameState, statusCode: gameStatusCode });
      
      if (gameState !== 'ongoing' && gameStatusCode !== 1) {
        throw new Error(`Invalid game state; cannot create turn. Current state: ${gameState} (${gameStatusCode})`);
      }
      
      console.info('[Store] Calling initTurn API...', { gameId, hasToken: !!token });
      try {
        const initResult = await gameApi.initTurn(gameId, token);
        console.info('[Store] initTurn API success:', initResult);
      } catch (initErr) {
        // If "Current turn already exists" error, the turn already exists; try fetching it
        if (initErr.message.includes('Current turn already exists')) {
          console.info('[Store] Current turn exists; fetching data...');
        } else {
          // Rethrow other errors
          throw initErr;
        }
      }

      // Refresh current turn
      console.info('[Store] Refreshing current turn data...');
      const turnResult = await get().fetchCurrentTurn(gameId, token);
      console.info('[Store] Current turn data refreshed:', turnResult);
      
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
    console.info('[Store] 📤 Start submitting current turn...', { hasToken: !!token });
    try {
      let gameId = get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] gameId not found, trying to fetch current game...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] Got gameId:', gameId);
      }
      if (!gameId) throw new Error('Failed to obtain gameId');

      console.info('[Store] Calling submitTurn API...', { gameId });
      await gameApi.submitTurn(gameId, token);
      console.info('[Store] submitTurn API success');

      // On success, refresh current turn
      console.info('[Store] Refreshing current turn data...');
      await get().fetchCurrentTurn(gameId, token);
      console.info('[Store] Current turn data refreshed');
      return true;
    } catch (err) {
      console.error('[Store] Failed to submit turn:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to submit turn' } }));
      return false;
    }
  },

    // Submit player choice (vote option)
  submitPlayerChoice: async (optionId, token = null) => { // player's token
    console.info('[Store] Start submitting player choice...', { optionId, hasToken: !!token });
    try {
      let gameId = get().gameMeta.id;
      if (!gameId) {
        console.info('[Store] gameId not found, trying to fetch current game...');
        const current = await get().fetchCurrentGame();
        gameId = current?.id || get().gameMeta.id;
        console.info('[Store] Got gameId:', gameId);
      }
      if (!gameId) throw new Error('Failed to obtain gameId');

      const auth = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null);
      if (!auth) throw new Error('Failed to obtain token');
      
      console.info('[Store] Calling submitChoice API...', { gameId, optionId });
      await gameApi.submitChoice(gameId, optionId, auth);
      console.info('[Store] submitChoice API success');

      // Optimistic update: increment voted count immediately
      const oldVoted = get().players.voted;
      set((state) => ({
        players: {
          ...state.players,
          voted: Math.min(state.players.voted + 1, state.players.total)
        },
      }));

      console.info('[Store] Choice submitted successfully!', {
        optionId,
        oldVoted,
        newVoted: get().players.voted,
        totalPlayers: get().players.total
      });
      return true;
    } catch (err) {
      console.error('[Store] 提交选择失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to submit choice' } }));
      return false;
    }
  },

  // Smartly advance to next turn: choose initCurrentTurn or submitCurrentTurn based on current state
  // Strategy:
  // - If turnsCount = 0: use initCurrentTurn (create first turn)
  // - If turnsCount > 0: use submitCurrentTurn (advance to next turn)
  // Purpose: unified "advance to next turn" API for Intro and Dashboard
  advanceTurn: async (maybeGameId = null, token = null) => {
    try {
      let gameId = maybeGameId || get().gameMeta.id;
      if (!gameId) throw new Error('Failed to obtain gameId');

      // Refresh game data first to ensure turnsCount is up to date
      await get().fetchGameDetail(gameId);
      
      const turnsCount = get().gameMeta.turnsCount;
      const gameState = get().gameMeta.state;

      console.log(`[Store] Current game state: state=${gameState}, turnsCount=${turnsCount}`);

      // Decide API by turnsCount
      if (turnsCount === 0) {
        // No turns → initialize the first turn
        console.log('[Store] No turns (turnsCount=0), calling initCurrentTurn to create first turn');
        return await get().initCurrentTurn(token);
      } else {
        // Already have turns → submit current turn to advance
        console.log(`[Store] There are ${turnsCount} turns, calling submitCurrentTurn to advance`);
        return await get().submitCurrentTurn(token);
      }
    } catch (err) {
      console.error('[Store] advanceTurn 失败:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Failed to advance to next turn' } }));
      return false;
    }
  },

  // Countdown end: submit turn regardless of vote status
  // When index reaches last round (= maxRounds - 1), set game state to finished
  handleCountdownEnd: async (token = null) => {
    console.info('[Store] Countdown ended');
    try {
      // Refresh latest turn once
      const gameId = get().gameMeta.id || (await get().fetchCurrentGame())?.id;
      if (!gameId) return false;
      
      const turn = await get().fetchCurrentTurn(gameId, token);
      if (!turn) {
        console.warn('[Store] Turn does not exist, skip countdown handling');
        return false;
      }

      const currentIndex = turn?.index || 0;
      const maxRounds = get().gameMeta.maxRounds || 0;
      console.info(`[Store] Current turn index: ${currentIndex}`);

      // If this is the last round (index = maxRounds - 1), mark game as finished after countdown
      if (Number.isFinite(maxRounds) && maxRounds > 0 && currentIndex === maxRounds - 1) {
        console.info('[Store] Last round countdown ended, marking game as finished');
        
        // Submit current turn first
        const submitSuccess = await get().submitCurrentTurn(token);
        
        if (submitSuccess) {
          // Call backend API to mark game as finished
          try {
            await gameApi.finishGame(gameId, token);
            console.info('[Store] Game has been marked as finished');
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
        }
        
        return submitSuccess;
      }

      // Guard: if beyond the last round index, do nothing
      if (Number.isFinite(maxRounds) && maxRounds > 0 && currentIndex >= maxRounds) {
        console.info('[Store] Game ended, exceeded last index', currentIndex, '>=', maxRounds);
        return false;
      }
      
      // Countdown ended: immediately submit current turn (do not check whether all players voted)
      console.info('[Store] Countdown ended, submitting current turn');
      return await get().submitCurrentTurn(token);
    } catch (err) {
      console.error('[Store] Countdown handling failed:', err);
      set((state) => ({ ui: { ...state.ui, error: err?.message || 'Countdown handling failed' } }));
      return false;
    }
  },

  // Calculate remaining time (based on turnEndsAt)
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

  // Update countdown: compute remaining time and update store
  updateCountdown: () => {
    const remaining = get().calculateTimeLeft();
    
    set((state) => ({
      turn: { ...state.turn, timeLeft: remaining }
    }));
    
    return remaining;
  },

  // Fetch game timeline history
  // API: GET /api/game/{game_id}/player/history/
  // Purpose: retrieve historical events for Timeline page
  fetchGameTimeline: async (gameId, token = null) => {
    console.info('[Store] Start fetching timeline...', { gameId, hasToken: !!token });
    
    set((state) => ({
      timeline: { ...state.timeline, loading: true, error: null }
    }));

    try {
      const data = await gameApi.getGameTimeline(gameId, token);
      console.info('[Store] Timeline API success:', data);
      
      // Handle API response shape: { status: true, data: { history: [...] } }
      const events = Array.isArray(data?.history) ? data.history : [];
      
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
}));


export default useGameStore;


