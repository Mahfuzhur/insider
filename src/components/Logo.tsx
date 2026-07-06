import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 116"
      className={cn("h-8 w-auto", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M50 2 96 29v58L50 114 4 87V29L50 2Z"
        fill="currentColor"
      />
      <rect x="30" y="30" width="11" height="56" rx="2" fill="var(--ink)" />
      <rect x="45" y="22" width="11" height="64" rx="2" fill="var(--ink)" />
      <rect x="60" y="30" width="11" height="56" rx="2" fill="var(--ink)" />
    </svg>
  );
}

export function Logo({
  className,
  showTagline = true,
  logoUrl,
  name = "INSIDER",
  tagline = "Adorn Your World",
}: {
  className?: string;
  showTagline?: boolean;
  logoUrl?: string | null;
  name?: string;
  tagline?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        className={cn("h-11 w-auto object-contain", className)}
      />
    );
  }
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark className="h-9 text-brand" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[22px] uppercase tracking-[0.18em] text-cream">
          {name}
        </span>
        {showTagline && tagline && (
          <span className="mt-1 text-[9px] uppercase tracking-[0.28em] text-brand/90">
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
