import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const GameIntro = () => {

    const title = "NAVIGATING THE FUTURE OF MEMORY";
    const subtitle = "2075 | The boundary between memory and privacy";
    const navigate = useNavigate();
    // 导航到游戏大厅的函数
    const goToGameDashboard = () => {
        navigate('/screen/game');
    };
    
    // 导航到投票页面的函数
    const goWaitingPage = () => {
        const gameId = 'demo-game'; // 写死的游戏ID
        navigate(`/game/${gameId}/waiting`);
    };


    // 键盘事件监听
    useEffect(() => {
        const goToGameDashboard = () => {
            navigate('/screen/game');
        };
        
        window.addEventListener('keydown', goToGameDashboard);
        return () => window.removeEventListener('keydown', goToGameDashboard);
    }, [navigate]);

    return (
        <>
            <div className="h-full overflow-hidden flex flex-col items-center justify-center gap-10 py-12">
                {/* Title 部分 */} 
                {/*<header className="flex flex-col items-center justify-center text-center">
                    <h1 className="leading-normal text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">NAVIGATING THE FUTURE OF MEMORY</h1>
                    <p className="text-2xl text-cyan-300">2075 | The boundary between memory and privacy</p>
                </header>*/}
                <header className="flex flex-col items-center justify-center text-center gap-4">
                    <h1 
                        className="font-pixel leading-tight text-5xl font-bold text-cyan-300 tracking-wide cursor-pointer hover:text-cyan-200 transition-colors duration-200"
                        onClick={goToGameDashboard}//点击标题跳转到手机投票页面（之后可删）
                    >
                        {title}
                    </h1>
                    <p className="font-pixel text-2xl font-medium text-cyan-300 tracking-wider opacity-90">
                        {subtitle}
                    </p>
                </header>

                {/* 游戏框部分 */}
                <main className="flex-1 flex flex-col justify-center items-center gap-15 px-4 py-2 w-8/10">
                    <div className="h-full w-full flex flex-col justify-center  px-20 py-15 items-center border-5 border-cyan-400 rounded-4xl">
                        <section className="flex-1 overflow-hidden">
                            <h2 className="pb-12 font-pixel text-6xl text-cyan-400 font-semibold mb-4" onClick={goWaitingPage}>Background</h2>
                            <p className="pb-8 text-4xl leading-relaxed text-cyan-200">
                            In the future, memory is no longer private—it is stored, traded, and controlled like currency. Governments and corporations manipulate recollections to shape loyalty, erase dissent, or invent false lives. Markets thrive on selling curated pasts, while citizens guard their memories as tightly as bank accounts. 
                            </p>
                            <p className="text-4xl leading-relaxed text-cyan-200">
                            Society itself is rebuilt on the flow of memory, fragile and unstable. Every decision—whether to keep, trade, or resist—reshapes both personal identity and the collective order. In this world, truth blurs, freedom bends, and the politics of memory decides the fate of all.
                            </p>
                        </section>
                    </div>
                    <section className="overflow-hidden">
                            <h2 className="font-pixel text-4xl text-cyan-50 font-semibold pb-15 animate-pulse">Press any key or click to continue</h2>
                    </section>
                </main>

            </div>
        </>
    );
};

export default GameIntro;
