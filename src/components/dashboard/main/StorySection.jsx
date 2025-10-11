import useGameStoreScreen from '../../../store/index_screen';


const StorySection = () => {
    const turnIndex = useGameStoreScreen(s => s.turn.index);
    const questionText = useGameStoreScreen(s => s.turn.questionText);
    const maxRounds = useGameStoreScreen(s => s.gameMeta.maxRounds);
    
    // 显示轮数 = max_turns - 2（排除 intro 和最后测试轮）
    const displayTotalRounds = maxRounds > 2 ? maxRounds - 2 : maxRounds;
    
    // 当前显示轮数：Turn 0-11 显示为 1-10
    // Turn 0 → 1, Turn 1 → 2, ..., Turn 9 → 10, Turn 10 → 10, Turn 11 → 10
    const getDisplayWorld = () => {
        if (turnIndex === 0) return 1; // Turn 0 显示为 World 1
        if (turnIndex >= displayTotalRounds) return displayTotalRounds; // Turn 10-11 显示为 World 10
        return turnIndex + 1; // Turn 1-9 显示为 World 2-10
    };
    
    return (
        <section className="flex-1 p-20 overflow-hidden">
            {/* 左侧内容 */}
            <h2 className="pixel-text mb-4">World {getDisplayWorld()}</h2>
            <p className="text-2xl leading-relaxed text-cyan-200">
            {questionText}
            </p>
        </section>
        );
    };
    
    export default StorySection;