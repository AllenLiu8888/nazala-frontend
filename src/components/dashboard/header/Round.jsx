import useGameStore from '../../../store';

const Round = () => {
    const round = useGameStore(s => s.turn.index);
    const totalRounds = useGameStore(s => s.gameMeta.maxRounds);
    const year = useGameStore(s => s.turn.year);

    return (
        <div className="flex-1 flex gap-4 p-8">
            <h1 className="pixel-text">{round} / {totalRounds}</h1>
            <h1 className="pixel-text">{year}</h1>
        </div>
    );
};

export default Round;