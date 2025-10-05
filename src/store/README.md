# Zustand 游戏状态（screen 端）

本文档说明 `src/store/index.js` 的设计、字段映射、调用方式与轮询机制，帮助快速上手与维护。

## 为什么用 Zustand

- 无需 Provider/Context，组件直接通过 `useGameStore(selector)` 订阅需要的切片，更新时只重渲染使用部分。
- 适合 screen 端“轮询 + 多组件联动”的场景，副作用（取数/轮询）集中在 store，更易控。

## 切片结构（state）

- gameMeta：整局信息
  - id：当前游戏 ID
  - statusCode：后端数值状态
  - state：字符串状态（0→waiting，1→ongoing，2→archived）
  - totalRounds：总回合数（优先 `max_turns`，后备 `turns_count`）
  - maxRounds：`$Game.max_turns`
  - turnsCount：`$Game.turns_count`
  - playersCount：`$Game.players_count`
  - joinToken：`$Game.join_token`
  - startedAt/endedAt：开始/结束时间

- turn：当前回合信息
  - index：回合序号（0 表示前端 intro 阶段）
  - year：年份（若后端提供可写入）
  - phase：阶段（0→intro，1→voting，2→result）
  - questionText：题干
  - options：选项数组（含属性影响值）

- players：玩家汇总
  - joined/total/voted：加入/总人数/已投票数（`$Turn.total_players/total_choices`）

- world：世界/可视化
  - radarData：雷达图数据（如需可从选项/结果汇总而来）
  - narrative：叙事文本

- ui：通用 UI
  - loading/error：加载中与错误信息

## Setters（局部更新）

- `setGameMeta(partial)`：局部更新 gameMeta
- `setTurn(partial)`：局部更新 turn（例如 `setTurn({ index: 1 })`）
- `setPlayers(partial)`：局部更新 players
- `setWorld(partial)`：局部更新 world
- `clearError()`：清空 `ui.error`

说明：partial 是“局部更新对象”，仅覆盖指定字段；如需整对象覆盖，可另行添加 `replaceXxx` 方法。

## Actions（取数与映射）

- `fetchCurrentGame()`：
  - 调后端“当前游戏”接口，兼容 `data.game` 或 `data`。
  - 映射 `$Game` → gameMeta：
    - id/status→statusCode/state、max_turns→maxRounds/totalRounds、turns_count→turnsCount、players_count→playersCount、join_token/started_at/ended_at。
  - 维护 `ui.loading/ui.error`。
  - 返回 `game` 对象（可供调用方额外使用）。

- `fetchGameDetail(gameId)`：
  - 调“游戏详情”，刷新统计类字段（同上映射）。
  - 用于大屏整体面板（玩家数、总回合、进度等）。

- `fetchCurrentTurn(gameId, token?)`：
  - 调"当前回合"，更新 turn 与 players：
    - index/status→phase、questionText/options、total_players/total_choices → players.total/voted。
  - 用于驱动回合/投票进度与组件展示。

- `startGame(gameId?, token?)`：
  - 调用后端"开始游戏" API，将游戏状态从 `waiting` 改为 `ongoing`。
  - 前置条件：游戏必须是 `waiting` 状态。
  - 成功后更新前端状态为 `ongoing`。

- `archiveGame(gameId?, token?)`：
  - 调用后端"归档游戏" API，将游戏状态从 `finished` 改为 `archived`。
  - 前置条件：游戏必须是 `finished` 状态。
  - 用于游戏结束后返回首页前的清理。

- `initTurn(gameId?, token?)`：
  - 调用后端"初始化回合" API，在 `ongoing` 状态下创建第一个 turn。
  - 前置条件：游戏必须是 `ongoing` 状态，且当前没有进行中的回合。
  - 用途：创建游戏的第一个正式回合。
  - 成功后立即调用 `fetchCurrentTurn` 获取新创建的回合数据。

- `submitTurn(gameId?, token?)`：
  - 调用后端"提交回合" API，提交当前回合并生成下一回合。
  - 前置条件：游戏必须是 `ongoing` 状态，所有玩家都已做出选择。
  - 用途：Dashboard 检测到所有玩家完成投票时调用。
  - 成功后立即调用 `fetchGameDetail` 和 `fetchCurrentTurn` 获取新回合数据。

