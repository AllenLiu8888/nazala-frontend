# Zustand Game State (screen)

This document explains `src/store/index.js` design, field mappings, usage, and polling to help onboarding and maintenance.

## Why Zustand

- No Provider/Context needed; components subscribe via `useGameStore(selector)` and only re-render the used slice.
- Fits screen-side "polling + multi-component coordination"; effects (fetching/polling) live in the store for control.

## State slices

- gameMeta: game-wide info
  - id: current game ID
  - statusCode: backend numeric status
  - state: text status (0→waiting, 1→ongoing, 2→archived)
  - totalRounds: total rounds (prefer `max_turns`, fallback `turns_count`)
  - maxRounds: `$Game.max_turns`
  - turnsCount: `$Game.turns_count`
  - playersCount: `$Game.players_count`
  - joinToken: `$Game.join_token`
  - startedAt/endedAt: start/end timestamps

- turn: current turn
  - index: turn index (0 means intro phase)
  - year: year (if provided by backend)
  - phase: phase (0→intro, 1→voting, 2→result)
  - questionText: question
  - options: options array (with attribute impacts)

- players: summary
  - joined/total/voted: joined/total/voted (`$Turn.total_players/total_choices`)

- world: visualization
  - radarData: radar chart data (can be aggregated)
  - narrative: narrative text

- ui: generic UI
  - loading/error: loading and error info

## Setters (partial updates)

- `setGameMeta(partial)`: update gameMeta
- `setTurn(partial)`: update turn (e.g. `setTurn({ index: 1 })`)
- `setPlayers(partial)`: update players
- `setWorld(partial)`: update world
- `clearError()`: clear `ui.error`

Note: `partial` only overrides provided fields; add `replaceXxx` if full replacements are needed.

## Actions (fetch & mapping)

- `fetchCurrentGame()`:
  - Call backend current game API (supports `data.game` or `data`).
  - Map `$Game` → gameMeta fields.
  - Maintain `ui.loading/ui.error`.
  - Return `game` for extra use.

- `fetchGameDetail(gameId)`: refresh statistics for dashboard.

- `fetchCurrentTurn(gameId, token?)`: update turn and players; drive progress.

- `startGame(gameId?, token?)`: set state to `ongoing` from `waiting`.

- `archiveGame(gameId?, token?)`: set to `archived` from `finished`.

- `initTurn(gameId?, token?)`: create first turn in `ongoing`; then `fetchCurrentTurn`.

- `submitTurn(gameId?, token?)`: submit current turn, create next.

- `advanceTurn(gameId?, token?)`: choose `initTurn` or `submitTurn` based on state (unified next-turn API).

## Polling (start/stop)

- `startPolling(providedGameId?)`:
  - Ensure `gameId` (via `fetchCurrentGame()` if needed).
  - Conditional `turn` requests by state.
  - Pull immediately once; then every 2s.

- `stopPolling()`: clear interval and nullify `_pollerId`.

Error policy: set `ui.error` but do not throw or stop polling; resume when network recovers.

## How to use in components

Read (fine-grained subscriptions):

```jsx
import useGameStore from '@/store';

const round = useGameStore(s => s.turn.index);
const totalRounds = useGameStore(s => s.gameMeta.totalRounds);
const votedRatio = useGameStore(s => `${s.players.voted}/${s.players.total}`);
const loading = useGameStore(s => s.ui.loading);
const error = useGameStore(s => s.ui.error);
```

Call actions:

```jsx
const fetchCurrentGame = useGameStore(s => s.fetchCurrentGame);
await fetchCurrentGame();

const { fetchGameDetail, fetchCurrentTurn } = useGameStore.getState();
await Promise.all([
  fetchGameDetail(gameId),
  fetchCurrentTurn(gameId),
]);
```

Control polling in page lifecycle:

```jsx
import useGameStore from '@/store';
import { useEffect } from 'react';

useEffect(() => {
  const { startPolling, stopPolling } = useGameStore.getState();
  startPolling();
  return () => stopPolling();
}, []);
```

## Backend field mapping (summary)

- `$Game`
  - id → gameMeta.id
  - status → gameMeta.statusCode → gameMeta.state (0 waiting / 1 ongoing / 2 archived)
  - max_turns → gameMeta.maxRounds (preferred source for totalRounds)
  - turns_count → gameMeta.turnsCount (fallback for totalRounds)
  - players_count → gameMeta.playersCount
  - join_token/started_at/ended_at → same-name fields

- `$Turn`
  - index → turn.index
  - status → turn.phase (0 intro / 1 voting / 2 result)
  - question_text → turn.questionText
  - options → turn.options
  - total_players/total_choices → players.total / players.voted (joined usually equals total)

## Notes

- Store is the single source of truth; backend data goes here; local UI state stays in components.
- Subscribe only to the fields you need to minimize re-renders.
- Navigation should live in pages; store focuses on data and effects.

## Troubleshooting

- Data not updating: ensure `startPolling` runs; `gameId` present; API paths/responses correct.
- Duplicate requests/jitter: avoid multiple `startPolling`; reuse `_pollerId`; call `stopPolling` on unmount.
- No navigation: verify state mapping (waiting/ongoing/archived vs intro/voting/result) and change-only listeners.


