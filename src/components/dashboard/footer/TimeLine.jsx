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
    startYear = 2075,
    endYear = 2125,
    points = 11,
    currentPoint = null,
    lineClass = 'bg-gray-300',
    pointClass = 'bg-gray-400',
    currentPointClass = 'bg-white',
    textClass = 'text-gray-600',
    className = ""
}) => {
  // 计算时间轴点
    const timelinePoints = [];
    const totalYears = endYear - startYear;
    const clampedCurrentIndex =
      typeof currentPoint === 'number'
        ? Math.max(0, Math.min(points - 1, currentPoint))
        : null;
    const currentPosition = clampedCurrentIndex !== null
      ? (100 / (points - 1)) * clampedCurrentIndex
      : null;
    
    for (let i = 0; i < points; i++) {
        const year = startYear + Math.floor((totalYears / (points - 1)) * i);
        timelinePoints.push({
        position: (100 / (points - 1)) * i,
        year: year,
        isMain: i === 0 || i === points - 1,
        isCurrent: i === clampedCurrentIndex
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
                {/* 固定刻度点（起止更大，中间更细） */}
                <div className={`${point.isMain ? 'w-4 h-4' : 'w-1.5 h-6'} ${pointClass} rounded-full`} />
                
                {/* 年份标签 - 添加淡入淡出效果 */}
                {point.isMain && (
                <div className={`
                    absolute top-12 -translate-x-1/2 text-xl ${textClass}
                    transition-all duration-500 ease-in-out
                    ${point.isCurrent ? 'opacity-100 scale-110' : 'opacity-80 scale-100'}
                `}>
                    {point.year}
                </div>
                )}
            </div>
            ))}

            {/* 丝滑移动的当前指示器（白色光晕 + 实心点） */}
            {currentPosition !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out"
                style={{ left: `${currentPosition}%` }}
              >
                {/* 光晕层：白色高斯模糊（弱化） */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/40 blur-xl pointer-events-none" />
                {/* 实心当前点 */}
                <div className={`${currentPointClass} w-6 h-6 rounded-full border-6 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
              </div>
            )}
        </div>
        </div>
    );
};

export default Timeline;