import React, { createContext, useContext, useState } from 'react';
import { GAME_STATES } from '../utils/constants';
import { initialWorldState, mockPlayers } from '../data/mockData';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(GAME_STATES.WAITING);
  const [currentRound, setCurrentRound] = useState(0);
  const [players, setPlayers] = useState([]);
  const [worldState, setWorldState] = useState(initialWorldState);
  const [gameHistory, setGameHistory] = useState([]);

  const startGame = () => {
    setGameState(GAME_STATES.INTRO);
    setCurrentRound(1);
    setPlayers(mockPlayers); // Using mock data for now
  };

  const nextRound = () => {
    setCurrentRound(prev => prev + 1);
    if (currentRound >= 10) {
      setGameState(GAME_STATES.GAME_OVER);
    }
  };

  const updateWorldState = (effects) => {
    setWorldState(prev => {
      const newState = { ...prev };
      Object.keys(effects).forEach(key => {
        newState[key] = Math.max(0, Math.min(100, prev[key] + effects[key]));
      });
      return newState;
    });
  };

  const addPlayer = (player) => {
    setPlayers(prev => [...prev, player]);
  };

  const value = {
    gameState,
    setGameState,
    currentRound,
    players,
    worldState,
    gameHistory,
    startGame,
    nextRound,
    updateWorldState,
    addPlayer,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};