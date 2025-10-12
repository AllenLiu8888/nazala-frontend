import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';

// ============ BGM URL 配置 ============
export const BGM_URLS = {
  menu: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760245768/Cyberpunk_2077_E3_2018_Trailer_Music_Hyper_-_SPOILER_4K_hcaqg8.mp3',
  // game: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760243513/intense-cyberpunk-techno-music-348920_w4ixcx.mp3',
  game: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760244988/Neon_Circuit_City_2025-10-11T104419_uzyizp.mp3',
  intro: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760258905/intro_3_xglst0.mp3',
  gameover: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760259256/GameOver_01_h7m1tb.mp3',
};


// 按音轨（soundUrl）记录播放状态，支持多轨并行
const playingState = Object.create(null);
const instances = Object.create(null);
const fadeTimers = Object.create(null);
const FADE_MS_DEFAULT = 600;

/**
 * 全局背景音乐 Hook
 * @param {string} soundUrl - 音频文件路径
 * @param {boolean} shouldPlay - 是否应该播放
 * @param {boolean} shouldStop - 是否应该停止
 * @param {number} volume - 音量（0-1，默认 0.5）
 * @param {boolean} loop - 是否循环（默认 true）
 */
export const useBgm = (soundUrl, shouldPlay = false, shouldStop = false, volume = 0.5, loop = true) => {
  const hasInitialized = useRef(false);

  // 创建或获取 Howl 实例
  const ensureInstance = () => {
    if (!instances[soundUrl]) {
      instances[soundUrl] = new Howl({ src: [soundUrl], loop, volume: 0 });
    } else {
      try { instances[soundUrl].loop(loop); } catch (err) { void err; }
    }
    return instances[soundUrl];
  };

  // 内部封装：淡入播放
  const play = useCallback((fadeMs = FADE_MS_DEFAULT) => {
    const howl = ensureInstance();
    if (!howl.playing()) {
      try { howl.volume(0); } catch (err) { void err; }
      howl.play();
    }
    // 清理可能存在的上次淡化
    if (fadeTimers[soundUrl]) { clearTimeout(fadeTimers[soundUrl]); fadeTimers[soundUrl] = null; }
    try { howl.fade(howl.volume(), Math.max(0, Math.min(1, volume)), fadeMs); } catch (err) { void err; }
    playingState[soundUrl] = true;
  }, [soundUrl, volume, loop]);

  // 内部封装：淡出停止
  const stop = useCallback((fadeMs = FADE_MS_DEFAULT) => {
    const howl = instances[soundUrl];
    if (!howl) { playingState[soundUrl] = false; return; }
    const from = howl.volume();
    try { howl.fade(from, 0, fadeMs); } catch (err) { void err; }
    if (fadeTimers[soundUrl]) clearTimeout(fadeTimers[soundUrl]);
    fadeTimers[soundUrl] = setTimeout(() => {
      try { howl.stop(); } catch (err) { void err; }
      playingState[soundUrl] = false;
      fadeTimers[soundUrl] = null;
    }, fadeMs + 20);
  }, [soundUrl]);

  useEffect(() => {
    // no-op: 保持与 React 生命周期同步
  }, []);

  useEffect(() => {
    // 如果需要播放且本实例未初始化，且该 soundUrl 未在播，则开始播放
    if (shouldPlay && !hasInitialized.current && !playingState[soundUrl]) {
      hasInitialized.current = true;
      playingState[soundUrl] = true;
      play();
      console.info('[BGM] 开始播放:', soundUrl);
    }
  }, [shouldPlay, soundUrl, play]);

  useEffect(() => {
    // 如果需要停止
    if (shouldStop && playingState[soundUrl]) {
      stop();
      playingState[soundUrl] = false;
      hasInitialized.current = false;
      console.info('[BGM] 停止播放:', soundUrl);
    }
  }, [shouldStop, soundUrl, stop]);

  // 清理函数：只在需要停止时才清理
  useEffect(() => {
    return () => {
      if (shouldStop && playingState[soundUrl]) {
        stop(200);
        playingState[soundUrl] = false;
        console.info('[BGM] 组件卸载，停止:', soundUrl);
      }
    };
  }, [shouldStop, soundUrl, stop]);

  return {
    play,
    stop,
    isPlaying: !!playingState[soundUrl],
    setVolume: (v) => {
      const howl = instances[soundUrl];
      try { if (howl) howl.volume(Math.max(0, Math.min(1, v))); } catch (err) { void err; }
    },
  };
};

// 手动控制全局音频的工具函数
export const resetBgm = () => {
  for (const k of Object.keys(playingState)) delete playingState[k];
  console.info('[BGM] 播放状态已重置');
};

