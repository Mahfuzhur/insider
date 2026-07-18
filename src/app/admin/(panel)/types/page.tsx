import { prisma } from "@/lib/prisma";
import { createType, deleteType } from "@/app/admin/actions";

export default async function TypesPage() {
  const types = await prisma.projectType.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl text-cream">Categories</h1>
      <p className="mt-1 text-sm text-cream/50">
        Project types like Residential, Commercial, Office — add as many as you
        need. They power the filter on the work page.
      </p>

      <form action={createType} className="mt-6 flex gap-3">
        <input
          name="name"
          required
          placeholder="New category name"
          className="admin-input"
        />
        <button className="shrink-0 rounded-lg bg-brand px-5 text-sm font-medium text-brand-fg hover:scale-[1.02]">
          Add
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-line">
        {types.length === 0 && (
          <p className="p-5 text-sm text-cream/50">No categories yet.</p>
        )}
        {types.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between border-b border-ink-line px-5 py-4 last:border-none"
          >
            <div>
              <div className="text-cream">{t.name}</div>
              <div className="text-xs text-cream/40">
                {t._count.projects} project
                {t._count.projects === 1 ? "" : "s"}
              </div>
            </div>
            {t._count.projects === 0 ? (
              <form action={deleteType}>
                <input type="hidden" name="id" value={t.id} />
                <button
                  className="text-sm text-cream/45 hover:text-brand"
                  title="Delete"
                >
                  <i className="ti ti-trash" />
                </button>
              </form>
            ) : (
              <span className="text-[11px] text-cream/30">In use</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
