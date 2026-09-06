import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PresenceProvider } from "@/lib/presence-context";
import AppShell from "@/components/layout/AppShell";
import PushBannerNotification from "@/components/common/PushBannerNotification";

export const metadata: Metadata = {
  title: "AquaEarth Operations Platform",
  description: "Enterprise multi-disciplinary consulting, engineering, and field operations platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <PresenceProvider>
            <PushBannerNotification />
            <AppShell>
              {children}
            </AppShell>
          </PresenceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
