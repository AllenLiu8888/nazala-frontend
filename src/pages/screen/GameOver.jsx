import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RadarChart from '../../components/dashboard/main/RadarCBefore';
import useGameStoreScreen from '../../store/index_screen';

const GameOver = () => {
    const { gameId } = useParams();
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // Page text content (configurable)
    const title = "ENDING";
    const subtitle = "Here's the world you created...";
    const endingText = useGameStoreScreen(s => s.ending.text) || "The chamber releases a final surge of light. Your chosen memory vanishes, leaving a hollow echo in your mind. On the giant screen, the crowd reacts—some cheer your sacrifice, others whisper doubts. Outside, society tilts: new rules form, trust shifts, and the balance of power bends to your decision. You step back into the world changed, carrying both the loss and the weight of its consequence. Game Over—your choice has written history.";
    const buttonText = "Back to Home";

    // Carousel configuration
    const slides = [
        {
            id: 'story',
            title: 'Story',
            content: (
                <section className="h-full flex flex-col items-center justify-center overflow-hidden px-20">
                    <div className="max-w-4xl">
                        <h2 className="pixel-text pb-12 text-5xl font-medium text-cyan-300 tracking-wider opacity-90 text-center">
                            {subtitle}
                        </h2>
                        <p className="text-2xl leading-relaxed text-cyan-200 text-start">
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
                        <RadarChart size={600} />
                    </div>
                </section>
            )
        }
    ];

    // Fetch ending text
    useEffect(() => {
        if (gameId) {
            useGameStoreScreen.getState().fetchGameEnding(gameId);
        }
    }, [gameId]);

    // Disable auto-play: manual switch only

    // Manual switch
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Archive game and return to home
    const handleBackToHome = async () => {
        try {
            // Call archiveGame API
            await useGameStoreScreen.getState().archiveGame(gameId);
        } catch (error) {
            console.error('Failed to archive game:', error);
        } finally {
            // Regardless of success or failure, navigate to home to refresh and clear store
            window.location.replace('/');
        }
    };

    return (
        <>
            <div className="h-full overflow-hidden flex flex-col items-center justify-between py-10">
                {/* Title section */} 
                <header className="flex flex-col items-center justify-center text-center gap-4">
                    <h1 className="font-pixel leading-tight text-8xl font-bold text-cyan-300 tracking-wide pb-10">
                        {title}
                    </h1>
                </header>
                <div className="relative w-8/10 mx-4" aria-hidden>
                    {/* Background glow layer */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 bg-cyan-400/10 blur-xl rounded-full" />
                    {/* Main highlight line */}
                    <div className="relative h-[2px] w-full bg-cyan-400/80 rounded-full shadow-[0_0_16px_rgba(34,211,238,0.7)]" />
                </div>

                {/* Carousel container */}
                <main className="flex-1 flex flex-col px-4  w-6/10 min-h-0 overflow-hidden pb-12 pt-4">
                    {/* Carousel content area */}
                    <div className="relative flex-1 w-full overflow-hidden">
                        {/* Slides */}
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

                    {/* Carousel indicators */}
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

                <div className="relative w-8/10 mx-4" aria-hidden>
                    {/* Background glow layer */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 bg-cyan-400/10 blur-xl rounded-full" />
                    {/* Main highlight line */}
                    <div className="relative h-[2px] w-full bg-cyan-400/80 rounded-full shadow-[0_0_16px_rgba(34,211,238,0.7)]" />
                </div>
                {/* Back to home button */}
                <footer className="flex justify-center pt-15">
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