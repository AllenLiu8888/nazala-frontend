# API集成任务计划

**项目状态**: 静态UI已完成，需要连接后端API实现数据流通
**目标**: 在保持现有UI不变的情况下，将所有页面和组件连接到真实的后端数据
**数据同步**: 每1秒轮询更新，大屏幕显示实时状态，手机端进行投票交互

## 任务执行顺序

### 阶段1：后端启动和连接测试 ⏱️ 15分钟

**任务1.1：启动后端服务**
- 操作：启动后端Django服务
- 命令：`cd /Users/allen/workspace/nazala_backend && source venv/bin/activate && python manage.py runserver`
- 验证：访问 `http://127.0.0.1:8000/api/game/current/` 确认API响应

**任务1.2：测试基础API连接**
- 操作：用curl或浏览器测试所有API端点
- 测试端点：`/api/game/current/`、`/api/game/1/detail/` 等基础端点

### 阶段2：GameProvider数据连接 ⏱️ 30分钟

**任务2.1：修改GameProvider.jsx - 添加实际API调用**
- 文件：`src/context/GameProvider.jsx`
- 修改内容：
  - 添加 `useEffect` 在组件挂载时调用 `getCurrentGame()`
  - 添加每1秒的轮询机制更新游戏状态
  - 保留现有的UI结构，只替换数据源
- 注释要求：在文件顶部添加中文注释说明从静态数据改为API调用

**任务2.2：更新useGameContext.js - 添加更多game操作**
- 文件：`src/hooks/useGameContext.js`
- 修改内容：添加startGame、initTurn、submitChoice等方法，保持现有API结构

### 阶段3：大屏幕页面数据连接 ⏱️ 45分钟

**任务3.1：修改HomePage.jsx - 连接游戏创建**
- 文件：`src/pages/screen/HomePage.jsx`
- 修改内容：
  - 添加 `useGameContext()` 获取游戏数据
  - 显示真实的游戏状态（waiting/ongoing/finished）
  - 保持现有UI布局和样式

**任务3.2：修改GameIntro.jsx - 显示真实QR码**
- 文件：`src/pages/screen/GameIntro.jsx`
- 修改内容：
  - 从context获取当前游戏ID和join_token
  - QR码内容改为 `${window.location.origin}/game/${gameId}/waiting`
  - 保持现有QR码组件样式

**任务3.3：修改GameDashboard.jsx - 连接实时游戏数据**
- 文件：`src/pages/screen/GameDashboard.jsx`
- 修改内容：
  - 传递真实的game、turn、players数据给所有子组件
  - 添加loading状态处理
  - 保持现有布局结构

### 阶段4：大屏幕组件数据连接 ⏱️ 60分钟

**任务4.1：修改Round.jsx - 显示真实回合信息**
- 文件：`src/components/dashboard/header/Round.jsx`
- 修改内容：
  - 接收props：`currentTurn`对象
  - 显示 `Round ${currentTurn?.index + 1 || 0}`
  - 注释掉写死的文本，保持样式

**任务4.2：修改WorldStatus.jsx - 显示世界属性**
- 文件：`src/components/dashboard/header/WorldStatus.jsx`
- 修改内容：
  - 接收props：`worldAttributes`对象
  - 显示Memory Equality, Technical Control等四个属性
  - 保持现有样式，替换静态文本

**任务4.3：修改StorySection.jsx - 显示当前问题**
- 文件：`src/components/dashboard/main/StorySection.jsx`
- 修改内容：
  - 接收props：`currentTurn`对象
  - 显示 `currentTurn?.question_text`
  - 保持现有文本样式和布局

**任务4.4：修改Visualisation.jsx - 连接图表数据**
- 文件：`src/components/dashboard/main/Visualisation.jsx`
- 修改内容：
  - 接收props：`worldAttributes`, `historicalData`
  - 将数据传递给RadarChart和HistoricalHorizontal组件
  - 保持现有图表样式

**任务4.5：修改UserStates.jsx - 显示玩家状态**
- 文件：`src/components/dashboard/footer/UserStates.jsx`
- 修改内容：
  - 接收props：`players`数组
  - 显示 `${players.length} players online`
  - 保持现有样式

**任务4.6：修改DecisionProgress.jsx - 显示投票进度**
- 文件：`src/components/dashboard/footer/DecisionProgress.jsx`
- 修改内容：
  - 接收props：`currentTurn`对象
  - 显示 `${currentTurn?.total_choices}/${currentTurn?.total_players} voted`
  - 保持现有进度条样式

### 阶段5：手机端页面数据连接 ⏱️ 45分钟

**任务5.1：修改WaitingPage.jsx - 连接玩家注册**
- 文件：`src/pages/mobile/WaitingPage.jsx`
- 修改内容：
  - 页面加载时调用 `gameApi.joinGame(gameId, null)` 自动注册
  - 存储返回的auth_token到localStorage
  - 显示真实的玩家数量
  - 取消注释playerCount相关代码，连接真实数据
  - 保持现有UI和动画

