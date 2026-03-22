import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-0 w-full">
            <main className="max-w-[1000px] mx-auto w-full py-2 md:py-4">
                {children}
            </main>
        </div>
    );
}
