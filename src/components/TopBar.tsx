"use client";

import { UserButton } from "@neondatabase/neon-js/auth/react/ui";

export function TopBar() {
    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16">
            <UserButton size="icon" />
        </header>
    );
}
