import { useContext } from 'react';
import { GameContext } from '../context/CreateGameContext';

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext 必须在 GameProvider 内部使用');
    }
    return context;
};
