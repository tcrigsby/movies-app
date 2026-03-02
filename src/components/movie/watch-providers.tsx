"use client";

import Image from "next/image";
import type { TMDBProvider } from "@/types/tmdb";

interface WatchProvidersProps {
  flatrate?: TMDBProvider[];
  rent?: TMDBProvider[];
  buy?: TMDBProvider[];
  link?: string;
}

function ProviderBadge({ provider }: { provider: TMDBProvider }) {
  return (
    <div className="group/provider relative flex-shrink-0" title={provider.provider_name}>
      <Image
        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
        alt={provider.provider_name}
        width={48}
        height={48}
        className="rounded-lg"
      />
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover/provider:opacity-100">
        {provider.provider_name}
      </span>
    </div>
  );
}

function ProviderSection({
  title,
  providers,
}: {
  title: string;
  providers: TMDBProvider[];
}) {
  if (providers.length === 0) return null;

  return (
    <div>
      <h4 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">
        {title}
      </h4>
      <div className="flex flex-wrap gap-3">
        {providers.map((provider) => (
          <ProviderBadge key={provider.provider_id} provider={provider} />
        ))}
      </div>
    </div>
  );
}

export function WatchProviders({ flatrate, rent, buy, link }: WatchProvidersProps) {
  const hasAny =
    (flatrate && flatrate.length > 0) ||
    (rent && rent.length > 0) ||
    (buy && buy.length > 0);

  if (!hasAny) {
    return (
      <div className="rounded-xl border bg-[var(--card)] p-4">
        <h3 className="mb-2 text-lg font-semibold">Where to Watch</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          No streaming information available for your region.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-[var(--card)] p-4">
      <h3 className="mb-4 text-lg font-semibold">Where to Watch</h3>
      <div className="space-y-4">
        {flatrate && <ProviderSection title="Stream" providers={flatrate} />}
        {rent && <ProviderSection title="Rent" providers={rent} />}
        {buy && <ProviderSection title="Buy" providers={buy} />}
      </div>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline"
        >
          View all options on TMDB
        </a>
      )}
      <p className="mt-3 text-xs text-[var(--muted-foreground)]">
        Powered by JustWatch
      </p>
    </div>
  );
}
