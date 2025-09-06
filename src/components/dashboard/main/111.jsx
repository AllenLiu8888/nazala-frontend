import React from 'react';

const RadarChart = () => {
    const dataPoints = [
        { angle: 0, value: 85, label: 'Memory Fidelity', color: 'cyan' },
        { angle: 90, value: 90, label: 'Technical Control', color: 'red' },
        { angle: 180, value: 80, label: 'Pattern Cohesion', color: 'yellow' },
        { angle: 270, value: 75, label: 'Autonomic Control', color: 'blue' }
    ];
    return (
        <>
            {/* 雷达图容器 */}
            <div className="relative w-96 h-96 rounded-lg p-8">
            {/* SVG 雷达图 */}
            <svg className="w-full h-full" viewBox="0 0 400 400">
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
                cx="200"
                cy="200"
                r={level * 30}
                fill="none"
                stroke="rgba(0, 255, 255, 0.2)"
                strokeWidth="1"
                />
            ))}

            {/* 轴线 */}
            {dataPoints.map((point, index) => {
                const angle = (index * 90 - 90) * Math.PI / 180;
                const x2 = 200 + 150 * Math.cos(angle);
                const y2 = 200 + 150 * Math.sin(angle);
                return (
                <line
                    key={index}
                    x1="200"
                    y1="200"
                    x2={x2}
                    y2={y2}
                    stroke="rgba(0, 255, 255, 0.3)"
                    strokeWidth="1"
                />
                );
            })}

            {/* 数据多边形 */}
            <polygon
                points={dataPoints.map((point, index) => {
                const angle = (index * 90 - 90) * Math.PI / 180;
                const radius = (point.value / 100) * 150;
                const x = 200 + radius * Math.cos(angle);
                const y = 200 + radius * Math.sin(angle);
                return `${x},${y}`;
                }).join(' ')}
                fill="url(#radarGradient)"
                stroke="cyan"
                strokeWidth="2"
            />

            {/* 数据点 */}
            {dataPoints.map((point, index) => {
                const angle = (index * 90 - 90) * Math.PI / 180;
                const radius = (point.value / 100) * 150;
                const x = 200 + radius * Math.cos(angle);
                const y = 200 + radius * Math.sin(angle);
                return (
                <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="6"
                    fill={point.color}
                    stroke="white"
                    strokeWidth="2"
                />
                );
            })}

            {/* 标签 */}
            {dataPoints.map((point, index) => {
                const angle = (index * 90 - 90) * Math.PI / 180;
                const x = 200 + 180 * Math.cos(angle);
                const y = 200 + 180 * Math.sin(angle);
                return (
                <g key={index}>
                    <rect
                    x={x - 60}
                    y={y - 12}
                    width="120"
                    height="24"
                    rx="12"
                    fill="rgba(0, 255, 255, 0.2)"
                    stroke="cyan"
                    strokeWidth="1"
                    />
                    <text
                    x={x}
                    y={y + 4}
                    fill="cyan"
                    fontSize="12"
                    textAnchor="middle"
                    className="font-medium"
                    >
                    {point.label}
                    </text>
                    <text
                    x={x}
                    y={y + 16}
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