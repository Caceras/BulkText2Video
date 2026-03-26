"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Job } from "@/lib/types";
import { JobProgress } from "@/components/JobProgress";
import { AssetGrid } from "@/components/AssetGrid";

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) {
          setError("Job not found");
          return;
        }
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error("Failed to fetch job:", err);
      }
    };

    fetchJob();
    const interval = setInterval(fetchJob, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">{error}</p>
        <Link href="/jobs" className="text-blue-400 hover:underline mt-4 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/jobs" className="text-sm text-gray-400 hover:text-gray-300">
            &larr; Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold text-white mt-1">Job Results</h1>
          <p className="text-sm font-mono text-gray-400 mt-1">
            {job.config.promptTemplate}
          </p>
        </div>
        {job.status === "completed" && (
          <a
            href={`/api/jobs/${jobId}/download`}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
          >
            Download ZIP
          </a>
        )}
      </div>

      <JobProgress job={job} />

      <div>
        <h2 className="text-lg font-medium text-white mb-4">
          Generated Assets ({job.combinations.length})
        </h2>
        <AssetGrid combinations={job.combinations} />
      </div>
    </div>
  );
}
