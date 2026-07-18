import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { formatArea } from "@/lib/utils";
import type { ProjectWithRelations } from "@/lib/data";

export default function ProjectCard({
  project,
}: {
  project: ProjectWithRelations;
}) {
  const cover =
    project.images.find((im) => im.isCover) ??
    project.images.find((im) => im.category === "live") ??
    project.images[0];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ink-line">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={cover.alt ?? project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a1c16] to-[#15100c]">
            <LogoMark className="h-14 text-cream/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-70" />
        <span className="absolute left-4 top-4 rounded-full bg-ink/60 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-cream backdrop-blur">
          {project.type.name}
        </span>
        <span className="absolute bottom-4 right-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-brand text-brand-fg opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <i className="ti ti-arrow-up-right" />
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-2xl text-cream transition-colors group-hover:text-brand">
          {project.title}
        </h3>
        <span className="shrink-0 text-xs uppercase tracking-[0.1em] text-cream/45">
          {[project.location, formatArea(project.areaSqft)]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    </Link>
  );
}
