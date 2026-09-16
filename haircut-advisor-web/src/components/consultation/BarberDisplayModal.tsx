'use client';

import React from 'react';
import { HaircutModel } from '@/types';
import { X, Scissors, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BarberDisplayModalProps {
  haircut: HaircutModel | null;
  clientPhoto: string | null;
  faceShapeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BarberDisplayModal: React.FC<BarberDisplayModalProps> = ({
  haircut,
  clientPhoto,
  faceShapeName,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !haircut) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto flex flex-col p-4 md:p-8 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-border max-w-5xl mx-auto w-full">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-barber-gold animate-pulse" />
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-zinc-100 uppercase">
              Mode Konsultasi Kursi Barber
            </h2>
          </div>
          <p className="text-xs md:text-sm text-zinc-400">
            Tunjukkan layar ini ke Barber untuk panduan teknis potongan rambut & clipper guard
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="rounded-full h-10 px-4 gap-2 bg-surface-border text-zinc-200 hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
          <span>Tutup</span>
        </Button>
      </div>

      {/* Main Comparison Area */}
      <div className="max-w-5xl mx-auto w-full py-6 flex-1 flex flex-col gap-6">
        {/* Side-by-Side Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Client Captured Photo */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-barber-gold/40 bg-surface shadow-2xl flex flex-col">
            <div className="p-3 bg-surface-border/80 flex items-center justify-between border-b border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-barber-gold">
                Foto Klien Anda
              </span>
              <Badge variant="default" className="text-[11px]">
                {faceShapeName}
              </Badge>
            </div>
            <div className="relative flex-1 min-h-[320px] md:min-h-[420px] bg-black">
              {clientPhoto ? (
                <img
                  src={clientPhoto}
                  alt="Client portrait"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  Foto klien tidak tersedia
                </div>
              )}
            </div>
          </div>

          {/* Haircut Target Model */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-accent-cyan/40 bg-surface shadow-2xl flex flex-col">
            <div className="p-3 bg-surface-border/80 flex items-center justify-between border-b border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                Referensi Gaya Rambut
              </span>
              <Badge variant="cyan" className="text-[11px]">
                {haircut.category}
              </Badge>
            </div>
            <div className="relative flex-1 min-h-[320px] md:min-h-[420px] bg-black">
              <img
                src={haircut.imageUrl}
                alt={haircut.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-5">
                <h3 className="text-2xl font-black text-white">{haircut.name}</h3>
                <p className="text-sm text-zinc-300">{haircut.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Barber Instructions Box */}
        <div className="rounded-3xl border border-barber-gold/50 bg-gradient-to-br from-surface to-surface-hover p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-surface-border">
            <div className="w-10 h-10 rounded-2xl bg-barber-gold/20 flex items-center justify-center text-barber-gold">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-black text-zinc-100">
                Panduan Teknis Untuk Barber (Clipper & Scissor Spec)
              </h4>
              <p className="text-xs text-zinc-400">
                Gunakan pengaturan berikut untuk hasil potongan yang presisi dan sesuai proporsi wajah
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="p-4 rounded-2xl bg-background/80 border border-surface-border">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold block mb-1">
                Tipe Fade / Samping
              </span>
              <span className="text-base font-bold text-accent-cyan block">
                {haircut.fadeType}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border border-surface-border">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold block mb-1">
                Ukuran Sepatu (Guard Number)
              </span>
              <span className="text-base font-bold text-barber-gold block">
                {haircut.guardNumber}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border border-surface-border">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold block mb-1">
                Panjang Bagian Atas
              </span>
              <span className="text-base font-bold text-accent-emerald block">
                {haircut.topLength}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-barber-gold/10 border border-barber-gold/30 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-barber-gold flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Catatan Khusus Barber
            </span>
            <p className="text-sm font-medium text-zinc-200 leading-relaxed">
              {haircut.barberNotes}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Langkah Styling Harian
              </span>
              <ul className="space-y-1.5">
                {haircut.stylingTips.map((tip, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Rekomendasi Produk Barbershop
              </span>
              <div className="flex flex-wrap gap-2">
                {haircut.recommendedProducts.map((prod, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-3 py-1 rounded-xl bg-surface-border border border-zinc-700 text-zinc-200"
                  >
                    {prod}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Dismiss button */}
        <div className="text-center pt-2">
          <Button
            size="lg"
            onClick={onClose}
            className="w-full sm:w-auto px-12"
          >
            Selesai Konsultasi
          </Button>
        </div>
      </div>
    </div>
  );
};
