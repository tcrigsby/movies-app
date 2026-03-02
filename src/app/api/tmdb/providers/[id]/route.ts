import { getMovieWatchProviders, getTVWatchProviders } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mediaType = request.nextUrl.searchParams.get("type") || "movie";
  const tmdbId = parseInt(id);

  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const providers =
      mediaType === "tv"
        ? await getTVWatchProviders(tmdbId)
        : await getMovieWatchProviders(tmdbId);
    return NextResponse.json(providers);
  } catch (error) {
    console.error("TMDB providers error:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}
