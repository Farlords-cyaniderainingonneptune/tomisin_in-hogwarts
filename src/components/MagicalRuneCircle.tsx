import React from 'react';

interface MagicalRuneCircleProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const MagicalRuneCircle: React.FC<MagicalRuneCircleProps> = ({
  className = '',
  size = 400,
  glow = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Runic Ring */}
      <svg
        className={`absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite] ${
          glow ? 'drop-shadow-[0_0_15px_rgba(244,114,182,0.4)]' : ''
        }`}
        viewBox="0 0 400 400"
      >
        <circle
          cx="200"
          cy="200"
          r="190"
          fill="none"
          stroke="#F472B6"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity="0.6"
        />
        <circle
          cx="200"
          cy="200"
          r="175"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.5"
          opacity="0.7"
        />
        {/* Runes along the circle */}
        {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛊ'].map(
          (rune, i) => {
            const angle = (i * 360) / 16;
            const rad = (angle * Math.PI) / 180;
            const x = 200 + 175 * Math.cos(rad);
            const y = 200 + 175 * Math.sin(rad);
            return (
              <text
                key={i}
                x={x}
                y={y}
                fill="#FBBF24"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${angle + 90}, ${x}, ${y})`}
                opacity="0.85"
              >
                {rune}
              </text>
            );
          }
        )}
      </svg>

      {/* Middle Geometric Star Polygon */}
      <svg
        className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite_reverse] drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]"
        viewBox="0 0 400 400"
      >
        {/* Octagram / Sacred Star */}
        <polygon
          points="200,60 230,150 320,150 250,205 275,295 200,240 125,295 150,205 80,150 170,150"
          fill="none"
          stroke="#EC4899"
          strokeWidth="1.2"
          opacity="0.5"
        />
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="#F472B6"
          strokeWidth="1"
          strokeDasharray="3 6"
          opacity="0.5"
        />
      </svg>

      {/* Inner Geometric Sacred Seal */}
      <svg
        className="absolute inset-0 w-full h-full animate-[spin_25s_linear_infinite]"
        viewBox="0 0 400 400"
      >
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <rect
          x="130"
          y="130"
          width="140"
          height="140"
          fill="none"
          stroke="#F472B6"
          strokeWidth="1"
          opacity="0.4"
          transform="rotate(45 200 200)"
        />
        <rect
          x="130"
          y="130"
          width="140"
          height="140"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};
