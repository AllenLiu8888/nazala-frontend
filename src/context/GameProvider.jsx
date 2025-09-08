import { useState, useCallback } from 'react';
import { gameApi } from '../services/gameApi';
import { GameContext } from './CreateGameContext';

// Provider 组件
export const GameProvider = ({ children }) => {
    // 状态定义（只包含当前需要的）
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

  // 获取当前游戏
  const getCurrentGame = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎮 Context: 获取当前游戏...');
      
      const gameData = await gameApi.getCurrentGame();
      setGame(gameData.game);
      
      console.log('✅ Context: 游戏数据已更新', gameData.game);
      return gameData.game;
    } catch (err) {
      setError(err.message);
      console.error('❌ Context: 获取游戏失败', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Context 值
  const contextValue = {
    // 状态
    game,
    loading,
    error,
    
    // 动作
    getCurrentGame,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
