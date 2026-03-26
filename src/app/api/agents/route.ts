import { NextRequest, NextResponse } from "next/server";
import { createAgent, listAgents } from "@/lib/agents";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, systemPrompt, firstMessage, voiceId } = body;

    if (!name || !systemPrompt) {
      return NextResponse.json(
        { error: "Name and system prompt are required" },
        { status: 400 }
      );
    }

    const result = await createAgent({ name, systemPrompt, firstMessage, voiceId });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Create agent error:", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await listAgents();
    return NextResponse.json(result);
  } catch (error) {
    console.error("List agents error:", error);
    return NextResponse.json({ error: "Failed to list agents" }, { status: 500 });
  }
}
