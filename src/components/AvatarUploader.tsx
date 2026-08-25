import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Wand2, Image as ImageIcon } from 'lucide-react';
import { playButtonClick } from '../utils/audio';

interface AvatarUploaderProps {
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
  characterName: string;
}

const PRESET_AVATARS = [
  {
    name: 'Tomisin (Birthday Sorceress)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    tag: '🎂 Birthday Queen',
  },
  {
    name: 'Gryffindor Lion Duelist',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    tag: '🦁 Courage',
  },
  {
    name: 'Ravenclaw Astral Sage',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    tag: '🦅 Wisdom',
  },
  {
    name: 'Hufflepuff Golden Herbalist',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    tag: '🦡 Loyalty',
  },
  {
    name: 'Slytherin Shadow Enchanter',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    tag: '🐍 Ambition',
  },
];

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatarUrl,
  onAvatarChange,
  characterName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Optimize & resize image on canvas to avoid huge payloads over websockets
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            onAvatarChange(compressed);
          } else {
            onAvatarChange(result);
          }
          setIsProcessing(false);
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4" id="avatar-uploader-section">
      <div className="flex flex-col items-center">
        {/* Enchanted Runic Avatar Frame */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-amber-400 to-rose-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
          
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-amber-300 shadow-[0_0_25px_rgba(236,72,153,0.6)] bg-slate-900 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={characterName || 'Character Avatar'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <ImageIcon className="w-12 h-12 text-pink-300/60" />
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
              </div>
            )}
          </div>

          <button
            type="button"
            id="btn-trigger-upload"
            onClick={() => {
              playButtonClick();
              fileInputRef.current?.click();
            }}
            className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-pink-600 to-amber-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-amber-200"
            title="Upload custom photo"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-pink-200 mt-2 font-medium tracking-wide">
          ✨ Upload Character Avatar (Drag & Drop or Click)
        </p>
      </div>

      {/* Drag & Drop Box */}
      <div
        id="avatar-drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center bg-pink-950/20 backdrop-blur-sm ${
          isDragging
            ? 'border-amber-400 bg-pink-900/40 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
            : 'border-pink-500/40 hover:border-amber-300/80 hover:bg-pink-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />
        <div className="flex items-center justify-center gap-2 text-pink-200 text-xs sm:text-sm font-medium">
          <Wand2 className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Click to select custom image from device</span>
        </div>
      </div>

      {/* Quick Magical Presets */}
      <div>
        <div className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Or Choose a Magical Hogwarts Preset:</span>
        </div>
        <div className="grid grid-cols-5 gap-2" id="preset-avatars-list">
          {PRESET_AVATARS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              id={`preset-avatar-${idx}`}
              onClick={() => {
                playButtonClick();
                onAvatarChange(preset.url);
              }}
              className={`group relative rounded-lg overflow-hidden border-2 transition-all p-0.5 ${
                avatarUrl === preset.url
                  ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] scale-105'
                  : 'border-pink-500/30 hover:border-pink-300'
              }`}
              title={preset.name}
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="w-full h-12 sm:h-14 object-cover rounded"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-pink-200 text-center py-0.5 truncate px-0.5">
                {preset.tag}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
