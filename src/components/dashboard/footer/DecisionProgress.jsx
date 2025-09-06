import Timeline from './TimeLine';

// 使用示例
const DecisionProgress = () => {
    return (
        <div className="flex-1 flex flex-col gap-17 p-3"> {/* 用gap调整的时间轴的上下间距*/}
            <h3 className="pixel-text">Decision Progress</h3>
            <div className="flex-1 px-20">
                <Timeline 
                startYear={2025}
                endYear={2030}
                points={10}
                currentPoint={1}
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