import type { Metadata, Viewport } from 'next';
import './globals.css';
import Link from 'next/link';
import { Scissors, Sparkles, Home, Camera } from 'lucide-react';

export const metadata: Metadata = {
  title: 'BarberVision AI - Smart Haircut Advisor',
  description:
    'Sistem konsultasi gaya rambut pintar untuk barbershop berbasis deteksi landmark wajah dan proporsi geometri MediaPipe AI.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080B11',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-background text-zinc-100 flex flex-col antialiased selection:bg-barber-gold selection:text-background">
        {/* Persistent Barbershop Header */}
        <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-lg">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-barber-gold to-barber-amber flex items-center justify-center text-background shadow-md shadow-barber-gold/20 group-hover:scale-105 transition-transform">
                <Scissors className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black tracking-wider text-base text-zinc-100">
                    BARBER<span className="text-barber-gold">VISION</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-barber-gold/20 text-barber-gold px-1.5 py-0.5 rounded border border-barber-gold/30">
                    AI PRO
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">Smart Haircut Advisor</p>
              </div>
            </Link>

            {/* Quick Header Nav Links */}
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-surface-hover transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Katalog</span>
              </Link>

              <Link
                href="/scan"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-surface-border hover:bg-surface-hover text-barber-gold border border-barber-gold/30 transition-all hover:border-barber-gold shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Konsultasi Baru</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Subtle Footer */}
        <footer className="border-t border-surface-border py-4 px-4 text-center text-xs text-zinc-500 bg-surface/40">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© BarberVision AI - Powered by MediaPipe 468 Face Mesh & FastAPI</span>
            <span className="text-zinc-400">Dirancang khusus untuk iPad & Smartphone Kursi Barbershop</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
