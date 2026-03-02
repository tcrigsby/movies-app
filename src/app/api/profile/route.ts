import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    let profile = await prisma.userProfile.findUnique({
      where: { id: "default-user" },
      include: { ratings: true, favorites: true },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { id: "default-user" },
        include: { ratings: true, favorites: true },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, favoriteGenres, favoriteActors, streamingServices } = body;

    const profile = await prisma.userProfile.upsert({
      where: { id: "default-user" },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(favoriteGenres !== undefined && {
          favoriteGenres: JSON.stringify(favoriteGenres),
        }),
        ...(favoriteActors !== undefined && {
          favoriteActors: JSON.stringify(favoriteActors),
        }),
        ...(streamingServices !== undefined && {
          streamingServices: JSON.stringify(streamingServices),
        }),
      },
      create: {
        id: "default-user",
        ...(displayName && { displayName }),
        ...(favoriteGenres && { favoriteGenres: JSON.stringify(favoriteGenres) }),
        ...(favoriteActors && { favoriteActors: JSON.stringify(favoriteActors) }),
        ...(streamingServices && {
          streamingServices: JSON.stringify(streamingServices),
        }),
      },
      include: { ratings: true, favorites: true },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
