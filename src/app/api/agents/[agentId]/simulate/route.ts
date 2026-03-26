import { NextRequest, NextResponse } from "next/server";
import { simulateConversation } from "@/lib/agents";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const result = await simulateConversation(agentId, messages);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Simulate error:", error);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
