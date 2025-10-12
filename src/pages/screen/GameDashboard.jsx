import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorldStatus from '../../components/dashboard/header/WorldStatus';
import Round from '../../components/dashboard/header/Round';
import UserStates from '../../components/dashboard/footer/UserStates';
import DecisionProgress from '../../components/dashboard/footer/DecisionProgress';
import StorySection from '../../components/dashboard/main/StorySection';
import Visualisation from '../../components/dashboard/main/Visualisation';
import useGameStoreScreen from '../../store/index_screen';
import LoadingOverlay from '../../components/shared/LoadingOverlay';
 


export default function Game() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const gameState = useGameStoreScreen(s => s.gameMeta.state);

    // 从 store 读取数据
    const playersTotal = useGameStoreScreen(s => s.players.total);
    const playersVoted = useGameStoreScreen(s => s.players.voted);
    const turnIndex = useGameStoreScreen(s => s.turn.index);
    const generating = useGameStoreScreen(s => s.ui.generating);

    // 使用 ref 防止 StrictMode 导致的重复调用
    const hasInitialized = useRef(false);

    // 页面渲染后启动轮询, 目的是持续更新「当前turn的已投票玩家数 playersVoted」
    useEffect(() => {
        const { stopDashboardPolling } = useGameStoreScreen.getState();

        // 防止 React StrictMode 导致的重复初始化
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            useGameStoreScreen.getState().startPollingForDashboard();
        }

        // 总是返回 cleanup，确保组件卸载时能清理轮询
        return () => {
            stopDashboardPolling();
        };
    }, []);

    // 监听 playersVoted：当全部玩家已在当前回合投票完成时，提交当前回合
    useEffect(() => {
        if (playersVoted == playersTotal && playersTotal > 0) {
            useGameStoreScreen.getState().submitCurrentTurn();
        }
    }, [playersVoted, playersTotal, turnIndex]);

    // 监听 turn index 和游戏状态变化，自动跳转
    useEffect(() => {
        // Turn 11 时跳转到 Reflection 页面
        if (turnIndex === 11) {
            console.log('🎯 Turn index = 11，跳转到 Reflection');
            navigate(`/game/${gameId}/reflection`);
            return;
        }
    }, [gameState, turnIndex, gameId, navigate]);

    return (
        <div className="h-full w-full flex flex-col relative">
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
            {generating && <LoadingOverlay text="Generating next turn..." small />}
        </div>
        );
    }
