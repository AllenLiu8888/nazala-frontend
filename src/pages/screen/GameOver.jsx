import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RadarChart from '../../components/dashboard/main/RadarCBefore';
import useGameStoreScreen from '../../store/index_screen';

const GameOver = () => {
    const { gameId } = useParams();
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // 页面文本内容（可配置）
    const title = "GAME OVER";
    const subtitle = "After 10 years of decisions, here's the world you created...";
    const endingText = useGameStoreScreen(s => s.ending.text) || "The chamber releases a final surge of light. Your chosen memory vanishes, leaving a hollow echo in your mind. On the giant screen, the crowd reacts—some cheer your sacrifice, others whisper doubts. Outside, society tilts: new rules form, trust shifts, and the balance of power bends to your decision. You step back into the world changed, carrying both the loss and the weight of its consequence. Game Over—your choice has written history.";
    const buttonText = "Back to Home";

    // 轮播图配置
    const slides = [
        {
            id: 'story',
            title: 'Story',
            content: (
                <section className="h-full flex flex-col items-center justify-center overflow-hidden px-20">
                    <div className="max-w-4xl">
                        <h2 className="pb-12 text-4xl font-medium text-cyan-300 tracking-wider opacity-90 text-center">
                            {subtitle}
                        </h2>
                        <p className="text-3xl leading-relaxed text-cyan-200 text-center">
                            {endingText}
                        </p>
                    </div>
                </section>
            )
        },
        {
            id: 'radar',
            title: 'World State',
            content: (
                <section className="h-full flex items-center justify-center overflow-hidden">
                    <div className="w-full max-w-2xl">
                        <RadarChart size={500} />
                    </div>
                </section>
            )
        }
    ];

    // 拉取结局文案
    useEffect(() => {
        if (gameId) {
            useGameStoreScreen.getState().fetchGameEnding(gameId);
        }
    }, [gameId]);

    // 自动轮播（每8秒切换）
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 10000);
        
        return () => clearInterval(interval);
    }, [slides.length]);

    // 手动切换
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // 归档游戏并返回首页
    const handleBackToHome = async () => {
        try {
            // 调用 archiveGame API
            await useGameStoreScreen.getState().archiveGame(gameId);
        } catch (error) {
            console.error('归档游戏失败:', error);
        } finally {
            // 无论成功或失败，使用浏览器级跳转回首页以刷新并清空 store
            window.location.replace('/');
        }
    };

    return (
        <>
            <div className="h-full overflow-hidden flex flex-col items-center justify-between gap-6 py-10">
                {/* Title 部分 */} 
                <header className="flex flex-col items-center justify-center text-center gap-4">
                    <h1 className="font-pixel leading-tight text-8xl font-bold text-cyan-300 tracking-wide">
                        {title}
                    </h1>
                </header>

                {/* 轮播图主体 */}
                <main className="flex-1 flex flex-col px-4 py-8 w-9/10 min-h-0 overflow-hidden">
                    {/* 轮播内容区域 */}
                    <div className="relative flex-1 w-full overflow-hidden">
                        {/* 轮播内容 */}
                        <div className="h-full w-full relative">
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                                        index === currentSlide
                                            ? 'opacity-100 translate-x-0'
                                            : index < currentSlide
                                            ? 'opacity-0 -translate-x-full'
                                            : 'opacity-0 translate-x-full'
                                    }`}
                                >
                                    {slide.content}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 轮播指示器 */}
                    <div className="flex justify-center items-center gap-4 mt-6">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                onClick={() => goToSlide(index)}
                                className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                                    index === currentSlide
                                        ? 'bg-cyan-400 text-gray-900'
                                        : 'bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/40'
                                }`}
                            >
                                <div
                                    className={`w-3 h-3 rounded-full transition-all ${
                                        index === currentSlide ? 'bg-gray-900' : 'bg-cyan-400'
                                    }`}
                                />
                                <span className="font-pixel text-sm">{slide.title}</span>
                            </button>
                        ))}
                    </div>
                </main>

                {/* 返回首页按钮 */}
                <footer className="flex justify-center">
                    <button 
                        className="text-2xl border-2 border-cyan-400 rounded-4xl px-4 py-2 text-cyan-400 font-semibold mb-4 hover:bg-cyan-400 hover:text-white transition-colors duration-200" 
                        onClick={handleBackToHome}
                    >
                        {buttonText}
                    </button>
                </footer>
            </div>
        </>
);
};

export default GameOver;