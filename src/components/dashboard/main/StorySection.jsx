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
    // cursor handled inside TypewriterLine

    // 使用 key 强制重挂载来重新打字，无需额外副作用
    
    return (
        <section className="flex-1 p-20 overflow-hidden">
            {/* 左侧内容 */}
            <h2 className="pixel-text mb-4">World {turnIndex}</h2>
            <p className="text-2xl leading-relaxed text-cyan-200">
                <TypewriterLine key={`${turnIndex}-${(storyText || '').length}`} content={storyText} typeSpeed={10} />
            </p>
        </section>
        );
    };
    
    export default StorySection;