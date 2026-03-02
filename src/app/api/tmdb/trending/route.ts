import { getTrending } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const mediaType =
    (request.nextUrl.searchParams.get("type") as "movie" | "tv" | "all") || "all";
  const timeWindow =
    (request.nextUrl.searchParams.get("window") as "day" | "week") || "week";

  try {
    const results = await getTrending(mediaType, timeWindow);
    return NextResponse.json(results);
  } catch (error) {
    console.error("TMDB trending error:", error);
    return NextResponse.json({ error: "Failed to fetch trending" }, { status: 500 });
  }
}
