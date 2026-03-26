import { NextRequest, NextResponse } from "next/server";
import { getElevenLabsClient } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const file = formData.get("file") as File;

    if (!name || !file) {
      return NextResponse.json({ error: "Name and audio file are required" }, { status: 400 });
    }

    const client = getElevenLabsClient();

    const result = await client.voices.ivc.create({
      name,
      files: [file],
    });

    return NextResponse.json({ voice: result });
  } catch (error) {
    console.error("Voice clone error:", error);
    return NextResponse.json({ error: "Voice cloning failed" }, { status: 500 });
  }
}
