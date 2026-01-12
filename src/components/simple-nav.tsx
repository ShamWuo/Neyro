"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/areas", label: "Areas" },
    { href: "/resources", label: "Resources" },
    { href: "/archive", label: "Archive" },
];

export function SimpleNav() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-[var(--border-subtle)] bg-[var(--bg)]/80 backdrop-blur-md px-6">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                        Neyro
                    </Link>
                    <div className="flex items-center gap-1">
                        {links.map((link) => {
                            const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "rounded-md px-3 py-2 text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-[var(--surface-muted)] text-[var(--text-primary)]"
                                            : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Add user profile/logout here if needed */}
                </div>
            </div>
        </nav>
    );
}
