"use client";

import { useEffect, useState, useRef } from "react";
import type { VoiceInfo } from "@/lib/types";

interface VoiceSelectorProps {
  value?: string;
  onChange: (voiceId: string, voiceName: string) => void;
  label?: string;
}

export function VoiceSelector({ value, onChange, label = "Voice" }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/voices")
      .then((r) => r.json())
      .then((data) => setVoices(data.voices || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? voices.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.category.toLowerCase().includes(search.toLowerCase())
      )
    : voices;

  const selectedVoice = voices.find((v) => v.voiceId === value);

  const playPreview = (voice: VoiceInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!voice.previewUrl) return;

    if (playingId === voice.voiceId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(voice.previewUrl);
    audioRef.current = audio;
    setPlayingId(voice.voiceId);
    audio.play();
    audio.onended = () => setPlayingId(null);
  };

  return (
    <div className="space-y-1 relative">
      <label className="text-xs text-gray-400">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-left text-sm text-white hover:border-gray-600 transition-colors"
      >
        {selectedVoice ? selectedVoice.name : loading ? "Loading voices..." : "Select a voice"}
        <span className="float-right text-gray-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search voices..."
              className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-gray-500">No voices found</p>
            ) : (
              filtered.map((voice) => (
                <button
                  key={voice.voiceId}
                  type="button"
                  onClick={() => {
                    onChange(voice.voiceId, voice.name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700/50 transition-colors ${
                    voice.voiceId === value ? "bg-blue-500/10" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{voice.name}</p>
                    <p className="text-xs text-gray-500">{voice.category}</p>
                  </div>
                  {voice.previewUrl && (
                    <button
                      type="button"
                      onClick={(e) => playPreview(voice, e)}
                      className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 shrink-0"
                    >
                      {playingId === voice.voiceId ? "⏹" : "▶"}
                    </button>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
