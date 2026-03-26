import { NextRequest, NextResponse } from "next/server";
import { getElevenLabsClient } from "@/lib/elevenlabs";
import type { VoiceInfo } from "@/lib/types";

// In-memory cache with 5-min TTL
let cachedVoices: VoiceInfo[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || "";

  try {
    const now = Date.now();
    if (!cachedVoices || now - cacheTime > CACHE_TTL) {
      const client = getElevenLabsClient();
      const response = await client.voices.getAll();
      cachedVoices = (response.voices || []).map((v) => ({
        voiceId: v.voiceId!,
        name: v.name || "Unknown",
        category: v.category || "other",
        labels: (v.labels as Record<string, string>) || {},
        previewUrl: v.previewUrl || undefined,
      }));
      cacheTime = now;
    }

    let voices = cachedVoices;
    if (search) {
      const q = search.toLowerCase();
      voices = voices.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          Object.values(v.labels).some((l) => l.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ voices });
  } catch (error) {
    console.error("Voice listing error:", error);
    return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 });
  }
}
