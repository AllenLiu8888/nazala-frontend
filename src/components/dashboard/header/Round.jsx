import useGameStore from '../../../store';

const Round = () => {
    const round = useGameStore(s => s.turn.index);
    const maxRounds = useGameStore(s => s.gameMeta.maxRounds);
    const year = useGameStore(s => s.turn.year);

    // 显示轮数 = max_turns - 2（排除 intro 和最后测试轮）
    const displayTotalRounds = maxRounds > 2 ? maxRounds - 2 : maxRounds;
    
    // 当前显示轮数：Turn 0 不显示，Turn 1-11 显示为 1-10，Turn 12 显示为 10
    const getDisplayRound = () => {
        if (round === 0) return 'Intro';
        if (round >= maxRounds - 1) return displayTotalRounds; // 最后一轮显示为 10
        return round; // Turn 1-11 显示为 1-10
    };

    return (
        <div className="flex-1 flex gap-4 p-8">
            <h1 className="pixel-text">{getDisplayRound()} / {displayTotalRounds}</h1>
            <h1 className="pixel-text">{year}</h1>
        </div>
    );
};

export default Round;