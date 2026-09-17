'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Scissors,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Share2,
  RotateCcw,
  ShieldCheck,
  Camera,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BarberDisplayModal } from '@/components/consultation/BarberDisplayModal';
import { ClientLookbookGallery } from '@/components/consultation/ClientLookbookGallery';
import { FACE_SHAPE_DETAILS } from '@/data/haircutCatalog';
import { getLookbookForShape } from '@/data/lookbookCatalog';
import { getSimulatedAnalysis } from '@/services/api';
import { FaceAnalysisData, GeneratedClientHaircut, ClientImages } from '@/types';

export default function ResultPage() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<FaceAnalysisData | null>(null);
  const [clientImages, setClientImages] = useState<ClientImages>({
    front: null,
    side: null,
    back: null,
  });
  const [isMetricsOpen, setIsMetricsOpen] = useState<boolean>(false);
  const [selectedHaircutForBarber, setSelectedHaircutForBarber] = useState<GeneratedClientHaircut | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('current_consultation');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnalysisData(parsed.analysis);
        if (parsed.images) {
          setClientImages(parsed.images);
        }
      } else {
        // Fallback for direct browser visits: provide simulation
        const fallback = getSimulatedAnalysis();
        setAnalysisData(fallback);
      }
    } catch (e) {
      setAnalysisData(getSimulatedAnalysis());
    }
  }, []);

  if (!analysisData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-barber-gold animate-spin mx-auto" />
          <p className="text-sm text-zinc-400">Memuat data rekomendasi...</p>
        </div>
      </div>
    );
  }

  const shapeKey = analysisData.face_shape.toLowerCase();
  const shapeDetails = FACE_SHAPE_DETAILS[shapeKey] || FACE_SHAPE_DETAILS.square;

  // Active Lookbook: Prefer Gemini-generated items from backend; fallback to shape templates
  const activeLookbook: GeneratedClientHaircut[] =
    analysisData.client_lookbook && analysisData.client_lookbook.length > 0
      ? analysisData.client_lookbook
      : getLookbookForShape(analysisData.face_shape, clientImages.front);

  const confidencePercent = Math.round(analysisData.confidence_score * 100);

  const handleShare = async () => {
    const primaryStyle = activeLookbook[0]?.name || 'Gaya Rambut Rekomendasi';
    const text = `Hasil Analisis Bentuk Wajah BarberVision: ${shapeDetails.nameId}. Rekomendasi lookbook klien: ${primaryStyle}.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hasil Konsultasi BarberVision',
          text,
          url: window.location.href,
        });
      } catch (e) {
        // Ignore user cancel
      }
    } else {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleShowToBarber = (haircut: GeneratedClientHaircut) => {
    setSelectedHaircutForBarber(haircut);
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-6 gap-6">
      {/* Top Banner Action Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="gap-1 px-3 py-1 font-bold text-xs uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Analisis Berhasil Disimpan
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-xs h-9 px-3"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareCopied ? 'Tersalin!' : 'Bagikan'}</span>
          </Button>

          <Link href="/scan">
            <Button size="sm" className="gap-1.5 text-xs h-9 px-3">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Konsultasi Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Face Shape & Client Summary Hero Card */}
      <div className="rounded-3xl border border-barber-gold/40 bg-gradient-to-br from-surface via-surface-hover to-background p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Client Photo Thumbnail */}
          <div className="relative w-32 h-40 md:w-36 md:h-48 rounded-2xl overflow-hidden bg-black border-2 border-barber-gold/60 shadow-xl flex-shrink-0">
            {clientImages.front ? (
              <img
                src={clientImages.front}
                alt="Client portrait"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                Foto Klien
              </div>
            )}
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="text-[10px] px-1.5 py-0.5 bg-black/80 backdrop-blur">
                Foto Klien
              </Badge>
            </div>
          </div>

          {/* Analysis Result Text */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge variant="default" className="text-xs uppercase font-bold tracking-wider">
                Bentuk Wajah Terdeteksi
              </Badge>
              <Badge variant="cyan" className="text-xs font-bold gap-1">
                <Award className="w-3.5 h-3.5" />
                {confidencePercent}% Confidence
              </Badge>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              {shapeDetails.nameId}
            </h1>

            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed max-w-2xl">
              {shapeDetails.description}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="text-xs px-3 py-1 rounded-xl bg-surface-border text-zinc-200 border border-zinc-700">
                Rahang: <strong className="text-barber-gold">{analysisData.features_detected.jaw_type}</strong>
              </span>
              <span className="text-xs px-3 py-1 rounded-xl bg-surface-border text-zinc-200 border border-zinc-700">
                Dahi: <strong className="text-barber-gold">{analysisData.features_detected.forehead_type}</strong>
              </span>
              <span className="text-xs px-3 py-1 rounded-xl bg-surface-border text-zinc-200 border border-zinc-700">
                Dagu: <strong className="text-barber-gold">{analysisData.features_detected.chin_type}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Goal Badge Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-barber-gold/15 border border-barber-gold/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-barber-gold flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-barber-gold uppercase tracking-wider block mb-0.5">
              Tujuan Styling Barber (Strategic Goal)
            </span>
            <p className="text-zinc-200 font-medium">
              {analysisData.haircut_guidance.goal}
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Geometric Metric Breakdown Card */}
      <Card className="border-surface-border bg-surface overflow-hidden">
        <button
          onClick={() => setIsMetricsOpen(!isMetricsOpen)}
          className="w-full p-4 flex items-center justify-between hover:bg-surface-hover transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-cyan" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Detail Perhitungan Geometri Landmark MediaPipe
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <span>{isMetricsOpen ? 'Tutup' : 'Lihat Detail'}</span>
            {isMetricsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isMetricsOpen && (
          <CardContent className="p-4 pt-0 border-t border-surface-border space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3 rounded-xl bg-background border border-surface-border">
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-1">
                  Rasio Panjang vs Lebar
                </span>
                <span className="text-base font-bold text-accent-cyan">
                  {analysisData.metrics.face_length_to_width_ratio}x
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Tinggi / Zygomatic Arch</span>
              </div>

              <div className="p-3 rounded-xl bg-background border border-surface-border">
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-1">
                  Lebar Dahi (Pelipis)
                </span>
                <span className="text-base font-bold text-zinc-200">
                  {analysisData.metrics.forehead_width_px} px
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Landmark 54 vs 284</span>
              </div>

              <div className="p-3 rounded-xl bg-background border border-surface-border">
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-1">
                  Lebar Tulang Pipi
                </span>
                <span className="text-base font-bold text-barber-gold">
                  {analysisData.metrics.cheekbone_width_px} px
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Landmark 234 vs 454</span>
              </div>

              <div className="p-3 rounded-xl bg-background border border-surface-border">
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-1">
                  Sudut Rahang (Angle)
                </span>
                <span className="text-base font-bold text-accent-emerald">
                  {analysisData.metrics.jaw_angle_degrees}°
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Sudut Gonion Dagu</span>
              </div>
            </div>

            {/* Optional Multi-View Notes if present */}
            {(analysisData.profile_analysis || analysisData.back_analysis) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {analysisData.profile_analysis && (
                  <div className="p-3 rounded-xl bg-surface-border/50 border border-zinc-700">
                    <span className="text-[10px] font-bold text-accent-cyan uppercase block mb-1">
                      Analisis Profil Samping:
                    </span>
                    <p className="text-zinc-300 text-[11px]">
                      {analysisData.profile_analysis.notes}
                    </p>
                  </div>
                )}
                {analysisData.back_analysis && (
                  <div className="p-3 rounded-xl bg-surface-border/50 border border-zinc-700">
                    <span className="text-[10px] font-bold text-accent-emerald uppercase block mb-1">
                      Analisis Tengkuk Belakang:
                    </span>
                    <p className="text-zinc-300 text-[11px]">
                      {analysisData.back_analysis.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Main Feature: Client Lookbook Gallery with 6-8 Haircut Variations on Client's Face */}
      <section className="pt-2">
        <ClientLookbookGallery
          lookbook={activeLookbook}
          clientPhotoUrl={clientImages.front}
          faceShapeName={shapeDetails.nameId}
          onShowToBarber={handleShowToBarber}
        />
      </section>

      {/* Styles to Avoid Warning Section */}
      <section className="rounded-3xl border border-accent-rose/30 bg-accent-rose/5 p-6 space-y-3">
        <div className="flex items-center gap-2 text-accent-rose">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold uppercase tracking-wide">
            Gaya yang Sebaiknya Dihindari untuk Wajah {analysisData.face_shape}
          </h3>
        </div>
        <p className="text-xs text-zinc-300">
          Potongan berikut berisiko menonjolkan dimensi yang kurang proporsional:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {shapeDetails.toAvoid.map((avoidItem, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-background/80 border border-accent-rose/20 text-xs text-zinc-200 flex items-start gap-2"
            >
              <span className="text-accent-rose font-bold">✕</span>
              <span>{avoidItem}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Floating Bar */}
      <div className="sticky bottom-4 z-20 bg-background/90 backdrop-blur-lg p-3 rounded-2xl border border-surface-border shadow-2xl flex items-center justify-between gap-4">
        <Link href="/scan" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto h-12 rounded-xl gap-2 font-bold text-xs uppercase"
          >
            <Camera className="w-4 h-4" />
            <span>Pindai Klien Baru</span>
          </Button>
        </Link>

        {activeLookbook[0] && (
          <Button
            size="lg"
            onClick={() => setSelectedHaircutForBarber(activeLookbook[0])}
            className="w-full sm:w-auto h-12 rounded-xl gap-2 font-bold text-xs uppercase shadow-lg shadow-barber-gold/20"
          >
            <Scissors className="w-4 h-4" />
            <span>Tunjukkan Rekomendasi Utama ke Barber</span>
          </Button>
        )}
      </div>

      {/* Fullscreen Consultation Modal */}
      <BarberDisplayModal
        haircut={selectedHaircutForBarber}
        clientPhoto={clientImages.front}
        faceShapeName={shapeDetails.nameId}
        isOpen={Boolean(selectedHaircutForBarber)}
        onClose={() => setSelectedHaircutForBarber(null)}
      />
    </div>
  );
}

