import React from 'react';
import { motion } from 'framer-motion';

const PieChart = ({ data, size = 200, strokeWidth = 20 }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulativeOffset = 0;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const dashArray = (item.value / total) * circumference;
                        const offset = cumulativeOffset;
                        cumulativeOffset += dashArray;

                        return (
                            <motion.circle
                                key={index}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                                strokeDashoffset={-offset}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold tracking-tighter" style={{ color: 'var(--text-main)' }}>
                        {total}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold uppercase tracking-widest transition-colors" style={{ color: 'var(--text-muted)' }}>
                                {item.label}
                            </span>
                            <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                                {item.value} ({Math.round((item.value / total) * 100)}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;
