import { prisma } from "@/lib/prisma";
import {
  getTrending,
  discoverMovies,
  getMovieRecommendations,
  getTVRecommendations,
} from "@/lib/tmdb";
import type { TMDBMediaItem } from "@/types/tmdb";
import { NextResponse } from "next/server";

interface FeedSection {
  id: string;
  title: string;
  subtitle?: string;
  items: TMDBMediaItem[];
  type: "trending" | "genre" | "similar" | "streaming" | "discover";
}

export async function GET() {
  try {
    // Wrap Prisma call so DB errors don't kill the whole feed
    let profile: Awaited<ReturnType<typeof prisma.userProfile.findUnique>> & {
      ratings?: { tmdbId: number; rating: number; mediaType: string; title: string }[];
      favorites?: { tmdbId: number }[];
    } | null = null;

    try {
      profile = await prisma.userProfile.findUnique({
        where: { id: "default-user" },
        include: { ratings: true, favorites: true },
      });
    } catch (dbError) {
      console.error("Database error (continuing without profile):", dbError);
    }

    const ratedTmdbIds = new Set(
      profile?.ratings?.map((r) => r.tmdbId) ?? []
    );
    const favoriteTmdbIds = new Set(
      profile?.favorites?.map((f) => f.tmdbId) ?? []
    );
    const excludeIds = new Set([...ratedTmdbIds, ...favoriteTmdbIds]);

    const sections: FeedSection[] = [];

    // Trending section — always show
    try {
      const trending = await getTrending("all", "week");
      sections.push({
        id: "trending",
        title: "Trending This Week",
        items: trending.results.slice(0, 20),
        type: "trending",
      });
    } catch {
      // TMDB might not be configured yet
    }

    // Genre-based sections from user preferences
    if (profile) {
      const favoriteGenres: string[] = JSON.parse(profile.favoriteGenres);

      const genreMap: Record<string, string> = {
        "28": "Action",
        "12": "Adventure",
        "16": "Animation",
        "35": "Comedy",
        "80": "Crime",
        "99": "Documentary",
        "18": "Drama",
        "10751": "Family",
        "14": "Fantasy",
        "36": "History",
        "27": "Horror",
        "10402": "Music",
        "9648": "Mystery",
        "10749": "Romance",
        "878": "Science Fiction",
        "10770": "TV Movie",
        "53": "Thriller",
        "10752": "War",
        "37": "Western",
      };

      // Add genre discovery sections (up to 2)
      for (const genreId of favoriteGenres.slice(0, 2)) {
        try {
          const genreName = genreMap[genreId] || `Genre ${genreId}`;
          const discovered = await discoverMovies({
            with_genres: genreId,
            sort_by: "vote_average.desc",
            "vote_count.gte": "100",
          });
          const filtered = discovered.results.filter(
            (m) => !excludeIds.has(m.id)
          );
          if (filtered.length > 0) {
            sections.push({
              id: `genre-${genreId}`,
              title: `Top ${genreName} Movies`,
              subtitle: `Because you love ${genreName.toLowerCase()}`,
              items: filtered.slice(0, 20),
              type: "genre",
            });
          }
        } catch {
          // Skip this genre section
        }
      }

      // "Because you liked X" sections from top-rated movies
      const topRated = profile.ratings
        .filter((r) => r.rating >= 4)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 2);

      for (const rated of topRated) {
        try {
          const recs =
            rated.mediaType === "tv"
              ? await getTVRecommendations(rated.tmdbId)
              : await getMovieRecommendations(rated.tmdbId);
          const filtered = recs.results.filter((m) => !excludeIds.has(m.id));
          if (filtered.length > 0) {
            sections.push({
              id: `similar-${rated.tmdbId}`,
              title: `Because You Liked "${rated.title}"`,
              items: filtered.slice(0, 20),
              type: "similar",
            });
          }
        } catch {
          // Skip this similar section
        }
      }
    }

    // Popular movies discovery
    try {
      const popular = await discoverMovies({
        sort_by: "popularity.desc",
      });
      const filtered = popular.results.filter((m) => !excludeIds.has(m.id));
      sections.push({
        id: "popular",
        title: "Popular Right Now",
        items: filtered.slice(0, 20),
        type: "discover",
      });
    } catch {
      // Skip popular section
    }

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
