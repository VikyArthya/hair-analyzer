'use client';

import React from 'react';
import { HaircutModel } from '@/types';
import { Scissors, Sparkles, Eye, CheckCircle, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface HaircutCardProps {
  haircut: HaircutModel;
  rank: number;
  onShowToBarber: (haircut: HaircutModel) => void;
  onTryOn?: (haircut: HaircutModel) => void;
}

export const HaircutCard: React.FC<HaircutCardProps> = ({
  haircut,
  rank,
  onShowToBarber,
  onTryOn,
}) => {

  return (
    <Card className="overflow-hidden border-surface-border bg-gradient-to-b from-surface to-surface-hover/80 hover:border-barber-gold/50 transition-all duration-300 flex flex-col group">
      {/* Haircut Reference Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
        <img
          src={haircut.imageUrl}
          alt={haircut.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <Badge
            variant="default"
            className="font-bold bg-background/90 backdrop-blur border-barber-gold text-barber-gold"
          >
            #{rank} Rekomendasi
          </Badge>
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {haircut.stylingDifficulty} Styling
          </Badge>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-3 inset-x-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-cyan block">
            {haircut.category}
          </span>
          <h3 className="text-xl font-black text-white leading-tight">{haircut.name}</h3>
          <p className="text-xs text-zinc-300">{haircut.subtitle}</p>
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
        {/* Rationale "Kenapa Cocok" */}
        <div className="p-3.5 rounded-2xl bg-barber-gold/10 border border-barber-gold/30">
          <div className="flex items-center gap-1.5 text-xs font-bold text-barber-gold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Kenapa Cocok dengan Wajah Anda
          </div>
          <p className="text-xs font-medium text-zinc-200 leading-relaxed">
            {haircut.matchReason}
          </p>
        </div>

        {/* Technical Specs Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-background border border-surface-border">
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Fade Samping</span>
            <span className="text-zinc-200 font-semibold truncate block">{haircut.fadeType}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-background border border-surface-border">
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Sepatu (Guard)</span>
            <span className="text-barber-gold font-bold truncate block">{haircut.guardNumber}</span>
          </div>
        </div>

        {/* Recommended Products */}
        <div>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Produk Styling Ideal
          </span>
          <div className="flex flex-wrap gap-1.5">
            {haircut.recommendedProducts.map((prod, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-surface-border text-zinc-300 border border-zinc-700/50"
              >
                {prod}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          {onTryOn && (
            <Button
              type="button"
              onClick={() => onTryOn(haircut)}
              className="w-full gap-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-barber-gold/20 via-amber-500/20 to-barber-gold/20 border border-barber-gold/50 text-barber-gold hover:bg-barber-gold/30 hover:border-barber-gold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-barber-gold animate-pulse" />
              <span>✨ Coba di Wajah Saya (After Cut)</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => onShowToBarber(haircut)}
            className="w-full gap-2 rounded-xl text-xs sm:text-sm font-bold border-surface-border hover:border-zinc-500 text-zinc-200"
          >
            <Eye className="w-4 h-4" />
            <span>Tunjukkan ke Barber</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

