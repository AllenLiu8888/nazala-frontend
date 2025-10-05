import React from 'react';
import useGameStore from '../../../store';

const RadarChart = () => {
    // 从 store 读取四维属性数据
    const categories = useGameStore(s => s.world.categories);
    const radarData = useGameStore(s => s.world.radarData);

    // 将 store 数据映射为雷达图数据点（角度、值、标签、颜色）
    const dataPoints = categories.map((label, index) => ({
        angle: index * 90, // 四个维度：0°, 90°, 180°, 270°
        value: radarData[index] ?? 50, // 如果数据缺失，默认 50
        label,
        color: ['cyan', 'red', 'yellow', 'blue'][index], // 固定颜色序列
    }));
    return (
        <>
            {/* 雷达图容器：自适应父容器高度 */}
            <div className="relative w-full h-full rounded-lg p-4 flex items-center justify-center">
            {/* SVG 雷达图：自适应容器，扩大 viewBox 以容纳标签，添加平滑过渡 */}
            <svg className="w-full h-full max-h-full" viewBox="0 0 600 600" style={{ overflow: 'visible' }}>
            {/* 定义渐变 */}
            <defs>
                <radialGradient id="radarGradient">
                <stop offset="0%" stopColor="cyan" stopOpacity="0.3" />
                <stop offset="100%" stopColor="cyan" stopOpacity="0.1" />
                </radialGradient>
            </defs>

            {/* 背景圆圈 */}
            {[1, 2, 3, 4, 5].map((level) => (
                <circle
                key={level}
                cx="300"
                cy="300"
                r={level * 30}
                fill="none"
                stroke="rgba(0, 255, 255, 0.2)"
                strokeWidth="1"
                />
            ))}

            {/* 轴线：延伸到标签位置，保持固定 */}
            {dataPoints.map((point, index) => {
                const angle = (index * 90 - 90) * Math.PI / 180;
                const x2 = 300 + 150 * Math.cos(angle);
                const y2 = 300 + 150 * Math.sin(angle);
                return (
                <line
                    key={index}
                    x1="300"
                    y1="300"
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
                const radius = (point.value / 100) * 150;
                const x = 300 + radius * Math.cos(angle);
                const y = 300 + radius * Math.sin(angle);
                return `${x},${y}`;
                }).join(' ')}
                fill="url(#radarGradient)"
                stroke="cyan"
                strokeWidth="2"
                style={{ transition: 'all 0.5s ease-in-out' }}
            />

            {/* 数据点：添加平滑过渡 */}
            {dataPoints.map((point, index) => {
                const angle = (index * 90 - 90) * Math.PI / 180;
                const radius = (point.value / 100) * 150;
                const x = 300 + radius * Math.cos(angle);
                const y = 300 + radius * Math.sin(angle);
                return (
                <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="6"
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
                const x = 300 + 250 * Math.cos(angle);
                const y = 300 + 220* Math.sin(angle);
                return (
                <g key={index}>
                    <rect
                    x={x - 70}
                    y={y - 18}
                    width="140"
                    height="36"
                    rx="12"
                    fill="rgba(0, 255, 255, 0.2)"
                    stroke="cyan"
                    strokeWidth="1"
                    />
                    <text
                    x={x}
                    y={y - 2}
                    fill="cyan"
                    fontSize="12"
                    textAnchor="middle"
                    className="font-medium"
                    >
                    {point.label}
                    </text>
                    <text
                    x={x}
                    y={y + 12}
                    fill="cyan"
                    fontSize="10"
                    textAnchor="middle"
                    className="opacity-70"
                    >
                    {point.value}%
                    </text>
                </g>
                );
            })}
            </svg>

            </div>

            {/* 底部装饰线 */}
            <div className="mt-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
    </>
    );
};

export default RadarChart;