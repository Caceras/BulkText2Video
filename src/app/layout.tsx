import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BulkText2Video - AI Brand Assets Generator",
  description: "Bulk-generate brand assets using AI: images, copy, video, and audio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="text-xl font-bold text-white">
                BulkText2Video
              </a>
              <div className="flex gap-6">
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Generate
                </a>
                <a href="/jobs" className="text-gray-300 hover:text-white transition-colors">
                  Jobs
                </a>
                <a href="/voices" className="text-gray-300 hover:text-white transition-colors">
                  Voices
                </a>
                <a href="/podcasts" className="text-gray-300 hover:text-white transition-colors">
                  Podcasts
                </a>
                <a href="/agents" className="text-gray-300 hover:text-white transition-colors">
                  Agents
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
