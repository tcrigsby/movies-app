"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/tmdb";
import {
  Loader2,
  Save,
  Star,
  Heart,
  Trash2,
  User,
  Film,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  displayName: string;
  favoriteGenres: string;
  favoriteActors: string;
  streamingServices: string;
  ratings: Rating[];
  favorites: Favorite[];
}

interface Rating {
  id: string;
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  rating: number;
  genreIds: string;
}

interface Favorite {
  id: string;
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
}

const ALL_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const STREAMING_SERVICES = [
  "Netflix",
  "Amazon Prime Video",
  "Disney+",
  "Hulu",
  "HBO Max",
  "Apple TV+",
  "Peacock",
  "Paramount+",
  "Crunchyroll",
  "Tubi",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"preferences" | "ratings" | "favorites">(
    "preferences"
  );

  // Editable fields
  const [displayName, setDisplayName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [actorInput, setActorInput] = useState("");
  const [actors, setActors] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data: Profile = await res.json();
          setProfile(data);
          setDisplayName(data.displayName);
          setSelectedGenres(JSON.parse(data.favoriteGenres));
          setActors(JSON.parse(data.favoriteActors));
          setSelectedServices(JSON.parse(data.streamingServices));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          favoriteGenres: selectedGenres,
          favoriteActors: actors,
          streamingServices: selectedServices,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((g) => g !== genreId)
        : [...prev, genreId]
    );
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const addActor = () => {
    if (actorInput.trim() && !actors.find((a) => a.name === actorInput.trim())) {
      setActors([...actors, { id: Date.now(), name: actorInput.trim() }]);
      setActorInput("");
    }
  };

  const removeActor = (id: number) => {
    setActors(actors.filter((a) => a.id !== id));
  };

  const handleRemoveFavorite = async (tmdbId: number) => {
    try {
      await fetch(`/api/profile/favorites?tmdbId=${tmdbId}`, { method: "DELETE" });
      setProfile((prev) =>
        prev
          ? { ...prev, favorites: prev.favorites.filter((f) => f.tmdbId !== tmdbId) }
          : prev
      );
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]">
          <User className="h-8 w-8 text-[var(--primary-foreground)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{displayName || "Movie Fan"}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {profile?.ratings.length || 0} ratings &middot;{" "}
            {profile?.favorites.length || 0} favorites
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border bg-[var(--muted)] p-1">
        {(["preferences", "ratings", "favorites"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors",
              activeTab === tab
                ? "bg-[var(--background)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          {/* Display Name */}
          <div className="rounded-xl border bg-[var(--card)] p-4">
            <label className="mb-2 block text-sm font-medium">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="Your name"
            />
          </div>

          {/* Favorite Genres */}
          <div className="rounded-xl border bg-[var(--card)] p-4">
            <label className="mb-3 block text-sm font-medium">
              Favorite Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(String(genre.id))}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    selectedGenres.includes(String(genre.id))
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                  )}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Actors */}
          <div className="rounded-xl border bg-[var(--card)] p-4">
            <label className="mb-2 block text-sm font-medium">
              Favorite Actors
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={actorInput}
                onChange={(e) => setActorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addActor())}
                className="flex-1 rounded-lg border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="Type an actor's name and press Enter"
              />
              <button
                onClick={addActor}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
              >
                Add
              </button>
            </div>
            {actors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {actors.map((actor) => (
                  <span
                    key={actor.id}
                    className="flex items-center gap-1 rounded-full bg-[var(--muted)] px-3 py-1 text-sm"
                  >
                    {actor.name}
                    <button
                      onClick={() => removeActor(actor.id)}
                      className="ml-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Streaming Services */}
          <div className="rounded-xl border bg-[var(--card)] p-4">
            <label className="mb-3 block text-sm font-medium">
              My Streaming Services
            </label>
            <div className="flex flex-wrap gap-2">
              {STREAMING_SERVICES.map((service) => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    selectedServices.includes(service)
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                  )}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Preferences
          </button>
        </div>
      )}

      {/* Ratings Tab */}
      {activeTab === "ratings" && (
        <div className="space-y-3">
          {profile?.ratings.length === 0 && (
            <div className="py-12 text-center">
              <Star className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" />
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                No ratings yet. Rate movies from their detail pages!
              </p>
            </div>
          )}
          {profile?.ratings.map((rating) => (
            <Link
              key={rating.id}
              href={`/movie/${rating.tmdbId}?type=${rating.mediaType}`}
              className="flex items-center gap-4 rounded-xl border bg-[var(--card)] p-3 transition-colors hover:bg-[var(--accent)]"
            >
              {rating.posterPath ? (
                <Image
                  src={getImageUrl(rating.posterPath, "w92") || ""}
                  alt={rating.title}
                  width={48}
                  height={72}
                  className="rounded-lg"
                />
              ) : (
                <div className="flex h-[72px] w-[48px] items-center justify-center rounded-lg bg-[var(--muted)]">
                  <Film className="h-5 w-5 text-[var(--muted-foreground)]" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{rating.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {rating.mediaType === "tv" ? "TV Show" : "Movie"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-4 w-4",
                      s <= rating.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-[var(--muted-foreground)]"
                    )}
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === "favorites" && (
        <div className="space-y-3">
          {profile?.favorites.length === 0 && (
            <div className="py-12 text-center">
              <Heart className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" />
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                No favorites yet. Heart movies from their detail pages!
              </p>
            </div>
          )}
          {profile?.favorites.map((fav) => (
            <div
              key={fav.id}
              className="flex items-center gap-4 rounded-xl border bg-[var(--card)] p-3"
            >
              <Link
                href={`/movie/${fav.tmdbId}?type=${fav.mediaType}`}
                className="flex flex-1 items-center gap-4 transition-colors hover:opacity-80"
              >
                {fav.posterPath ? (
                  <Image
                    src={getImageUrl(fav.posterPath, "w92") || ""}
                    alt={fav.title}
                    width={48}
                    height={72}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="flex h-[72px] w-[48px] items-center justify-center rounded-lg bg-[var(--muted)]">
                    <Film className="h-5 w-5 text-[var(--muted-foreground)]" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{fav.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {fav.mediaType === "tv" ? "TV Show" : "Movie"}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleRemoveFavorite(fav.tmdbId)}
                className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-red-500"
                title="Remove from favorites"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
