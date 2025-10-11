import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorldStatus from '../../components/dashboard/header/WorldStatus';
import Round from '../../components/dashboard/header/Round';
import UserStates from '../../components/dashboard/footer/UserStates';
import DecisionProgress from '../../components/dashboard/footer/DecisionProgress';
import StorySection from '../../components/dashboard/main/StorySection';
import Visualisation from '../../components/dashboard/main/Visualisation';
import useGameStoreScreen from '../../store/index_screen';

export default function Game() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const gameState = useGameStoreScreen(s => s.gameMeta.state);
    const turnIndex = useGameStoreScreen(s => s.turn.index);

    // 组件挂载时启动轮询，卸载时停止
    useEffect(() => {
        if (gameId) {
            useGameStoreScreen.getState().startPollingForDashboard(gameId);
        }
        return () => {
            useGameStoreScreen.getState().stopPolling();
        };
    }, [gameId]);

    // 监听 turn index 和游戏状态变化，自动跳转
    useEffect(() => {
        // Turn 11 时跳转到 Reflection 页面
        if (turnIndex === 11) {
            console.log('🎯 Turn index = 11，跳转到 Reflection');
            navigate(`/game/${gameId}/reflection`);
            return;
        }
        
        // 游戏结束时跳转到 GameOver
        if (gameState === 'finished' || gameState === 'archived') {
            navigate(`/game/${gameId}/gameover`);
        }
    }, [gameState, turnIndex, gameId, navigate]);

    return (
        <div className="h-full w-full flex flex-col">
            {/* Header: 固定高度 */}
            <header className="flex justify-between flex-shrink-0">
                <Round />
                <div className="w-px h-full border-3 border-cyan-300 mx-4"/>
                <WorldStatus />
            </header>

            {/* Main: 占据剩余空间，设置最小高度避免过度压缩 */}
            <main className="flex-1 flex border-5 border-cyan-300 min-h-96 overflow-hidden">
                <StorySection />
                <div className="w-px h-full border-3 border-cyan-300 mx-4"/>
                <Visualisation />
            </main>

            {/* Footer: 固定高度 */}
            <footer className="flex justify-between flex-shrink-0">
                <UserStates />
                <div className="w-px h-10rem border-3 border-cyan-300 mx-4"/>
                <DecisionProgress />
            </footer>
        </div>
        );
    }
