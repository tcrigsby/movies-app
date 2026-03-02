"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MovieGrid } from "@/components/movie/movie-grid";
import type { TMDBMediaItem } from "@/types/tmdb";
import { Loader2, Search } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<TMDBMediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    async function search() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(
            data.results.filter(
              (item: TMDBMediaItem & { media_type?: string }) =>
                item.media_type === "movie" || item.media_type === "tv"
            )
          );
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }
    search();
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search Results</h1>
        {query && (
          <p className="text-sm text-[var(--muted-foreground)]">
            Showing results for &quot;{query}&quot;
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <MovieGrid items={results} layout="grid" />
      )}

      {!loading && query && results.length === 0 && (
        <div className="py-12 text-center">
          <Search className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" />
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            No results found for &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
