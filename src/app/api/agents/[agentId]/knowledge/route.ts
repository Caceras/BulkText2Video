import { NextRequest, NextResponse } from "next/server";
import { getElevenLabsClient } from "@/lib/elevenlabs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  // agentId kept for future use when linking docs to specific agents
  await params;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const client = getElevenLabsClient();

    const result = await client.conversationalAi.addToKnowledgeBase({
      file,
      name: name || file.name,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Knowledge upload error:", error);
    return NextResponse.json({ error: "Failed to upload knowledge" }, { status: 500 });
  }
}
