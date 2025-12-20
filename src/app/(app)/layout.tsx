import { redirect } from "next/navigation";
import { neonAuth } from "@neondatabase/neon-js/auth/next";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const { session } = await neonAuth();

    if (!session) {
        redirect("/auth/sign-in");
    }

    return <AppShell>{children}</AppShell>;
}
