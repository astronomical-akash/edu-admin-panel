'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

export function LandingPage() {
    const router = useRouter()
    const [isExiting, setIsExiting] = useState(false)

    const handleEnter = () => {
        setIsExiting(true)
        setTimeout(() => {
            router.push('/dashboard/hierarchy')
        }, 1000) // Wait for exit animation
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex flex-col items-center justify-center">
            {/* Organic Blob Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-[100px]"
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
                    className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-[80px]"
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

            {/* Content */}
            <AnimatePresence>
                {!isExiting && (
                    <motion.div
                        className="relative z-10 text-center space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        transition={{ duration: 0.8 }}
                    >

                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                            AdarshabaniNXT
                        </h1>
                        <p className="text-xl text-white/60 max-w-md mx-auto">
                            Leap to the NXT generation of learning!
                        </p>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="lg"
                                onClick={handleEnter}
                                className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-shadow duration-500"
                            >
                                Enter Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Glowing Transition Overlay */}
            <AnimatePresence>
                {isExiting && (
                    <motion.div
                        className="absolute inset-0 z-50 bg-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
