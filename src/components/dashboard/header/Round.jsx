import useGameStore from '../../../store';

const Round = () => {
    const round = useGameStore(s => s.turn.index);
    const maxRounds = useGameStore(s => s.gameMeta.maxRounds);
    const year = useGameStore(s => s.turn.year);

    // 显示轮数 = max_turns - 2（排除 intro 和最后测试轮）
    const displayTotalRounds = maxRounds > 2 ? maxRounds - 2 : maxRounds;
    
    // 当前显示轮数：Turn 0-11 显示为 1-10
    // Turn 0 → 1, Turn 1 → 2, ..., Turn 9 → 10, Turn 10 → 10, Turn 11 → 10
    const getDisplayRound = () => {
        if (round === 0) return 1; // Turn 0 显示为 1
        if (round >= displayTotalRounds) return displayTotalRounds; // Turn 10-11 显示为 10
        return round + 1; // Turn 1-9 显示为 2-10
    };

    // 优先使用后端提供的 turn.year；缺省时用 startYear + round 回退
    const displayYear = (typeof year === 'number')
        ? year
        : '-'

    return (
        <div className="flex-1 flex gap-4 p-8">
            <h1 className="pixel-text">{getDisplayRound()} / {displayTotalRounds}</h1>
            <h1 className="pixel-text">{displayYear}</h1>
        </div>
    );
};

export default Round;