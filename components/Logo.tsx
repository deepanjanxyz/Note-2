import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path, Circle, G } from 'react-native-svg';

interface LogoProps {
  size?: number;
  glowOpacity?: number;
}

export function Logo({ size = 48, glowOpacity = 0.6 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="penGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#00E0FF" />
          <Stop offset="1" stopColor="#7B61FF" />
        </LinearGradient>
        <LinearGradient id="padGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1A2235" />
          <Stop offset="1" stopColor="#111827" />
        </LinearGradient>
        <LinearGradient id="glowGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#00E0FF" stopOpacity={String(glowOpacity)} />
          <Stop offset="1" stopColor="#00E0FF" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <G>
        <Path
          d="M25 18 L75 18 Q82 18 82 25 L82 82 Q82 88 75 88 L25 88 Q18 88 18 82 L18 25 Q18 18 25 18 Z"
          fill="url(#padGrad)"
          stroke="#00E0FF"
          strokeWidth="1"
          strokeOpacity="0.2"
        />
        <Path d="M30 38 L65 38" stroke="#1E2D45" strokeWidth="2" strokeLinecap="round" />
        <Path d="M30 48 L58 48" stroke="#1E2D45" strokeWidth="2" strokeLinecap="round" />
        <Path d="M30 58 L62 58" stroke="#1E2D45" strokeWidth="2" strokeLinecap="round" />
        <Path d="M30 68 L50 68" stroke="#1E2D45" strokeWidth="2" strokeLinecap="round" />
        <G>
          <Path
            d="M58 12 L78 72 Q79 76 76 77 L72 78 Q69 79 68 75 L48 15 Q47 12 50 11 L54 10 Q57 9 58 12 Z"
            fill="url(#penGrad)"
            opacity="0.95"
          />
          <Path
            d="M48 15 L50 11 Q51 9 53 10"
            stroke="#00E0FF"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        </G>
        <Circle cx="73" cy="76" r="6" fill="url(#glowGrad)" />
        <Circle cx="73" cy="76" r="2.5" fill="#00E0FF" opacity="0.9" />
      </G>
    </Svg>
  );
}
