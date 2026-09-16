'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HaircutModel, TryOnResult } from '@/types';
import { requestVirtualTryOn } from '@/services/api';
import {
  X,
  Sparkles,
  Scissors,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  haircut: HaircutModel | null;
  customerPhotoUrl: string | null;
  onShowToBarber: (haircut: HaircutModel) => void;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
  haircut,
  customerPhotoUrl,
  onShowToBarber,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger try-on when modal opens with a haircut
  useEffect(() => {
    if (isOpen && haircut && customerPhotoUrl) {
      handleGenerateTryOn();
    } else {
      setTryOnResult(null);
      setErrorMessage(null);
      setSliderPosition(50);
    }
  }, [isOpen, haircut?.id]);

  const handleGenerateTryOn = async () => {
    if (!haircut || !customerPhotoUrl) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await requestVirtualTryOn(
        customerPhotoUrl,
        haircut.id,
        haircut.name,
        haircut.imageUrl,
        `${haircut.guardNumber} | ${haircut.fadeType}`
      );
      setTryOnResult(result);
    } catch (err: any) {
      console.error('Try-on generation error:', err);
      setErrorMessage(err?.message || 'Gagal memproses simulasi gaya rambut.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updateSlider(e.touches[0].clientX);
    }
  };

  const handleDownload = () => {
    const afterImg = tryOnResult?.after_image_base64 || haircut?.imageUrl;
    if (!afterImg) return;
    const link = document.createElement('a');
    link.href = afterImg;
    link.download = `barbervision-${haircut?.name.toLowerCase().replace(/\s+/g, '-')}-after.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !haircut) return null;

  const afterImageSrc = tryOnResult?.after_image_base64 || haircut.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-surface border border-surface-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-barber-gold/20 border border-barber-gold/40 flex items-center justify-center text-barber-gold shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{haircut.name}</h3>
                <Badge variant="default" className="text-[10px] bg-accent-cyan/20 text-accent-cyan border-accent-cyan/40">
                  AI Virtual Try-On
                </Badge>
              </div>
              <p className="text-xs text-zinc-400">{haircut.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-border text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center gap-5">
          {/* Main Visual Comparison Slider */}
          <div className="w-full max-w-2xl flex flex-col items-center">
            {isLoading ? (
              <div className="w-full aspect-[4/3] rounded-2xl bg-zinc-950 border border-surface-border flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                {/* Animated scan line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-barber-gold to-transparent animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_15px_#D4AF37]" />
                <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
                  <div className="w-12 h-12 rounded-full border-2 border-barber-gold/30 border-t-barber-gold animate-spin" />
                  <p className="text-sm font-bold text-white">AI Sedang Mentransfer Gaya Rambut...</p>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Menyesuaikan tekstur {haircut.name}, kontur kepala, dan pencahayaan wajah asli Anda.
                  </p>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="w-full aspect-[4/3] rounded-2xl bg-red-950/20 border border-red-500/40 p-6 flex flex-col items-center justify-center gap-3 text-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-sm font-bold text-red-200">{errorMessage}</p>
                <Button
                  onClick={handleGenerateTryOn}
                  variant="outline"
                  className="gap-2 text-xs rounded-xl border-red-500/40 hover:bg-red-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-3">
                {/* Before / After Container */}
                <div
                  ref={containerRef}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-2xl border border-surface-border bg-black"
                >
                  {/* Under layer: AFTER (New Haircut) */}
                  <img
                    src={afterImageSrc}
                    alt="After Haircut"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur border border-emerald-500/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    AFTER (Gaya Baru)
                  </div>

                  {/* Over layer: BEFORE (Original Customer Photo) clipped by slider */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={customerPhotoUrl || haircut.imageUrl}
                      alt="Before Original"
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                      style={{
                        width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                        height: '100%',
                      }}
                    />
                    <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur border border-zinc-700 text-[11px] font-bold text-zinc-300">
                      BEFORE (Asli)
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-30 pointer-events-none"
                    style={{ left: `calc(${sliderPosition}% - 0.5px)` }}
                  >
                    {/* Handle Pill */}
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-lg border border-zinc-300">
                      <Sliders className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Instruction */}
                <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                  <Sliders className="w-3.5 h-3.5 text-barber-gold" />
                  Geser garis pemisah ke kiri/kanan untuk membandingkan foto asli vs gaya rambut baru
                </p>
              </div>
            )}
          </div>

          {/* Barber Technical Specifications Banner */}
          <div className="w-full bg-surface-hover/80 border border-surface-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-barber-gold" />
                <span className="text-xs font-bold text-barber-gold uppercase tracking-wider">
                  Panduan Potong untuk Barber
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                <strong className="text-white">Sepatu Cukur:</strong> {haircut.guardNumber} &bull;{' '}
                <strong className="text-white">Teknik Fade:</strong> {haircut.fadeType} &bull;{' '}
                <strong className="text-white">Panjang Atas:</strong> {haircut.topLength}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1 sm:flex-initial gap-2 text-xs font-bold rounded-xl border-surface-border hover:border-zinc-500"
              >
                <Download className="w-3.5 h-3.5" />
                Simpan Foto
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  onShowToBarber(haircut);
                }}
                className="flex-1 sm:flex-initial gap-2 text-xs font-bold rounded-xl bg-barber-gold text-zinc-950 hover:brightness-110 shadow-md"
              >
                <Eye className="w-3.5 h-3.5" />
                Mode Barber
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
