import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Wrap DB call so chat still works even if database is unavailable
  let profile = null;
  try {
    profile = await prisma.userProfile.findUnique({
      where: { id: "default-user" },
      include: { ratings: true, favorites: true },
    });
  } catch (dbError) {
    console.error("Database error in chat (continuing without profile):", dbError);
  }

  const systemPrompt = buildSystemPrompt(profile);

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
    maxTokens: 512,
  });

  return result.toDataStreamResponse();
}
