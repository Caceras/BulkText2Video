"use client";

import { useCallback } from "react";

interface PromptBuilderProps {
  value: string;
  onChange: (value: string) => void;
  detectedVariables: string[];
}

export function PromptBuilder({ value, onChange, detectedVariables }: PromptBuilderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Prompt Template
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder='e.g. "Create a [style] version of this logo for [platform]"'
        className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
      />
      {detectedVariables.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Detected variables:</span>
          {detectedVariables.map((v) => (
            <span
              key={v}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
            >
              [{v}]
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
