import { neonAuth } from "@neondatabase/neon-js/auth/next";

export default async function DebugSession() {
    const { session, user } = await neonAuth();
    return (
        <pre>{JSON.stringify({ hasSession: !!session, user }, null, 2)}</pre>
    );
}
