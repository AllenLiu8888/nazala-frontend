import Timeline from './TimeLine';
import useGameStoreScreen from '../../../store/index_screen';
// 使用示例
const DecisionProgress = () => {
    const currentPoint = useGameStoreScreen(s => s.turn.index);
    const maxRounds = useGameStoreScreen(s => s.gameMeta.maxRounds);
    const startYear = useGameStoreScreen(s => s.gameMeta.startYear);
    const endYear = useGameStoreScreen(s => s.gameMeta.endYear);
    const displayCurrentPoint = currentPoint - 1;

    // 显示点数 = max_turns - 2（排除 intro 和最后测试轮）
    const displayTotalPoints = maxRounds > 2 ? maxRounds - 2 : maxRounds;

    return (
        <div className="flex-1 flex flex-col gap-17 p-3"> {/* 用gap调整的时间轴的上下间距*/}
            <h3 className="pixel-text">Decision Progress</h3>
            <div className="flex-1 px-20">
                <Timeline 
                startYear={startYear}
                endYear={endYear}
                points={displayTotalPoints}
                currentPoint={displayCurrentPoint}
                lineClass="bg-cyan-400"
                pointClass="bg-cyan-400"
                currentPointClass="bg-cyan-400 border-10 border-yellow-200"
                textClass="text-cyan-400"
                />
            </div>
        </div>
    );
};

export default DecisionProgress;