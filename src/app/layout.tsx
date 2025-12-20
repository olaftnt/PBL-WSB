import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "SERWIS IT",
    description: "IT Service Management Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl" suppressHydrationWarning>
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
