'use client';

import React from 'react';
import { CaptureAngle } from '@/types';

interface SilhouetteOverlayProps {
  angle: CaptureAngle;
}

export const SilhouetteOverlay: React.FC<SilhouetteOverlayProps> = ({ angle }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
      {/* Corner viewfinders */}
      <div className="absolute inset-6 md:inset-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-barber-gold/80 rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-barber-gold/80 rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-barber-gold/80 rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-barber-gold/80 rounded-br-sm" />
      </div>

      {/* Dynamic Angle Overlays */}
      <svg
        className="w-full h-full max-w-md max-h-[580px] p-4 text-barber-gold"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {angle === 'front' && (
          <g className="transition-opacity duration-300">
            {/* Outer Head Oval */}
            <ellipse
              cx="200"
              cy="235"
              rx="115"
              ry="160"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              className="opacity-70 animate-pulse-slow"
            />

            {/* Symmetry Center Line */}
            <line
              x1="200"
              y1="60"
              x2="200"
              y2="410"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="opacity-40"
            />

            {/* Eye Horizon Guide */}
            <line
              x1="100"
              y1="210"
              x2="300"
              y2="210"
              stroke="#06B6D4"
              strokeWidth="2"
              className="opacity-80"
            />
            <circle cx="150" cy="210" r="4" fill="#06B6D4" className="opacity-90" />
            <circle cx="250" cy="210" r="4" fill="#06B6D4" className="opacity-90" />
            <text
              x="200"
              y="200"
              textAnchor="middle"
              fill="#06B6D4"
              fontSize="11"
              fontWeight="600"
              letterSpacing="1.5"
              className="uppercase"
            >
              Garis Mata (Eye-Line)
            </text>

            {/* Cheekbone Width Guide */}
            <line
              x1="85"
              y1="250"
              x2="315"
              y2="250"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              className="opacity-50"
            />

            {/* Chin alignment bracket */}
            <path
              d="M 165 375 C 185 400, 215 400, 235 375"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              className="opacity-80"
            />
            <text
              x="200"
              y="418"
              textAnchor="middle"
              fill="currentColor"
              fontSize="10"
              fontWeight="bold"
              letterSpacing="1"
              className="uppercase"
            >
              Ujung Dagu
            </text>
          </g>
        )}

        {angle === 'side' && (
          <g className="transition-opacity duration-300">
            {/* Side Profile Silhouette Contour */}
            <path
              d="M 230 80 
                 C 190 85, 150 115, 140 160 
                 C 135 180, 130 195, 120 205
                 C 115 210, 105 215, 100 220
                 C 115 225, 122 232, 118 245
                 C 115 255, 105 260, 115 268
                 C 125 275, 125 285, 115 295
                 C 125 315, 135 350, 150 365
                 C 165 380, 200 375, 235 345
                 C 255 325, 260 270, 260 210
                 C 260 140, 255 90, 230 80 Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="opacity-75 animate-pulse-slow"
              fill="none"
            />

            {/* Mandibular / Jaw Angle Projection Line */}
            <path
              d="M 150 365 L 235 345"
              stroke="#06B6D4"
              strokeWidth="2.5"
              className="opacity-90"
            />
            <circle cx="235" cy="345" r="5" fill="#06B6D4" />
            <text
              x="250"
              y="348"
              fill="#06B6D4"
              fontSize="11"
              fontWeight="bold"
              letterSpacing="1"
            >
              Gonion (Sudut Rahang)
            </text>

            {/* Ear reference marker */}
            <ellipse
              cx="225"
              cy="230"
              rx="18"
              ry="30"
              stroke="currentColor"
              strokeWidth="1.5"
              className="opacity-60"
            />
            <text
              x="225"
              y="235"
              textAnchor="middle"
              fill="currentColor"
              fontSize="9"
              className="opacity-70"
            >
              Telinga
            </text>
          </g>
        )}

        {angle === 'back' && (
          <g className="transition-opacity duration-300">
            {/* Back of Head Arch */}
            <path
              d="M 130 380
                 C 120 330, 100 280, 100 210
                 C 100 110, 150 70, 200 70
                 C 250 70, 300 110, 300 210
                 C 300 280, 280 330, 270 380"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="opacity-75 animate-pulse-slow"
              fill="none"
            />

            {/* Occipital Crown Arch */}
            <ellipse
              cx="200"
              cy="180"
              rx="60"
              ry="35"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="opacity-40"
            />
            <text
              x="200"
              y="185"
              textAnchor="middle"
              fill="currentColor"
              fontSize="10"
              className="opacity-60"
            >
              Mahkota (Crown Area)
            </text>

            {/* Neck Nape Taper Boundary */}
            <path
              d="M 140 370 Q 200 395 260 370"
              stroke="#10B981"
              strokeWidth="3"
              fill="none"
              className="opacity-90"
            />
            <circle cx="200" cy="388" r="4" fill="#10B981" />
            <text
              x="200"
              y="415"
              textAnchor="middle"
              fill="#10B981"
              fontSize="11"
              fontWeight="bold"
              letterSpacing="1.5"
              className="uppercase"
            >
              Batas Tengkuk / Nape
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
