import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProject, deleteProject } from "@/app/admin/actions";
import ImageManager from "@/components/admin/ImageManager";
import { parseRooms } from "@/lib/utils";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, types] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.projectType.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!project) notFound();

  const rooms = parseRooms(project.rooms).join(", ");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/projects"
          className="text-xs uppercase tracking-[0.1em] text-cream/50 hover:text-cream"
        >
          ← Projects
        </Link>
        <Link
          href={`/projects/${project.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-cream/55 hover:text-brand"
        >
          <i className="ti ti-external-link" /> View live
        </Link>
      </div>

      <h1 className="font-serif text-3xl text-cream">{project.title}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Details */}
        <form action={updateProject} className="space-y-5">
          <input type="hidden" name="id" value={project.id} />
          <Field label="Title" name="title" defaultValue={project.title} required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Lbl>Category</Lbl>
              <select
                name="typeId"
                defaultValue={project.typeId}
                className="admin-input"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <Field label="URL slug" name="slug" defaultValue={project.slug} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Location" name="location" defaultValue={project.location ?? ""} />
            <Field
              label="Total area (sqft)"
              name="areaSqft"
              type="number"
              defaultValue={project.areaSqft ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Year completed"
              name="yearCompleted"
              type="number"
              defaultValue={project.yearCompleted ?? ""}
            />
            <Field label="Duration" name="duration" defaultValue={project.duration ?? ""} />
          </div>

          <Field
            label="Design style / theme"
            name="designStyle"
            defaultValue={project.designStyle ?? ""}
          />
          <Field
            label="Rooms / spaces (comma separated)"
            name="rooms"
            defaultValue={rooms}
          />

          <div>
            <Lbl>Short description</Lbl>
            <textarea
              name="shortDescription"
              rows={3}
              defaultValue={project.shortDescription ?? ""}
              className="admin-input"
            />
          </div>

          <div>
            <Lbl>Client testimonial</Lbl>
            <textarea
              name="testimonial"
              rows={2}
              defaultValue={project.testimonial ?? ""}
              className="admin-input"
            />
          </div>
          <Field
            label="Testimonial author"
            name="testimonialAuthor"
            defaultValue={project.testimonialAuthor ?? ""}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Sort order"
              name="order"
              type="number"
              defaultValue={project.order}
            />
            <div className="flex items-end gap-5 pb-1">
              <Check name="featured" label="Featured" defaultChecked={project.featured} />
              <Check name="published" label="Published" defaultChecked={project.published} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-brand-fg hover:scale-[1.02]"
            >
              Save changes
            </button>
          </div>
        </form>

        {/* Images */}
        <div>
          <h2 className="mb-4 text-sm uppercase tracking-[0.1em] text-cream/50">
            Images
          </h2>
          <ImageManager projectId={project.id} images={project.images} />
        </div>
      </div>

      <div className="mt-12 border-t border-ink-line pt-6">
        <form action={deleteProject}>
          <input type="hidden" name="id" value={project.id} />
          <button className="inline-flex items-center gap-2 text-sm text-cream/45 hover:text-brand">
            <i className="ti ti-trash" /> Delete this project
          </button>
        </form>
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
      {children}
    </span>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <Lbl>{label}</Lbl>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="admin-input"
      />
    </label>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-cream/80">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-brand"
      />
      {label}
    </label>
  );
}
