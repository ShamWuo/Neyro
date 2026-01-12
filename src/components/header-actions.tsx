"use client";

import dynamic from "next/dynamic";

const QuickCaptureButton = dynamic(() => import("@/components/quick-capture-button"), { ssr: false });
const ActiveProjectsBadge = dynamic(() => import("@/components/active-projects-badge"), { ssr: false });
const QuickCaptureHint = dynamic(() => import("@/components/quick-capture-hint"), { ssr: false });

export function HeaderActions() {
    return (
        <div className="header-actions">
            <ActiveProjectsBadge />
            <QuickCaptureButton />
            <QuickCaptureHint />
        </div>
    );
}
