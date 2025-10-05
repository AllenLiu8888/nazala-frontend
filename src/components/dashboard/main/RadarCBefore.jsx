import React from 'react';
import useGameStore from '../../../store';

/**
 * 雷达图组件
 * @param {Object} props - 组件属性
 * @param {number} props.size - SVG viewBox 大小，默认 600
 * @param {number} props.maxRadius - 最大半径（数据区域），默认 150
 * @param {number} props.labelRadius - 标签距离中心的半径，默认 250
 * @param {number} props.labelYOffset - 标签 Y 轴偏移，默认 220
 * @param {number} props.levels - 背景圆圈层数，默认 5
 * @param {number} props.levelRadius - 每层圆圈的半径间隔，默认 30
 * @param {number} props.pointRadius - 数据点半径，默认 6
 * @param {Array} props.colors - 四个维度的颜色数组，默认 ['cyan', 'red', 'yellow', 'blue']
 * @param {string} props.strokeColor - 主要描边颜色，默认 'cyan'
 * @param {string} props.gradientId - 渐变 ID，默认 'radarGradient'
 * @param {boolean} props.showBottomLine - 是否显示底部装饰线，默认 false
 * @param {number} props.labelWidth - 标签宽度，默认 140
 * @param {number} props.labelHeight - 标签高度，默认 36
 * @param {boolean} props.showPercentage - 是否显示百分比，默认 true
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
    // 从 store 读取四维属性数据
    const categories = useGameStore(s => s.world.categories);
    const radarData = useGameStore(s => s.world.radarData);

    // 计算中心点
    const center = size / 2;

    // 将 store 数据映射为雷达图数据点（角度、值、标签、颜色）
    const dataPoints = categories.map((label, index) => ({
        angle: index * 90, // 四个维度：0°, 90°, 180°, 270°
        value: radarData[index] ?? 50, // 如果数据缺失，默认 50
        label,
        color: colors[index] || 'cyan', // 使用传入的颜色或默认值
    }));

    return (
        <>
            {/* 雷达图容器：自适应父容器高度 */}
            <div className="relative w-full h-full rounded-lg p-4 flex items-center justify-center">
                {/* SVG 雷达图：自适应容器，扩大 viewBox 以容纳标签，添加平滑过渡 */}
                <svg className="w-full h-full max-h-full" viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
                    {/* 定义渐变 */}
                    <defs>
                        <radialGradient id={gradientId}>
                            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.1" />
                        </radialGradient>
                    </defs>

                    {/* 背景圆圈 */}
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

                    {/* 轴线：延伸到标签位置，保持固定 */}
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

                    {/* 数据多边形：添加平滑过渡 */}
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

                    {/* 数据点：添加平滑过渡 */}
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

                    {/* 标签：固定在圆形外围，不随数据变化 */}
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

            {/* 底部装饰线（可选） */}
            {showBottomLine && (
                <div className="mt-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            )}
        </>
    );
};

export default RadarChart;