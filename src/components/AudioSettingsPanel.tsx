"use client";

import type { AssetTypes, AudioSettings } from "@/lib/types";
import { VoiceSelector } from "./VoiceSelector";

interface AudioSettingsPanelProps {
  assetTypes: AssetTypes;
  value: AudioSettings;
  onChange: (value: AudioSettings) => void;
}

export function AudioSettingsPanel({ assetTypes, value, onChange }: AudioSettingsPanelProps) {
  const showVoiceover = assetTypes.voiceover;
  const showMusic = assetTypes.music;
  const showDialogue = assetTypes.dialogue;

  if (!showVoiceover && !showMusic && !showDialogue && !assetTypes.soundEffect) {
    return null;
  }

  return (
    <div className="space-y-4 bg-gray-800/30 border border-gray-700 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-300">Audio Settings</label>

      {/* Voiceover settings */}
      {showVoiceover && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Voiceover</p>
          <VoiceSelector
            label="Voice"
            value={value.voiceover?.voiceId}
            onChange={(voiceId, voiceName) =>
              onChange({
                ...value,
                voiceover: { ...value.voiceover, voiceId, voiceName },
              })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Stability</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={value.voiceover?.stability ?? 0.5}
                onChange={(e) =>
                  onChange({
                    ...value,
                    voiceover: { ...value.voiceover, stability: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-blue-500"
              />
              <span className="text-xs text-gray-500">{(value.voiceover?.stability ?? 0.5).toFixed(2)}</span>
            </div>
            <div>
              <label className="text-xs text-gray-400">Similarity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={value.voiceover?.similarityBoost ?? 0.75}
                onChange={(e) =>
                  onChange({
                    ...value,
                    voiceover: { ...value.voiceover, similarityBoost: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-blue-500"
              />
              <span className="text-xs text-gray-500">{(value.voiceover?.similarityBoost ?? 0.75).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Music settings */}
      {showMusic && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Music</p>
          <input
            type="text"
            placeholder="Genre (e.g. corporate, upbeat, ambient)"
            value={value.music?.genre || ""}
            onChange={(e) =>
              onChange({ ...value, music: { ...value.music, genre: e.target.value } })
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-400">Duration (sec)</label>
              <input
                type="number"
                min="3"
                max="600"
                value={Math.round((value.music?.durationMs || 30000) / 1000)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    music: { ...value.music, durationMs: parseInt(e.target.value) * 1000 },
                  })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.music?.instrumental ?? true}
                onChange={(e) =>
                  onChange({
                    ...value,
                    music: { ...value.music, instrumental: e.target.checked },
                  })
                }
                className="accent-blue-500"
              />
              <span className="text-xs text-gray-400">Instrumental</span>
            </label>
          </div>
        </div>
      )}

      {/* Dialogue settings */}
      {showDialogue && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Dialogue</p>
          <textarea
            placeholder={`Script template (e.g.):\nHost: Welcome to our show about [topic]\nGuest: Thanks for having me`}
            value={value.dialogue?.scriptTemplate || ""}
            onChange={(e) =>
              onChange({
                ...value,
                dialogue: { ...value.dialogue, scriptTemplate: e.target.value },
              })
            }
            className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono"
          />
          <p className="text-xs text-gray-500">
            Use &quot;Role: text&quot; format. Assign voices to roles below.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(value.dialogue?.voices || [{ role: "Host", voiceId: "" }, { role: "Guest", voiceId: "" }]).map(
              (voice, idx) => (
                <div key={idx} className="space-y-1">
                  <input
                    type="text"
                    placeholder="Role name"
                    value={voice.role}
                    onChange={(e) => {
                      const voices = [...(value.dialogue?.voices || [])];
                      voices[idx] = { ...voices[idx], role: e.target.value };
                      onChange({ ...value, dialogue: { ...value.dialogue, voices } });
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <VoiceSelector
                    label=""
                    value={voice.voiceId}
                    onChange={(voiceId, voiceName) => {
                      const voices = [...(value.dialogue?.voices || [])];
                      voices[idx] = { ...voices[idx], voiceId, voiceName };
                      onChange({ ...value, dialogue: { ...value.dialogue, voices } });
                    }}
                  />
                </div>
              )
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              const voices = [...(value.dialogue?.voices || []), { role: "", voiceId: "" }];
              onChange({ ...value, dialogue: { ...value.dialogue, voices } });
            }}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            + Add role
          </button>
        </div>
      )}

      {/* Sound effect settings */}
      {assetTypes.soundEffect && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Sound Effect</p>
          <input
            type="text"
            placeholder="Description override (or uses expanded prompt)"
            value={value.soundEffect?.description || ""}
            onChange={(e) =>
              onChange({
                ...value,
                soundEffect: { ...value.soundEffect, description: e.target.value },
              })
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
