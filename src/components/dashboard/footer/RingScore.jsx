// src/components/ScoreRing.jsx
import React, { useEffect, useMemo, useState } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
// Import styles within component once -> consumers only import this component
import "react-circular-progressbar/dist/styles.css";

/**
 * Circular progress (animated, centered value/max)
 *
 * Props:
 * - value: number   numerator
 * - max: number     denominator
 * - size?: number = 72           diameter (px)
 * - strokeWidth?: number = 10    stroke width
 * - color?: string = "#03ffff"   progress color
 * - track?: string = "#0b1220"   track color
 * - ccw?: boolean = true         counter-clockwise
 * - duration?: number = 0.6      animation duration (seconds)
 * - easing?: string = "cubic-bezier(.22,1,.36,1)" easing
 * - showText?: boolean = true    show "value/max"
 * - className?: string           outer custom className
 * - animateOnMount?: boolean = true  animate from 0 on mount
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

    // Manage displayed percentage internally for self-animated component
    const [pct, setPct] = useState(() => (animateOnMount ? 0 : targetPct));
    useEffect(() => {
        // Smoothly transition to target value on mount/update
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
            // Fully custom transition: precise control (with easing)
            pathTransition: `stroke-dashoffset ${duration}s ${easing}`,
            // Or simple mode: pathTransitionDuration: duration,
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
