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
  Camera,
  Upload,
  User,
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
  const [customFacePhoto, setCustomFacePhoto] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveFacePhoto = customFacePhoto || customerPhotoUrl;

  // Trigger try-on when modal opens with a haircut and face photo
  useEffect(() => {
    if (isOpen && haircut && effectiveFacePhoto) {
      handleGenerateTryOn(effectiveFacePhoto);
    } else if (isOpen && !effectiveFacePhoto) {
      setTryOnResult(null);
      setErrorMessage(null);
    }
  }, [isOpen, haircut?.id, effectiveFacePhoto]);

  const handleGenerateTryOn = async (photoToUse: string) => {
    if (!haircut || !photoToUse) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await requestVirtualTryOn(
        photoToUse,
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCustomFacePhoto(dataUrl);
      };
      reader.readAsDataURL(file);
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
    const afterImg = tryOnResult?.after_image_base64 || effectiveFacePhoto;
    if (!afterImg) return;
    const link = document.createElement('a');
    link.href = afterImg;
    link.download = `barbervision-${haircut?.name.toLowerCase().replace(/\s+/g, '-')}-after.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !haircut) return null;

  // After photo must ALWAYS show customer face with new hair, NEVER stock model photo
  const afterImageSrc = tryOnResult?.after_image_base64 || effectiveFacePhoto || '';

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
                  Simulasi After Potong
                </Badge>
              </div>
              <p className="text-xs text-zinc-400">{haircut.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            {effectiveFacePhoto && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="hidden sm:flex items-center gap-1.5 text-xs rounded-xl border-surface-border hover:border-barber-gold/50 text-zinc-300"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Foto Wajah</span>
              </Button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-border text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center gap-5">
          {/* Case 1: No Customer Face Photo Uploaded */}
          {!effectiveFacePhoto ? (
            <div className="w-full max-w-2xl aspect-[4/3] rounded-2xl bg-zinc-950 border-2 border-dashed border-barber-gold/40 p-6 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-barber-gold/10 border border-barber-gold/30 flex items-center justify-center text-barber-gold shadow-lg">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-black text-white">
                  Unggah Foto Wajah Anda Terlebih Dahulu
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                  Agar hasil simulasi menampilkan wajah asli Anda mengenakan gaya rambut{' '}
                  <strong className="text-barber-gold">{haircut.name}</strong>, silakan pilih foto selfie atau foto tampak depan Anda.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 text-xs sm:text-sm font-bold rounded-xl bg-barber-gold text-zinc-950 hover:brightness-110 shadow-lg shadow-barber-gold/20"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih Foto Selfie / Wajah Saya</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Case 2: Customer Face Photo is Present */
            <div className="w-full max-w-2xl flex flex-col items-center">
              {isLoading ? (
                <div className="w-full aspect-[4/3] rounded-2xl bg-zinc-950 border border-surface-border flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-barber-gold to-transparent animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_15px_#D4AF37]" />
                  <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
                    <div className="w-12 h-12 rounded-full border-2 border-barber-gold/30 border-t-barber-gold animate-spin" />
                    <p className="text-sm font-bold text-white">AI Sedang Memasangkan Gaya Rambut di Wajah Anda...</p>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Mendeteksi kontur kepala dan memposisikan mahkota rambut {haircut.name} tepat di dahi wajah Anda.
                    </p>
                  </div>
                </div>
              ) : errorMessage ? (
                <div className="w-full aspect-[4/3] rounded-2xl bg-red-950/20 border border-red-500/40 p-6 flex flex-col items-center justify-center gap-3 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                  <p className="text-sm font-bold text-red-200">{errorMessage}</p>
                  <Button
                    onClick={() => handleGenerateTryOn(effectiveFacePhoto)}
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
                    {/* Under layer: AFTER (Customer Face with New Haircut) */}
                    <img
                      src={afterImageSrc}
                      alt="After Haircut (Wajah Anda)"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-emerald-950/90 backdrop-blur border border-emerald-500/50 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      AFTER (Wajah Anda + {haircut.name})
                    </div>

                    {/* Over layer: BEFORE (Original Customer Face Photo) clipped by slider */}
                    <div
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={effectiveFacePhoto}
                        alt="Before Original (Wajah Asli Anda)"
                        className="absolute inset-0 w-full h-full object-cover max-w-none"
                        style={{
                          width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                          height: '100%',
                        }}
                      />
                      <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/90 backdrop-blur border border-zinc-700 text-[11px] font-bold text-zinc-200 shadow-md">
                        BEFORE (Wajah Asli Anda)
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] z-30 pointer-events-none"
                      style={{ left: `calc(${sliderPosition}% - 0.5px)` }}
                    >
                      {/* Handle Pill */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-2xl border border-zinc-300">
                        <Sliders className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Instruction */}
                  <div className="flex flex-wrap items-center justify-between w-full text-xs text-zinc-400 gap-2 px-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sliders className="w-3.5 h-3.5 text-barber-gold" />
                      Geser garis untuk membandingkan wajah asli vs setelah potong
                    </span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-barber-gold hover:underline font-semibold flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      Ganti Foto Wajah
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
              {effectiveFacePhoto && (
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1 sm:flex-initial gap-2 text-xs font-bold rounded-xl border-surface-border hover:border-zinc-500"
                >
                  <Download className="w-3.5 h-3.5" />
                  Simpan Foto
                </Button>
              )}
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
