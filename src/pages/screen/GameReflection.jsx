import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGameStoreScreen from '../../store/index_screen';

const GameReflection = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const gameState = useGameStoreScreen(s => s.gameMeta.state);

    // 启动轮询
    useEffect(() => {
        if (gameId) {
            useGameStoreScreen.getState().startPollingForDashboard(gameId);
        }
        return () => {
            useGameStoreScreen.getState().stopPolling();
        };
    }, [gameId]);

    // 监听游戏状态，finished/archived 时自动跳转到 gameover
    useEffect(() => {
        if (gameState === 'finished' || gameState === 'archived') {
            navigate(`/game/${gameId}/gameover`);
        }
    }, [gameState, gameId, navigate]);

    return (
        <div className="h-full w-full flex items-center justify-center">
            <h1 className="text-9xl font-pixel text-cyan-300">Reflection</h1>
        </div>
    );
};

export default GameReflection;

