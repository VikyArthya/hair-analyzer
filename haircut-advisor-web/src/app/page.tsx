'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera,
  Scissors,
  Sparkles,
  ChevronRight,
  History,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FACE_SHAPE_DETAILS, HAIRCUT_CATALOG } from '@/data/haircutCatalog';
import { ConsultationSession } from '@/types';

export default function HomePage() {
  const [selectedShape, setSelectedShape] = useState<string>('square');
  const [recentSessions, setRecentSessions] = useState<ConsultationSession[]>([]);

  useEffect(() => {
    // Load recent sessions from localStorage
    try {
      const saved = localStorage.getItem('barbervision_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSessions(parsed.slice(0, 4));
        }
      }
    } catch (e) {
      console.warn('Unable to read recent sessions', e);
    }
  }, []);

  const activeDetails = FACE_SHAPE_DETAILS[selectedShape] || FACE_SHAPE_DETAILS.square;
  const activeHaircuts = HAIRCUT_CATALOG[selectedShape] || HAIRCUT_CATALOG.square;

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-8 gap-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-barber-gold/40 bg-gradient-to-br from-surface via-surface-hover to-background p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-barber-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-accent-cyan/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <Badge variant="default" className="gap-1.5 px-3 py-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem AI Konsultasi Kursi Barbershop
            </Badge>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Presisi Bentuk Wajah, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-barber-gold via-barber-amber to-accent-cyan">
                Potongan Rambut Akurat.
              </span>
            </h1>

            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              Pindai foto wajah klien dengan panduan kamera pintar. MediaPipe Face Mesh mendeteksi proporsi rahang & bentuk wajah, lalu Google Gemini AI me-render 6-8 variasi gaya rambut terbaik langsung di wajah klien lengkap dengan panduan clipper guard untuk barber.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-300 bg-surface-border/80 px-2.5 py-1 rounded-xl border border-zinc-700">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
                468 Landmark MediaPipe
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-zinc-300 bg-surface-border/80 px-2.5 py-1 rounded-xl border border-zinc-700">
                <Zap className="w-3.5 h-3.5 text-barber-gold" />
                Koreksi Kemiringan Kepala
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-zinc-300 bg-surface-border/80 px-2.5 py-1 rounded-xl border border-zinc-700">
                <Scissors className="w-3.5 h-3.5 text-accent-cyan" />
                Clipper & Fade Guides
              </span>
            </div>
          </div>

          {/* Big CTA Button */}
          <div className="w-full md:w-auto flex flex-col items-center">
            <Link href="/scan" className="w-full md:w-auto">
              <Button
                size="lg"
                className="w-full md:w-auto h-16 md:h-20 px-8 md:px-10 rounded-2xl md:rounded-3xl text-base md:text-lg font-black tracking-wider uppercase gap-3 shadow-xl shadow-barber-gold/25 hover:scale-105 transition-all"
              >
                <Camera className="w-6 h-6 stroke-[2.5]" />
                <span>Mulai Konsultasi Klien Baru</span>
              </Button>
            </Link>
            <span className="text-[11px] text-zinc-400 mt-2 font-medium text-center">
              Waktu analisis hanya ~2 detik
            </span>
          </div>
        </div>
      </section>

      {/* Recent Scans History (if any) */}
      {recentSessions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-barber-gold" />
              <h3 className="text-base font-bold text-zinc-100 uppercase tracking-wide">
                Konsultasi Terakhir
              </h3>
            </div>
            <span className="text-xs text-zinc-500">{recentSessions.length} sesi tersimpan</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentSessions.map((session) => (
              <Link
                key={session.id}
                href={`/result?session=${session.id}`}
                className="group rounded-2xl border border-surface-border bg-surface hover:border-barber-gold/50 p-3 transition-all flex flex-col gap-2"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black">
                  {session.images.front ? (
                    <img
                      src={session.images.front}
                      alt="Recent scan"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                      Foto Klien
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1">
                    <Badge variant="default" className="text-[10px] px-1.5 py-0.5">
                      {session.analysis.face_shape}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-100 capitalize truncate">
                    {session.analysis.face_shape} Face
                  </h4>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {new Date(session.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Face Shape & Haircut Catalog Browser */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-100 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-barber-gold" />
            Katalog Panduan Bentuk Wajah & Rekomendasi Gaya
          </h2>
          <p className="text-xs md:text-sm text-zinc-400">
            Jelajahi karakteristik geometris tiap bentuk wajah dan potongan yang direkomendasikan barber profesional.
          </p>
        </div>

        {/* Shape Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {Object.keys(FACE_SHAPE_DETAILS).map((shapeKey) => {
            const isActive = selectedShape === shapeKey;
            return (
              <button
                key={shapeKey}
                onClick={() => setSelectedShape(shapeKey)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-barber-gold text-background border-barber-gold shadow-md'
                    : 'bg-surface text-zinc-400 border-surface-border hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {shapeKey}
              </button>
            );
          })}
        </div>

        {/* Selected Shape Detail Overview */}
        <Card className="border-surface-border bg-surface p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-zinc-100">{activeDetails.nameId}</h3>
                <Badge variant="cyan" className="text-xs">
                  Karakteristik Geometris
                </Badge>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {activeDetails.description}
              </p>

              <div className="p-3.5 rounded-2xl bg-barber-gold/10 border border-barber-gold/30">
                <span className="text-xs font-bold uppercase tracking-wider text-barber-gold block mb-1">
                  Tujuan Styling Barber
                </span>
                <p className="text-xs font-medium text-zinc-200">{activeDetails.goal}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {activeDetails.characteristics.map((char, i) => (
                  <div key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-barber-gold mt-1.5 flex-shrink-0" />
                    <span>{char}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid warning card */}
            <div className="w-full md:w-80 p-4 rounded-2xl bg-accent-rose/10 border border-accent-rose/30 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-rose block">
                Gaya Rambut yang Sebaiknya Dihindari:
              </span>
              <ul className="space-y-1.5">
                {activeDetails.toAvoid.map((item, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                    <span className="text-accent-rose font-bold">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Haircut Showcase Cards for this Shape */}
          <div className="mt-8 pt-6 border-t border-surface-border">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
              Gaya Rambut Unggulan Untuk Bentuk {selectedShape.toUpperCase()}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeHaircuts.slice(0, 3).map((haircut) => (
                <div
                  key={haircut.id}
                  className="rounded-2xl border border-surface-border bg-surface-hover/50 overflow-hidden flex flex-col group hover:border-barber-gold/40 transition-all"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                    <img
                      src={haircut.imageUrl}
                      alt={haircut.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-barber-gold block">
                        {haircut.category}
                      </span>
                      <h5 className="text-base font-bold text-white">{haircut.name}</h5>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                    <p className="text-zinc-300 leading-relaxed text-[11px]">
                      {haircut.matchReason}
                    </p>

                    <div className="p-2 rounded-xl bg-background border border-surface-border flex items-center justify-between">
                      <span className="text-zinc-400 text-[10px]">Clipper Guard:</span>
                      <span className="text-barber-gold font-bold">{haircut.guardNumber}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
