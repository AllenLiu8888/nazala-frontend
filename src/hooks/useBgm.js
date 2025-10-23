import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';

// ============ BGM URL configuration ============
export const BGM_URLS = {
  // menu: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760245768/Cyberpunk_2077_E3_2018_Trailer_Music_Hyper_-_SPOILER_4K_hcaqg8.mp3',
  menu: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760332238/1-01_V_im1khy.mp3',
  // game: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760243513/intense-cyberpunk-techno-music-348920_w4ixcx.mp3',
  game: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760244988/Neon_Circuit_City_2025-10-11T104419_uzyizp.mp3',
  intro: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760440502/intro_5_rh0yl8.mp3',
  gameover: 'https://res.cloudinary.com/dd9dbngmy/video/upload/v1760259256/GameOver_01_h7m1tb.mp3',
};


// Track playback state per soundUrl, support multiple concurrent tracks
const playingState = Object.create(null);
const instances = Object.create(null);
const fadeTimers = Object.create(null);
const FADE_MS_DEFAULT = 600;

/**
 * Global background music hook
 * @param {string} soundUrl - Audio file URL
 * @param {boolean} shouldPlay - Whether it should play
 * @param {boolean} shouldStop - Whether it should stop
 * @param {number} volume - Volume (0-1, default 0.5)
 * @param {boolean} loop - Whether to loop (default true)
 */
export const useBgm = (soundUrl, shouldPlay = false, shouldStop = false, volume = 0.5, loop = true) => {
  const hasInitialized = useRef(false);

  // Create or retrieve Howl instance
  const ensureInstance = () => {
    if (!instances[soundUrl]) {
      instances[soundUrl] = new Howl({ src: [soundUrl], loop, volume: 0 });
    } else {
      try { instances[soundUrl].loop(loop); } catch (err) { void err; }
    }
    return instances[soundUrl];
  };

  // Internal: fade-in play
  const play = useCallback((fadeMs = FADE_MS_DEFAULT) => {
    const howl = ensureInstance();
    if (!howl.playing()) {
      try { howl.volume(0); } catch (err) { void err; }
      howl.play();
    }
    // Clear previous fade timer if any
    if (fadeTimers[soundUrl]) { clearTimeout(fadeTimers[soundUrl]); fadeTimers[soundUrl] = null; }
    try { howl.fade(howl.volume(), Math.max(0, Math.min(1, volume)), fadeMs); } catch (err) { void err; }
    playingState[soundUrl] = true;
  }, [soundUrl, volume, loop]);

  // Internal: fade-out stop
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
    // no-op: keep in sync with React lifecycle
  }, []);

  useEffect(() => {
    // If shouldPlay, not initialized, and this soundUrl is not playing, start playback
    if (shouldPlay && !hasInitialized.current && !playingState[soundUrl]) {
      hasInitialized.current = true;
      playingState[soundUrl] = true;
      play();
      console.info('[BGM] Start playing:', soundUrl);
    }
  }, [shouldPlay, soundUrl, play]);

  useEffect(() => {
    // If should stop
    if (shouldStop && playingState[soundUrl]) {
      stop();
      playingState[soundUrl] = false;
      hasInitialized.current = false;
      console.info('[BGM] Stop playing:', soundUrl);
    }
  }, [shouldStop, soundUrl, stop]);

  // Cleanup: only stop if shouldStop is true
  useEffect(() => {
    return () => {
      if (shouldStop && playingState[soundUrl]) {
        stop(200);
        playingState[soundUrl] = false;
        console.info('[BGM] Component unmount, stop:', soundUrl);
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

// Utility to manually control global audio
export const resetBgm = () => {
  for (const k of Object.keys(playingState)) delete playingState[k];
  console.info('[BGM] Playback state reset');
};

