import { searchMulti } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const page = request.nextUrl.searchParams.get("page") || "1";

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  try {
    const results = await searchMulti(query, parseInt(page));
    return NextResponse.json(results);
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
