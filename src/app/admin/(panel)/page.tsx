import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [projects, types, services, unread, recent] = await Promise.all([
    prisma.project.count(),
    prisma.projectType.count(),
    prisma.service.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { type: true },
    }),
  ]);

  const stats = [
    { label: "Projects", value: projects, href: "/admin/projects", icon: "ti-photo" },
    { label: "Categories", value: types, href: "/admin/types", icon: "ti-category" },
    { label: "Services", value: services, href: "/admin/services", icon: "ti-tools" },
    { label: "Unread messages", value: unread, href: "/admin/messages", icon: "ti-mail" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-cream">Dashboard</h1>
          <p className="mt-1 text-sm text-cream/50">
            Welcome back. Here&apos;s your content at a glance.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-[#2a1006] hover:scale-[1.02]"
        >
          <i className="ti ti-plus" /> New project
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-ink-line bg-ink-card p-5 transition-colors hover:border-brand/40"
          >
            <i className={`ti ${s.icon} text-2xl text-brand`} />
            <div className="mt-3 font-serif text-4xl text-cream">{s.value}</div>
            <div className="text-sm text-cream/50">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-sm uppercase tracking-[0.1em] text-cream/50">
          Recently updated
        </h2>
        <div className="overflow-hidden rounded-2xl border border-ink-line">
          {recent.length === 0 && (
            <p className="p-6 text-sm text-cream/50">No projects yet.</p>
          )}
          {recent.map((p) => (
            <Link
              key={p.id}
              href={`/admin/projects/${p.id}`}
              className="flex items-center justify-between border-b border-ink-line px-5 py-4 last:border-none hover:bg-cream/5"
            >
              <span className="text-cream">{p.title}</span>
              <span className="text-xs uppercase tracking-[0.08em] text-cream/45">
                {p.type.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
