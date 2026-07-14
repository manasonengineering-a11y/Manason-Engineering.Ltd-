/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  height?: number;
}

export default function Logo({ className = '', height = 48 }: LogoProps) {
  // Calculated responsive width based on height (roughly 2.2:1 aspect ratio)
  const width = Math.round(height * 2.2);

  return (
    <div className={`flex items-center select-none ${className}`} style={{ height }}>
      <svg
        id="manason-logo"
        viewBox="0 0 450 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* BIG M SERIF LETTER - Left block */}
        <text
          x="15"
          y="160"
          fontFamily="Playfair Display, Georgia, serif"
          fontWeight="900"
          fontSize="175"
          fill="#ECC90B" // Rich yellow
        >
          M
        </text>

        {/* ROAD ARCHING OVER THE M AND CONNECTING THE TEXT */}
        {/* Solid asphalt road background */}
        <path
          d="M 25 155 C 80 80, 220 75, 345 120"
          stroke="#1A1A1A"
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
        />
        {/* Dash lane dividers inside the road */}
        <path
          d="M 32 150 C 83 82, 218 77, 338 122"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeDasharray="14,10"
          strokeLinecap="round"
          fill="none"
        />

        {/* ANASON TEXT WITH SERIF YELLOW */}
        <text
          x="142"
          y="156"
          fontFamily="Playfair Display, Georgia, serif"
          fontWeight="bold"
          fontSize="56"
          fill="#ECC90B" // Rich yellow
          letterSpacing="2"
        >
          ANASON
        </text>

        {/* ENGINEERING LTD SMALLER TEXT */}
        <text
          x="178"
          y="185"
          fontFamily="Playfair Display, Georgia, serif"
          fontWeight="medium"
          fontSize="22"
          fill="#ECC90B" // Rich yellow
          letterSpacing="4"
        >
          ENGINEERING Ltd
        </text>

        {/* THIN GREEN LINE BUILDINGS - Right side */}
        <g stroke="#2BB155" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Main tall outline frame */}
          <path d="M 360 170 L 360 80 L 415 45 L 415 135 Z" />
          <path d="M 360 80 L 335 98 L 335 155 Z" />
          {/* Internal architectural grid accents */}
          <path d="M 360 110 L 415 75" />
          <path d="M 360 140 L 415 105" />
          <path d="M 335 115 L 360 98" />
          <path d="M 335 135 L 360 118" />
          {/* A secondary shorter outline tower behind */}
          <path d="M 380 70 L 380 20 L 435 -15 L 435 80 Z" opacity="0.65" strokeWidth="1.8" />
          <path d="M 380 40 L 435 5" opacity="0.65" strokeWidth="1.8" />
        </g>
      </svg>
    </div>
  );
}
