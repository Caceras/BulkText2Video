"use client";

import type { CombinationResult } from "@/lib/types";

interface AssetGridProps {
  combinations: CombinationResult[];
}

function AudioPlayer({ src, label }: { src: string; label: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500">{label}</p>
      <audio src={src} controls className="w-full h-8" />
    </div>
  );
}

export function AssetGrid({ combinations }: AssetGridProps) {
  if (combinations.length === 0) {
    return <p className="text-gray-500 text-center py-8">No results yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {combinations.map((combo) => (
        <div
          key={combo.index}
          className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden"
        >
          {combo.assets.image && (
            <img
              src={combo.assets.image}
              alt={combo.expandedPrompt}
              className="w-full h-48 object-cover"
            />
          )}

          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-400 font-mono truncate">
              {combo.expandedPrompt}
            </p>

            <div className="flex flex-wrap gap-1">
              {Object.entries(combo.variableValues).map(([key, val]) => (
                <span
                  key={key}
                  className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300"
                >
                  {key}: {val}
                </span>
              ))}
            </div>

            {combo.assets.copy && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  {combo.assets.copy.tagline}
                </p>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {combo.assets.copy.description}
                </p>
              </div>
            )}

            {combo.assets.video && (
              <video src={combo.assets.video} controls className="w-full rounded" />
            )}

            {combo.assets.voiceover && (
              <AudioPlayer src={combo.assets.voiceover} label="Voiceover" />
            )}

            {combo.assets.music && (
              <AudioPlayer src={combo.assets.music} label="Music" />
            )}

            {combo.assets.soundEffect && (
              <AudioPlayer src={combo.assets.soundEffect} label="Sound FX" />
            )}

            {combo.assets.dialogue && (
              <AudioPlayer src={combo.assets.dialogue} label="Dialogue" />
            )}

            <div className="flex items-center gap-2">
              {combo.status === "processing" && (
                <span className="text-xs text-blue-400">Processing...</span>
              )}
              {combo.status === "completed" && (
                <span className="text-xs text-green-400">Done</span>
              )}
              {combo.status === "failed" && (
                <span className="text-xs text-red-400" title={combo.error}>
                  Failed
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
