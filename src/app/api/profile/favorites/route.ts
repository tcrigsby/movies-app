import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const favorites = await prisma.favoriteMovie.findMany({
      where: { userId: "default-user" },
      orderBy: { addedAt: "desc" },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Favorites fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tmdbId, mediaType, title, posterPath, genreIds } = body;

    if (!tmdbId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: tmdbId, title" },
        { status: 400 }
      );
    }

    // Ensure user exists
    await prisma.userProfile.upsert({
      where: { id: "default-user" },
      update: {},
      create: { id: "default-user" },
    });

    const favorite = await prisma.favoriteMovie.create({
      data: {
        tmdbId: Number(tmdbId),
        mediaType: mediaType || "movie",
        title,
        posterPath: posterPath || null,
        genreIds: genreIds ? JSON.stringify(genreIds) : "[]",
        userId: "default-user",
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error("Favorite create error:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tmdbId = request.nextUrl.searchParams.get("tmdbId");

    if (!tmdbId) {
      return NextResponse.json({ error: "Missing tmdbId" }, { status: 400 });
    }

    await prisma.favoriteMovie.delete({
      where: {
        userId_tmdbId: { userId: "default-user", tmdbId: Number(tmdbId) },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Favorite delete error:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
