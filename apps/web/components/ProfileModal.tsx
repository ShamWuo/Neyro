'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, Shield, LogOut, Moon, Sun } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
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
                        initial={{ opacity: 0, scale: 0.95, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: 20 }}
                        className="fixed right-4 top-4 w-full max-w-sm bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-[101]"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-accent-light/20 flex items-center justify-center text-accent font-black text-xl border border-accent/20">
                                    JD
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">John Doe</h2>
                                    <p className="text-neutral-500 text-xs font-medium">john@example.com</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <button className="w-full flex items-center gap-3 p-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">View Profile</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                <Settings className="w-4 h-4" />
                                <span className="text-sm font-medium">Account Settings</span>
                            </button>
                            <button className="w-full flex items-center justify-between p-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                <div className="flex items-center gap-3">
                                    <Moon className="w-4 h-4" />
                                    <span className="text-sm font-medium">Dark Mode</span>
                                </div>
                                <div className="w-8 h-4 bg-accent/20 rounded-full relative">
                                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-accent rounded-full" />
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-medium">Privacy & Security</span>
                            </button>
                        </div>

                        <div className="h-px bg-white/5 my-4" />

                        <button className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-xl transition-all font-bold">
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Log Out</span>
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
