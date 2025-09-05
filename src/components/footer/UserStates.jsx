import ScoreRing from './RingScore';



const UserStates = () => {
    const value = 4;
    const max = 5;

    return (    
        <div className="flex items-center gap-4 p-6">
            <div className="p-6">
                <ScoreRing value={value} max={max}/>  {/* 默认逆时针，带动画与文字 */}
            </div>
            <p className="text-2xl font-bold text-white text-center">{value}/{max}</p>
        </div>
    );
};

export default UserStates;