import { NextRequest, NextResponse } from "next/server";
import { getElevenLabsClient } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  try {
    const { description, text } = await request.json();

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const client = getElevenLabsClient();

    const result = await client.textToVoice.createPreviews({
      voiceDescription: description,
      text: text || "Hello, this is a preview of the designed voice.",
    });

    return NextResponse.json({ previews: result.previews || [] });
  } catch (error) {
    console.error("Voice design error:", error);
    return NextResponse.json({ error: "Voice design failed" }, { status: 500 });
  }
}
