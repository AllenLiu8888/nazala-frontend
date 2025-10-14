import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import useGameStoreScreen from '../../store/index_screen';
import RingScore from '../../components/dashboard/footer/RingScore';
import { useBgm, BGM_URLS } from '../../hooks/useBgm';
import LoadingOverlay from '../../components/shared/LoadingOverlay';

const GameIntro = () => {
    const title = "NAVIGATING THE FUTURE OF MEMORY";
    const subtitle = "2075 | The boundary between memory and privacy";
    const navigate = useNavigate();
    const { gameId } = useParams();
    
    // 从 store 读取数据
    const playersTotal = useGameStoreScreen(s => s.players.total);
    const playersVoted = useGameStoreScreen(s => s.players.voted);
    const turnIndex = useGameStoreScreen(s => s.turn.index);
    const turnsCount = useGameStoreScreen(s => s.gameMeta.turnsCount);
    const generating = useGameStoreScreen(s => s.ui.generating);
    
    // 使用 ref 防止 StrictMode 导致的重复调用
    const hasInitialized = useRef(false);
    
    // BGM：进入 GameIntro 时停止 HomePage/Lobby 的音乐
    const bgmUrl = BGM_URLS.menu;
    useBgm(bgmUrl, false, true); // 不启动播放，但要停止
    
    // 页面渲染后启动轮询, 目的是持续更新「当前turn的已投票玩家数 playersVoted」
    useEffect(() => {
        if (!gameId) return;

        const { stopIntroPolling } = useGameStoreScreen.getState();

        // 防止 React StrictMode 导致的重复初始化
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            if (turnsCount == 0) {
                useGameStoreScreen.getState().initCurrentTurn();
            }
            useGameStoreScreen.getState().startPollingForIntro(gameId);
        }

        // 总是返回 cleanup，确保组件卸载时能清理轮询
        return () => {
            stopIntroPolling();
        };
    }, []);

    // 监听 playersVoted, 以获取「当前turn的已投票玩家数 playersVoted」, 以实现「当全部玩家已投票完毕时, 执行submit turn」
    useEffect(() => {
        if (playersVoted == playersTotal && playersTotal > 0) {
            useGameStoreScreen.getState().submitCurrentTurn();
        }
    }, [playersVoted]);

    // 监听 turn index 变化，这样当「submit turn」成功后，就能成功获知并自动跳转到 dashboard
    useEffect(() => {
        if (turnIndex >= 1 && turnIndex <= 10) {
            console.log(`🎯 Turn index = ${turnIndex}，跳转到 Dashboard`);
            navigate(`/game/${gameId}/game`);
        } else if (turnIndex === 11) {
            console.log(`🎯 Turn index = 11，跳转到 Reflection`);
            navigate(`/game/${gameId}/reflection`);
        }
    }, [turnIndex, gameId, navigate]);

    return (
        <>
            <div 
                className="h-full overflow-hidden flex flex-col items-center justify-center gap-10 py-10 relative"
            >
                {/* Title 部分 */}
                <header className="flex flex-col items-center justify-center text-center gap-4">
                    <h1 className="font-pixel leading-tight text-7xl font-bold text-cyan-300 tracking-wide">
                        {title}
                    </h1>
                    <p className="font-pixel text-3xl font-medium text-cyan-300 tracking-wider opacity-90">
                        {subtitle}
                    </p>
                </header>

                {/* 游戏框部分 */}
                <main className="flex-1 flex flex-col justify-center items-center gap-15 px-4 py-2 w-8/10">
                    <div className="h-full w-full flex flex-col justify-center px-20 py-15 items-center border-5 border-cyan-400 rounded-4xl">
                        <section className="flex-1 overflow-hidden">
                            <div className="pb-18 flex items-center justify-between gap-4">
                                <h2 className="font-pixel text-6xl text-cyan-400 font-semibold">Background</h2>
                                <div className="flex items-center gap-4 font-pixel text-3xl text-cyan-300 justify-center">
                                    <RingScore size={32} value={playersVoted} max={playersTotal}/>
                                    {playersVoted} / {playersTotal} players completed
                                </div>
                            </div>
                            
                            <p className="pb-8 text-4xl leading-relaxed text-cyan-200">
                            In the future, memory is no longer private—it is stored, traded, and controlled like currency. Governments and corporations manipulate recollections to shape loyalty, erase dissent, or invent false lives. Markets thrive on selling curated pasts, while citizens guard their memories as tightly as bank accounts. 
                            </p>
                            <p className="text-4xl leading-relaxed text-cyan-200">
                            Society itself is rebuilt on the flow of memory, fragile and unstable. Every decision—whether to keep, trade, or resist—reshapes both personal identity and the collective order. In this world, truth blurs, freedom bends, and the politics of memory decides the fate of all.
                            </p>
                        </section>
                    </div>
                </main>
                {generating && <LoadingOverlay text="Generating next turn..." small />}
            </div>
        </>
    );
};

export default GameIntro;
