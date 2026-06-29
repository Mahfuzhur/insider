import { prisma } from "@/lib/prisma";
import {
  createService,
  updateService,
  deleteService,
} from "@/app/admin/actions";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl text-cream">Services</h1>
      <p className="mt-1 text-sm text-cream/50">
        Shown on the homepage and services page. Icons use{" "}
        <a
          href="https://tabler.io/icons"
          target="_blank"
          rel="noreferrer"
          className="text-brand hover:underline"
        >
          Tabler icon
        </a>{" "}
        names (e.g. ti-armchair).
      </p>

      <form
        action={createService}
        className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-ink-line p-3"
      >
        <input name="title" placeholder="New service title" className="admin-input" />
        <input
          name="icon"
          placeholder="ti-armchair"
          defaultValue="ti-armchair"
          className="admin-input max-w-[160px]"
        />
        <button className="shrink-0 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-[#2a1006] hover:scale-[1.02]">
          Add
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {services.map((s) => (
          <form
            key={s.id}
            action={updateService}
            className="rounded-2xl border border-ink-line bg-ink-card p-5"
          >
            <input type="hidden" name="id" value={s.id} />
            <div className="flex items-start gap-4">
              <i className={`ti ${s.icon} mt-1 text-3xl text-brand`} />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-[1fr_160px_90px] gap-3">
                  <input name="title" defaultValue={s.title} className="admin-input" />
                  <input name="icon" defaultValue={s.icon} className="admin-input" />
                  <input
                    name="order"
                    type="number"
                    defaultValue={s.order}
                    className="admin-input"
                    title="Sort order"
                  />
                </div>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={s.description ?? ""}
                  className="admin-input"
                />
                <div className="flex items-center gap-4">
                  <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#2a1006] hover:scale-[1.02]">
                    Save
                  </button>
                  <button
                    formAction={deleteService}
                    className="text-sm text-cream/45 hover:text-brand"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
