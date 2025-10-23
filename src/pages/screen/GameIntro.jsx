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
    // Paragraphs
    const para1 = "The age of memory arrived without warning. What once hid in silence—private, fragile, fleeting—was dragged into light, stored in vaults, and traded like coin. Governments soon discovered its power: a recollection erased could silence dissent; a recollection forged could invent loyalty. Corporations followed, selling childhoods like luxury goods, auctioning grief, curating love.";
    const para2 = "Citizens learned to guard their minds as if they were bank accounts, clutching each fragment of the past against intrusion. Yet the market thrived. Identity itself became negotiable, a shifting ledger of purchases and exchanges.";
    const para3 = "The world tilted. Truth blurred, freedom bent, and the order of society pulsed to the flow of memory. Each decision—whether to keep, to trade, or to resist—reshaped not only the self, but the collective future. And beneath it all, one question lingered, unspoken but absolute: when memory is no longer yours, what remains of you?";
    const para4 = "We offer no endings — only beginnings. The rest is written by your choices and our discussions.";
    const navigate = useNavigate();
    const { gameId } = useParams();
    
    // Read data from store
    const playersTotal = useGameStoreScreen(s => s.players.total);
    const playersVoted = useGameStoreScreen(s => s.players.voted);
    const turnIndex = useGameStoreScreen(s => s.turn.index);
    const turnsCount = useGameStoreScreen(s => s.gameMeta.turnsCount);
    const generating = useGameStoreScreen(s => s.ui.generating);
    
    // Use ref to prevent duplicate calls caused by StrictMode
    const hasInitialized = useRef(false);
    
    // BGM: stop HomePage/Lobby music when entering GameIntro
    const bgmUrl = BGM_URLS.menu;
    useBgm(bgmUrl, false, true); // Do not start playback, but stop
    
    // After render, start polling to keep playersVoted updated for the current turn
    useEffect(() => {
        if (!gameId) return;

        const { stopIntroPolling } = useGameStoreScreen.getState();

        // Prevent duplicate init due to React StrictMode
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            if (turnsCount == 0) {
                useGameStoreScreen.getState().initCurrentTurn();
            }
            useGameStoreScreen.getState().startPollingForIntro(gameId);
        }

        // Always return cleanup to clear polling on unmount
        return () => {
            stopIntroPolling();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen to playersVoted: when all have voted in current turn, submit turn
    useEffect(() => {
        if (playersVoted == playersTotal && playersTotal > 0) {
            useGameStoreScreen.getState().submitCurrentTurn();
        }
    }, [playersVoted, playersTotal]);

    // Simple fade-in (not time-sliced; only fades on switch)
    const fadeUp = () => ({
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut' }
    });

    // Slower fade-in (for second screen)
    const fadeUpSlow = () => ({
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 1.2, ease: 'easeOut' }
    });

    // Container fade (ensure animation on switching screens)
    const fadeContainer = {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 6 },
        transition: { duration: 0.6, ease: 'easeOut' }
    };

    // Slower container fade (for second screen)
    const fadeContainerSlow = {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 6 },
        transition: { duration: 0.9, ease: 'easeOut' }
    };

    // Split text: first show para1+para2, then on click show para3+para4
    const [showSecondPhase, setShowSecondPhase] = useState(false);

    // Watch turn index changes to navigate to dashboard or reflection after submit turn
    useEffect(() => {
        if (turnIndex >= 1 && turnIndex <= 10) {
            console.log(`Turn index = ${turnIndex}, navigate to Dashboard`);
            navigate(`/game/${gameId}/game`);
        } else if (turnIndex === 11) {
            console.log(`Turn index = 11, navigate to Reflection`);
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
