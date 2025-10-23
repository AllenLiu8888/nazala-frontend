# NaZaLa Backend API Documentation

## Overview

NaZaLa is a multiplayer turn-based game. Players make choices that affect four core attributes of the world. The game uses LLMs to generate dynamic content for an immersive decision-making experience.

## Basics

- **Base URL**: `http://127.0.0.1:8000`
- **API Version**: v1
- **Data Format**: JSON
- **Encoding**: UTF-8

## Authentication

### Methods
The API supports three methods:

1. **Authorization Header** (recommended)
```http
Authorization: Bearer <your_auth_token>
```

2. **Custom Header**
```http
X-Auth-Token: <your_auth_token>
```

3. **URL parameter**
```
?auth_token=<your_auth_token>
```

### Obtain token
You get an auth token when creating a player via `/api/game/{game_id}/player/init/`.

## Core attributes

The game has four core attributes; each choice affects them:

- **Memory Equality**
- **Technical Control**
- **Society Cohesion**
- **Autonomy Control**

## Game status

### Game Status
- `0` - WAITING
- `1` - ONGOING
- `10` - FINISHED
- `20` - ARCHIVED

## API endpoints

### 1. Game management

#### Get current game
```http
GET /api/game/current/
```

**Note:** If the latest game is ARCHIVED, a new WAITING game will be created and returned.

**Response example:**
```json
{
  "status": true,
  "data": {
    "game": {
      "id": 1,
      "status": 0,
      "max_turns": 12,
      "join_token": "abc123def456",
      "started_at": null,
      "ended_at": null,
      "players_count": 2,
      "turns_count": 0
    }
  }
}
```

#### Get game detail
```http
GET /api/game/{game_id}/detail/
```

**Path parameter:**
- `game_id` (integer): Game ID

**Response:** Same as current game

#### Start game
```http
POST /api/game/{game_id}/start/
```

**Preconditions:**
- Game status is WAITING
- At least 1 player

**Response example:**
```json
{
  "status": true,
  "data": {
    "game": {
      "id": 1,
      "status": 1,
      "started_at": "2024-01-01T10:00:00Z",
      "players_count": 2,
      "turns_count": 0
    }
  }
}
```

#### Finish game
```http
POST /api/game/{game_id}/finish/
```

**Preconditions:**
- Game status is ONGOING

**Note:** Switch status from ONGOING to FINISHED, typically after the last turn.

#### Archive game
```http
POST /api/game/{game_id}/archive/
```

**Preconditions:**
- Game status is FINISHED

### 2. Turn management

#### Get current turn
```http
GET /api/game/{game_id}/turn/current
```

**Note:** If the first turn is not created, the API returns `status: false`.

**Preconditions:**
- Game status is ONGOING

**Response example:**
```json
{
  "status": true,
  "data": {
    "turn": {
      "id": 1,
      "game": {...},
      "index": 0,
      "status": 0,
      "question_text": "You face an important decision...",
      "options": [
        {
          "id": 1,
          "turn_id": 1,
          "display_number": 1,
          "text": "Support technological development",
          "attrs": [
            {"name": "Memory Equality", "value": 5},
            {"name": "Technical Control", "value": 10},
            {"name": "Society Cohesion", "value": -5},
            {"name": "Autonomy Control", "value": 0}
          ],
          "created_at": "2024-01-01T10:00:00Z"
        }
      ],
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z",
      "total_players": 2,
      "total_choices": 0
    }
  }
}
```

#### Init new turn
```http
POST /api/game/{game_id}/turn/init
```

**Preconditions:**
- Game status is ONGOING
- No current ongoing turn

**Function:** Generate new question/options with LLM

#### Submit turn
```http
POST /api/game/{game_id}/turn/submit
```

**Preconditions:**
- Game status is ONGOING
- All players have chosen

**Function:** Submit current turn choices and generate next turn; returns `status: false` if invalid.

**Response example:**
```json
{
  "status": true,
  "data": {
    "next_turn": { /* $Turn */ }
  }
}
```

### 3. Player management

#### Get my profile
```http
GET /api/game/my_profile/
```

**Auth:** Required

**Response example:**
```json
{
  "status": true,
  "data": {
    "player": {
      "id": 1,
      "game": {...},
      "auth_token": "token_here",
      "token_expires_at": "2024-02-01T10:00:00Z"
    }
  }
}
```

#### Init player / join game
```http
POST /api/game/{game_id}/player/init/
```

**Request body:**
```json
{
  "display_name": "player nickname"
}
```

**Note:** With a valid `auth_token` belonging to this `game_id`, the existing player is returned.

**Response example:**
```json
{
  "status": true,
  "data": {
    "player": {
      "id": 1,
      "game": {...},
      "auth_token": "your_new_auth_token_here",
      "token_expires_at": "2024-02-01T10:00:00Z"
    }
  }
}
```

#### Submit choice
```http
POST /api/game/{game_id}/player/submit/
```

**Auth:** Required

**Request body:**
```json
{
  "option_id": 1
}
```
(Form field submission is supported: `option_id=<Integer>`)

