import useGameStoreScreen from '../../../store/index_screen';
 
import { useTypewriter, Cursor } from 'react-simple-typewriter';


const TypewriterLine = ({ content, typeSpeed = 10 }) => {
    const [text, helper] = useTypewriter({
        words: [content || ''],
        typeSpeed,
        deleteSpeed: 0,
        delaySpeed: 0,
        loop: 1
    });
    const { isDone } = helper;
    return (
        <>
            <span>{text}</span>
            {!isDone && (
                <Cursor cursorStyle="▍" cursorColor="rgba(255, 255, 255, 1)" />
            )}
        </>
    );
};

const StorySection = () => {
    const turnIndex = useGameStoreScreen(s => s.turn.index);
    const storyText = useGameStoreScreen(s => s.turn.storyText);
    // Cursor handled inside TypewriterLine

    // Use key to force remount to retype without extra effects
    
    return (
        <section className="flex-1 p-20 overflow-hidden">
            {/* Left content */}
            <h2 className="pixel-text mb-4">World {turnIndex}</h2>
            <p className="text-2xl leading-relaxed text-cyan-200">
                <TypewriterLine key={`${turnIndex}-${(storyText || '').length}`} content={storyText} typeSpeed={10} />
            </p>
        </section>
        );
    };
    
    export default StorySection;