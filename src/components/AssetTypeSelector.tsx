"use client";

import type { AssetTypes } from "@/lib/types";

interface AssetTypeSelectorProps {
  value: AssetTypes;
  onChange: (value: AssetTypes) => void;
}

const ASSET_OPTIONS = [
  { key: "images" as const, label: "Images", icon: "🖼", description: "Generate images via Gemini Imagen" },
  { key: "copy" as const, label: "Copy", icon: "📝", description: "Taglines & descriptions via Gemini" },
  { key: "video" as const, label: "Video", icon: "🎬", description: "Short video clips via Gemini Veo" },
  { key: "audio" as const, label: "Audio", icon: "🔊", description: "Voiceovers via ElevenLabs" },
];

export function AssetTypeSelector({ value, onChange }: AssetTypeSelectorProps) {
  const toggle = (key: keyof AssetTypes) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Asset Types
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ASSET_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => toggle(option.key)}
            className={`p-4 rounded-lg border text-left transition-all ${
              value[option.key]
                ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
            }`}
          >
            <div className="text-2xl mb-2">{option.icon}</div>
            <div className="font-medium text-sm text-white">{option.label}</div>
            <div className="text-xs text-gray-400 mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
