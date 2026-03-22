'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Zap, Target, Flame } from 'lucide-react';
import { useDemoStore } from '@/store/demo-store';

interface MomentumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MomentumModal({ isOpen, onClose }: MomentumModalProps) {
    const momentumScore = useDemoStore(state => state.momentumScore);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-[101] overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500" />
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                                    Momentum
                                </h2>
                                <p className="text-neutral-400 text-sm mt-1">Your current productivity velocity.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center justify-center py-8 bg-black/30 rounded-2xl border border-white/5 mb-6">
                            <span className="text-6xl font-black text-white tabular-nums tracking-tighter">
                                {momentumScore}
                            </span>
                            <span className="text-orange-500 font-bold text-sm mt-2 uppercase tracking-widest flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" /> 
                                {momentumScore > 80 ? 'Exceptional' : 'Steady'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">5 Day Streak</div>
                                    <div className="text-xs text-neutral-500">You&apos;re on fire! Keep it up.</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Daily Focus: 4.2h</div>
                                    <div className="text-xs text-neutral-500">Average deep work today.</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl mt-8 hover:bg-neutral-200 transition-colors"
                        >
                            Close Breakdown
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