- `advanceTurn(gameId?, token?)`：
  - **智能进入下一回合**：根据当前状态自动选择 `initTurn` 或 `submitTurn`。
  - 策略：
    - 如果 `turnsCount = 0`：调用 `initTurn`（创建第一个回合）
    - 如果 `turnsCount > 0`：调用 `submitTurn`（进入下一回合）
  - 用途：统一的"进入下一回合"接口，适用于：
    - `GameIntro`：点击进入 Dashboard 时
    - `GameDashboard`：检测到所有玩家完成投票时

## 轮询机制（start/stop）

- `startPolling(providedGameId?)`：
  - 若无 `gameId` 先 `fetchCurrentGame()` 获取。
  - **条件性请求 turn**：
    - `waiting` 状态：只请求 `fetchGameDetail`，不请求 turn（避免报错）
    - `ongoing` 且 `turnsCount === 0`：只请求 `fetchGameDetail`，不请求 turn（intro 页面阶段）
    - 其他情况：并行请求 `fetchGameDetail + fetchCurrentTurn`
  - 立即拉取一次（`Promise.allSettled`，失败不中断）。
  - 若已在轮询则跳过；否则 `setInterval` 每 2s 拉取，并把句柄存 `_pollerId`。
  - 每轮读取最新 `gameMeta.id` 和状态，避免使用过期值。

- `stopPolling()`：
  - 读取 `_pollerId` 并 `clearInterval`，将其置空；幂等安全。
  - 在大屏相关页面卸载时调用，防止泄漏与重复请求。

错误策略：任一请求失败仅更新 `ui.error`，不抛出到外层，不中断轮询；网络恢复后自动继续。

## 组件如何使用

读取（细粒度订阅）：

```jsx
import useGameStore from '@/store';

const round = useGameStore(s => s.turn.index);
const totalRounds = useGameStore(s => s.gameMeta.totalRounds);
const votedRatio = useGameStore(s => `${s.players.voted}/${s.players.total}`);
const loading = useGameStore(s => s.ui.loading);
const error = useGameStore(s => s.ui.error);
```

调用 actions：

```jsx
const fetchCurrentGame = useGameStore(s => s.fetchCurrentGame);
await fetchCurrentGame();

const { fetchGameDetail, fetchCurrentTurn } = useGameStore.getState();
await Promise.all([
  fetchGameDetail(gameId),
  fetchCurrentTurn(gameId),
]);
```

在页面生命周期控制轮询：

```jsx
import useGameStore from '@/store';
import { useEffect } from 'react';

useEffect(() => {
  const { startPolling, stopPolling } = useGameStore.getState();
  startPolling();
  return () => stopPolling();
}, []);
```

## 与后端字段映射（摘要）

- `$Game`
  - id → gameMeta.id
  - status → gameMeta.statusCode → gameMeta.state（0 waiting / 1 ongoing / 2 archived）
  - max_turns → gameMeta.maxRounds（以及 totalRounds 优先来源）
  - turns_count → gameMeta.turnsCount（totalRounds 兜底）
  - players_count → gameMeta.playersCount
  - join_token/started_at/ended_at → 同名字段

- `$Turn`
  - index → turn.index
  - status → turn.phase（0 intro / 1 voting / 2 result）
  - question_text → turn.questionText
  - options → turn.options
  - total_players/total_choices → players.total / players.voted（joined 与 total 通常一致）

## 注意事项

- store 是“全局单一事实源”。跨组件共享、来自后端的数据应放这里；纯局部 UI 状态（如弹窗开关）用组件内 `useState` 更佳。
- 选择器必须尽量“只订阅需要的字段”，避免不必要的重渲染。
- 导航（路由跳转）建议放在页面层，基于 store 的变化触发；store 专注于数据与副作用。

## 故障排查

- 数据不更新：检查是否已在页面启动 `startPolling`；是否拿到 `gameId`；接口路径/响应结构是否符合服务层约定。
- 重复请求/抖动：确认未在多个组件反复 `startPolling`；`_pollerId` 是否正常复用；离开页面是否调用 `stopPolling`。
- 路由不跳：确认状态机映射（waiting/ongoing/archived 与 intro/voting/result）与页面监听逻辑是否只在“变化时”触发。


