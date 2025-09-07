// src/components/ScoreRing.jsx
import React, { useEffect, useMemo, useState } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
// 一次性在组件里引入样式 -> 使用者只需引入这个组件
import "react-circular-progressbar/dist/styles.css";

/**
 * 环形进度（带动画，居中显示 value/max）
 *
 * Props：
 * - value: number   分子
 * - max: number     分母
 * - size?: number = 72           直径（px）
 * - strokeWidth?: number = 10    线宽
 * - color?: string = "#03ffff"   进度色
 * - track?: string = "#0b1220"   轨道色
 * - ccw?: boolean = true         逆时针（counter-clockwise）
 * - duration?: number = 0.6      动画时长（秒）
 * - easing?: string = "cubic-bezier(.22,1,.36,1)" 动画缓动
 * - showText?: boolean = true    是否显示“value/max”
 * - className?: string           外层自定义类名
 * - animateOnMount?: boolean = true  首次挂载是否从 0 动到目标
 */
export default function ScoreRing({
    value,
    max,
    size = 96,
    strokeWidth = 20,
    color = "#03ffff",
    track = "#0b1220",
    ccw = true,
    duration = 0.6,
    easing = "cubic-bezier(.22,1,.36,1)",
    showText = false,
    className = "",
    animateOnMount = true,
    }) {
    const safeMax = Math.max(0, Number(max) || 0);
    const safeVal = Math.min(Math.max(0, Number(value) || 0), safeMax);

    const targetPct = useMemo(
        () => (safeMax > 0 ? (safeVal / safeMax) * 100 : 0),
        [safeVal, safeMax]
    );

    // 为了“一个组件即可动画”，内部自己管理显示用的百分比
    const [pct, setPct] = useState(() => (animateOnMount ? 0 : targetPct));
    useEffect(() => {
        // 进入或更新时，平滑过渡到目标值
        setPct(targetPct);
    }, [targetPct]);

    return (
        <div
        className={className}
        style={{ width: size, height: size, display: "grid", placeItems: "center" }}
        >
        <CircularProgressbarWithChildren
            value={pct}
            strokeWidth={strokeWidth}
            counterClockwise={ccw}
            styles={buildStyles({
            pathColor: color,
            trailColor: track,
            // 完全自定义 transition：更可控（含缓动）
            pathTransition: `stroke-dashoffset ${duration}s ${easing}`,
            // 也可以用简单模式：pathTransitionDuration: duration,
            textColor: "#67e8f9",
            })}
        >
            {showText && (
            <span style={{ color: "#67e8f9", fontSize: 12, fontWeight: 600 }}>
                {safeVal}/{safeMax}
            </span>
            )}
        </CircularProgressbarWithChildren>
        </div>
    );
}
