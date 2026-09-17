'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaptureAngle, ClientImages, FaceAnalysisData } from '@/types';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { AnglePreviewCard } from '@/components/consultation/AnglePreviewCard';
import { analyzeFace } from '@/services/api';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SCAN_STEPS: { angle: CaptureAngle; title: string; subtitle: string; isRequired: boolean }[] = [
  {
    angle: 'front',
    title: 'Tampak Depan',
    subtitle: 'Wajib untuk deteksi landmark & rasio',
    isRequired: true,
  },
  {
    angle: 'side',
    title: 'Tampak Samping',
    subtitle: 'Opsional: proyeksi rahang & profil',
    isRequired: false,
  },
  {
    angle: 'back',
    title: 'Tampak Belakang',
    subtitle: 'Opsional: batas leher & pusar kepala',
    isRequired: false,
  },
];

export default function ScanPage() {
  const router = useRouter();
  const [currentAngle, setCurrentAngle] = useState<CaptureAngle>('front');
  const [images, setImages] = useState<ClientImages>({
    front: null,
    side: null,
    back: null,
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhotoCaptured = (angle: CaptureAngle, dataUrl: string) => {
    setImages((prev) => ({ ...prev, [angle]: dataUrl }));

    // Auto advance to next empty angle
    if (angle === 'front' && !images.side) {
      setCurrentAngle('side');
    } else if (angle === 'side' && !images.back) {
      setCurrentAngle('back');
    }
  };

  const handleRetake = (angle: CaptureAngle) => {
    setImages((prev) => ({ ...prev, [angle]: null }));
    setCurrentAngle(angle);
  };

  const handleSubmitAnalysis = async () => {
    if (!images.front) {
      setErrorMessage('Foto tampak depan wajib diambil terlebih dahulu.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    // Dynamic loading status simulation steps
    setAnalysisStatus('Mendeteksi 468 titik landmark wajah (MediaPipe Face Mesh)...');

    const statusTimer1 = setTimeout(() => {
      setAnalysisStatus('Menganalisis proporsi tulang pipi, dahi, dan sudut rahang...');
    }, 800);

    const statusTimer2 = setTimeout(() => {
      setAnalysisStatus('Google Gemini AI me-render 6-8 variasi gaya rambut di wajah klien...');
    }, 1800);

    try {
      const analysisResult: FaceAnalysisData = await analyzeFace(images);

      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
      setAnalysisStatus('Selesai! Menyiapkan lookbook personal klien...');

      // Save consultation to sessionStorage for /result page
      const sessionData = {
        id: 'session_' + Date.now(),
        timestamp: new Date().toISOString(),
        images,
        analysis: analysisResult,
      };

      sessionStorage.setItem('current_consultation', JSON.stringify(sessionData));

      // Also save to localStorage recent history
      try {
        const existing = JSON.parse(localStorage.getItem('barbervision_sessions') || '[]');
        const updated = [sessionData, ...existing.slice(0, 9)];
        localStorage.setItem('barbervision_sessions', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      setTimeout(() => {
        router.push('/result');
      }, 600);
    } catch (err: any) {
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Gagal menganalisis foto wajah klien.');
    }
  };

  const frontReady = Boolean(images.front);

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6 gap-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-zinc-100 flex items-center gap-2">
            <span>Panduan Pemotretan Klien</span>
            <Badge variant="cyan" className="text-[11px] uppercase">
              3 Sudut Barbershop
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400">
            Arahkan kamera ke wajah klien. Ikuti garis overlay untuk akurasi geometris maksimal.
          </p>
        </div>

        {/* Status Count Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">Progres Foto:</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-surface-border text-barber-gold border border-barber-gold/30">
            {[images.front, images.side, images.back].filter(Boolean).length} / 3 Sudut
          </span>
        </div>
      </div>

      {/* Main Interactive Camera Viewfinder */}
      <CameraCapture
        currentAngle={currentAngle}
        onPhotoCaptured={handlePhotoCaptured}
        onAngleChange={(angle) => setCurrentAngle(angle)}
      />

      {/* 3 Angles Preview Thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SCAN_STEPS.map((step) => (
          <AnglePreviewCard
            key={step.angle}
            angle={step.angle}
            title={step.title}
            subtitle={step.subtitle}
            image={images[step.angle]}
            isActive={currentAngle === step.angle}
            isRequired={step.isRequired}
            onSelect={() => setCurrentAngle(step.angle)}
            onRetake={() => handleRetake(step.angle)}
          />
        ))}
      </div>

      {/* Error Recovery Banner (if 422 or network error) */}
      {errorMessage && (
        <div className="rounded-2xl border border-accent-rose/50 bg-accent-rose/10 p-4 flex items-start gap-3 animate-in fade-in duration-200">
          <ShieldAlert className="w-5 h-5 text-accent-rose flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-accent-rose mb-0.5">Pemeriksaan Wajah Diperlukan</h4>
            <p className="text-zinc-200 leading-relaxed mb-2">{errorMessage}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  handleRetake('front');
                  setErrorMessage(null);
                }}
                className="h-8 px-3 text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Foto Ulang Tampak Depan</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Submit Action Bar */}
      <div className="sticky bottom-4 z-20 bg-background/90 backdrop-blur-lg p-3 rounded-2xl border border-surface-border shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-zinc-400 text-center sm:text-left">
          {frontReady ? (
            <span className="text-accent-emerald font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Foto tampak depan siap dianalisis AI!
            </span>
          ) : (
            <span className="text-zinc-400 italic">
              Ambil foto tampak depan untuk mengaktifkan analisis.
            </span>
          )}
        </div>

        <Button
          size="lg"
          disabled={!frontReady || isAnalyzing}
          onClick={handleSubmitAnalysis}
          className="w-full sm:w-auto h-14 px-8 rounded-xl font-black text-sm uppercase tracking-wider gap-2 shadow-lg shadow-barber-gold/20"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Menganalisis...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Analisis Bentuk Wajah & Rekomendasi</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Fullscreen AI Scanning Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="relative w-72 h-96 rounded-3xl overflow-hidden border-2 border-barber-gold/60 shadow-2xl shadow-barber-gold/20 bg-black flex items-center justify-center mb-6">
            {images.front && (
              <img
                src={images.front}
                alt="Scanning target"
                className="w-full h-full object-cover opacity-80"
              />
            )}

            {/* Glowing Scan Line Animation */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-barber-gold to-transparent shadow-[0_0_15px_#E5B869] animate-scan-line" />

            {/* Grid Coordinates Mesh Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          </div>

          <div className="text-center max-w-sm space-y-2">
            <div className="flex items-center justify-center gap-2 text-barber-gold font-bold text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI VISION COMPUTING</span>
            </div>
            <h3 className="text-lg font-black text-zinc-100">{analysisStatus}</h3>
            <p className="text-xs text-zinc-400">
              Menghitung jarak zygomatic arch, lebar dahi, dan kelengkungan mandibular rahang.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
