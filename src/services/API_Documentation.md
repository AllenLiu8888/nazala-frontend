# NaZaLa Backend API 文档

## 概述

NaZaLa 是一个多人回合制游戏系统，玩家通过做出选择来影响游戏世界的四个核心属性。游戏使用LLM生成动态内容，为玩家提供沉浸式的决策体验。

## 基本信息

- **Base URL**: `http://127.0.0.1:8000`
- **API 版本**: v1
- **数据格式**: JSON
- **字符编码**: UTF-8

## 身份验证

### 认证方式
API支持三种认证方式：

1. **Authorization Header** (推荐)
```http
Authorization: Bearer <your_auth_token>
```

2. **自定义Header**
```http
X-Auth-Token: <your_auth_token>
```

3. **URL参数**
```
?auth_token=<your_auth_token>
```

### 获取认证Token
通过 `/api/game/{game_id}/player/init/` 端点创建玩家时获得认证token。

## 游戏核心属性

游戏包含四个核心属性，每个玩家的选择都会影响这些属性：

- **Memory Equality** (记忆平等)
- **Technical Control** (技术控制) 
- **Society Cohesion** (社会凝聚力)
- **Autonomy Control** (自主控制)

## 游戏状态

### Game Status
- `0` - WAITING (等待中)
- `1` - ONGOING (进行中)
- `10` - FINISHED (已完成)
- `20` - ARCHIVED (已归档)

## API端点

### 1. 游戏管理

#### 获取当前游戏
```http
GET /api/game/current/
```

**响应示例：**
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

#### 获取游戏详情
```http
GET /api/game/{game_id}/detail/
```

**路径参数：**
- `game_id` (integer): 游戏ID

**响应：** 与获取当前游戏相同

#### 开始游戏
```http
POST /api/game/{game_id}/start/
```

**前置条件：**
- 游戏状态为 WAITING
- 至少有1个玩家

**响应示例：**
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

#### 归档游戏
```http
POST /api/game/{game_id}/archive/
```

**前置条件：**
- 游戏状态为 FINISHED

### 2. 回合管理

#### 获取当前回合
```http
GET /api/game/{game_id}/turn/current
```

**前置条件：**
- 游戏状态为 ONGOING

**响应示例：**
```json
{
  "status": true,
  "data": {
    "turn": {
      "id": 1,
      "game": {...},
      "index": 0,
      "status": 0,
      "question_text": "你面临一个重要的决策...",
      "options": [
        {
          "id": 1,
          "turn_id": 1,
          "display_number": 1,
          "text": "选择支持技术发展",
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

#### 初始化新回合
```http
POST /api/game/{game_id}/turn/init
```

**前置条件：**
- 游戏状态为 ONGOING
- 当前没有进行中的回合

**功能：** 使用LLM生成新的问题和选项

#### 提交回合
```http
POST /api/game/{game_id}/turn/submit
```

**前置条件：**
- 游戏状态为 ONGOING
- 所有玩家都已做出选择

**功能：** 生成下一回合的内容

### 3. 玩家管理

#### 获取我的资料
```http
GET /api/game/my_profile/
```

**认证：** 必需

**响应示例：**
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

#### 初始化玩家/加入游戏
```http
POST /api/game/{game_id}/player/init/
```

**请求体：**
```json
{
  "display_name": "玩家昵称"
}
```

**响应示例：**
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

#### 提交选择
```http
POST /api/game/{game_id}/player/submit/
```

**认证：** 必需

**请求体：**
```json
{
  "option_id": 1
}
```

**前置条件：**
- 游戏状态为 ONGOING
- 玩家尚未在当前回合做出选择
- 选项属于当前回合

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

## 错误处理

### 错误响应格式
```json
{
  "status": false,
  "data": {},
  "error": "错误描述信息"
}
```

### 常见错误码

- **400 Bad Request**: 请求参数错误
- **401 Unauthorized**: 认证失败或token无效
- **404 Not Found**: 资源不存在
- **500 Internal Server Error**: 服务器内部错误

### 业务错误示例

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

## 完整游戏流程示例

### 1. 创建/获取当前游戏
```javascript
const response = await fetch('/api/game/current/');
const { data } = await response.json();
const game = data.game;
```

### 2. 玩家加入游戏
```javascript
const joinResponse = await fetch(`/api/game/${game.id}/player/init/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    display_name: '张三'
  })
});
const { data: playerData } = await joinResponse.json();
const authToken = playerData.player.auth_token;
```

### 3. 开始游戏
```javascript
const startResponse = await fetch(`/api/game/${game.id}/start/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

### 4. 初始化第一回合
```javascript
const initTurnResponse = await fetch(`/api/game/${game.id}/turn/init`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

### 5. 获取当前回合信息
```javascript
const turnResponse = await fetch(`/api/game/${game.id}/turn/current`, {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
const { data: turnData } = await turnResponse.json();
const turn = turnData.turn;
```

### 6. 玩家做出选择
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

### 7. 等待所有玩家选择完成，然后提交回合
```javascript
// 检查是否所有玩家都已选择
if (turn.total_choices === turn.total_players) {
  const submitResponse = await fetch(`/api/game/${game.id}/turn/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
}
```

## 实时更新建议

由于游戏是多人协作的，建议前端实现轮询机制来获取最新状态：

```javascript
// 轮询当前回合状态
setInterval(async () => {
  const response = await fetch(`/api/game/${game.id}/turn/current`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const { data } = await response.json();
  updateUI(data.turn);
}, 2000); // 每2秒检查一次
```

## 数据模型参考

### Game 对象
```json
{
  "id": 1,
  "status": 0,
  "max_turns": 12,
  "join_token": "abc123",
  "started_at": "2024-01-01T10:00:00Z",
  "ended_at": null,
  "players_count": 2,
  "turns_count": 1
}
```

### Turn 对象
```json
{
  "id": 1,
  "game": {...},
  "index": 0,
  "status": 0,
  "question_text": "问题文本",
  "options": [...],
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z",
  "total_players": 2,
  "total_choices": 1
}
```

### Option 对象
```json
{
  "id": 1,
  "turn_id": 1,
  "display_number": 1,
  "text": "选项描述",
  "attrs": [
    {"name": "Memory Equality", "value": 5},
    {"name": "Technical Control", "value": 10},
    {"name": "Society Cohesion", "value": -5},
    {"name": "Autonomy Control", "value": 0}
  ],
  "created_at": "2024-01-01T10:00:00Z"
}
```

### Player 对象
```json
{
  "id": 1,
  "game": {...},
  "auth_token": "token_string",
  "token_expires_at": "2024-02-01T10:00:00Z"
}
```

## 注意事项

1. **Token管理**: 认证token有效期为30天，请妥善保存
2. **游戏状态**: 确保在正确的游戏状态下调用相应的API
3. **并发处理**: 多人游戏中注意处理并发选择的情况
4. **错误处理**: 始终检查API响应的`status`字段
5. **轮询频率**: 建议轮询间隔不少于1秒，避免对服务器造成压力

## 联系方式

如有技术问题，请联系后端开发团队。

---

*文档更新时间：2024年1月*
