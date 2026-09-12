'use client';

import React, { useState } from 'react';

export function FlyingDragon() {
  const [isRoaring, setIsRoaring] = useState(false);

  const handleDragonClick = () => {
    setIsRoaring(true);
    setTimeout(() => setIsRoaring(false), 1600);
  };

  return (
    <div className="flying-dragon-container" aria-hidden="true">
      {/* Auspicious background clouds */}
      <div className="auspicious-cloud cloud-1" />
      <div className="auspicious-cloud cloud-2" />
      <div className="auspicious-cloud cloud-3" />

      {/* Main Flying Eastern Dragon */}
      <div className="dragon-flight relative">
        <div
          onClick={handleDragonClick}
          className={`dragon-serpentine relative cursor-pointer pointer-events-auto transition-transform duration-500 ${
            isRoaring ? 'scale-125 filter drop-shadow-[0_0_60px_rgba(239,68,68,0.95)]' : ''
          }`}
          title="Thần Rồng Hoàng Kim (Bấm vào để Rồng Gầm!)"
        >
          {/* Golden Aura Glow Layer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/25 via-orange-500/25 to-red-500/25 blur-3xl animate-pulse pointer-events-none" />

          {/* 100% PURE SVG EASTERN GOLDEN DRAGON (THẦN RỒNG HOÀNG KIM) */}
          <svg
            viewBox="0 0 500 950"
            className="w-[360px] h-[684px] filter drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] drop-shadow-[0_0_35px_rgba(239,68,68,0.5)] select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Gold Body Gradient */}
              <linearGradient id="goldBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Gold Highlight Gradient */}
              <linearGradient id="goldShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fde047" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.2" />
              </linearGradient>

              {/* Cream Belly Gradient */}
              <linearGradient id="bellyCream" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="50%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#fde68a" />
              </linearGradient>

              {/* Fiery Red Mane Gradient */}
              <linearGradient id="flameRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fee2e2" />
                <stop offset="25%" stopColor="#ef4444" />
                <stop offset="65%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>

              {/* Horn Gradient */}
              <linearGradient id="hornGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>

              {/* Fire Ember Glow */}
              <radialGradient id="emberGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>

              {/* Dragon Scale Pattern */}
              <pattern id="scales" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M 0,8 Q 8,0 16,8 Q 8,16 0,8 Z" fill="none" stroke="#b45309" strokeWidth="1" opacity="0.4" />
                <path d="M 4,8 Q 8,4 12,8" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.6" />
              </pattern>

              {/* Soft Drop Shadow Filter */}
              <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* --- 1. RED SPINE FLAMES & BACK MANE (BỜM RỒNG ĐỎ DỌC SỐNG LƯNG) --- */}
            {/* Upper Neck Mane */}
            <path
              d="M 230,120 C 190,80 140,70 120,40 C 150,80 180,110 200,140 C 170,110 130,100 110,80 C 140,120 180,150 210,180 Z"
              fill="url(#flameRed)"
            />
            <path
              d="M 270,180 C 230,130 180,120 160,90 C 190,130 220,160 250,200 C 210,170 170,160 140,130 C 180,180 230,220 260,240 Z"
              fill="url(#flameRed)"
            />

            {/* Middle Back Mane */}
            <path
              d="M 330,320 C 370,270 420,250 450,230 C 410,270 380,310 360,350 C 400,320 440,310 470,290 C 420,340 370,370 340,390 Z"
              fill="url(#flameRed)"
            />
            <path
              d="M 320,460 C 360,420 410,400 440,380 C 400,420 370,450 350,490 C 380,470 420,460 450,440 C 410,480 360,510 330,530 Z"
              fill="url(#flameRed)"
            />

            {/* Lower Body Mane */}
            <path
              d="M 180,590 C 140,560 100,560 70,540 C 110,570 140,590 160,620 C 120,600 80,600 50,590 C 90,620 140,640 170,660 Z"
              fill="url(#flameRed)"
            />
            <path
              d="M 230,730 C 190,720 150,730 120,720 C 150,740 180,750 200,780 C 170,760 130,770 100,770 C 140,790 190,800 220,810 Z"
              fill="url(#flameRed)"
            />

            {/* Tail Flame Tip (Cụm Tua Lửa Đuôi) */}
            <g className="dragon-tail-flame">
              <path
                d="M 170,890 C 130,920 80,940 30,950 C 80,920 130,890 160,860 C 120,880 70,890 20,890 C 70,870 130,840 180,830 Z"
                fill="url(#flameRed)"
              />
              <path
                d="M 190,880 C 160,930 120,960 70,980 C 110,950 150,910 180,870 Z"
                fill="#ef4444"
              />
              <path
                d="M 180,870 C 140,900 100,920 60,930 C 100,900 140,880 170,850 Z"
                fill="#f59e0b"
              />
            </g>

            {/* --- 2. SERPENTINE BODY TRUNK (THÂN RỒNG UỐN LƯỢN CHỮ S) --- */}
            {/* Main Golden Trunk */}
            <path
              d="M 260,140 C 160,200 130,350 250,420 C 370,490 390,600 270,680 C 150,760 120,840 180,880 C 230,910 270,860 260,820 C 240,770 190,740 210,680 C 240,610 320,570 300,480 C 270,390 190,340 240,240 C 270,180 300,160 260,140 Z"
              fill="url(#goldBody)"
              stroke="#b45309"
              strokeWidth="3"
            />

            {/* Body Scale Pattern Overlay */}
            <path
              d="M 260,140 C 160,200 130,350 250,420 C 370,490 390,600 270,680 C 150,760 120,840 180,880 C 230,910 270,860 260,820 C 240,770 190,740 210,680 C 240,610 320,570 300,480 C 270,390 190,340 240,240 C 270,180 300,160 260,140 Z"
              fill="url(#scales)"
              opacity="0.85"
            />

            {/* Gold Body Highlight Curve */}
            <path
              d="M 250,150 C 170,210 145,340 245,410 C 350,480 375,590 260,670 C 160,740 140,820 185,865"
              stroke="url(#goldShine)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />

            {/* --- 3. RIDGED BELLY (BỤNG RỒNG TỪNG ĐỐT MÀU KEM) --- */}
            <path
              d="M 260,170 C 190,220 170,330 240,390 C 320,460 330,550 240,620 C 180,670 160,730 190,810 L 210,800 C 180,740 195,685 255,635 C 345,565 335,465 255,395 C 185,335 205,235 270,185 Z"
              fill="url(#bellyCream)"
              stroke="#d97706"
              strokeWidth="2"
            />
            {/* Belly Segment Lines */}
            <path
              d="M 245,200 L 265,185 M 225,230 L 250,215 M 210,270 L 235,255 M 205,310 L 230,295 M 215,350 L 240,340 M 240,390 L 260,380 M 270,430 L 290,420 M 295,470 L 315,460 M 300,510 L 318,500 M 285,550 L 305,540 M 260,590 L 280,580 M 230,630 L 250,620 M 205,670 L 225,660 M 190,720 L 210,710 M 195,770 L 215,760"
              stroke="#b45309"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* --- 4. FOUR LEGS & SHARP CLAWS (BỐN CHÂN & MÓNG VUỐT) --- */}
            {/* Upper Right Leg & Claw (Grasping Backwards) */}
            <g className="dragon-leg-ur">
              <path d="M 280,310 C 340,300 390,320 420,350 C 400,360 360,350 310,340 Z" fill="url(#goldBody)" stroke="#b45309" strokeWidth="2" />
              {/* Claws */}
              <path d="M 420,350 L 445,340 M 420,350 L 450,355 M 420,350 L 440,370 M 420,350 L 425,375" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <path d="M 420,350 L 445,340 M 420,350 L 450,355 M 420,350 L 440,370 M 420,350 L 425,375" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Upper Left Leg & Claw (Forward Grab) */}
            <g className="dragon-leg-ul">
              <path d="M 210,270 C 150,270 110,300 80,340 C 100,350 140,330 190,300 Z" fill="url(#goldBody)" stroke="#b45309" strokeWidth="2" />
              {/* Claws */}
              <path d="M 80,340 L 55,330 M 80,340 L 50,345 M 80,340 L 60,360 M 80,340 L 75,365" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <path d="M 80,340 L 55,330 M 80,340 L 50,345 M 80,340 L 60,360 M 80,340 L 75,365" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Lower Right Leg & Claw */}
            <g className="dragon-leg-lr">
              <path d="M 290,620 C 350,610 390,630 430,670 C 400,680 360,660 310,640 Z" fill="url(#goldBody)" stroke="#b45309" strokeWidth="2" />
              {/* Claws */}
              <path d="M 430,670 L 455,660 M 430,670 L 460,675 M 430,670 L 445,690 M 430,670 L 435,695" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <path d="M 430,670 L 455,660 M 430,670 L 460,675 M 430,670 L 445,690 M 430,670 L 435,695" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Lower Left Leg & Claw */}
            <g className="dragon-leg-ll">
              <path d="M 200,690 C 140,710 100,750 80,790 C 110,790 140,760 180,720 Z" fill="url(#goldBody)" stroke="#b45309" strokeWidth="2" />
              {/* Claws */}
              <path d="M 80,790 L 55,780 M 80,790 L 50,795 M 80,790 L 60,810 M 80,790 L 75,815" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <path d="M 80,790 L 55,780 M 80,790 L 50,795 M 80,790 L 60,810 M 80,790 L 75,815" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* --- 5. DRAGON HEAD (ĐẦU RỒNG HẰM HỔ & UY NGHIÊM) --- */}
            <g className="dragon-head-group">
              {/* Golden Antlers / Horns (Sừng Hươu Vàng Nhọn Branching Upward) */}
              <g className="dragon-horns">
                {/* Main Right Antler */}
                <path
                  d="M 260,130 C 290,90 320,60 360,30 C 340,60 330,80 300,110 C 330,80 370,60 400,40 C 370,75 340,105 310,135 Z"
                  fill="url(#hornGold)"
                  stroke="#78350f"
                  strokeWidth="1.5"
                />
                {/* Main Left Antler */}
                <path
                  d="M 230,120 C 240,70 260,30 280,0 C 270,40 255,70 240,100 C 265,65 295,45 320,25 C 290,60 265,90 245,115 Z"
                  fill="url(#hornGold)"
                  stroke="#78350f"
                  strokeWidth="1.5"
                />
              </g>

              {/* Head Mane & Crown Fluff (Bờm Đỏ Trên Đầu) */}
              <path
                d="M 210,140 C 180,100 140,80 100,70 C 140,110 170,130 190,160 Z"
                fill="url(#flameRed)"
              />
              <path
                d="M 240,130 C 220,90 190,60 150,50 C 180,90 210,120 225,145 Z"
                fill="#ef4444"
              />

              {/* Upper Skull & Snout Structure */}
              <path
                d="M 260,140 C 240,160 210,165 170,160 C 140,155 110,165 90,185 C 120,195 150,190 180,185 C 210,180 250,180 270,165 Z"
                fill="url(#goldBody)"
                stroke="#b45309"
                strokeWidth="2.5"
              />

              {/* Fierce Brow & Eye Ridge */}
              <path
                d="M 230,150 C 200,145 170,150 150,165 C 180,160 210,160 230,165 Z"
                fill="#dc2626"
                stroke="#7f1d1d"
                strokeWidth="1"
              />

              {/* Glowing Fierce Dragon Eye */}
              <g className="dragon-eye">
                {/* Eye Socket */}
                <ellipse cx="180" cy="162" rx="14" ry="9" fill="#7f1d1d" />
                {/* Glowing Yellow/Red Iris */}
                <ellipse cx="178" cy="162" rx="11" ry="7" fill="#facc15" />
                {/* Sharp Slit Pupil */}
                <polygon points="178,154 180,162 178,170 176,162" fill="#000000" />
                {/* Eye Glint */}
                <circle cx="182" cy="159" r="2.5" fill="#ffffff" />
              </g>

              {/* Snout Nostril & Flames */}
              <path d="M 105,178 Q 112,172 120,180" stroke="#78350f" strokeWidth="2.5" fill="none" />
              <circle cx="112" cy="177" r="3" fill="#7f1d1d" />

              {/* Open Fierce Mouth Upper Jaw & Fangs (Hàm Trên & Nanh Nhọn) */}
              <path
                d="M 180,185 C 140,190 110,190 85,200 C 115,210 150,205 185,195 Z"
                fill="url(#goldBody)"
                stroke="#b45309"
                strokeWidth="2"
              />

              {/* Upper Fangs */}
              <polygon points="100,198 105,214 112,198" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <polygon points="120,196 124,210 130,196" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <polygon points="140,194 143,208 148,194" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <polygon points="160,192 163,205 167,192" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

              {/* Lower Jaw & Lower Fangs (Hàm Dưới Mở Rộng) */}
              <path
                d="M 190,215 C 150,230 115,235 95,230 C 120,215 155,210 185,198 Z"
                fill="url(#goldBody)"
                stroke="#b45309"
                strokeWidth="2"
              />

              {/* Fiery Red Tongue Inside Mouth */}
              <path d="M 130,206 Q 150,200 170,210 Q 150,215 130,206 Z" fill="#ef4444" />

              {/* Lower Fangs */}
              <polygon points="105,225 110,210 115,223" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <polygon points="125,220 129,208 133,219" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <polygon points="145,217 148,206 152,216" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

              {/* Beard & Cheek Fluff (Râu Cằm & Bờm Má) */}
              <path
                d="M 190,215 C 160,240 130,265 100,275 C 135,255 165,240 185,225 Z"
                fill="url(#flameRed)"
              />
              <path
                d="M 210,205 C 190,235 160,260 130,280 C 160,250 185,230 200,215 Z"
                fill="#f59e0b"
              />

              {/* Long Sweeping Gold Whiskers (Râu Rồng Vàng Uốn Lượn Uy Nghiêm) */}
              <g className="dragon-whiskers">
                {/* Upper Whisker */}
                <path
                  d="M 115,182 C 70,170 30,190 0,160 C 40,175 80,165 115,182 Z"
                  fill="url(#hornGold)"
                  stroke="#b45309"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                {/* Lower Whisker */}
                <path
                  d="M 105,225 C 60,245 20,230 -20,260 C 20,235 60,240 105,225 Z"
                  fill="url(#hornGold)"
                  stroke="#b45309"
                  strokeWidth="1.5"
                />
              </g>
            </g>

            {/* --- 6. FLOATING FIRE EMBERS & SPARKLES --- */}
            <circle cx="90" cy="140" r="5" fill="url(#emberGlow)" className="animate-ping" />
            <circle cx="60" cy="210" r="7" fill="url(#emberGlow)" className="animate-pulse" />
            <circle cx="340" cy="260" r="6" fill="url(#emberGlow)" className="animate-bounce" />
            <circle cx="420" cy="360" r="8" fill="url(#emberGlow)" className="animate-pulse" />
            <circle cx="120" cy="530" r="6" fill="url(#emberGlow)" className="animate-ping" />
            <circle cx="280" cy="710" r="7" fill="url(#emberGlow)" className="animate-bounce" />
          </svg>

          {/* Golden Flame Embers Trailing Behind */}
          <div className="dragon-ember ember-1" />
          <div className="dragon-ember ember-2" />
          <div className="dragon-ember ember-3" />
          <div className="dragon-ember ember-4" />
          <div className="dragon-ember ember-5" />

          {/* Roar Burst Aura */}
          {isRoaring && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 blur-2xl opacity-80 animate-ping pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}


