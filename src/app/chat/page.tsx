"use client";

import { useChat } from "@ai-sdk/react";
import {
  Send,
  Loader2,
  Bot,
  User,
  Film,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import Link from "next/link";

interface MovieRec {
  tmdbId: number;
  title: string;
  year: number;
  mediaType: "movie" | "tv";
}

function parseMovieRecs(content: string): {
  parts: { type: "text" | "movie"; content: string; movie?: MovieRec }[];
} {
  const regex = /\[MOVIE_REC:\s*(\{.*?\})\]/g;
  const parts: { type: "text" | "movie"; content: string; movie?: MovieRec }[] = [];
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(content)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    // Parse the movie rec
    try {
      const movie = JSON.parse(match[1]) as MovieRec;
      parts.push({
        type: "movie",
        content: match[0],
        movie,
      });
    } catch {
      parts.push({ type: "text", content: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }

  return { parts: parts.length > 0 ? parts : [{ type: "text", content }] };
}

function InlineMovieCard({ movie }: { movie: MovieRec }) {
  return (
    <Link
      href={`/movie/${movie.tmdbId}?type=${movie.mediaType}`}
      className="my-2 flex items-center gap-3 rounded-lg border bg-[var(--muted)] p-3 transition-colors hover:bg-[var(--accent)]"
    >
      <Film className="h-8 w-8 flex-shrink-0 text-[var(--primary)]" />
      <div>
        <p className="font-medium">
          {movie.title}{" "}
          <span className="text-[var(--muted-foreground)]">({movie.year})</span>
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          {movie.mediaType === "tv" ? "TV Show" : "Movie"} — Click to see
          details & where to watch
        </p>
      </div>
    </Link>
  );
}

function ChatMessage({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const { parts } = parseMovieRecs(content);

  return (
    <div
      className={cn(
        "flex gap-3",
        role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          role === "user"
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "bg-[var(--muted)]"
        )}
      >
        {role === "user" ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          role === "user"
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "bg-[var(--muted)]"
        )}
      >
        {parts.map((part, i) =>
          part.type === "movie" && part.movie ? (
            <InlineMovieCard key={i} movie={part.movie} />
          ) : (
            <div key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
              {part.content}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, status, setMessages } =
    useChat({
      api: "/api/chat",
    });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const isLoading = status === "streaming";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-6rem)]">
      {/* Chat header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Chat with MovieMind</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Tell me about your tastes and I&apos;ll recommend movies & shows
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-xl border bg-[var(--card)] p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-[var(--primary)]/10 p-4">
              <Bot className="h-10 w-10 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Hi! I&apos;m MovieMind
              </h2>
              <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
                I&apos;m your personal movie recommendation assistant. Tell me
                what kind of movies or shows you enjoy, and I&apos;ll suggest
                something perfect for you!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "I love sci-fi movies with great visuals",
                "Suggest a funny TV show for tonight",
                "What's similar to Breaking Bad?",
                "I want something dark and thrilling",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    handleInputChange({
                      target: { value: suggestion },
                    } as React.ChangeEvent<HTMLTextAreaElement>);
                    setTimeout(() => {
                      const form = document.querySelector("form");
                      form?.requestSubmit();
                    }, 50);
                  }}
                  className="rounded-lg border bg-[var(--background)] px-3 py-2 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role as "user" | "assistant"}
            content={message.content}
          />
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)]">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-end gap-2"
      >
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Tell me what you want to watch..."
            rows={1}
            className="w-full resize-none rounded-xl border bg-[var(--background)] px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}
