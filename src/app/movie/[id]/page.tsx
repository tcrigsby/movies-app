"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";
import { WatchProviders } from "@/components/movie/watch-providers";
import { RatingButtons } from "@/components/movie/rating-buttons";
import type {
  TMDBMovieDetail,
  TMDBTVDetail,
  TMDBWatchProviders,
} from "@/types/tmdb";
import { Loader2, ArrowLeft, Clock, Calendar, Star } from "lucide-react";
import Link from "next/link";

export default function MovieDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const mediaType = searchParams.get("type") || "movie";

  const [details, setDetails] = useState<TMDBMovieDetail | TMDBTVDetail | null>(null);
  const [providers, setProviders] = useState<TMDBWatchProviders | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [detailsRes, providersRes] = await Promise.all([
          fetch(`/api/tmdb/movie/${id}?type=${mediaType}`),
          fetch(`/api/tmdb/providers/${id}?type=${mediaType}`),
        ]);

        if (detailsRes.ok) {
          setDetails(await detailsRes.json());
        }
        if (providersRes.ok) {
          setProviders(await providersRes.json());
        }

        // Load user's rating/favorite status
        const [ratingsRes, favoritesRes] = await Promise.all([
          fetch("/api/profile/ratings"),
          fetch("/api/profile/favorites"),
        ]);

        if (ratingsRes.ok) {
          const ratings = await ratingsRes.json();
          const myRating = ratings.find(
            (r: { tmdbId: number }) => r.tmdbId === Number(id)
          );
          if (myRating) setUserRating(myRating.rating);
        }

        if (favoritesRes.ok) {
          const favorites = await favoritesRes.json();
          const isFav = favorites.some(
            (f: { tmdbId: number }) => f.tmdbId === Number(id)
          );
          setIsFavorited(isFav);
        }
      } catch (error) {
        console.error("Failed to load movie details:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, mediaType]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Movie not found</p>
      </div>
    );
  }

  const isMovie = "title" in details;
  const title = isMovie ? details.title : (details as TMDBTVDetail).name;
  const releaseDate = isMovie
    ? details.release_date
    : (details as TMDBTVDetail).first_air_date;
  const runtime = isMovie ? (details as TMDBMovieDetail).runtime : null;
  const backdropUrl = getImageUrl(details.backdrop_path, "original");
  const posterUrl = getImageUrl(details.poster_path, "w500");
  const genres = details.genres || [];
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  const usProviders = providers?.results?.US;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Hero section with backdrop */}
      <div className="relative overflow-hidden rounded-2xl">
        {backdropUrl && (
          <div className="relative h-[300px] md:h-[400px]">
            <Image
              src={backdropUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        )}

        <div
          className={`${
            backdropUrl ? "absolute bottom-0 left-0 right-0" : ""
          } flex gap-6 p-6`}
        >
          {/* Poster */}
          {posterUrl && (
            <div className="hidden flex-shrink-0 md:block">
              <Image
                src={posterUrl}
                alt={title}
                width={180}
                height={270}
                className="rounded-xl shadow-2xl"
              />
            </div>
          )}

          {/* Info */}
          <div className={backdropUrl ? "text-white" : ""}>
            <h1 className="text-2xl font-bold md:text-4xl">
              {title}{" "}
              {year && (
                <span className="font-normal opacity-70">({year})</span>
              )}
            </h1>

            {details.tagline && (
              <p className="mt-1 italic opacity-70">{details.tagline}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {details.vote_average > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {details.vote_average.toFixed(1)}/10
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(runtime / 60)}h {runtime % 60}m
                </span>
              )}
              {releaseDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(releaseDate).toLocaleDateString()}
                </span>
              )}
              {!isMovie && (details as TMDBTVDetail).number_of_seasons && (
                <span>
                  {(details as TMDBTVDetail).number_of_seasons} Season
                  {(details as TMDBTVDetail).number_of_seasons > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="mt-3 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rating & Favorite */}
      <div className="rounded-xl border bg-[var(--card)] p-4">
        <RatingButtons
          tmdbId={Number(id)}
          mediaType={mediaType}
          title={title}
          posterPath={details.poster_path}
          genreIds={genres.map((g) => g.id)}
          currentRating={userRating}
          isFavorited={isFavorited}
          onRatingChange={setUserRating}
          onFavoriteChange={setIsFavorited}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <div className="rounded-xl border bg-[var(--card)] p-4">
            <h3 className="mb-2 text-lg font-semibold">Overview</h3>
            <p className="leading-relaxed text-[var(--muted-foreground)]">
              {details.overview || "No overview available."}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Where to Watch */}
          <WatchProviders
            flatrate={usProviders?.flatrate}
            rent={usProviders?.rent}
            buy={usProviders?.buy}
            link={usProviders?.link}
          />
        </div>
      </div>
    </div>
  );
}
