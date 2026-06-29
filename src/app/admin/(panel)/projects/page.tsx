import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LogoMark } from "@/components/Logo";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { type: true, images: true },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-cream">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-[#2a1006] hover:scale-[1.02]"
        >
          <i className="ti ti-plus" /> New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-line p-12 text-center">
          <p className="text-cream/55">No projects yet.</p>
          <Link
            href="/admin/projects/new"
            className="mt-4 inline-block text-sm text-brand hover:underline"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const cover =
              p.images.find((i) => i.isCover) ?? p.images[0];
            return (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="group overflow-hidden rounded-2xl border border-ink-line bg-ink-card transition-colors hover:border-brand/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-ink-soft">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <LogoMark className="h-10 text-cream/10" />
                    </div>
                  )}
                  {!p.published && (
                    <span className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-1 text-[10px] uppercase tracking-wide text-cream/70">
                      Draft
                    </span>
                  )}
                  {p.featured && (
                    <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] uppercase tracking-wide text-[#2a1006]">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-serif text-xl text-cream">{p.title}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-cream/45">
                    <span>{p.type.name}</span>
                    <span>{p.images.length} images</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
