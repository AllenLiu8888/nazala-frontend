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

    // 组件挂载时启动轮询，卸载时停止
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
