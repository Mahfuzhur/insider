import Link from "next/link";
import ProjectCard from "@/components/site/ProjectCard";
import { getProjects, getProjectTypes } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Work" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const [types, projects] = await Promise.all([
    getProjectTypes(),
    getProjects({ typeSlug: type }),
  ]);

  return (
    <div className="container-x pb-28 pt-36">
      <span className="eyebrow">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Our work
      </span>
      <h1 className="mt-4 max-w-2xl text-balance font-serif text-5xl text-cream md:text-7xl">
        Projects we&apos;ve brought to life.
      </h1>

      <div className="mt-10 flex flex-wrap gap-3">
        <FilterPill href="/projects" active={!type} label="All" />
        {types.map((t) => (
          <FilterPill
            key={t.id}
            href={`/projects?type=${t.slug}`}
            active={type === t.slug}
            label={t.name}
          />
        ))}
      </div>

      {projects.length ? (
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-cream/50">
          No projects in this category yet.
        </p>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-5 py-2 text-[13px] uppercase tracking-[0.1em] transition-colors",
        active
          ? "border-brand bg-brand text-[#2a1006]"
          : "border-ink-line text-cream/65 hover:border-cream/40 hover:text-cream"
      )}
    >
      {label}
    </Link>
  );
}
