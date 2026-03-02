"use client";

import { useState } from "react";
import { Star, Heart, HeartOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingButtonsProps {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  genreIds: number[];
  currentRating?: number;
  isFavorited?: boolean;
  onRatingChange?: (rating: number) => void;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

export function RatingButtons({
  tmdbId,
  mediaType,
  title,
  posterPath,
  genreIds,
  currentRating,
  isFavorited = false,
  onRatingChange,
  onFavoriteChange,
}: RatingButtonsProps) {
  const [rating, setRating] = useState(currentRating || 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [favorited, setFavorited] = useState(isFavorited);
  const [saving, setSaving] = useState(false);

  const handleRate = async (newRating: number) => {
    setSaving(true);
    setRating(newRating);

    try {
      await fetch("/api/profile/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId,
          mediaType,
          title,
          posterPath,
          rating: newRating,
          genreIds,
        }),
      });
      onRatingChange?.(newRating);
    } catch (error) {
      console.error("Failed to save rating:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleFavorite = async () => {
    setSaving(true);
    const newFavorited = !favorited;
    setFavorited(newFavorited);

    try {
      if (newFavorited) {
        await fetch("/api/profile/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, mediaType, title, posterPath, genreIds }),
        });
      } else {
        await fetch(`/api/profile/favorites?tmdbId=${tmdbId}`, {
          method: "DELETE",
        });
      }
      onFavoriteChange?.(newFavorited);
    } catch (error) {
      console.error("Failed to update favorite:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Star rating */}
      <div className="flex items-center gap-1">
        <span className="mr-1 text-sm font-medium text-[var(--muted-foreground)]">
          Rate:
        </span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            disabled={saving}
            className="transition-transform hover:scale-110 disabled:opacity-50"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                (hoveredStar >= star || (!hoveredStar && rating >= star))
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-[var(--muted-foreground)]"
              )}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-1 text-sm text-[var(--muted-foreground)]">
            {rating}/5
          </span>
        )}
      </div>

      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        disabled={saving}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          favorited
            ? "bg-red-500/10 text-red-500"
            : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
        )}
      >
        {favorited ? (
          <>
            <Heart className="h-4 w-4 fill-current" />
            Favorited
          </>
        ) : (
          <>
            <HeartOff className="h-4 w-4" />
            Favorite
          </>
        )}
      </button>
    </div>
  );
}
