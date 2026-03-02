"use client";

import { MovieCard } from "./movie-card";
import type { TMDBMediaItem } from "@/types/tmdb";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface MovieGridProps {
  items: TMDBMediaItem[];
  layout?: "scroll" | "grid";
}

export function MovieGrid({ items, layout = "scroll" }: MovieGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <MovieCard key={item.id} item={item} className="w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="group/scroll relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-2 top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-[var(--background)] shadow-lg ring-1 ring-[var(--border)] transition-opacity group-hover/scroll:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-2 top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-[var(--background)] shadow-lg ring-1 ring-[var(--border)] transition-opacity group-hover/scroll:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <MovieCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
