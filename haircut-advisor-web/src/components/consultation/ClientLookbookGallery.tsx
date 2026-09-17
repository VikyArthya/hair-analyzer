'use client';

import React, { useState } from 'react';
import { GeneratedClientHaircut } from '@/types';
import {
  Sparkles,
  Scissors,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  Flame,
  Award,
  ShieldCheck,
  Check,
  Eye,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { HaircutVisualOverlay } from '@/components/consultation/HaircutVisualOverlay';

interface ClientLookbookGalleryProps {
  lookbook: GeneratedClientHaircut[];
  clientPhotoUrl: string | null;
  faceShapeName: string;
  onShowToBarber: (haircut: GeneratedClientHaircut) => void;
}

export const ClientLookbookGallery: React.FC<ClientLookbookGalleryProps> = ({
  lookbook,
  clientPhotoUrl,
  faceShapeName,
  onShowToBarber,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({});

  // Categories extracted from lookbook
  const categories = ['Semua', ...Array.from(new Set(lookbook.map((item) => item.category)))];

  const filteredLookbook =
    selectedCategory === 'Semua'
      ? lookbook
      : lookbook.filter((item) => item.category === selectedCategory);

  const toggleShowOriginal = (id: string) => {
    setShowOriginalMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpand = (id: string) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-barber-gold/20 text-barber-gold text-xs font-black uppercase tracking-wider border border-barber-gold/40 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Lookbook Personal di Wajah Klien (Google Gemini AI)
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {lookbook.length} Variasi Gaya Rambut Terbaik
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 mt-1 max-w-2xl">
            Semua rekomendasi di bawah ini telah dirender <strong>langsung pada foto wajah klien</strong> sesuai dengan proporsi bentuk wajah <strong className="text-barber-gold">{faceShapeName}</strong>. Tidak menggunakan foto model lain!
          </p>
        </div>

        {/* Global info pill */}
        <div className="flex items-center gap-2 bg-surface p-2 px-3.5 rounded-2xl border border-surface-border text-xs text-zinc-300 flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-accent-emerald" />
          <span>Dilengkapi spesifikasi clipper & fade</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-barber-gold text-black shadow-lg shadow-barber-gold/25 scale-[1.02]'
                : 'bg-surface hover:bg-surface-hover text-zinc-300 border border-surface-border'
            }`}
          >
            {cat} {cat === 'Semua' ? `(${lookbook.length})` : ''}
          </button>
        ))}
      </div>

      {/* 6-8 Haircut Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLookbook.map((haircut, index) => {
          const isShowingOriginal = Boolean(showOriginalMap[haircut.id]);
          const isExpanded = expandedCardId === haircut.id;
          const displayImage =
            isShowingOriginal && clientPhotoUrl
              ? clientPhotoUrl
              : haircut.generated_image_url;

          return (
            <Card
              key={haircut.id}
              className="overflow-hidden border-surface-border bg-gradient-to-b from-surface via-surface to-surface-hover hover:border-barber-gold/50 transition-all duration-300 flex flex-col group rounded-3xl shadow-xl hover:shadow-2xl"
            >
              {/* Haircut Image Area (Direct Client Portrait with Haircut) */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                <img
                  src={displayImage}
                  alt={haircut.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent opacity-90" />

                {/* Visible Haircut Style Overlay */}
                {!isShowingOriginal && (
                  <HaircutVisualOverlay
                    styleId={haircut.id}
                    styleName={haircut.name}
                    category={haircut.category}
                  />
                )}

                {/* Top Badges Bar */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <Badge
                    variant="default"
                    className="font-bold bg-black/85 backdrop-blur-md border border-barber-gold/60 text-barber-gold text-[11px] gap-1 px-2.5 py-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    #{index + 1} Cocok ({haircut.match_percentage || 95}%)
                  </Badge>

                  <Badge
                    variant="emerald"
                    className="font-bold bg-black/85 backdrop-blur-md text-[10px] uppercase tracking-wider px-2 py-0.5"
                  >
                    {haircut.category}
                  </Badge>
                </div>

                {/* Before / After Toggle Button */}
                {clientPhotoUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleShowOriginal(haircut.id);
                    }}
                    className="absolute top-14 right-3 z-10 px-2.5 py-1 rounded-full bg-black/80 hover:bg-black text-[10px] font-bold text-zinc-200 border border-zinc-700/80 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
                  >
                    <Eye className="w-3 h-3 text-barber-gold" />
                    <span>{isShowingOriginal ? 'Lihat Rambut Baru' : 'Lihat Foto Asli'}</span>
                  </button>
                )}

                {/* Image Label Pill */}
                <div className="absolute top-14 left-3 z-10">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow ${
                      isShowingOriginal
                        ? 'bg-blue-600 text-white'
                        : 'bg-accent-emerald text-black'
                    }`}
                  >
                    {isShowingOriginal ? 'Foto Asli Klien' : 'Wajah Klien + Gaya Baru'}
                  </span>
                </div>

                {/* Bottom Title Info */}
                <div className="absolute bottom-3 inset-x-4 z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent-cyan block">
                    {haircut.subtitle}
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight mt-0.5">
                    {haircut.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                {/* Why it fits (Kenapa Cocok) */}
                <div className="p-3.5 rounded-2xl bg-barber-gold/10 border border-barber-gold/30">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-barber-gold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Analisis Kesesuaian Wajah</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {haircut.why_it_fits}
                  </p>
                </div>

                {/* Technical Specs 3-Column Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-background/90 border border-surface-border text-center">
                    <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">
                      Fade
                    </span>
                    <span className="text-accent-cyan font-bold text-[11px] truncate block mt-0.5">
                      {haircut.fade_type}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-background/90 border border-surface-border text-center">
                    <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">
                      Guard
                    </span>
                    <span className="text-barber-gold font-bold text-[11px] truncate block mt-0.5">
                      {haircut.guard_number}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-background/90 border border-surface-border text-center">
                    <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">
                      Atas
                    </span>
                    <span className="text-accent-emerald font-bold text-[11px] truncate block mt-0.5">
                      {haircut.top_length}
                    </span>
                  </div>
                </div>

                {/* Collapsible Styling Tips & Barber Notes */}
                {isExpanded && (
                  <div className="pt-2 border-t border-surface-border space-y-3 animate-in fade-in duration-200">
                    {/* Barber Technical Notes */}
                    <div className="p-3 rounded-xl bg-background/80 border border-zinc-700 text-xs">
                      <span className="font-bold text-barber-gold text-[10px] uppercase tracking-wider block mb-1">
                        Catatan Teknis Barber:
                      </span>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        {haircut.barber_notes}
                      </p>
                    </div>

                    {/* Daily Styling Tips */}
                    {haircut.styling_tips && haircut.styling_tips.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                          Tips Styling di Rumah:
                        </span>
                        <ul className="space-y-1">
                          {haircut.styling_tips.map((tip, idx) => (
                            <li key={idx} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-accent-emerald flex-shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Products */}
                    {haircut.recommended_products && haircut.recommended_products.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                          Produk Rekomendasi:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {haircut.recommended_products.map((prod, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-surface-border border border-zinc-700 text-zinc-200"
                            >
                              {prod}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    size="lg"
                    onClick={() => onShowToBarber(haircut)}
                    className="w-full h-11 rounded-xl gap-2 font-bold text-xs uppercase tracking-wider shadow-lg shadow-barber-gold/20"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Tunjukkan ke Barber</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpand(haircut.id)}
                    className="w-full text-zinc-400 hover:text-white text-xs gap-1.5 h-8"
                  >
                    <span>{isExpanded ? 'Tutup Detail Styling' : 'Lihat Tips & Produk'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
