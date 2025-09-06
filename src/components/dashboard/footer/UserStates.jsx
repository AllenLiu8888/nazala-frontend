import ScoreRing from './RingScore';



const UserStates = () => {
    const value = 3;
    const max = 5;

    return (    
        <div className="flex flex-col items-center gap-6 p-3 px-6">
            <h3 className="pixel-text">User States</h3>
            <div className="flex-1 flex items-center justify-center gap-8 pb-5">
                <div className="flex-1">
                    <ScoreRing value={value} max={max}/>  {/* 默认逆时针，带动画与文字 */}
                </div>
                <p className="text-4xl text-cyan-300 font-bold text-center">{value}/{max}</p>
            </div>
        </div>
    );
};

export default UserStates;