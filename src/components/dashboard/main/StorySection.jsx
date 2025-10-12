import useGameStoreScreen from '../../../store/index_screen';


const StorySection = () => {
    const turnIndex = useGameStoreScreen(s => s.turn.index);
    const storyText = useGameStoreScreen(s => s.turn.storyText);
    
    return (
        <section className="flex-1 p-20 overflow-hidden">
            {/* 左侧内容 */}
            <h2 className="pixel-text mb-4">World {turnIndex}</h2>
            <p className="text-2xl leading-relaxed text-cyan-200">
            {storyText}
            </p>
        </section>
        );
    };
    
    export default StorySection;