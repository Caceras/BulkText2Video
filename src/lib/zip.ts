import archiver from "archiver";
import path from "path";
import fs from "fs";
import { PassThrough } from "stream";

/**
 * Create a ZIP archive of all generated assets for a job.
 * Returns a readable stream of the ZIP file.
 */
export function createJobZip(jobId: string): NodeJS.ReadableStream {
  const jobDir = path.join(process.cwd(), "public", "generated", jobId);

  if (!fs.existsSync(jobDir)) {
    throw new Error(`No generated files found for job ${jobId}`);
  }

  const passthrough = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(passthrough);
  archive.directory(jobDir, false);
  archive.finalize();

  return passthrough;
}
