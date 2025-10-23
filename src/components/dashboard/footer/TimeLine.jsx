import React from 'react';

/**
 * SimpleTimeline Component - minimal timeline with smooth animations
 * 
 * @param {number} startYear - start year
 * @param {number} endYear - end year
 * @param {number} points - number of points on the timeline (default 11)
 * @param {number} currentPoint - index of the highlighted point (optional)
 * @param {string} lineClass - Tailwind class for the line (e.g. 'bg-gray-300')
 * @param {string} pointClass - Tailwind class for points (e.g. 'bg-gray-400')
 * @param {string} currentPointClass - Tailwind class for current point (e.g. 'bg-blue-500')
 * @param {string} textClass - Tailwind class for text (e.g. 'text-gray-600')
 * @param {string} className - extra container className
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
  // Compute timeline points
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
        {/* Timeline */}
        <div className="relative">
            {/* Main line - gradient and animation */}
            <div className={`absolute top-1/2 left-0 right-0 h-2 ${lineClass} -translate-y-1/2 transition-all duration-500 ease-in-out`}></div>

            {/* Time point markers */}
            {timelinePoints.map((point, index) => (
            <div
                key={index}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out"
                style={{ left: `${point.position}%` }}
            >
                {/* Fixed ticks (larger at ends, thinner in middle) */}
                <div className={`${point.isMain ? 'w-4 h-4' : 'w-1.5 h-6'} ${pointClass} rounded-full`} />
                
                {/* Year label - fade effect */}
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

            {/* Smooth current indicator (white glow + solid dot) */}
            {currentPosition !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out"
                style={{ left: `${currentPosition}%` }}
              >
                {/* Glow layer: subtle white blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/40 blur-xl pointer-events-none" />
                {/* Solid current point */}
                <div className={`${currentPointClass} w-6 h-6 rounded-full border-6 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
              </div>
            )}
        </div>
        </div>
    );
};

export default Timeline;