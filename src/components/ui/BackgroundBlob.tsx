'use client'

import { motion } from 'framer-motion'

export function BackgroundBlob() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-[100px]"
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    borderRadius: ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "50%"],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-full blur-[80px]"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    )
}
