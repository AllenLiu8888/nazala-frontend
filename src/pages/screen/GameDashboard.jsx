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
    const maxRounds = useGameStoreScreen(s => s.gameMeta.maxRounds);

    // Read data from store
    const playersTotal = useGameStoreScreen(s => s.players.total);
    const playersVoted = useGameStoreScreen(s => s.players.voted);
    const turnIndex = useGameStoreScreen(s => s.turn.index);
    const generating = useGameStoreScreen(s => s.ui.generating);

    // Use ref to prevent duplicate calls caused by StrictMode
    const hasInitialized = useRef(false);

    // After render, start polling to keep playersVoted updated for the current turn
    useEffect(() => {
        const { stopDashboardPolling } = useGameStoreScreen.getState();

        // Prevent duplicate init due to React StrictMode
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            useGameStoreScreen.getState().startPollingForDashboard();
        }

        // Always return cleanup to clear polling on unmount
        return () => {
            stopDashboardPolling();
        };
    }, []);

    // Listen to playersVoted: when all have voted in current turn, submit current turn
    useEffect(() => {
        if (playersVoted == playersTotal && playersTotal > 0) {
            useGameStoreScreen.getState().submitCurrentTurn();
        }
    }, [playersVoted, playersTotal, turnIndex]);

    // Watch turn index and game state changes, auto navigate
    useEffect(() => {
        // Last round (maxRounds - 1): navigate to Reflection
        const maxIndex = typeof maxRounds === 'number' && maxRounds > 0 ? maxRounds - 1 : null;
        if (maxIndex !== null && turnIndex === maxIndex) {
            console.log('Last round, navigate to Reflection');
            navigate(`/game/${gameId}/reflection`);
            return;
        }
    }, [gameState, maxRounds, turnIndex, gameId, navigate]);

    return (
        <div className="h-full w-full flex flex-col relative">
            {/* Header: fixed height */}
            <header className="flex justify-between flex-shrink-0">
                <Round />
                <div className="w-px h-full border-3 border-cyan-300 mx-4"/>
                <WorldStatus />
            </header>

            {/* Main: fill remaining space, set min height to avoid squeezing */}
            <main className="flex-1 flex border-5 border-cyan-300 min-h-96 overflow-hidden">
                <StorySection />
                <div className="w-px h-full border-3 border-cyan-300 mx-4"/>
                <Visualisation />
            </main>

            {/* Footer: fixed height */}
            <footer className="flex justify-between flex-shrink-0">
                <UserStates />
                <div className="w-px h-10rem border-3 border-cyan-300 mx-4"/>
                <DecisionProgress />
            </footer>
            {generating && <LoadingOverlay text="Generating next turn..." small />}
        </div>
        );
    }
