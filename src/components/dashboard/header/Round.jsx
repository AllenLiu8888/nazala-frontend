const Round = () => {
    const round = 1;
    const totalRounds = 10;
    const year = 2075;

    return (
        <div className="flex-1 flex gap-4 p-8">
            <h1 className="pixel-text">{round} / {totalRounds}</h1>
            <h1 className="pixel-text">{year}</h1>
        </div>
    );
};

export default Round;