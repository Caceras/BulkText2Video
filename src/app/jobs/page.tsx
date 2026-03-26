"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Job } from "@/lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: string) =>
    ({
      queued: "bg-yellow-500/20 text-yellow-400",
      processing: "bg-blue-500/20 text-blue-400",
      completed: "bg-green-500/20 text-green-400",
      failed: "bg-red-500/20 text-red-400",
    })[status] || "bg-gray-500/20 text-gray-400";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Loading jobs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Jobs</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          New Generation
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No jobs yet</p>
          <p className="mt-1">Create your first generation to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-mono text-gray-300 truncate">
                    {job.config.promptTemplate}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{job.totalCombinations} combinations</span>
                    <span>{new Date(job.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {job.status === "processing" && (
                    <span className="text-xs text-gray-400">
                      {job.completedCombinations}/{job.totalCombinations}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(job.status)}`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
