import { getMovieDetails, getTVDetails } from "@/lib/tmdb";
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
    const details =
      mediaType === "tv"
        ? await getTVDetails(tmdbId)
        : await getMovieDetails(tmdbId);
    return NextResponse.json(details);
  } catch (error) {
    console.error("TMDB detail error:", error);
    return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
  }
}
