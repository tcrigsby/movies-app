import type {
  TMDBMovie,
  TMDBMovieDetail,
  TMDBTVDetail,
  TMDBCredits,
  TMDBWatchProviders,
  TMDBSearchResponse,
  TMDBGenreListResponse,
  TMDBMediaItem,
} from "@/types/tmdb";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

async function tmdbFetch<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value)
    );
  }

  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
  if (!token || token === "your_tmdb_read_access_token_here") {
    throw new Error(
      "TMDB API token not configured. Please set TMDB_API_READ_ACCESS_TOKEN in .env.local"
    );
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Search
export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDBSearchResponse<TMDBMovie>> {
  return tmdbFetch("/search/movie", {
    query,
    page: String(page),
    include_adult: "false",
  });
}

export async function searchTV(
  query: string,
  page = 1
): Promise<TMDBSearchResponse<TMDBMovie>> {
  return tmdbFetch("/search/tv", {
    query,
    page: String(page),
    include_adult: "false",
  });
}

export async function searchMulti(
  query: string,
  page = 1
): Promise<TMDBSearchResponse<TMDBMediaItem>> {
  return tmdbFetch("/search/multi", {
    query,
    page: String(page),
    include_adult: "false",
  });
}

// Details
export async function getMovieDetails(id: number): Promise<TMDBMovieDetail> {
  return tmdbFetch(`/movie/${id}`);
}

export async function getTVDetails(id: number): Promise<TMDBTVDetail> {
  return tmdbFetch(`/tv/${id}`);
}

// Credits
export async function getMovieCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch(`/movie/${id}/credits`);
}

export async function getTVCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch(`/tv/${id}/credits`);
}

// Watch Providers
export async function getMovieWatchProviders(
  id: number
): Promise<TMDBWatchProviders> {
  return tmdbFetch(`/movie/${id}/watch/providers`);
}

export async function getTVWatchProviders(
  id: number
): Promise<TMDBWatchProviders> {
  return tmdbFetch(`/tv/${id}/watch/providers`);
}

// Trending
export async function getTrending(
  mediaType: "movie" | "tv" | "all" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<TMDBSearchResponse<TMDBMediaItem>> {
  return tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
}

// Discover
export async function discoverMovies(
  params: Record<string, string> = {}
): Promise<TMDBSearchResponse<TMDBMovie>> {
  return tmdbFetch("/discover/movie", {
    include_adult: "false",
    sort_by: "popularity.desc",
    ...params,
  });
}

export async function discoverTV(
  params: Record<string, string> = {}
): Promise<TMDBSearchResponse<TMDBMovie>> {
  return tmdbFetch("/discover/tv", {
    include_adult: "false",
    sort_by: "popularity.desc",
    ...params,
  });
}

// Recommendations & Similar
export async function getMovieRecommendations(
  id: number,
  page = 1
): Promise<TMDBSearchResponse<TMDBMovie>> {
  return tmdbFetch(`/movie/${id}/recommendations`, { page: String(page) });
}

export async function getTVRecommendations(
  id: number,
  page = 1
): Promise<TMDBSearchResponse<TMDBMovie>> {
  return tmdbFetch(`/tv/${id}/recommendations`, { page: String(page) });
}

// Genres
export async function getMovieGenres(): Promise<TMDBGenreListResponse> {
  return tmdbFetch("/genre/movie/list");
}

export async function getTVGenres(): Promise<TMDBGenreListResponse> {
  return tmdbFetch("/genre/tv/list");
}

// Image URL helper
export function getImageUrl(
  path: string | null,
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Get display title (works for both movies and TV shows)
export function getTitle(item: TMDBMediaItem): string {
  if ("title" in item) return item.title;
  if ("name" in item) return item.name;
  return "Unknown";
}

// Get release year
export function getReleaseYear(item: TMDBMediaItem): string {
  const date =
    "release_date" in item ? item.release_date : ("first_air_date" in item ? item.first_air_date : "");
  return date ? new Date(date).getFullYear().toString() : "";
}

// Get media type
export function getMediaType(item: TMDBMediaItem): "movie" | "tv" {
  if (item.media_type) return item.media_type;
  if ("title" in item) return "movie";
  return "tv";
}
