import React from 'react';
import useGameStoreScreen from '../../../store/index_screen';


/**
 * Radar chart component
 * @param {Object} props - component properties
 * @param {number} props.size - SVG viewBox size, default 600
 * @param {number} props.maxRadius - maximum radius (data area), default 150
 * @param {number} props.labelRadius - radius for labels from center, default 250
 * @param {number} props.labelYOffset - label Y offset, default 220
 * @param {number} props.levels - number of background rings, default 5
 * @param {number} props.levelRadius - radius step per ring, default 30
 * @param {number} props.pointRadius - data point radius, default 6
 * @param {Array} props.colors - colors for four dimensions, default ['cyan', 'red', 'yellow', 'blue']
 * @param {string} props.strokeColor - primary stroke color, default 'cyan'
 * @param {string} props.gradientId - gradient ID, default 'radarGradient'
 * @param {boolean} props.showBottomLine - show bottom decorative line, default false
 * @param {number} props.labelWidth - label width, default 140
 * @param {number} props.labelHeight - label height, default 48
 * @param {boolean} props.showPercentage - show percentage, default true
 */
const RadarChart = ({
    size = 450,
    maxRadius = 150,
    labelRadius = 250,
    labelYOffset = 220,
    levels = 5,
    levelRadius = 30,
    pointRadius = 6,
    colors = ['cyan', 'red', 'yellow', 'blue'],
    strokeColor = 'cyan',
    gradientId = 'radarGradient',
    showBottomLine = false,
    labelWidth = 140,
    labelHeight = 48,
    showPercentage = true,
}) => {
    // Read four-dimensional attribute data from store
    const categories = useGameStoreScreen(s => s.world.categories);
    const radarData = useGameStoreScreen(s => s.world.radarData);

    // Normalize world attribute values to 0-100 (backend may provide -100~100 or already 0~100)
    const normalizeToPercent = (value) => {
        if (typeof value !== 'number' || Number.isNaN(value)) return 50;
        if (value >= 0 && value <= 100) return value; // already percentage
        // Map [-100, 100] to [0, 100]
        const clamped = Math.max(-100, Math.min(100, value));
        return Math.round(clamped / 2 + 50);
    };
    const normalizedData = Array.isArray(radarData) ? radarData.map(normalizeToPercent) : [50, 50, 50, 50];

    // Compute center
    const center = size / 2;

    // Map store data to radar points (angle, value, label, color)
    const dataPoints = categories.map((label, index) => ({
        angle: index * 90, // Four dimensions: 0°, 90°, 180°, 270°
        value: normalizedData[index] ?? 50, // Default 50 if data is missing
        label,
        color: colors[index] || 'cyan', // Use provided color or default
    }));

    return (
        <>
            {/* Radar container: fits parent height */}
            <div className="relative w-full h-full rounded-lg p-4 flex items-center justify-center">
                {/* SVG radar: responsive, enlarged viewBox for labels, smooth transitions */}
                <svg className="w-full h-full max-h-full" viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
                    {/* Define gradient */}
                    <defs>
                        <radialGradient id={gradientId}>
                            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.1" />
                        </radialGradient>
                    </defs>

                    {/* Background rings */}
                    {Array.from({ length: levels }, (_, i) => i + 1).map((level) => (
                        <circle
                            key={level}
                            cx={center}
                            cy={center}
                            r={level * levelRadius}
                            fill="none"
                            stroke="rgba(0, 255, 255, 0.2)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Axes: extend to label positions, stay fixed */}
                    {dataPoints.map((point, index) => {
                        const angle = (index * 90 - 90) * Math.PI / 180;
                        const x2 = center + maxRadius * Math.cos(angle);
                        const y2 = center + maxRadius * Math.sin(angle);
                        return (
                            <line
                                key={index}
                                x1={center}
                                y1={center}
                                x2={x2}
                                y2={y2}
                                stroke="rgba(0, 255, 255, 0.3)"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Data polygon: smooth transition */}
                    <polygon
                        points={dataPoints.map((point, index) => {
                            const angle = (index * 90 - 90) * Math.PI / 180;
                            const radius = (point.value / 100) * maxRadius;
                            const x = center + radius * Math.cos(angle);
                            const y = center + radius * Math.sin(angle);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill={`url(#${gradientId})`}
                        stroke={strokeColor}
                        strokeWidth="2"
                        style={{ transition: 'all 0.5s ease-in-out' }}
                    />

                    {/* Data points: smooth transition */}
                    {dataPoints.map((point, index) => {
                        const angle = (index * 90 - 90) * Math.PI / 180;
                        const radius = (point.value / 100) * maxRadius;
                        const x = center + radius * Math.cos(angle);
                        const y = center + radius * Math.sin(angle);
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r={pointRadius}
                                fill={point.color}
                                stroke="white"
                                strokeWidth="2"
                                style={{ transition: 'all 0.5s ease-in-out' }}
                            />
                        );
                    })}

                    {/* Labels: fixed outside circle, do not change with data */}
                    {dataPoints.map((point, index) => {
                        const angle = (index * 90 - 90) * Math.PI / 180;
                        const x = center + labelRadius * Math.cos(angle);
                        const y = center + labelYOffset * Math.sin(angle);
                        return (
                            <g key={index} className="flex items-center justify-center">
                                <rect
                                    x={x - labelWidth / 2}
                                    y={y - labelHeight / 2}
                                    width={labelWidth}
                                    height={labelHeight}
                                    rx="12"
                                    fill="rgba(0, 255, 255, 0.2)"
                                    stroke={strokeColor}
                                    strokeWidth="1"
                                />
                                <text
                                    x={x}
                                    y={y - 2}
                                    fill={strokeColor}
                                    fontSize="12"
                                    textAnchor="middle"
                                    className="font-medium"
                                >
                                    {point.label}
                                </text>
                                {showPercentage && (
                                    <text
                                        x={x}
                                        y={y + 12}
                                        fill={strokeColor}
                                        fontSize="10"
                                        textAnchor="middle"
                                        className="opacity-70"
                                    >
                                        {point.value}%
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Optional bottom decorative line */}
            {showBottomLine && (
                <div className="mt-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            )}
        </>
    );
};

export default RadarChart;