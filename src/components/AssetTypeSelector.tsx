"use client";

import type { AssetTypes } from "@/lib/types";

interface AssetTypeSelectorProps {
  value: AssetTypes;
  onChange: (value: AssetTypes) => void;
}

const VISUAL_OPTIONS = [
  { key: "images" as const, label: "Images", icon: "🖼", description: "Gemini Imagen" },
  { key: "video" as const, label: "Video", icon: "🎬", description: "Gemini Veo" },
];

const TEXT_OPTIONS = [
  { key: "copy" as const, label: "Copy", icon: "📝", description: "Gemini text" },
];

const AUDIO_OPTIONS = [
  { key: "voiceover" as const, label: "Voiceover", icon: "🎙", description: "ElevenLabs TTS" },
  { key: "music" as const, label: "Music", icon: "🎵", description: "ElevenLabs Music" },
  { key: "soundEffect" as const, label: "Sound FX", icon: "🔊", description: "ElevenLabs SFX" },
  { key: "dialogue" as const, label: "Dialogue", icon: "💬", description: "Multi-voice" },
];

function AssetButton({
  option,
  active,
  onToggle,
}: {
  option: { key: keyof AssetTypes; label: string; icon: string; description: string };
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`p-3 rounded-lg border text-left transition-all ${
        active
          ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
      }`}
    >
      <div className="text-xl mb-1">{option.icon}</div>
      <div className="font-medium text-sm text-white">{option.label}</div>
      <div className="text-xs text-gray-400">{option.description}</div>
    </button>
  );
}

export function AssetTypeSelector({ value, onChange }: AssetTypeSelectorProps) {
  const toggle = (key: keyof AssetTypes) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">Asset Types</label>

      <div className="space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Visual</p>
        <div className="grid grid-cols-2 gap-3">
          {VISUAL_OPTIONS.map((opt) => (
            <AssetButton key={opt.key} option={opt} active={value[opt.key]} onToggle={() => toggle(opt.key)} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Text</p>
        <div className="grid grid-cols-2 gap-3">
          {TEXT_OPTIONS.map((opt) => (
            <AssetButton key={opt.key} option={opt} active={value[opt.key]} onToggle={() => toggle(opt.key)} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Audio (ElevenLabs)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AUDIO_OPTIONS.map((opt) => (
            <AssetButton key={opt.key} option={opt} active={value[opt.key]} onToggle={() => toggle(opt.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}
