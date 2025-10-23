import { useEffect, useRef, useState } from 'react';
import QRCode from '../../components/shared/QRCode';
import useGameStoreScreen from '../../store/index_screen';
import { useNavigate, useParams } from 'react-router-dom';
import { useBgm, BGM_URLS } from '../../hooks/useBgm';

const GameLobby = () => {
    const title = "NAVIGATING THE FUTURE OF MEMORY";
    const subtitle = "2075 | The boundary between memory and privacy";
    const navigate = useNavigate();
    const { gameId } = useParams();
    const gameState = useGameStoreScreen(s => s.gameMeta.state);
    const storeGameId = useGameStoreScreen(s => s.gameMeta.id);
    const setGameMeta = useGameStoreScreen(s => s.setGameMeta);
    const showValues = useGameStoreScreen(s => s.uiConfig?.showValues);
    const setUiConfig = useGameStoreScreen(s => s.setUiConfig);
    const [maxTurns, setMaxTurns] = useState(5);
    const turnsCount = useGameStoreScreen(s => s.gameMeta.turnsCount);

    // Use ref to prevent duplicate calls caused by StrictMode
    const hasInitialized = useRef(false);
    
    // BGM: continue playing HomePage music without stopping
    const bgmUrl = BGM_URLS.menu;
    useBgm(bgmUrl, false, false); // Do not start new playback, also do not stop

    // Start game: only call backend in waiting state, then navigate to intro
    const onStartGame = async () => {
        if (gameState !== 'waiting') return;
        
        const { startGame } = useGameStoreScreen.getState();
        const success = await startGame(gameId, null, {
            // Backend max_turns needs to include intro and ending (+2)
            max_turns: Number.isFinite(+maxTurns) && +maxTurns > 0 ? (+maxTurns + 2) : undefined,
            show_values: !!showValues,
        });
        if (success && gameId) {
            navigate(`/game/${gameId}/intro`);
        }
    };

    // Start polling + auto navigate logic
    useEffect(() => {
        const { stopLobbyPolling } = useGameStoreScreen.getState();

        // Prevent duplicate init due to React StrictMode
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            // If store lacks gameId, backfill from route param, ensuring QR/polling works
            if (!storeGameId && gameId) {
                try { setGameMeta({ id: gameId }); } catch { /* no-op */ }
            }
            const { startPollingForLobby } = useGameStoreScreen.getState();
            startPollingForLobby(gameId);
        }
        
        // Always return cleanup to clear polling on unmount
        return () => {
            stopLobbyPolling();
        }
    }, [gameId, setGameMeta, storeGameId]);

    // Auto navigate based on game state and turns_count
    useEffect(() => {
        if (!gameId) return;

        // archived → navigate to home
        if (gameState === 'archived') {
            navigate('/');
            return;
        }

        // ongoing + turnsCount = 0 → navigate to intro (intro will auto-create turn)
        if (gameState === 'ongoing' && turnsCount === 0) {
            navigate(`/game/${gameId}/intro`);
            return;
        }

        // ongoing + turnsCount > 0 → navigate to dashboard
        // Note: do not check turnIndex here; Lobby stage lacks turn data
        // Turn index handling is in GameIntro and GameDashboard
        if (gameState === 'ongoing' && turnsCount > 0) {
            navigate(`/game/${gameId}/game`);
            return;
        }

        // finished → navigate to gameover
        if (gameState === 'finished') {
            navigate(`/game/${gameId}/gameover`);
            return;
        }

        // waiting → stay on this page; no navigation
    }, [gameState, turnsCount, gameId, navigate]);

    // Do not auto-navigate; decision by button click based on state
    return (
        <>
            <div className="h-full overflow-hidden flex flex-col items-center justify-center gap-6 py-10">
                {/* Title section */} 
                {/*<header className="flex flex-col items-center justify-center text-center">
                    <h1 className="leading-normal text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">NAVIGATING THE FUTURE OF MEMORY</h1>
                    <p className="text-2xl text-cyan-300">2075 | The boundary between memory and privacy</p>
                </header>*/}
                {/* Title 部分 */} 
                {/*<header className="flex flex-col items-center justify-center text-center">
                    <h1 className="leading-normal text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">NAVIGATING THE FUTURE OF MEMORY</h1>
                    <p className="text-2xl text-cyan-300">2075 | The boundary between memory and privacy</p>
                </header>*/}
                <header className="flex flex-col items-center justify-center text-center gap-4">
                    <h1 
                        className="font-pixel leading-tight text-7xl font-bold text-cyan-300 tracking-wide cursor-pointer"
                    >
                        {title}
                    </h1>
                    <p className="font-pixel text-3xl font-medium text-cyan-300 tracking-wider opacity-90">
                        {subtitle}
                    </p>
                </header>

                {/* Game container section */}
                <main className="flex-1 flex px-4 py-2 w-8/10">
                    <div className="h-full w-full flex border-5 border-cyan-400 rounded-4xl">
                        <section className="flex-1 flex flex-col justify-space-between p-15 overflow-hidden">
                            {/* {left} */}
                            {/* Left section */}
                            <h2 className="font-pixel text-6xl text-cyan-400 font-semibold mb-4">Background</h2>
                            <p className="flex-1 flex flex-col justify-center text-2xl leading-relaxed text-cyan-200">
                            In the future, memory is no longer private—it is stored, traded, and controlled like currency. Governments and corporations manipulate recollections to shape loyalty, erase dissent, or invent false lives. Markets thrive on selling curated pasts, while citizens guard their memories as tightly as bank accounts. Society itself is rebuilt on the flow of memory, fragile and unstable. Every decision—whether to keep, trade, or resist—reshapes both personal identity and the collective order. In this world, truth blurs, freedom bends, and the politics of memory decides the fate of all.
                            </p>
                        </section>
                        <div className="w-px h-full border-3 border-cyan-400 mx-4" aria-hidden />
                        <section className="flex-1 px-15 py-5 flex flex-col justify-center overflow-hidden gap-5">
                            <div className="flex flex-col items-center justify-center m-8">
                            {/* {right} */}
                            {/* Right section */}
                                <QRCode />
                            </div>
                            <div className="flex flex-col items-center justify-center gap-4">
                                    {/* Toggle: Show option values (checkbox after text) */}
                                    <div className="flex flex-col items-center justify-center">
                                    <label className="flex items-center gap-3 mb-3 select-none text-cyan-300">
                                        <span className="text-lg">Show option values</span>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-cyan-400 cursor-pointer"
                                            checked={!!showValues}
                                            onChange={(e) => setUiConfig({ showValues: !!e.target.checked })}
                                        />
                                    </label>
                                    {/* Stepper: Playable rounds (excludes intro & reflection) */}
                                    <div className="flex items-center gap-2 mb-4 text-cyan-300">
                                        <span className="text-lg">Playable rounds</span>
                                        <button
                                            className="px-2 py-0.5 text-sm border border-cyan-400 rounded-lg hover:bg-cyan-400/20"
                                            onClick={() => setMaxTurns((v) => Math.max(1, (+v || 5) - 1))}
                                            disabled={gameState !== 'waiting'}
                                        >-</button>
                                        <input
                                            type="text"
                                            className="w-16 text-center text-sm bg-transparent border border-cyan-400 rounded-lg py-1 select-none"
                                            value={String(maxTurns)}
                                            readOnly
                                            disabled={gameState !== 'waiting'}
                                        />
                                        <button
                                            className="px-2 py-0.5 text-sm border border-cyan-400 rounded-lg hover:bg-cyan-400/20"
                                            onClick={() => setMaxTurns((v) => Math.max(1, (+v || 5) + 1))}
                                            disabled={gameState !== 'waiting'}
                                        >+</button>
                                    </div>
                                </div>
                                <button 
                                    className="text-3xl border-2 border-cyan-400 rounded-4xl px-4 py-2 text-cyan-400 font-semibold mb-4 hover:bg-cyan-400 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                                    onClick={onStartGame}
                                    disabled={gameState !== 'waiting'}
                                >
                                    Game Start
                                </button>
                            </div>
                        </section>
                    </div>  
                </main>

            </div>
        </>
    );
};

export default GameLobby;