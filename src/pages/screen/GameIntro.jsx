import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import useGameStoreScreen from '../../store/index_screen';
import RingScore from '../../components/dashboard/footer/RingScore';
import { useBgm, BGM_URLS } from '../../hooks/useBgm';
import LoadingOverlay from '../../components/shared/LoadingOverlay';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const GameIntro = () => {
    const title = "NAVIGATING THE FUTURE OF MEMORY";
    const subtitle = "2075 | The boundary between memory and privacy";
    // 段落（按你的文本拆分为三段）
    const para1 = "The age of memory arrived without warning. What once hid in silence—private, fragile, fleeting—was dragged into light, stored in vaults, and traded like coin. Governments soon discovered its power: a recollection erased could silence dissent; a recollection forged could invent loyalty. Corporations followed, selling childhoods like luxury goods, auctioning grief, curating love.";
    const para2 = "Citizens learned to guard their minds as if they were bank accounts, clutching each fragment of the past against intrusion. Yet the market thrived. Identity itself became negotiable, a shifting ledger of purchases and exchanges.";
    const para3 = "The world tilted. Truth blurred, freedom bent, and the order of society pulsed to the flow of memory. Each decision—whether to keep, to trade, or to resist—reshaped not only the self, but the collective future. And beneath it all, one question lingered, unspoken but absolute: when memory is no longer yours, what remains of you?";
    const para4 = "We offer no endings — only beginnings. The rest is written by your choices and our discussions.";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 监听 playersVoted, 以获取「当前turn的已投票玩家数 playersVoted」, 以实现「当全部玩家已投票完毕时, 执行submit turn」
    useEffect(() => {
        if (playersVoted == playersTotal && playersTotal > 0) {
            useGameStoreScreen.getState().submitCurrentTurn();
        }
    }, [playersVoted, playersTotal]);

    // 简单渐显（不基于时间分段显示，仅在切换时淡入）
    const fadeUp = () => ({
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut' }
    });

    // 更慢的淡入（用于第二屏）
    const fadeUpSlow = () => ({
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 1.2, ease: 'easeOut' }
    });

    // 容器层淡入淡出（用于两屏切换时确保进入有动画）
    const fadeContainer = {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 6 },
        transition: { duration: 0.6, ease: 'easeOut' }
    };

    // 更慢的容器淡入（用于第二屏）
    const fadeContainerSlow = {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 6 },
        transition: { duration: 0.9, ease: 'easeOut' }
    };

    // 文本分屏：先显示 para1+para2，点击后显示 para3+para4
    const [showSecondPhase, setShowSecondPhase] = useState(false);

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
                <main className="flex-1 flex flex-col justify-center items-center gap-15 px-4 py-2 pb-8 w-8/10">
                    <div className="h-full w-full flex flex-col justify-center px-20 py-15 items-center border-5 border-cyan-400 rounded-4xl">
                        <section className="w-full flex-1 overflow-hidden flex flex-col justify-center items-center">
                            <div className="w-full pb-8 flex items-center justify-between gap-4">
                                <h2 className="font-pixel text-6xl text-cyan-400 font-semibold">Background</h2>
                                <div className="flex items-center gap-4 font-pixel text-3xl text-cyan-300 justify-center">
                                    <RingScore size={32} value={playersVoted} max={playersTotal}/>
                                    {playersVoted} / {playersTotal} players completed
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-start items-start gap-4 w-full">
                                <AnimatePresence mode="wait">
                                    {!showSecondPhase ? (
                                        <Motion.div key="phase1" {...fadeContainer} className="contents">
                                            <Motion.p className="text-3xl leading-relaxed text-cyan-200" {...fadeUp()}>
                                                {para1}
                                            </Motion.p>
                                            <Motion.p className="text-3xl leading-relaxed text-cyan-200" {...fadeUp()}>
                                                {para2}
                                            </Motion.p>
                                        </Motion.div>
                                    ) : (
                                        <Motion.div key="phase2" {...fadeContainerSlow} className="contents">
                                            <Motion.p className="text-3xl leading-relaxed text-cyan-200" {...fadeUpSlow()}>
                                                {para3}
                                            </Motion.p>
                                            <Motion.p className="text-3xl leading-relaxed text-cyan-200" {...fadeUpSlow()}>
                                                {para4}
                                            </Motion.p>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {!showSecondPhase && (
                                <div className="w-full pt-6 flex justify-end">
                                    <button
                                        onClick={() => setShowSecondPhase(true)}
                                        className="font-pixel animate-pulse flex items-center gap-2 text-3xl text-gray-200 hover:text-white transition-colors duration-200 cursor-pointer"
                                    >
                                        <span>Continue</span>
                                        <ArrowRight className="w-7 h-7" />
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </main>
                {generating && <LoadingOverlay text="LLM-RAG cognitive cores generating…" small />}
            </div>
        </>
    );
};

export default GameIntro;
