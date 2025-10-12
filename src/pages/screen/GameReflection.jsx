import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGameStoreScreen from '../../store/index_screen';
import { CONFIG } from '../../store/common_tools';

const GameReflection = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const gameState = useGameStoreScreen(s => s.gameMeta.state);
    const playersTotal = useGameStoreScreen(s => s.players.total);
    const playersVoted = useGameStoreScreen(s => s.players.voted);
    const turnIndex = useGameStoreScreen(s => s.turn.index);

    // 启动轮询
    useEffect(() => {
        if (gameId) {
            useGameStoreScreen.getState().startPollingForDashboard(gameId);
        }
        return () => {
            useGameStoreScreen.getState().stopDashboardPolling();
        };
    }, [gameId]);

    // 监听投票完成：当所有玩家在当前回合完成投票
    // - 若非最后一轮：仅提交当前回合
    // - 若为最后一轮：先提交当前回合，再结束游戏
    useEffect(() => {
        if (playersVoted == playersTotal && playersTotal > 0) {
            useGameStoreScreen.getState().submitCurrentTurn();
            if (turnIndex == CONFIG.LAST_TURN_INDEX) {
                useGameStoreScreen.getState().finishGame();
            }
        }
    }, [playersVoted, playersTotal, turnIndex]);

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

