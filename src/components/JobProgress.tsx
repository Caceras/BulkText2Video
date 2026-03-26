"use client";

import type { Job } from "@/lib/types";

interface JobProgressProps {
  job: Job;
}

export function JobProgress({ job }: JobProgressProps) {
  const percent =
    job.totalCombinations > 0
      ? Math.round((job.completedCombinations / job.totalCombinations) * 100)
      : 0;

  const statusColor = {
    queued: "text-yellow-400",
    processing: "text-blue-400",
    completed: "text-green-400",
    failed: "text-red-400",
  }[job.status];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={statusColor}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
        <span className="text-gray-400">
          {job.completedCombinations} / {job.totalCombinations}
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
