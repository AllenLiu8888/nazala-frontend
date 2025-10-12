# 🎵 useBgm Hook 使用指南

## 📦 功能

基于 `use-sound` 库的全局背景音乐管理 Hook，支持跨页面共享音频实例。

## 🎯 特性

- ✅ 全局单例音频实例
- ✅ 跨页面无缝播放
- ✅ 简单的播放/停止控制
- ✅ 基于 `use-sound` 库

## 📋 API

```javascript
useBgm(soundUrl, shouldPlay, shouldStop)
```

### 参数

- `soundUrl` (string): 音频文件的 URL
- `shouldPlay` (boolean): 是否应该开始播放
- `shouldStop` (boolean): 是否应该停止播放

## 🚀 使用示例

### 1. 在 HomePage 开始播放 BGM

```jsx
import { useBgm } from '../../hooks/useBgm';

const HomePage = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  
  // 在 HomePage 开始播放，不停止
  useBgm(bgmUrl, true, false);
  
  return <div>Home Page</div>;
};
```

### 2. 在 GameLobby 继续播放（不中断）

```jsx
import { useBgm } from '../../hooks/useBgm';

const GameLobby = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  
  // 不启动新播放，也不停止（继续播放）
  useBgm(bgmUrl, false, false);
  
  return <div>Game Lobby</div>;
};
```

### 3. 在 GameIntro 停止播放

```jsx
import { useBgm } from '../../hooks/useBgm';

const GameIntro = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  
  // 不启动播放，但要停止
  useBgm(bgmUrl, false, true);
  
  return <div>Game Intro</div>;
};
```

## 📖 完整流程示例

### 场景：HomePage → GameLobby → GameIntro

```jsx
// ===== HomePage.jsx =====
import { useBgm } from '../../hooks/useBgm';

const HomePage = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  useBgm(bgmUrl, true, false); // 开始播放
  
  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => navigate('/lobby')}>Go to Lobby</button>
    </div>
  );
};

// ===== GameLobby.jsx =====
import { useBgm } from '../../hooks/useBgm';

const GameLobby = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  useBgm(bgmUrl, false, false); // 继续播放（不中断）
  
  return (
    <div>
      <h1>Game Lobby</h1>
      <button onClick={() => navigate('/intro')}>Start Game</button>
    </div>
  );
};

// ===== GameIntro.jsx =====
import { useBgm } from '../../hooks/useBgm';

const GameIntro = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  useBgm(bgmUrl, false, true); // 停止播放
  
  return (
    <div>
      <h1>Game Intro</h1>
    </div>
  );
};
```

### 播放流程

1. **用户进入 HomePage**
   - `useBgm(url, true, false)` → 开始播放 BGM
   - 音乐循环播放

2. **用户点击进入 GameLobby**
   - `useBgm(url, false, false)` → 继续播放（不做任何操作）
   - 音乐**不会中断**，保持流畅播放

3. **用户点击 Start Game，进入 GameIntro**
   - `useBgm(url, false, true)` → 停止 BGM
   - 音乐停止

## 🔧 工作原理

### 全局状态管理

```javascript
// 全局变量，跨组件共享
let globalAudioInstance = null;
let globalIsPlaying = false;
```

- `globalAudioInstance`: 保存 `use-sound` 创建的音频实例
- `globalIsPlaying`: 跟踪当前播放状态

### 关键逻辑

1. **首次播放 (shouldPlay = true)**:
   - 检查 `globalIsPlaying` 是否为 false
   - 调用 `play()` 开始播放
   - 设置 `globalIsPlaying = true`

2. **继续播放 (shouldPlay = false, shouldStop = false)**:
   - 不做任何操作
   - 音频实例继续播放

3. **停止播放 (shouldStop = true)**:
   - 调用 `stop()` 停止音频
   - 设置 `globalIsPlaying = false`

## ⚠️ 注意事项

### 1. URL 必须一致

确保所有页面使用**完全相同**的 `soundUrl`：

```javascript
// ✅ 正确 - 使用相同的 URL
const bgmUrl = 'https://example.com/audio/menu.ogg';

// HomePage
useBgm(bgmUrl, true, false);

// GameLobby
useBgm(bgmUrl, false, false);
```

```javascript
// ❌ 错误 - URL 不同
// HomePage
useBgm('https://example.com/audio/menu.ogg', true, false);

// GameLobby
useBgm('https://example.com/audio/menu2.ogg', false, false); // 不同的 URL！
```

### 2. 浏览器自动播放限制

现代浏览器要求用户交互后才能播放音频。确保在用户点击按钮后启动音乐：

```jsx
const HomePage = () => {
  const [canPlay, setCanPlay] = useState(false);
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  
  useBgm(bgmUrl, canPlay, false);
  
  return (
    <button onClick={() => setCanPlay(true)}>
      Start (点击后播放音乐)
    </button>
  );
};
```

### 3. 组件卸载

当设置 `shouldStop = true` 时，组件卸载会自动停止音乐：

```jsx
useBgm(bgmUrl, false, true); // 卸载时自动停止
```

## 🎨 进阶用法

### 切换不同的 BGM

```jsx
const [currentBgm, setCurrentBgm] = useState('menu');

const bgmUrls = {
  menu: 'https://example.com/audio/menu.ogg',
  game: 'https://example.com/audio/game.ogg',
  gameover: 'https://example.com/audio/gameover.ogg',
};

// 停止当前 BGM
useBgm(bgmUrls[currentBgm], false, true);

// 播放新 BGM
useBgm(bgmUrls['game'], true, false);
```

### 手动重置全局状态

```javascript
import { resetBgm } from '../../hooks/useBgm';

// 在某些特殊情况下重置
resetBgm();
```

## 🐛 故障排查

### 问题：音乐没有播放

**解决方案**:
1. 检查 `shouldPlay` 是否为 `true`
2. 确保用户有过交互（点击按钮等）
3. 检查音频 URL 是否正确
4. 打开浏览器控制台查看日志

### 问题：切换页面时音乐中断了

**解决方案**:
1. 确保所有页面使用相同的 `soundUrl`
2. 在中间页面使用 `useBgm(url, false, false)`
3. 检查是否有其他地方调用了 `shouldStop = true`

### 问题：音乐无法停止

**解决方案**:
1. 确保目标页面使用了 `shouldStop = true`
2. 检查全局状态是否被正确更新
3. 尝试调用 `resetBgm()` 手动重置

## 📚 相关资源

- [use-sound 文档](https://github.com/joshwcomeau/use-sound)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 🎉 完成！

现在你可以在项目中实现跨页面的无缝背景音乐播放了！