**Preconditions:**
- Game status is ONGOING
- Player has not chosen in current turn
- Option belongs to current turn

**响应示例：**
```json
{
  "status": true,
  "data": {
    "option": {...},
    "turn": {...},
    "game": {...}
  }
}
```

#### Get my history
```http
GET /api/game/{game_id}/player/history
```

**Auth:** Required

**Function:** Get all historical choices for this game.

**响应示例：**
```json
{
  "status": true,
  "data": {
    "history": [
      { "turn": { /* $Turn */ }, "user_option": { /* $Option */ } },
      { "turn": { /* $Turn */ }, "user_option": { /* $Option */ } }
    ]
  }
}
```

## Error handling

### Error response format
```json
{
  "status": false,
  "data": {},
  "error": "error description"
}
```

### Common error codes

- **400 Bad Request**: invalid request parameters
- **401 Unauthorized**: auth failed or token invalid
- **404 Not Found**: resource not found
- **500 Internal Server Error**: server error

### Business error examples

```json
{
  "status": false,
  "data": {},
  "error": "Game is not in waiting status."
}
```

```json
{
  "ok": false,
  "error": "PLAYER_AUTH_REQUIRED",
  "message": "Auth token missing or invalid."
}
```

## Full game flow example

### 1. Create/Get current game
```javascript
const response = await fetch('/api/game/current/');
const { data } = await response.json();
const game = data.game;
```

### 2. Player joins the game
```javascript
const joinResponse = await fetch(`/api/game/${game.id}/player/init/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    display_name: 'Zhang San'
  })
});
const { data: playerData } = await joinResponse.json();
const authToken = playerData.player.auth_token;
```

### 3. Start game
```javascript
const startResponse = await fetch(`/api/game/${game.id}/start/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

### 4. Initialize first turn
```javascript
const initTurnResponse = await fetch(`/api/game/${game.id}/turn/init`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

### 5. Get current turn info
```javascript
const turnResponse = await fetch(`/api/game/${game.id}/turn/current`, {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
const { data: turnData } = await turnResponse.json();
const turn = turnData.turn;
```

### 6. Player makes a choice
```javascript
const choiceResponse = await fetch(`/api/game/${game.id}/player/submit/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  },
  body: JSON.stringify({
    option_id: 1
  })
});
```

### 7. Wait for all players then submit turn
```javascript
// Check if all players have chosen
if (turn.total_choices === turn.total_players) {
  const submitResponse = await fetch(`/api/game/${game.id}/turn/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const submitData = await submitResponse.json();
  const nextTurn = submitData?.data?.next_turn;
  // Use nextTurn to update UI/state
}
```

### 8. Finish game (optional)
```javascript
const finishResponse = await fetch(`/api/game/${game.id}/finish/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

### 9. Archive game (optional)
```javascript
const archiveResponse = await fetch(`/api/game/${game.id}/archive/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

## Realtime update suggestion

As it is multiplayer, we recommend polling for latest state:

```javascript
// Poll current turn status
setInterval(async () => {
  const response = await fetch(`/api/game/${game.id}/turn/current`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const { data } = await response.json();
  updateUI(data.turn);
}, 2000); // every 2 seconds
```

## Data models

### Game object
```json
{
  "id": 1,
  "status": 0,
  "max_turns": 12,
  "join_token": "abc123",
  "started_at": "2024-01-01T10:00:00Z",
  "ended_at": null,
  "players_count": 2,
  "turns_count": 1,
  "start_year": 2075,
  "end_year": 2125
}
```

### Turn object
```json
{
  "id": 1,
  "game": {...},
  "index": 0,
  "status": 0,
  "question_text": "Question text",
  "options": [...],
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z",
  "total_players": 2,
  "total_choices": 1,
  "year": 2075,
  "attrs": [
    {"name": "Memory Equality", "value": 5},
    {"name": "Technical Control", "value": 10},
    {"name": "Society Cohesion", "value": -5},
    {"name": "Autonomy Control", "value": 0}
  ]
}
```

### Option object
```json
{
  "id": 1,
  "turn_id": 1,
  "display_number": 1,
  "text": "Option description",
  "attrs": [
    {"name": "Memory Equality", "value": 5},
    {"name": "Technical Control", "value": 10},
    {"name": "Society Cohesion", "value": -5},
    {"name": "Autonomy Control", "value": 0}
  ],
  "created_at": "2024-01-01T10:00:00Z"
}
```

### Player object
```json
{
  "id": 1,
  "game": {...},
  "auth_token": "token_string",
  "token_expires_at": "2024-02-01T10:00:00Z"
}
```

## Notes

1. **Token management**: token is valid for 30 days; keep it safe
2. **Game status**: call the correct API in the correct state
3. **Concurrency**: handle concurrent choices
4. **Error handling**: always check the `status` field
5. **Polling frequency**: avoid intervals below 1s to reduce server load

## Contact

For issues, contact the backend team.

---

*Last updated: 2024-01*
