import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { JobConfigSchema, Job } from "@/lib/types";
import { createJob, getAllJobs } from "@/lib/store";
import { expandCombinations } from "@/lib/template";
import { runPipeline } from "@/lib/pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = JobConfigSchema.parse(body);

    // Validate at least one asset type selected
    const { images, copy, video, audio } = config.assetTypes;
    if (!images && !copy && !video && !audio) {
      return NextResponse.json(
        { error: "Select at least one asset type" },
        { status: 400 }
      );
    }

    // Calculate total combinations
    const expanded = expandCombinations(config.promptTemplate, config.variables);

    const job: Job = {
      id: crypto.randomUUID(),
      config,
      status: "queued",
      combinations: [],
      totalCombinations: expanded.length,
      completedCombinations: 0,
      createdAt: new Date().toISOString(),
    };

    createJob(job);

    // Start pipeline in background (don't await)
    runPipeline(job.id).catch((err) => {
      console.error(`Pipeline failed for job ${job.id}:`, err);
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid config", details: error }, { status: 400 });
    }
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function GET() {
  const jobs = getAllJobs();
  return NextResponse.json(jobs);
}
