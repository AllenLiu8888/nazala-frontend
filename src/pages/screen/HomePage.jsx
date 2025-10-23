import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStoreScreen from '../../store/index_screen';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
// Top-level App controls BGM; no per-page BGM here


const HomePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const fetchCurrentGame = useGameStoreScreen(s => s.fetchCurrentGame);

    const createGame = async () => {
        try {
            setLoading(true);
            console.log('loding current game...');

            // Fetch current game via store and write to global state
            const currentGame = await fetchCurrentGame();

            console.log('already get current game:', currentGame);
            console.log('current game id:', currentGame?.id); // current game id

            // On big screen, no need to persist gameId; subsequent pages poll for latest state

            // Navigate to lobby page
            if (currentGame?.id) {
                navigate(`/game/${currentGame.id}/lobby`);
            } else {
                navigate('/');
            }

        } catch (error) {
            console.error('get game info failed:', error);
            // Even if API call fails, still navigate to intro page
            alert('get game info failed: ' + (error?.message || 'unknown error'));
        } finally {
            setLoading(false);
        }
    };
    
    const HomePageTitle = "Memory Trading & Editing";
    const TAGS_B = useMemo(() => [
        'Hope', 'Doubt', 'Trade-offs', 'Sacrifice', 'Trust', 'Power', 'Consequences', 'Solidarity', 'Resilience', 'Legacy'
    ], []);
    const [subtitleText, helper] = useTypewriter({
        words: TAGS_B,
        typeSpeed: 60,
        deleteSpeed: 20,
        delaySpeed: 2000,
        loop: 0 // after one loop, we manually restart
    });
    const { isDone } = helper;
    return (
        <div className="flex items-center justify-center ">
            <div
                className={`flex flex-col gap-40 items-center justify-center min-h-screen ${loading ? 'cursor-wait' : 'cursor-pointer'}`}
                onClick={loading ? undefined : createGame}
            >
                <div className="flex flex-col items-center justify-center text-center gap-6">
                    <h1 className="font-pixel leading-normal text-9xl font-bold text-cyan-300">
                        {HomePageTitle}
                    </h1>
                    
                    <p className="font-pixel text-8xl text-cyan-300 font-light">
                        {subtitleText}
                        {!isDone && <Cursor cursorStyle="▍" />}
                    </p>
                    
                </div>
                <div className="font-pixel animate-pulse">
                    <p className="text-6xl text-gray-400">
                        {loading ? 'Loading game...' : 'Press any key or click to start'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;