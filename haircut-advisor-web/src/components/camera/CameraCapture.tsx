'use client';

import React, { useRef, useState } from 'react';
import { CaptureAngle } from '@/types';
import { useCamera } from '@/hooks/useCamera';
import { SilhouetteOverlay } from './SilhouetteOverlay';
import {
  Camera,
  SwitchCamera,
  Zap,
  ZapOff,
  Upload,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  currentAngle: CaptureAngle;
  onPhotoCaptured: (angle: CaptureAngle, dataUrl: string) => void;
  onAngleChange: (angle: CaptureAngle) => void;
}

const ANGLE_INFO: Record<
  CaptureAngle,
  {
    title: string;
    badge: string;
    instructions: string;
  }
> = {
  front: {
    title: 'Tampak Depan',
    badge: 'Langkah 1 (Wajib)',
    instructions: 'Posisikan mata sejajar garis biru, tegakkan kepala lurus ke kamera.',
  },
  side: {
    title: 'Tampak Samping',
    badge: 'Langkah 2 (Opsional)',
    instructions: 'Putar kepala 90° ke samping untuk mengukur sudut rahang.',
  },
  back: {
    title: 'Tampak Belakang',
    badge: 'Langkah 3 (Opsional)',
    instructions: 'Arahkan kamera ke belakang kepala untuk kepadatan rambut & batas tengkuk.',
  },
};

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  currentAngle,
  onPhotoCaptured,
  onAngleChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);

  const {
    videoRef,
    isLoading,
    error,
    facingMode,
    isTorchOn,
    hasTorch,
    toggleFacingMode,
    toggleTorch,
    capturePhoto,
    startCamera,
    loadPhotoFromFile,
  } = useCamera({ initialFacingMode: 'environment' });

  const handleShutter = () => {
    // Shutter animation
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 150);

    const dataUrl = capturePhoto();
    if (dataUrl) {
      onPhotoCaptured(currentAngle, dataUrl);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await loadPhotoFromFile(file);
        onPhotoCaptured(currentAngle, dataUrl);
      } catch (err) {
        console.error('File load error:', err);
      }
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-black rounded-3xl overflow-hidden border border-surface-border shadow-2xl flex flex-col aspect-[3/4] sm:aspect-[4/5]">
      {/* Hidden File Input for Fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Angle Selection Tabs Header */}
      <div className="absolute top-0 inset-x-0 z-30 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-surface/80 backdrop-blur-md border border-surface-border">
          {(['front', 'side', 'back'] as CaptureAngle[]).map((angle) => {
            const isActive = currentAngle === angle;
            return (
              <button
                key={angle}
                onClick={() => onAngleChange(angle)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                  isActive
                    ? 'bg-barber-gold text-background shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {ANGLE_INFO[angle].title}
              </button>
            );
          })}
        </div>

        {/* Live Guideline Banner */}
        <div className="mt-2 text-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-300 bg-background/70 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
            <Sparkles className="w-3 h-3 text-barber-gold" />
            {ANGLE_INFO[currentAngle].instructions}
          </span>
        </div>
      </div>

      {/* Video Viewfinder Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-zinc-950 flex items-center justify-center">
        {error ? (
          <div className="p-6 text-center max-w-xs flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent-rose/20 text-accent-rose flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-100">Kamera Tidak Tersedia</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
            <div className="flex flex-col w-full gap-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => startCamera()}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Coba Akses Lagi
              </Button>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Unggah Foto dari Galeri
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />
            {/* SVG Silhouette Guide */}
            <SilhouetteOverlay angle={currentAngle} />

            {/* Shutter flash effect */}
            {shutterFlash && (
              <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-150" />
            )}
          </>
        )}
      </div>

      {/* Camera Controls Footer Bar */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black via-black/70 to-transparent">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          {/* Torch / Flash Toggle (or Gallery Upload fallback) */}
          {hasTorch ? (
            <button
              onClick={toggleTorch}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                isTorchOn
                  ? 'bg-barber-gold text-background border-barber-gold'
                  : 'bg-surface/80 text-zinc-300 border-surface-border hover:bg-surface'
              }`}
              title="Flash / Torch"
            >
              {isTorchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur text-zinc-300 border border-surface-border flex items-center justify-center hover:text-barber-gold transition-colors"
              title="Unggah dari Galeri"
            >
              <Upload className="w-5 h-5" />
            </button>
          )}

          {/* Primary Shutter Button */}
          <button
            onClick={handleShutter}
            disabled={Boolean(error) || isLoading}
            className="w-20 h-20 rounded-full border-4 border-white/80 p-1 flex items-center justify-center group active:scale-95 transition-transform disabled:opacity-40"
            title="Ambil Foto"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-barber-gold to-barber-amber flex items-center justify-center shadow-lg group-hover:scale-95 transition-transform">
              <Camera className="w-8 h-8 text-background stroke-[2.5]" />
            </div>
          </button>

          {/* Camera Flip (Front / Back) */}
          <button
            onClick={toggleFacingMode}
            disabled={Boolean(error)}
            className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur text-zinc-300 border border-surface-border flex items-center justify-center hover:text-barber-gold transition-colors active:rotate-180 duration-300 disabled:opacity-40"
            title="Putar Kamera"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
