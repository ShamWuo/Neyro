"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDemoStore } from '@/store/demo-store';

export function FloatingCaptureButton() {
    const setCaptureOpen = useDemoStore(state => state.setCaptureOpen);

    return (
        <motion.button
            onClick={() => setCaptureOpen(true)}
            initial={{ scale: 1 }}
            animate={{ scale: [1.0, 1.04, 1.0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", times: [0, 0.03, 0.06] }}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#5B52E6] shadow-[0_4px_16px_rgba(108,99,255,0.2)] flex items-center justify-center text-white z-50 hover:scale-105 active:scale-95 transition-transform group"
        >
            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </motion.button>
    );
}
