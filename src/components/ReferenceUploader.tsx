"use client";

import { useCallback, useState } from "react";

interface ReferenceUploaderProps {
  value?: string;
  onChange: (path: string | undefined) => void;
}

export function ReferenceUploader({ value, onChange }: ReferenceUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.path) {
          onChange(data.path);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        upload(file);
      }
    },
    [upload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
    },
    [upload]
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Reference Image <span className="text-gray-500">(optional)</span>
      </label>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Reference"
            className="h-32 rounded-lg border border-gray-700 object-cover"
          />
          <button
            onClick={() => onChange(undefined)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
          >
            x
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 hover:border-gray-600"
          }`}
          onClick={() => document.getElementById("ref-upload")?.click()}
        >
          <input
            id="ref-upload"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          {uploading ? (
            <p className="text-gray-400">Uploading...</p>
          ) : (
            <p className="text-gray-400">
              Drop an image here or <span className="text-blue-400">browse</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
