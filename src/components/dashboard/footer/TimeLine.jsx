import React from 'react';

/**
 * SimpleTimeline Component - 极简时间轴组件（带丝滑动画）
 * 
 * @param {number} startYear - 开始年份
 * @param {number} endYear - 结束年份
 * @param {number} points - 时间轴上的点数（默认11个点）
 * @param {number} currentPoint - 当前高亮点的索引（可选）
 * @param {string} lineClass - 线条的 Tailwind 类名（如 'bg-gray-300'）
 * @param {string} pointClass - 点的 Tailwind 类名（如 'bg-gray-400'）
 * @param {string} currentPointClass - 当前点的 Tailwind 类名（如 'bg-blue-500'）
 * @param {string} textClass - 文字的 Tailwind 类名（如 'text-gray-600'）
 * @param {string} className - 额外的容器样式类名
 */
const Timeline = ({
    startYear = 2025,
    endYear = 2075,
    points = 11,
    currentPoint = null,
    lineClass = 'bg-gray-300',
    pointClass = 'bg-gray-400',
    currentPointClass = 'bg-yellow-200',
    textClass = 'text-gray-600',
    className = ""
}) => {
  // 计算时间轴点
    const timelinePoints = [];
    const totalYears = endYear - startYear;
    
    for (let i = 0; i < points; i++) {
        const year = startYear + Math.floor((totalYears / (points - 1)) * i);
        timelinePoints.push({
        position: (100 / (points - 1)) * i,
        year: year,
        isMain: i === 0 || i === points - 1,
        isCurrent: i === currentPoint
        });
    }

    return (
        <div className={`relative ${className}`}>
        {/* 时间轴 */}
        <div className="relative">
            {/* 主线 - 添加渐变和动画 */}
            <div className={`absolute top-1/2 left-0 right-0 h-2 ${lineClass} -translate-y-1/2 transition-all duration-500 ease-in-out`}></div>

            {/* 时间点标记 */}
            {timelinePoints.map((point, index) => (
            <div
                key={index}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out"
                style={{ left: `${point.position}%` }}
            >
                {/* 标记点 - 添加丝滑的尺寸和颜色过渡 */}
                <div className={`
                ${point.isCurrent ? currentPointClass : pointClass}
                ${point.isCurrent ? 'w-10 h-10' : ''}
                ${!point.isCurrent && point.isMain ? 'w-6 h-6' : ''}
                ${!point.isCurrent && !point.isMain ? 'w-2 h-8' : ''}
                rounded-full
                transition-all duration-500 ease-in-out
                ${point.isCurrent ? 'shadow-lg shadow-cyan-400/50' : 'shadow-sm'}
                hover:scale-110
                transform-gpu
                `}></div>
                
                {/* 年份标签 - 添加淡入淡出效果 */}
                {point.isMain && (
                <div className={`
                    absolute top-8 -translate-x-1/2 text-xl ${textClass}
                    transition-all duration-500 ease-in-out
                    ${point.isCurrent ? 'opacity-100 scale-110' : 'opacity-80 scale-100'}
                `}>
                    {point.year}
                </div>
                )}
            </div>
            ))}
        </div>
        </div>
    );
};

export default Timeline;