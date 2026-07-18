import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectGallery from "@/components/site/ProjectGallery";
import { getProjectBySlug } from "@/lib/data";
import { formatArea, parseRooms } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return { title: project?.title ?? "Project" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !project.published) notFound();

  const rooms = parseRooms(project.rooms);

  const facts: { icon: string; label: string; value: string | null }[] = [
    { icon: "ti-map-pin", label: "Location", value: project.location },
    { icon: "ti-ruler-2", label: "Total area", value: formatArea(project.areaSqft) },
    {
      icon: "ti-calendar",
      label: "Year completed",
      value: project.yearCompleted ? String(project.yearCompleted) : null,
    },
    { icon: "ti-clock", label: "Duration", value: project.duration },
    { icon: "ti-palette", label: "Design style", value: project.designStyle },
  ];

  return (
    <article className="container-x pb-28 pt-32">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-cream/55 hover:text-cream"
      >
        <i className="ti ti-arrow-left text-brand" /> All projects
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-serif text-5xl leading-[0.98] text-cream md:text-7xl">
            {project.title}
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.08em] text-cream/55">
            {[project.location, project.yearCompleted && `Completed ${project.yearCompleted}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <span className="rounded-full border border-brand/40 bg-brand/15 px-4 py-2 text-xs uppercase tracking-[0.08em] text-brand">
          {project.type.name}
        </span>
      </div>

      <div className="mt-10">
        <ProjectGallery images={project.images} title={project.title} />
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-[1.4fr_0.9fr]">
        <div>
          <h2 className="mb-4 text-[12px] uppercase tracking-widest2 text-brand">
            About the project
          </h2>
          {project.shortDescription && (
            <p className="text-lg leading-relaxed text-cream/75">
              {project.shortDescription}
            </p>
          )}

          {rooms.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2.5">
              {rooms.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-ink-line bg-cream/5 px-4 py-1.5 text-sm text-cream/75"
                >
                  {r}
                </span>
              ))}
            </div>
          )}

          {project.testimonial && (
            <blockquote className="mt-12 border-l-2 border-brand pl-6">
              <p className="font-serif text-2xl leading-snug text-cream">
                “{project.testimonial}”
              </p>
              {project.testimonialAuthor && (
                <cite className="mt-3 block text-xs uppercase not-italic tracking-[0.1em] text-cream/50">
                  — {project.testimonialAuthor}
                </cite>
              )}
            </blockquote>
          )}
        </div>

        <aside className="rounded-2xl border border-ink-line bg-cream/[0.03] px-6">
          {facts
            .filter((f) => f.value)
            .map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 border-b border-ink-line py-4 last:border-none"
              >
                <i className={`ti ${f.icon} text-lg text-brand`} />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-cream/45">
                    {f.label}
                  </div>
                  <div className="text-cream">{f.value}</div>
                </div>
              </div>
            ))}
        </aside>
      </div>

      <div className="mt-20 border-t border-ink-line pt-10 text-center">
        <p className="font-serif text-3xl text-cream">
          Like what you see?
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-brand-fg transition-transform hover:scale-[1.03]"
        >
          Start your project <i className="ti ti-arrow-right" />
        </Link>
      </div>
    </article>
  );
}
