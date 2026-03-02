import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const ratings = await prisma.movieRating.findMany({
      where: { userId: "default-user" },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Ratings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tmdbId, mediaType, title, posterPath, rating, review, genreIds } = body;

    if (!tmdbId || rating === undefined || !title) {
      return NextResponse.json(
        { error: "Missing required fields: tmdbId, title, rating" },
        { status: 400 }
      );
    }

    // Ensure user exists
    await prisma.userProfile.upsert({
      where: { id: "default-user" },
      update: {},
      create: { id: "default-user" },
    });

    const movieRating = await prisma.movieRating.upsert({
      where: {
        userId_tmdbId: { userId: "default-user", tmdbId: Number(tmdbId) },
      },
      update: {
        rating: Number(rating),
        ...(review !== undefined && { review }),
        ...(posterPath !== undefined && { posterPath }),
        ...(genreIds !== undefined && { genreIds: JSON.stringify(genreIds) }),
      },
      create: {
        tmdbId: Number(tmdbId),
        mediaType: mediaType || "movie",
        title,
        posterPath: posterPath || null,
        rating: Number(rating),
        review: review || null,
        genreIds: genreIds ? JSON.stringify(genreIds) : "[]",
        userId: "default-user",
      },
    });

    return NextResponse.json(movieRating);
  } catch (error) {
    console.error("Rating create error:", error);
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}
