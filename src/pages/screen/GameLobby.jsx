import { useEffect } from 'react';
import QRCode from '../../components/shared/QRCode';
import useGameStore from '../../store';
import { useNavigate, useParams } from 'react-router-dom';

const GameLobby = () => {
    const title = "NAVIGATING THE FUTURE OF MEMORY";
    const subtitle = "2075 | The boundary between memory and privacy";
    const navigate = useNavigate();
    const { gameId } = useParams();
    const gameState = useGameStore(s => s.gameMeta.state);
    const turnIndex = useGameStore(s => s.turn.index);

    const onStartGame = async () => {
        // 非 waiting：根据回合跳转
        if (gameState !== 'waiting') {
            if (!gameId) {
                navigate('/');
                return;
            }
            if (turnIndex === 0) {
                navigate(`/game/${gameId}/intro`);
            } else if (turnIndex >= 1 && turnIndex < 11) {
                navigate(`/game/${gameId}/game`);
            } else if (turnIndex >= 11) {
                navigate(`/game/${gameId}/gameover`);
            } else {
                navigate(`/game/${gameId}/game`);
            }
            return;
        }
        // waiting：调用后端开始游戏，完成后进入 dashboard（按你最初需求保留）
        const { startGame } = useGameStore.getState();
        const success = await startGame(gameId);
        if (success) {
            if (gameId) navigate(`/game/${gameId}/game`);
            else navigate('/');
        }
    };

    useEffect(() => {
        const { startPolling, stopPolling } = useGameStore.getState();
        startPolling(gameId);
        return () => stopPolling();
    }, [gameId]);

    // 不自动跳转；仅在按钮点击时根据状态决定行为
    return (
        <>
            <div className="h-full overflow-hidden flex flex-col items-center justify-center gap-6 py-10">
                {/* Title 部分 */} 
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
                        className="font-pixel leading-tight text-5xl font-bold text-cyan-300 tracking-wide cursor-pointer hover:text-cyan-200 transition-colors duration-200"
                    >
                        {title}
                    </h1>
                    <p className="font-pixel text-2xl font-medium text-cyan-300 tracking-wider opacity-90">
                        {subtitle}
                    </p>
                </header>

                {/* 游戏框部分 */}
                <main className="flex-1 flex px-4 py-2 w-8/10">
                    <div className="h-full w-full flex border-5 border-cyan-400 rounded-4xl">
                        <section className="flex-1 flex flex-col justify-space-between p-15 overflow-hidden">
                            {/* {left} */}
                            {/* 左侧内容 */}
                            <h2 className="text-4xl text-cyan-400 font-semibold mb-4">Background</h2>
                            <p className="flex-1 flex flex-col justify-center text-2xl leading-relaxed text-cyan-200">
                            In the future, memory is no longer private—it is stored, traded, and controlled like currency. Governments and corporations manipulate recollections to shape loyalty, erase dissent, or invent false lives. Markets thrive on selling curated pasts, while citizens guard their memories as tightly as bank accounts. Society itself is rebuilt on the flow of memory, fragile and unstable. Every decision—whether to keep, trade, or resist—reshapes both personal identity and the collective order. In this world, truth blurs, freedom bends, and the politics of memory decides the fate of all.
                            </p>
                        </section>
                        <div className="w-px h-full border-3 border-cyan-400 mx-4" aria-hidden />
                        <section className="flex-1 p-15 flex flex-col justify-space-between overflow-hidden gap-1">
                            <div className="flex flex-col items-center justify-center m-8">
                            {/* {right} */}
                            {/* 右侧内容 */}
                                <QRCode />
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <button className="text-2xl  border-2 border-cyan-400 rounded-4xl px-4 py-2 text-cyan-400 font-semibold mb-4 hover:bg-cyan-400 hover:text-white transition-colors duration-200" onClick={onStartGame}>{gameState === 'waiting' ? 'Game Start' : 'Back to Game'}
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