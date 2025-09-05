const Round = () => {
    const round = 1;
    const totalRounds = 10;
    const year = 2075;

    return (
        <div className="flex-1 flex gap-4 p-6">
            <h1 className="font-pixel text-2xl font-bold text-white">{round} / {totalRounds}</h1>
            <h1 className="font-pixel text-2xl font-bold text-white">{year}</h1>
        </div>
    );
};

export default Round;