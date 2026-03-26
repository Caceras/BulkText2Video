import { NextRequest, NextResponse } from "next/server";
import { createPodcast } from "@/lib/generators/podcast";

export async function POST(request: NextRequest) {
  try {
    const { text, title } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }

    const result = await createPodcast({ text, title });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Podcast creation error:", error);
    return NextResponse.json({ error: "Failed to create podcast" }, { status: 500 });
  }
}