**任务5.2：修改VotingPage.jsx - 连接投票功能**
- 文件：`src/pages/mobile/VotingPage.jsx`
- 修改内容：
  - 注释掉写死的votingOptions数组
  - 从API获取当前回合的options数据
  - 修改handleOptionSelect提交到后端
  - 保持现有UI样式和倒计时动画
  - 投票后禁用选项或跳转到等待页面

**任务5.3：修改Question.jsx - 显示真实问题**
- 文件：`src/components/dashboard/main/Queston.jsx`
- 修改内容：
  - 接收props：`question`字符串
  - 替换默认的"Memories is:"文本
  - 保持现有样式和点击跳转功能

**任务5.4：修改VotingOption.jsx - 连接选项数据**
- 文件：`src/components/dashboard/main/VotingOption.jsx`
- 修改内容：
  - 接收props：`option`对象（包含text和attrs）
  - 可选：显示属性影响（+5 Memory Equality等）
  - 保持现有按钮样式

### 阶段6：实时数据同步 ⏱️ 30分钟

**任务6.1：添加轮询机制到GameProvider**
- 文件：`src/context/GameProvider.jsx`
- 修改内容：
  - 添加useEffect设置setInterval每1000ms调用getCurrentGame
  - 只在游戏状态为ongoing时轮询当前回合数据
  - 添加cleanup函数清理定时器

**任务6.2：添加token管理逻辑**
- 文件：`src/services/http.js`
- 修改内容：
  - 从localStorage读取token并添加到请求头
  - 处理token过期情况
  - 保持现有的http请求结构

### 阶段7：History页面连接 ⏱️ 20分钟

**任务7.1：修改History.jsx - 显示历史选择**
- 文件：`src/pages/mobile/History.jsx`
- 修改内容：
  - 调用API获取玩家的历史choices
  - 显示每轮选择和世界属性变化
  - 保持现有时间线样式

### 阶段8：错误处理和loading状态 ⏱️ 25分钟

**任务8.1：添加Loading组件**
- 文件：创建 `src/components/shared/Loading.jsx`
- 修改内容：简单的loading spinner，保持现有设计风格

**任务8.2：各页面添加错误处理**
- 文件：所有修改过的页面和组件
- 修改内容：
  - 添加error state处理
  - 显示用户友好的错误信息
  - 保持现有页面布局

### 阶段9：测试和调试 ⏱️ 30分钟

**任务9.1：端到端测试完整游戏流程**
- 测试内容：
  - 大屏幕：创建游戏 → 开始游戏 → 查看实时数据
  - 手机端：扫码加入 → 投票 → 查看历史
  - 验证数据同步和实时更新

**任务9.2：性能优化和bug修复**
- 修复发现的问题，优化轮询频率

## 重要配置信息

### 后端API地址
- 开发环境：`http://127.0.0.1:8000`
- 配置文件：`.env` 中的 `VITE_API_BASE_URL`
- 后端路径：`/Users/allen/workspace/nazala_backend`

### 测试数据管理
- **允许向后端数据库添加测试数据**
- **数据库路径**: `/Users/allen/workspace/nazala_backend`
- **添加方式**: Django Admin、API调用、Django shell
- **测试数据类型**: Game、Player、Turn、Option对象

### 数据同步策略
- 轮询频率：每1秒
- 同步范围：游戏状态、当前回合、玩家数量、投票进度
- 只在游戏进行中(ongoing)时轮询turn数据

### 用户流程
1. 管理员在大屏幕启动游戏
2. 玩家扫码自动加入（Player_1, Player_2格式）
3. 管理员手动开始游戏
4. 投票倒计时结束，未投票玩家数值为0

### 世界属性
- Memory Equality (记忆平等)
- Technical Control (技术控制)
- Society Cohesion (社会凝聚力)
- Autonomy Control (自主控制)

所有属性均使用英文显示，数值变化通过玩家选择计算。

## 执行检查清单

- [ ] 每个任务完成后测试UI保持原样
- [ ] 每个修改的文件添加完整中文注释
- [ ] 使用 `/* === 修改开始 === */` 和 `/* === 修改结束 === */` 标记修改范围
- [ ] 数据连接正确，无静态数据残留
- [ ] 错误处理和loading状态完整
- [ ] 可以向后端数据库添加测试数据验证功能
- [ ] 端到端游戏流程测试通过

## 修改注释要求

### 每个文件必须包含的注释内容
```javascript
/*
 * 修改日期: 2024-09-17
 * 修改内容: [具体修改了什么]
 * 修改原因: [为什么要这样修改]
 * 影响范围: [影响哪些功能]
 *
 * 整体修改说明:
 * 1. [列出主要修改点1]
 * 2. [列出主要修改点2]
 * 3. [列出主要修改点3]
 * 4. 保持原有UI样式不变
 */
```

### 代码修改标记
```javascript
/* === 修改开始 === */
// 修改的代码内容
/* === 修改结束 === */
```

这样便于后续检查完成后一次性删除测试性修改内容。