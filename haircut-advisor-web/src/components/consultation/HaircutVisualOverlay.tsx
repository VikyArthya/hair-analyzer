'use client';

import React from 'react';

interface HaircutVisualOverlayProps {
  styleId?: string;
  styleName?: string;
  category?: string;
}

export const HaircutVisualOverlay: React.FC<HaircutVisualOverlayProps> = ({
  styleId = '',
  styleName = '',
  category = '',
}) => {
  const nameLower = (styleName + ' ' + styleId + ' ' + category).toLowerCase();

  // 1. French Crop / Textured Fringe (Choppy forward fringe + mid drop fade)
  if (nameLower.includes('crop') || nameLower.includes('fringe') || nameLower.includes('sq-1')) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300">
        <svg className="w-full h-full" viewBox="0 0 400 533" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cropFadeL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#080b11" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#080b11" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="cropFadeR" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#080b11" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#080b11" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Side Fades */}
          <rect x="0" y="160" width="85" height="150" fill="url(#cropFadeL)" />
          <rect x="315" y="160" width="85" height="150" fill="url(#cropFadeR)" />

          {/* Choppy French Crop Fringe */}
          <path
            d="M 90,135 Q 200,110 310,135 L 305,185 L 285,175 L 265,190 L 245,178 L 225,192 L 200,175 L 175,192 L 155,178 L 135,188 L 115,175 L 95,185 Z"
            fill="#12100e"
            fillOpacity="0.88"
          />
          {/* Micro-texture fringe strands */}
          <path
            d="M 120,150 L 125,185 M 150,145 L 155,188 M 180,140 L 182,185 M 210,140 L 215,190 M 240,145 L 243,186 M 270,148 L 273,184"
            stroke="#2a221b"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      </div>
    );
  }

  // 2. Classic Side Part (Razor parting line + directional sweep + clean taper)
  if (nameLower.includes('side part') || nameLower.includes('part') || nameLower.includes('sq-2')) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300">
        <svg className="w-full h-full" viewBox="0 0 400 533" preserveAspectRatio="none">
          <defs>
            <linearGradient id="partSheen" x1="0" y1="0" x2="1" y2="0.3">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="taperL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#080b11" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#080b11" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Low Temple Taper */}
          <rect x="0" y="190" width="70" height="120" fill="url(#taperL)" />

          {/* Hair Combed Directional Sheen Layer */}
          <path
            d="M 140,145 Q 240,110 320,135 Q 310,180 200,165 Q 150,160 140,145 Z"
            fill="url(#partSheen)"
          />
          {/* Razor Sharp Parting Line */}
          <line
            x1="135"
            y1="165"
            x2="165"
            y2="105"
            stroke="#e0cdb5"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Sleek combed strokes */}
          <path
            d="M 155,120 Q 220,118 290,135 M 150,135 Q 225,130 295,148 M 145,150 Q 220,145 285,160"
            stroke="#161310"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>
    );
  }

  // 3. Buzz Cut with Beard Fade (Sharp clean lineup + high skin fade)
  if (nameLower.includes('buzz') || nameLower.includes('crew') || nameLower.includes('sq-3')) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300">
        <svg className="w-full h-full" viewBox="0 0 400 533" preserveAspectRatio="none">
          <defs>
            <linearGradient id="highSkinFadeL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#080b11" stopOpacity="0.92" />
              <stop offset="60%" stopColor="#080b11" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#080b11" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="highSkinFadeR" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#080b11" stopOpacity="0.92" />
              <stop offset="60%" stopColor="#080b11" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#080b11" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* High Skin Fade to Skin */}
          <rect x="0" y="140" width="95" height="170" fill="url(#highSkinFadeL)" />
          <rect x="305" y="140" width="95" height="170" fill="url(#highSkinFadeR)" />

          {/* Crisp Razor Lineup Box */}
          <polyline
            points="105,175 105,145 295,145 295,175"
            fill="none"
            stroke="#0a0807"
            strokeWidth="3.5"
            strokeLinecap="square"
            opacity="0.95"
          />
          {/* Subtle 3D Buzz Top Texture */}
          <ellipse cx="200" cy="115" rx="100" ry="40" fill="#0d0b09" fillOpacity="0.45" />
        </svg>
      </div>
    );
  }

  // 4. Modern Textured Quiff / Pompadour (Lifted vertical volume)
  if (nameLower.includes('quiff') || nameLower.includes('pompadour') || nameLower.includes('sq-4')) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300">
        <svg className="w-full h-full" viewBox="0 0 400 533" preserveAspectRatio="none">
          <defs>
            <linearGradient id="quiffLift" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#14110e" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#221c17" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#352b22" stopOpacity="0.75" />
            </linearGradient>
          </defs>
          {/* Lifted Upward Crest */}
          <path
            d="M 120,150 Q 140,85 200,75 Q 260,85 280,150 Q 200,135 120,150 Z"
            fill="url(#quiffLift)"
          />
          {/* Upward Hair Flow Lines */}
          <path
            d="M 160,145 Q 170,105 195,85 M 190,140 Q 195,100 205,82 M 220,142 Q 220,103 215,84 M 245,147 Q 235,108 222,90"
            stroke="#3d3227"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>
    );
  }

  // 5. Messy Spiky Texture
  if (nameLower.includes('spik') || nameLower.includes('sq-5')) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300">
        <svg className="w-full h-full" viewBox="0 0 400 533" preserveAspectRatio="none">
          {/* Spiky Points */}
          <polygon points="140,135 150,90 160,135" fill="#14110e" opacity="0.85" />
          <polygon points="165,130 178,80 190,130" fill="#181410" opacity="0.9" />
          <polygon points="195,125 210,72 225,125" fill="#1e1813" opacity="0.92" />
          <polygon points="230,128 242,78 255,128" fill="#181410" opacity="0.9" />
          <polygon points="258,135 270,88 280,135" fill="#14110e" opacity="0.85" />
        </svg>
      </div>
    );
  }

  // 6. Slicked Back Undercut
  return (
    <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300">
      <svg className="w-full h-full" viewBox="0 0 400 533" preserveAspectRatio="none">
        <defs>
          <linearGradient id="slickSheen" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0d0b09" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#1e1814" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#40342a" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="undercutL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#080b11" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#080b11" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="undercutR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#080b11" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#080b11" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Disconnected Undercut on sides */}
        <rect x="0" y="145" width="85" height="150" fill="url(#undercutL)" />
        <rect x="315" y="145" width="85" height="150" fill="url(#undercutR)" />

        {/* Sleek backward flow */}
        <path
          d="M 125,145 Q 200,125 275,145 Q 265,95 200,90 Q 135,95 125,145 Z"
          fill="url(#slickSheen)"
        />
        {/* Comb teeth flow */}
        <path
          d="M 145,140 Q 155,105 175,98 M 175,138 Q 185,102 195,95 M 205,138 Q 210,102 215,95 M 235,140 Q 235,105 230,98"
          stroke="#473a2e"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
    </div>
  );
};
