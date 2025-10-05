import { useNavigate, useParams } from 'react-router-dom';
import RadarChart from '../../components/dashboard/main/RadarChart';
import useGameStore from '../../store';

const GameOver = () => {
    const navigate = useNavigate();
    const { gameId } = useParams();
    
    const title = "GAME OVER";
    const subtitle = "After 10 years of decisions, here's the world you created...";

    // 归档游戏并返回首页
    const handleBackToHome = async () => {
        try {
            // 调用 archiveGame API
            await useGameStore.getState().archiveGame(gameId);
        } catch (error) {
            console.error('归档游戏失败:', error);
        } finally {
            // 无论成功或失败，都导航到首页
            navigate('/');
        }
    };

    return (
        <>
            <div className="h-full overflow-hidden flex flex-col items-center justify-center gap-6 py-12">
                {/* Title 部分 */} 
                <header className="flex flex-col items-center justify-center text-center gap-4">
                    <h1 className="font-pixel leading-tight text-6xl font-bold text-cyan-300 tracking-wide">
                        {title}
                    </h1>
                    <p className="font-pixel text-2xl font-medium text-cyan-300 tracking-wider opacity-90">
                        {subtitle}
                    </p>
                </header>

                {/* 雷达图部分 */}
                <main className="flex-1 flex px-4 py-2 w-8/10">
                    <div className="h-full w-full flex flex-col justify-center  px-20 items-center ">
                        <section className="flex-1 overflow-hidden">
                            <p className="pb-4 text-3xl leading-relaxed text-cyan-200">
                            The chamber releases a final surge of light. Your chosen memory vanishes, leaving a hollow echo in your mind. On the giant screen, the crowd reacts—some cheer your sacrifice, others whisper doubts. Outside, society tilts: new rules form, trust shifts, and the balance of power bends to your decision. You step back into the world changed, carrying both the loss and the weight of its consequence. Game Over—your choice has written history.
                            </p>
                        </section>  
                        <RadarChart />
                    </div>
                </main>

                {/* 返回首页按钮 */}
                <footer className="flex justify-center pb-8">
                    <button
                        onClick={handleBackToHome}
                        className="btn btn-lg btn-primary pixel-text"
                    >
                        Back to Home
                    </button>
                </footer>
            </div>
        </>
);
};

export default GameOver;