"use client";

import React from 'react';
import { AppSidebar } from './AppSidebar';
import { motion } from 'framer-motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#020204]">
            <AppSidebar />
            <main className="lg:pl-64 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="container max-w-7xl mx-auto p-4 md:p-8 pt-20 lg:pt-8"
                >
                    {children}
                </motion.div>
            </main>

            {/* Mobile nav placeholder - to be implemented fully later */}
            <div className="lg:hidden fixed bottom-0 w-full glass border-t border-white/10 p-4 flex justify-around items-center z-50">
                <span className="text-xs text-neutral-500">Mobile Menu</span>
            </div>
        </div>
    );
}
