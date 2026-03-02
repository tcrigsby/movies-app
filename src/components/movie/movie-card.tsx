"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getImageUrl, getTitle, getReleaseYear, getMediaType } from "@/lib/tmdb";
import type { TMDBMediaItem } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  item: TMDBMediaItem;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MovieCard({ item, className, size = "md" }: MovieCardProps) {
  const title = getTitle(item);
  const year = getReleaseYear(item);
  const mediaType = getMediaType(item);
  const posterUrl = getImageUrl(item.poster_path, size === "sm" ? "w185" : "w342");

  const widthClass = {
    sm: "w-[130px]",
    md: "w-[180px]",
    lg: "w-[220px]",
  }[size];

  return (
    <Link
      href={`/movie/${item.id}?type=${mediaType}`}
      className={cn(
        "group flex-shrink-0 cursor-pointer",
        widthClass,
        className
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--muted)]">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 130px, 180px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--muted-foreground)]">
            <span className="text-sm">No Poster</span>
          </div>
        )}

        {/* Rating badge */}
        {item.vote_average > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {item.vote_average.toFixed(1)}
          </div>
        )}

        {/* Media type badge */}
        {mediaType === "tv" && (
          <div className="absolute left-2 top-2 rounded-md bg-[var(--primary)] px-1.5 py-0.5 text-xs font-medium text-white">
            TV
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="mt-2 space-y-0.5">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-[var(--primary)]">
          {title}
        </h3>
        {year && (
          <p className="text-xs text-[var(--muted-foreground)]">{year}</p>
        )}
      </div>
    </Link>
  );
}
