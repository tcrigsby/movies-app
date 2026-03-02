import type { UserProfile, MovieRating, FavoriteMovie } from "@prisma/client";

type ProfileWithRelations = UserProfile & {
  ratings: MovieRating[];
  favorites: FavoriteMovie[];
};

export function buildSystemPrompt(profile: ProfileWithRelations | null): string {
  if (!profile) {
    return getBasePrompt("Movie Fan", "", "", "", "", "", "");
  }

  const genres: string[] = JSON.parse(profile.favoriteGenres);
  const actors: { id: number; name: string }[] = JSON.parse(profile.favoriteActors);
  const services: string[] = JSON.parse(profile.streamingServices);

  const likedMovies = profile.ratings.filter((r) => r.rating >= 4);
  const dislikedMovies = profile.ratings.filter((r) => r.rating <= 2);

  const genreStr =
    genres.length > 0 ? genres.join(", ") : "Not set yet — ask them!";
  const actorStr =
    actors.length > 0
      ? actors.map((a) => a.name).join(", ")
      : "Not set yet — ask them!";
  const serviceStr =
    services.length > 0 ? services.join(", ") : "Not specified";

  const likedStr =
    likedMovies.length > 0
      ? likedMovies.map((m) => `- ${m.title} (${m.mediaType}, rated ${m.rating}/5)`).join("\n")
      : "None yet";

  const dislikedStr =
    dislikedMovies.length > 0
      ? dislikedMovies.map((m) => `- ${m.title} (${m.mediaType}, rated ${m.rating}/5)`).join("\n")
      : "None yet";

  const favoritesStr =
    profile.favorites.length > 0
      ? profile.favorites.map((m) => `- ${m.title} (${m.mediaType})`).join("\n")
      : "None yet";

  return getBasePrompt(
    profile.displayName,
    genreStr,
    actorStr,
    serviceStr,
    likedStr,
    dislikedStr,
    favoritesStr
  );
}

function getBasePrompt(
  name: string,
  genres: string,
  actors: string,
  services: string,
  liked: string,
  disliked: string,
  favorites: string
): string {
  return `You are a knowledgeable and enthusiastic movie and TV show recommendation assistant called "MovieMind". You help users discover films and shows they will love based on their tastes.

## User Profile
- Name: ${name || "Movie Fan"}
- Favorite Genres: ${genres || "Not set yet — ask them!"}
- Favorite Actors: ${actors || "Not set yet — ask them!"}
- Streaming Services: ${services || "Not specified"}

## Movies/Shows They Loved:
${liked || "None yet"}

## Movies/Shows They Disliked:
${disliked || "None yet"}

## Favorites List:
${favorites || "None yet"}

## Your Behavior
1. **BE BRIEF.** Keep responses short and punchy — 2-3 sentences per recommendation max. No long paragraphs or essays.
2. When recommending a movie or TV show, include this structured marker on its own line so the app can render a rich card:
   [MOVIE_REC: {"tmdbId": <number>, "title": "<title>", "year": <year>, "mediaType": "movie" or "tv"}]
3. Give a quick 1-sentence reason WHY they'd like each pick. Don't over-explain.
4. If the user has no profile data, ask 1-2 short questions about their tastes.
5. Recommend 2-3 titles per response unless they ask for more.
6. Be casual and direct — like texting a friend who knows movies, not writing a review.
7. If they mention liking or disliking something, acknowledge it briefly and adjust.
8. Never recommend movies they have already rated or favorited unless they ask.
9. When you don't know a TMDB ID, just mention the title by name without the marker.
10. Skip intros and filler. Get straight to the recommendations.`;
}
