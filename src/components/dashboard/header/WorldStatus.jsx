// import useGameStore from '../../../store';

const WorldStatus = () => {
    // const worldStatus = useGameStore(s => s.turn.questionText);

    const worldStatus = "Stable";
    return (
        <div className="flex-1 flex gap-4 p-8 text-right">
            <h1 className="pixel-text">World Status: {worldStatus}</h1>
        </div>
    );
};

export default WorldStatus;