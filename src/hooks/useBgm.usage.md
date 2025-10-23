# useBgm Hook Guide

## What it does

A global background music management hook based on `use-sound`, supporting audio instance sharing across pages.

## Features

- Global singleton audio instance
- Seamless playback across pages
- Simple play/stop controls
- Built on top of `use-sound`

## API

```javascript
useBgm(soundUrl, shouldPlay, shouldStop)
```

### Parameters

- `soundUrl` (string): audio file URL
- `shouldPlay` (boolean): whether to start playing
- `shouldStop` (boolean): whether to stop playing

## Usage examples

### 1. Start BGM in HomePage

```jsx
import { useBgm } from '../../hooks/useBgm';

const HomePage = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  
  // Start playing in HomePage, do not stop
  useBgm(bgmUrl, true, false);
  
  return <div>Home Page</div>;
};
```

### 2. Keep playing in GameLobby (no interruption)

```jsx
import { useBgm } from '../../hooks/useBgm';

const GameLobby = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  
  // Do not start new playback, do not stop (continue playing)
  useBgm(bgmUrl, false, false);
  
  return <div>Game Lobby</div>;
};
```

### 3. Stop playback in GameIntro

```jsx
import { useBgm } from '../../hooks/useBgm';

const GameIntro = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  
  // Do not start playback, but stop
  useBgm(bgmUrl, false, true);
  
  return <div>Game Intro</div>;
};
```

## Full flow example

### Scenario: HomePage → GameLobby → GameIntro

```jsx
// ===== HomePage.jsx =====
import { useBgm } from '../../hooks/useBgm';

const HomePage = () => {
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  useBgm(bgmUrl, true, false); // start playing
  
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

### Playback flow

1. **User enters HomePage**
   - `useBgm(url, true, false)` → start BGM
   - Music loops

2. **User navigates to GameLobby**
   - `useBgm(url, false, false)` → keep playing (no operation)
   - Music keeps playing smoothly

3. **User clicks Start Game and enters GameIntro**
   - `useBgm(url, false, true)` → stop BGM
   - Music stops

## How it works

### Global state management

```javascript
// Global variables shared across components
let globalAudioInstance = null;
let globalIsPlaying = false;
```

- `globalAudioInstance`: holds the audio instance created by `use-sound`
- `globalIsPlaying`: tracks current playback state

### Key logic

1. **First play (shouldPlay = true)**:
   - Check `globalIsPlaying` is false
   - Call `play()` to start
   - Set `globalIsPlaying = true`

2. **Continue (shouldPlay = false, shouldStop = false)**:
   - Do nothing
   - Audio keeps playing

3. **Stop (shouldStop = true)**:
   - Call `stop()`
   - Set `globalIsPlaying = false`

## Notes

### 1. URL must be consistent

Ensure all pages use the **exact same** `soundUrl`:

```javascript
// Correct - same URL
const bgmUrl = 'https://example.com/audio/menu.ogg';

// HomePage
useBgm(bgmUrl, true, false);

// GameLobby
useBgm(bgmUrl, false, false);
```

```javascript
// Wrong - different URLs
// HomePage
useBgm('https://example.com/audio/menu.ogg', true, false);

// GameLobby
useBgm('https://example.com/audio/menu2.ogg', false, false); // 不同的 URL！
```

### 2. Browser autoplay restrictions

Modern browsers require a user gesture before audio playback. Ensure you start music after a click:

```jsx
const HomePage = () => {
  const [canPlay, setCanPlay] = useState(false);
  const bgmUrl = 'https://example.com/audio/menu.ogg';
  
  useBgm(bgmUrl, canPlay, false);
  
  return (
    <button onClick={() => setCanPlay(true)}>
      Start (play after click)
    </button>
  );
};
```

### 3. Component unmount

When `shouldStop = true`, unmount will automatically stop music:

```jsx
useBgm(bgmUrl, false, true); // 卸载时自动停止
```

## Advanced usage

### Switch different BGM

```jsx
const [currentBgm, setCurrentBgm] = useState('menu');

const bgmUrls = {
  menu: 'https://example.com/audio/menu.ogg',
  game: 'https://example.com/audio/game.ogg',
  gameover: 'https://example.com/audio/gameover.ogg',
};

// Stop current BGM
useBgm(bgmUrls[currentBgm], false, true);

// Play new BGM
useBgm(bgmUrls['game'], true, false);
```

### Manually reset global state

```javascript
import { resetBgm } from '../../hooks/useBgm';

// Reset in special cases
resetBgm();
```

## Troubleshooting

### Issue: Music does not play

**Solution**:
1. Check `shouldPlay` is `true`
2. Ensure a user gesture happened (click etc.)
3. Verify audio URL
4. Check browser console logs

### Issue: Music interrupts when switching pages

**Solution**:
1. Ensure all pages use the same `soundUrl`
2. Use `useBgm(url, false, false)` on intermediate pages
3. Check if something sets `shouldStop = true`

### Issue: Music cannot stop

**Solution**:
1. Ensure target page uses `shouldStop = true`
2. Check global state updates
3. Try `resetBgm()` to reset

## Related resources

- [use-sound docs](https://github.com/joshwcomeau/use-sound)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)


