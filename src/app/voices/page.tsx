"use client";

import { useEffect, useState, useRef } from "react";
import type { VoiceInfo } from "@/lib/types";

export default function VoicesPage() {
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Design voice state
  const [designOpen, setDesignOpen] = useState(false);
  const [designDesc, setDesignDesc] = useState("");
  const [designText, setDesignText] = useState("");
  const [designing, setDesigning] = useState(false);
  const [previews, setPreviews] = useState<Array<{ audioBase64: string; generatedVoiceId: string }>>([]);

  // Clone voice state
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [cloning, setCloning] = useState(false);

  const fetchVoices = async () => {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/voices${q}`);
      const data = await res.json();
      setVoices(data.voices || []);
    } catch (err) {
      console.error("Failed to fetch voices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, [search]);

  const playPreview = (url: string, id: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingId(id);
    audio.play();
    audio.onended = () => setPlayingId(null);
  };

  const handleDesign = async () => {
    setDesigning(true);
    try {
      const res = await fetch("/api/voices/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: designDesc, text: designText }),
      });
      const data = await res.json();
      setPreviews(data.previews || []);
    } catch (err) {
      console.error("Design failed:", err);
    } finally {
      setDesigning(false);
    }
  };

  const handleClone = async () => {
    if (!cloneFile || !cloneName) return;
    setCloning(true);
    try {
      const formData = new FormData();
      formData.append("name", cloneName);
      formData.append("file", cloneFile);
      await fetch("/api/voices/clone", { method: "POST", body: formData });
      setCloneOpen(false);
      setCloneName("");
      setCloneFile(null);
      fetchVoices();
    } catch (err) {
      console.error("Clone failed:", err);
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Voices</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDesignOpen(!designOpen)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            Design Voice
          </button>
          <button
            onClick={() => setCloneOpen(!cloneOpen)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Clone Voice
          </button>
        </div>
      </div>

      {/* Design Voice Panel */}
      {designOpen && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-white">Design a Voice</h2>
          <textarea
            value={designDesc}
            onChange={(e) => setDesignDesc(e.target.value)}
            placeholder="Describe the voice (e.g. 'A warm, professional female voice with a slight British accent')"
            className="w-full h-20 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <input
            type="text"
            value={designText}
            onChange={(e) => setDesignText(e.target.value)}
            placeholder="Preview text (optional)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleDesign}
            disabled={!designDesc || designing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white text-sm rounded-lg"
          >
            {designing ? "Generating previews..." : "Generate Previews"}
          </button>
          {previews.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Previews:</p>
              {previews.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                  <span className="text-sm text-gray-300">Preview {i + 1}</span>
                  {p.audioBase64 && (
                    <audio
                      src={`data:audio/mp3;base64,${p.audioBase64}`}
                      controls
                      className="h-8 flex-1"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clone Voice Panel */}
      {cloneOpen && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-white">Clone a Voice</h2>
          <input
            type="text"
            value={cloneName}
            onChange={(e) => setCloneName(e.target.value)}
            placeholder="Voice name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setCloneFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
          />
          <button
            onClick={handleClone}
            disabled={!cloneName || !cloneFile || cloning}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm rounded-lg"
          >
            {cloning ? "Cloning..." : "Clone Voice"}
          </button>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search voices..."
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Voice Grid */}
      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading voices...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {voices.map((voice) => (
            <div
              key={voice.voiceId}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white text-sm">{voice.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">
                  {voice.category}
                </span>
              </div>
              {Object.keys(voice.labels).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(voice.labels).map(([key, val]) => (
                    <span key={key} className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-500">
                      {val}
                    </span>
                  ))}
                </div>
              )}
              {voice.previewUrl && (
                <button
                  onClick={() => playPreview(voice.previewUrl!, voice.voiceId)}
                  className="text-xs px-3 py-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  {playingId === voice.voiceId ? "⏹ Stop" : "▶ Preview"}
                </button>
              )}
              <p className="text-xs text-gray-600 font-mono truncate">{voice.voiceId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
