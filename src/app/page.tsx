"use client";

import { useEffect, useState } from "react";
import { MovieGrid } from "@/components/movie/movie-grid";
import type { TMDBMediaItem } from "@/types/tmdb";
import { Loader2, Sparkles, MessageCircle } from "lucide-react";
import Link from "next/link";

interface FeedSection {
  id: string;
  title: string;
  subtitle?: string;
  items: TMDBMediaItem[];
  type: string;
}

export default function HomePage() {
  const [sections, setSections] = useState<FeedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch("/api/recommendations");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load recommendations");
        }
        setSections(data.sections || []);
      } catch (err) {
        console.error("Feed error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(`Could not load recommendations: ${message}`);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Loading recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-xl border bg-[var(--card)] p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold">Something Went Wrong</h2>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">{error}</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            If deployed, make sure environment variables are set correctly in your hosting provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Welcome to MovieMind
            </h1>
            <p className="mt-2 max-w-xl text-sm text-purple-100 md:text-base">
              Your AI-powered movie and TV show companion. Get personalized
              recommendations that improve the more you use the app.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50"
              >
                <MessageCircle className="h-4 w-4" />
                Chat for Recommendations
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
              >
                <Sparkles className="h-4 w-4" />
                Set Up Preferences
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feed sections */}
      {sections.map((section) => (
        <section key={section.id}>
          <div className="mb-3">
            <h2 className="text-xl font-bold">{section.title}</h2>
            {section.subtitle && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {section.subtitle}
              </p>
            )}
          </div>
          <MovieGrid items={section.items} />
        </section>
      ))}

      {sections.length === 0 && !loading && (
        <div className="py-12 text-center">
          <p className="text-lg font-medium">No recommendations yet</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Start by{" "}
            <Link href="/chat" className="text-[var(--primary)] hover:underline">
              chatting with MovieMind
            </Link>{" "}
            or{" "}
            <Link href="/profile" className="text-[var(--primary)] hover:underline">
              setting up your preferences
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
