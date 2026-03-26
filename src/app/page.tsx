"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PromptBuilder } from "@/components/PromptBuilder";
import { VariableInputs } from "@/components/VariableInputs";
import { ReferenceUploader } from "@/components/ReferenceUploader";
import { AssetTypeSelector } from "@/components/AssetTypeSelector";
import { AudioSettingsPanel } from "@/components/AudioSettingsPanel";
import { GenerateButton } from "@/components/GenerateButton";
import type { AssetTypes, AudioSettings } from "@/lib/types";

function parseVariables(template: string): string[] {
  const matches = template.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  const seen = new Set<string>();
  const variables: string[] = [];
  for (const match of matches) {
    const name = match.slice(1, -1);
    if (!seen.has(name)) {
      seen.add(name);
      variables.push(name);
    }
  }
  return variables;
}

export default function HomePage() {
  const router = useRouter();
  const [promptTemplate, setPromptTemplate] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string[]>>({});
  const [referenceImage, setReferenceImage] = useState<string | undefined>();
  const [assetTypes, setAssetTypes] = useState<AssetTypes>({
    images: true,
    copy: false,
    video: false,
    voiceover: false,
    music: false,
    soundEffect: false,
    dialogue: false,
  });
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectedVariables = useMemo(() => parseVariables(promptTemplate), [promptTemplate]);

  const combinationCount = useMemo(() => {
    if (detectedVariables.length === 0) return promptTemplate.trim() ? 1 : 0;
    return detectedVariables.reduce((total, varName) => {
      const count = variableValues[varName]?.length || 0;
      return total * (count || 1);
    }, 1);
  }, [detectedVariables, variableValues, promptTemplate]);

  const canSubmit = useMemo(() => {
    if (!promptTemplate.trim()) return false;
    const hasAsset = Object.values(assetTypes).some(Boolean);
    if (!hasAsset) return false;
    for (const v of detectedVariables) {
      if (!variableValues[v]?.length) return false;
    }
    return true;
  }, [promptTemplate, assetTypes, detectedVariables, variableValues]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptTemplate,
          variables: variableValues,
          referenceImage,
          assetTypes,
          audioSettings,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create job");
        return;
      }
      router.push(`/jobs/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [promptTemplate, variableValues, referenceImage, assetTypes, audioSettings, router]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Brand Assets Generator</h1>
        <p className="mt-2 text-gray-400">
          Create a prompt template with [variables], provide values, and bulk-generate assets.
        </p>
      </div>

      <div className="space-y-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <ReferenceUploader value={referenceImage} onChange={setReferenceImage} />
        <PromptBuilder
          value={promptTemplate}
          onChange={setPromptTemplate}
          detectedVariables={detectedVariables}
        />
        <VariableInputs
          variables={detectedVariables}
          values={variableValues}
          onChange={setVariableValues}
        />
        <AssetTypeSelector value={assetTypes} onChange={setAssetTypes} />
        <AudioSettingsPanel
          assetTypes={assetTypes}
          value={audioSettings}
          onChange={setAudioSettings}
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <GenerateButton
          combinationCount={combinationCount}
          loading={loading}
          disabled={!canSubmit}
          onClick={handleGenerate}
        />
      </div>
    </div>
  );
}
