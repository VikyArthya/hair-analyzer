'use client';

import React, { useState, useRef } from 'react';
import { VarietyHairstyle } from '@/types';
import { VARIETY_HAIRSTYLES } from '@/data/varietyCatalog';
import {
  Sparkles,
  Scissors,
  Camera,
  Upload,
  Eye,
  CheckCircle2,
  Share2,
  Download,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HairstyleGalleryWithFaceProps {
  customerPhotoUrl: string | null;
  onUpdateCustomerPhoto?: (dataUrl: string) => void;
  onShowToBarber?: (haircut: VarietyHairstyle) => void;
}

export const HairstyleGalleryWithFace: React.FC<HairstyleGalleryWithFaceProps> = ({
  customerPhotoUrl,
  onUpdateCustomerPhoto,
  onShowToBarber,
}) => {
  const [selectedHaircut, setSelectedHaircut] = useState<VarietyHairstyle>(VARIETY_HAIRSTYLES[1]); // Default: Low Fade
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePhoto = customPhoto || customerPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCustomPhoto(dataUrl);
        if (onUpdateCustomerPhoto) {
          onUpdateCustomerPhoto(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Main Poster Container */}
      <div className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-3xl p-4 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-6">
        
        {/* Poster Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none">
              JENIS-JENIS GAYA RAMBUT
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mt-1">
              DENGAN WAJAH ANDA
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 text-white dark:bg-zinc-800 px-4 py-2 rounded-2xl shadow-md border border-zinc-700 text-xs sm:text-sm font-semibold tracking-wide">
              Temukan gaya rambut terbaik untuk Anda!
            </div>
          </div>
        </div>

        {/* Top Grid: 10 Cards (Card 0: Foto Anda Sekarang + Cards 1-9: 9 Gaya Rambut) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Card 0: FOTO ANDA (SEKARANG) */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 ring-4 ring-blue-600 border-2 border-blue-500 bg-zinc-900 flex flex-col justify-between"
          >
            <img
              src={activePhoto}
              alt="Foto Anda Sekarang"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center text-white z-10">
              <Camera className="w-6 h-6 mb-1 text-blue-400" />
              <span className="text-[11px] font-bold">Klik untuk Ganti Foto</span>
            </div>

            {/* Top Badge */}
            <div className="relative z-10 p-2">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow uppercase tracking-wider inline-flex items-center gap-1">
                <Check className="w-3 h-3" /> Asli
              </span>
            </div>

            {/* Bottom Blue Banner */}
            <div className="relative z-10 bg-blue-600 text-white py-2 px-2 text-center shadow-lg">
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider leading-none">
                FOTO ANDA
              </div>
              <div className="text-[10px] font-semibold text-blue-100 leading-tight">
                (SEKARANG)
              </div>
            </div>
          </div>

          {/* Cards 1 to 9: 9 Gaya Rambut */}
          {VARIETY_HAIRSTYLES.map((haircut) => {
            const isSelected = selectedHaircut.id === haircut.id;
            return (
              <div
                key={haircut.id}
                onClick={() => setSelectedHaircut(haircut)}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 flex flex-col justify-between bg-zinc-900 ${
                  isSelected
                    ? 'ring-4 ring-blue-500 border-2 border-blue-400 scale-[1.02]'
                    : 'border border-zinc-300 dark:border-zinc-800 hover:scale-[1.01] hover:border-zinc-500'
                }`}
              >
                {/* Haircut Image */}
                <img
                  src={haircut.imageUrl}
                  alt={haircut.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Selected Indicator Badge */}
                {isSelected && (
                  <div className="relative z-10 p-2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md inline-flex items-center gap-1">
                      <Check className="w-3 h-3" /> Dipilih
                    </span>
                  </div>
                )}
                {!isSelected && <div />}

                {/* Bottom Dark Banner */}
                <div className="relative z-10 bg-zinc-950/95 dark:bg-black/95 text-white py-2 px-2 text-center border-t border-zinc-800">
                  <div className="text-[11px] sm:text-xs font-black uppercase tracking-wide truncate text-zinc-100">
                    {haircut.number}. {haircut.name}
                  </div>
                  <div className="text-[10px] font-medium text-zinc-400 truncate">
                    {haircut.tagline}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section: CONTOH SUDUT PANDANG (GAYA: {SELECTED_NAME}) */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wide text-zinc-900 dark:text-white flex items-center gap-2">
              <Scissors className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              CONTOH SUDUT PANDANG (GAYA: {selectedHaircut.name})
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              5 Sisi Lengkap: Depan, Kiri, Kanan, Belakang, Samping Depan
            </span>
          </div>

          {/* 5 Angles Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {/* 1. DEPAN */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-zinc-900 border border-zinc-300 dark:border-zinc-700">
                <img
                  src={selectedHaircut.angles.front}
                  alt="Tampak Depan"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                DEPAN
              </span>
            </div>

            {/* 2. KIRI */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-zinc-900 border border-zinc-300 dark:border-zinc-700">
                <img
                  src={selectedHaircut.angles.left}
                  alt="Tampak Kiri"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                KIRI
              </span>
            </div>

            {/* 3. KANAN */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-zinc-900 border border-zinc-300 dark:border-zinc-700">
                <img
                  src={selectedHaircut.angles.right}
                  alt="Tampak Kanan"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                KANAN
              </span>
            </div>

            {/* 4. BELAKANG */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-zinc-900 border border-zinc-300 dark:border-zinc-700">
                <img
                  src={selectedHaircut.angles.back}
                  alt="Tampak Belakang"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                BELAKANG
              </span>
            </div>

            {/* 5. SAMPING DEPAN */}
            <div className="flex flex-col items-center gap-2 col-span-2 sm:col-span-1">
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-zinc-900 border border-zinc-300 dark:border-zinc-700">
                <img
                  src={selectedHaircut.angles.threeQuarter}
                  alt="Tampak Samping Depan"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                SAMPING DEPAN
              </span>
            </div>
          </div>
        </div>

        {/* Technical Clipper & Barber Guide for Selected Haircut */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Instruksi Teknis untuk Barber ({selectedHaircut.name})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-300">
              <span><strong>Sepatu Cukur:</strong> {selectedHaircut.guardNumber}</span>
              <span>&bull;</span>
              <span><strong>Fade:</strong> {selectedHaircut.fadeType}</span>
              <span>&bull;</span>
              <span><strong>Panjang Atas:</strong> {selectedHaircut.topLength}</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
              &ldquo;{selectedHaircut.barberNotes}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-initial gap-2 text-xs font-bold rounded-xl border-zinc-300 dark:border-zinc-700"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ganti Foto Wajah</span>
            </Button>

            {onShowToBarber && (
              <Button
                onClick={() => onShowToBarber(selectedHaircut)}
                className="flex-1 md:flex-initial gap-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Tunjukkan ke Barber</span>
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
