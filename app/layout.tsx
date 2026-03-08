import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/auth";
import { Toaster } from 'sonner';
import prisma from '@/lib/prisma';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Powerade | Inspection Management",
  description: "Modern inspection order management platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  let openOrdersCount = 0;
  if (session) {
    openOrdersCount = await prisma.workOrder.count({
      where: { status: 'Open' }
    });
  }

  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          {session && <Sidebar user={session.user} openOrdersCount={openOrdersCount} />}
          <main className={session ? "main-content" : "w-full"}>
            {children}
          </main>
        </div>
        <Toaster theme="dark" position="bottom-right" className="powerade-toaster" />
      </body>
    </html>
  );
}
