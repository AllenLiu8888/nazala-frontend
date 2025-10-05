import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import useGameStore from '../../store';
import RingScore from '../../components/dashboard/footer/RingScore';

const GameIntro = () => {
    const title = "NAVIGATING THE FUTURE OF MEMORY";
    const subtitle = "2075 | The boundary between memory and privacy";
    const navigate = useNavigate();
    const { gameId } = useParams();
    
    // 从 store 读取数据
    const playersTotal = useGameStore(s => s.players.total);
    const playersVoted = useGameStore(s => s.players.voted);
    const turnIndex = useGameStore(s => s.turn.index);
    
    // 页面打开时立即创建 turn
    useEffect(() => {
        const initializeTurn = async () => {
            if (!gameId) return;
            
            console.log('🎬 GameIntro 打开，准备创建 turn...');
            const { advanceTurn, startPolling } = useGameStore.getState();
            
            // 尝试创建/进入回合
            await advanceTurn(gameId);
            
            // 启动轮询以获取玩家选择数据
            startPolling(gameId);
        };
        
        initializeTurn();
        
        return () => {
            useGameStore.getState().stopPolling();
        };
    }, [gameId]);

    // 监听 turn index 变化，自动跳转到 dashboard
    useEffect(() => {
        if (turnIndex >= 1) {
            console.log(`🎯 检测到 turn index 变化: ${turnIndex}，跳转到 Dashboard`);
            navigate(`/game/${gameId}/game`);
        }
    }, [turnIndex, gameId, navigate]);

    return (
        <>
            <div 
                className="h-full overflow-hidden flex flex-col items-center justify-center gap-10 py-10"
            >
                {/* Title 部分 */}
                <header className="flex flex-col items-center justify-center text-center gap-4">
                    <h1 className="font-pixel leading-tight text-5xl font-bold text-cyan-300 tracking-wide">
                        {title}
                    </h1>
                    <p className="font-pixel text-2xl font-medium text-cyan-300 tracking-wider opacity-90">
                        {subtitle}
                    </p>
                </header>

                {/* 游戏框部分 */}
                <main className="flex-1 flex flex-col justify-center items-center gap-15 px-4 py-2 w-8/10">
                    <div className="h-full w-full flex flex-col justify-center px-20 py-15 items-center border-5 border-cyan-400 rounded-4xl">
                        <section className="flex-1 overflow-hidden">
                            <div className="pb-12 flex items-center justify-between gap-4">
                                <h2 className="font-pixel text-5xl text-cyan-400 font-semibold">Background</h2>
                                <div className="flex items-center gap-4 font-pixel text-2xl text-cyan-300">
                                    <RingScore size={32} value={playersVoted} max={playersTotal}/>
                                    {playersVoted} / {playersTotal} players completed
                                </div>
                            </div>
                            
                            <p className="pb-8 text-3xl leading-relaxed text-cyan-200">
                            In the future, memory is no longer private—it is stored, traded, and controlled like currency. Governments and corporations manipulate recollections to shape loyalty, erase dissent, or invent false lives. Markets thrive on selling curated pasts, while citizens guard their memories as tightly as bank accounts. 
                            </p>
                            <p className="text-3xl leading-relaxed text-cyan-200">
                            Society itself is rebuilt on the flow of memory, fragile and unstable. Every decision—whether to keep, trade, or resist—reshapes both personal identity and the collective order. In this world, truth blurs, freedom bends, and the politics of memory decides the fate of all.
                            </p>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
};

export default GameIntro;
