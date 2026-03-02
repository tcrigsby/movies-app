import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    TMDB_API_READ_ACCESS_TOKEN: !!process.env.TMDB_API_READ_ACCESS_TOKEN,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    TURSO_DATABASE_URL: !!process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: !!process.env.TURSO_AUTH_TOKEN,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV || "unknown",
  };

  // Quick TMDB test
  let tmdbOk = false;
  try {
    const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
    if (token) {
      const res = await fetch(
        "https://api.themoviedb.org/3/configuration",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      tmdbOk = res.ok;
    }
  } catch {
    tmdbOk = false;
  }

  return NextResponse.json({
    status: "ok",
    envVars: checks,
    tmdbConnection: tmdbOk,
    timestamp: new Date().toISOString(),
  });
}
