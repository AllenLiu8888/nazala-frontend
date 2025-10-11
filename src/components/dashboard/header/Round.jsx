import useGameStoreScreen from '../../../store/index_screen';

const Round = () => {
    const round = useGameStoreScreen(s => s.turn.index);
    const maxRounds = useGameStoreScreen(s => s.gameMeta.maxRounds);
    const year = useGameStoreScreen(s => s.turn.year);
    const displayTotalRounds = maxRounds > 2 ? maxRounds - 2 : maxRounds;

    // 优先使用后端提供的 turn.year；缺省时显示 '-'
    const displayYear = (typeof year === 'number')
        ? year
        : '-'

    return (
        <div className="flex-1 flex gap-4 p-8">
            <h1 className="pixel-text">{round} / {displayTotalRounds}</h1>
            <h1 className="pixel-text">{displayYear}</h1>
        </div>
    );
};

export default Round;