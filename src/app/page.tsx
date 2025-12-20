import { redirect } from "next/navigation";
import { neonAuth } from "@neondatabase/neon-js/auth/next";

/*export default async function Home() {
  const { session } = await neonAuth();

  // If logged in, go to app
  if (session) redirect("/dashboard");

  // If not logged in, go to sign-in (and stop looping)
  redirect("/auth/sign-in");
}*/
export default function Home() {
    return (
        <main style={{ padding: 24 }}>
            <h1>Home</h1>
            <p>Go to <a href="/auth/sign-in">/auth/sign-in</a></p>
            <p>Then try <a href="/account/settings">/account/settings</a></p>
        </main>
    );
}
