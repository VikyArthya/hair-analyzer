'use client';

import React from 'react';
import { CaptureAngle } from '@/types';
import { Camera, Check, RefreshCw } from 'lucide-react';

interface AnglePreviewCardProps {
  angle: CaptureAngle;
  title: string;
  subtitle: string;
  image: string | null;
  isActive: boolean;
  isRequired?: boolean;
  onSelect: () => void;
  onRetake: () => void;
}

export const AnglePreviewCard: React.FC<AnglePreviewCardProps> = ({
  angle,
  title,
  subtitle,
  image,
  isActive,
  isRequired,
  onSelect,
  onRetake,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 p-2 flex items-center gap-3 ${
        isActive
          ? 'border-barber-gold bg-surface-hover shadow-lg shadow-barber-gold/10'
          : 'border-surface-border bg-surface hover:border-zinc-700'
      }`}
    >
      {/* Thumbnail or Empty Placeholder */}
      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-background border border-surface-border flex-shrink-0 flex items-center justify-center">
        {image ? (
          <>
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute top-1 right-1 w-5 h-5 bg-accent-emerald text-background rounded-full flex items-center justify-center shadow">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-500">
            <Camera className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{angle}</span>
          </div>
        )}
      </div>

      {/* Info & Actions */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-zinc-100 truncate">{title}</h4>
          {isRequired && (
            <span className="text-[10px] uppercase font-bold text-barber-gold bg-barber-gold/10 px-1.5 py-0.5 rounded">
              Wajib
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 truncate">{subtitle}</p>

        <div className="mt-1 flex items-center gap-2">
          {image ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetake();
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-barber-gold transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Foto Ulang</span>
            </button>
          ) : (
            <span className="text-xs text-zinc-500 italic">Klik untuk memotret</span>
          )}
        </div>
      </div>
    </div>
  );
};
