import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProject } from "@/app/admin/actions";

export default async function NewProjectPage() {
  const types = await prisma.projectType.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/admin/projects"
        className="text-xs uppercase tracking-[0.1em] text-cream/50 hover:text-cream"
      >
        ← Projects
      </Link>
      <h1 className="mt-3 font-serif text-3xl text-cream">New project</h1>
      <p className="mt-1 text-sm text-cream/50">
        Start with a title and category — you can add details and images next.
      </p>

      {types.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink-line p-6 text-sm text-cream/55">
          Create a category first under{" "}
          <Link href="/admin/types" className="text-brand hover:underline">
            Categories
          </Link>
          .
        </div>
      ) : (
        <form action={createProject} className="mt-8 space-y-5">
          <Labeled label="Project title">
            <input
              name="title"
              required
              placeholder="e.g. Nazrul Islam Residence"
              className="admin-input"
            />
          </Labeled>
          <Labeled label="Category">
            <select name="typeId" required className="admin-input">
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Labeled>
          <button
            type="submit"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-[#2a1006] hover:scale-[1.02]"
          >
            Create &amp; continue
          </button>
        </form>
      )}
    </div>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
        {label}
      </span>
      {children}
    </label>
  );
}
