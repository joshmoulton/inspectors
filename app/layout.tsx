import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/auth";
import { Toaster } from 'sonner';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import NavigationProgress from '@/components/NavigationProgress';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Powerade | Inspection Management",
  description: "Modern inspection order management platform",
};

async function SidebarWithData({ user }: { user: any }) {
  const openOrdersCount = await prisma.workOrder.count({
    where: { status: 'Open' }
  });
  return <Sidebar user={user} openOrdersCount={openOrdersCount} />;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <Suspense><NavigationProgress /></Suspense>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <div className="app-layout">
          {session && (
            <Suspense fallback={<aside className="sidebar" />}>
              <SidebarWithData user={session.user} />
            </Suspense>
          )}
          <main id="main-content" className={session ? "main-content" : "w-full"}>
            {children}
          </main>
        </div>
        {session && <KeyboardShortcuts />}
        <Toaster theme="dark" position="bottom-right" className="powerade-toaster" richColors closeButton />
      </body>
    </html>
  );
}
