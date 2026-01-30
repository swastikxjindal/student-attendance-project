import React from 'react';
import { motion } from 'framer-motion';

const BarChart = ({ data, height = 200 }) => {
    const max = Math.max(...data.map(item => item.value), 1);

    return (
        <div className="flex items-end justify-between gap-4 w-full h-full pt-10 px-2" style={{ height }}>
            {data.map((item, index) => {
                const barHeight = (item.value / max) * 100;
                return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                        {/* Tooltip */}
                        <div className="absolute -top-6 bg-[var(--text-main)] text-[var(--bg-main)] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-lg">
                            {item.value}
                        </div>

                        {/* Bar */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${barHeight}%` }}
                            transition={{ duration: 1, delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                            className="w-full rounded-t-xl relative overflow-hidden group-hover:brightness-110 transition-all shadow-lg"
                            style={{ backgroundColor: item.color }}
                        >
                            {/* Glass effect on top */}
                            <div className="absolute top-0 left-0 w-full h-4 bg-white/20 blur-sm" />
                        </motion.div>

                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate w-full text-center">
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default BarChart;
