"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { slugify, stringifyRooms, parseReviewVideo } from "@/lib/utils";
import { getPalette } from "@/lib/theme";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function num(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}
function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on" || fd.get(key) === "true";
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "project";
  let slug = root;
  let i = 2;
  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${i++}`;
  }
}

function refreshSite() {
  revalidatePath("/");
  revalidatePath("/projects");
}

/* ---------- Projects ---------- */

export async function createProject(fd: FormData) {
  await requireSession();
  const title = str(fd, "title") || "Untitled project";
  const typeId = str(fd, "typeId");
  if (!typeId) throw new Error("A category is required.");

  const project = await prisma.project.create({
    data: { title, slug: await uniqueSlug(title), typeId },
  });
  refreshSite();
  redirect(`/admin/projects/${project.id}`);
}

export async function updateProject(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const title = str(fd, "title");
  await prisma.project.update({
    where: { id },
    data: {
      title,
      slug: await uniqueSlug(str(fd, "slug") || title, id),
      typeId: str(fd, "typeId"),
      location: str(fd, "location") || null,
      areaSqft: num(fd, "areaSqft"),
      yearCompleted: num(fd, "yearCompleted"),
      duration: str(fd, "duration") || null,
      designStyle: str(fd, "designStyle") || null,
      shortDescription: str(fd, "shortDescription") || null,
      testimonial: str(fd, "testimonial") || null,
      testimonialAuthor: str(fd, "testimonialAuthor") || null,
      rooms: stringifyRooms(
        str(fd, "rooms").split(",").map((r) => r.trim())
      ),
      featured: bool(fd, "featured"),
      published: bool(fd, "published"),
      order: num(fd, "order") ?? 0,
    },
  });
  refreshSite();
  revalidatePath(`/admin/projects/${id}`);
  redirect("/admin/projects");
}

export async function deleteProject(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  await prisma.project.delete({ where: { id } });
  refreshSite();
  redirect("/admin/projects");
}

export async function deleteImage(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const projectId = str(fd, "projectId");
  await prisma.projectImage.delete({ where: { id } });
  refreshSite();
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function setCover(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const projectId = str(fd, "projectId");
  await prisma.projectImage.updateMany({
    where: { projectId },
    data: { isCover: false },
  });
  await prisma.projectImage.update({ where: { id }, data: { isCover: true } });
  refreshSite();
  revalidatePath(`/admin/projects/${projectId}`);
}

/* ---------- Categories (types) ---------- */

export async function createType(fd: FormData) {
  await requireSession();
  const name = str(fd, "name");
  if (!name) return;
  const slug = slugify(name);
  const exists = await prisma.projectType.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (!exists) {
    const count = await prisma.projectType.count();
    await prisma.projectType.create({ data: { name, slug, order: count } });
  }
  refreshSite();
  revalidatePath("/admin/types");
}

export async function deleteType(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const inUse = await prisma.project.count({ where: { typeId: id } });
  if (inUse === 0) await prisma.projectType.delete({ where: { id } });
  refreshSite();
  revalidatePath("/admin/types");
}

/* ---------- Services ---------- */

export async function createService(fd: FormData) {
  await requireSession();
  const count = await prisma.service.count();
  await prisma.service.create({
    data: {
      title: str(fd, "title") || "New service",
      description: str(fd, "description") || null,
      icon: str(fd, "icon") || "ti-armchair",
      order: count,
    },
  });
  refreshSite();
  revalidatePath("/admin/services");
}

export async function updateService(fd: FormData) {
  await requireSession();
  await prisma.service.update({
    where: { id: str(fd, "id") },
    data: {
      title: str(fd, "title"),
      description: str(fd, "description") || null,
      icon: str(fd, "icon") || "ti-armchair",
      order: num(fd, "order") ?? 0,
    },
  });
  refreshSite();
  revalidatePath("/admin/services");
}

export async function deleteService(fd: FormData) {
  await requireSession();
  await prisma.service.delete({ where: { id: str(fd, "id") } });
  refreshSite();
  revalidatePath("/admin/services");
}

/* ---------- Settings ---------- */

export async function updateSettings(fd: FormData) {
  await requireSession();
  const data = {
    brandName: str(fd, "brandName"),
    brandTagline: str(fd, "brandTagline"),
    heroLine: str(fd, "heroLine"),
    heroWords: str(fd, "heroWords"),
    heroTagline: str(fd, "heroTagline"),
    aboutTitle: str(fd, "aboutTitle"),
    aboutBody: str(fd, "aboutBody"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    address: str(fd, "address"),
    facebook: str(fd, "facebook"),
    theme: getPalette(str(fd, "theme")).id,
  };
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  refreshSite();
  // The palette lives on the shared root layout, so refresh every route.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function removeLogo() {
  await requireSession();
  await prisma.siteSetting.update({
    where: { id: 1 },
    data: { logoUrl: null },
  });
  refreshSite();
  revalidatePath("/admin/settings");
}

/* ---------- Hero film ---------- */

export async function updateHeroSettings(fd: FormData) {
  await requireSession();
  const speed = Number(str(fd, "heroSpeed"));
  const slowFps = Number(str(fd, "heroSlowFps"));
  const fastFps = Number(str(fd, "heroFastFps"));
  await prisma.siteSetting.update({
    where: { id: 1 },
    data: {
      heroSpeed: Number.isFinite(speed) ? Math.min(12, Math.max(1.5, speed)) : 4.8,
      heroCaption: str(fd, "heroCaption"),
      heroSlowSegments: str(fd, "heroSlowSegments"),
      heroSlowFps: Number.isFinite(slowFps) ? Math.min(24, Math.max(6, slowFps)) : 12,
      heroFastFps: Number.isFinite(fastFps) ? Math.min(8, Math.max(1, fastFps)) : 3,
    },
  });
  refreshSite();
  revalidatePath("/admin/hero");
}

/** Point the hero at a freshly uploaded frame set. */
export async function commitHeroFrames(fd: FormData) {
  await requireSession();
  const setId = str(fd, "setId");
  const count = num(fd, "count");
  if (!/^[a-f0-9-]{8,40}$/.test(setId) || !count || count < 10 || count > 1000) {
    throw new Error("Invalid frame set.");
  }
  await prisma.siteSetting.update({
    where: { id: 1 },
    data: {
      heroFrameDir: `/uploads/hero/${setId}`,
      heroFrameCount: count,
    },
  });
  refreshSite();
  revalidatePath("/admin/hero");
}

/* ---------- Gallery ---------- */

export async function deleteGalleryImage(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const img = await prisma.galleryImage.findUnique({ where: { id } });
  if (img) {
    await prisma.galleryImage.delete({ where: { id } });
    // Best-effort removal of the file from disk.
    if (img.url.startsWith("/uploads/gallery/")) {
      try {
        await unlink(path.join(process.cwd(), "public", img.url));
      } catch {
        /* file already gone — ignore */
      }
    }
  }
  refreshSite();
  revalidatePath("/admin/gallery");
}

export async function moveGalleryImage(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const dir = str(fd, "dir"); // "up" | "down"
  const all = await prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  const i = all.findIndex((g) => g.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i !== -1 && j >= 0 && j < all.length) {
    await prisma.$transaction([
      prisma.galleryImage.update({ where: { id: all[i].id }, data: { order: j } }),
      prisma.galleryImage.update({ where: { id: all[j].id }, data: { order: i } }),
    ]);
  }
  refreshSite();
  revalidatePath("/admin/gallery");
}

/* ---------- Circle gallery ---------- */

export async function updateCircleCaption(fd: FormData) {
  await requireSession();
  await prisma.circleImage.update({
    where: { id: str(fd, "id") },
    data: { caption: str(fd, "caption") },
  });
  refreshSite();
  revalidatePath("/admin/circle-gallery");
}

export async function deleteCircleImage(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const img = await prisma.circleImage.findUnique({ where: { id } });
  if (img) {
    await prisma.circleImage.delete({ where: { id } });
    if (img.url.startsWith("/uploads/circle/")) {
      try {
        await unlink(path.join(process.cwd(), "public", img.url));
      } catch {
        /* file already gone — ignore */
      }
    }
  }
  refreshSite();
  revalidatePath("/admin/circle-gallery");
}

export async function moveCircleImage(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const dir = str(fd, "dir");
  const all = await prisma.circleImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  const i = all.findIndex((g) => g.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i !== -1 && j >= 0 && j < all.length) {
    await prisma.$transaction([
      prisma.circleImage.update({ where: { id: all[i].id }, data: { order: j } }),
      prisma.circleImage.update({ where: { id: all[j].id }, data: { order: i } }),
    ]);
  }
  refreshSite();
  revalidatePath("/admin/circle-gallery");
}

/* ---------- Client review ---------- */

/** Add a review from a pasted link (YouTube/Vimeo/Facebook/file URL). */
export async function createReview(fd: FormData) {
  await requireSession();
  const videoUrl = str(fd, "videoUrl");
  if (parseReviewVideo(videoUrl).kind === "none") {
    throw new Error("That link isn't a recognized video URL.");
  }
  const count = await prisma.review.count();
  await prisma.review.create({
    data: {
      videoUrl,
      quote: str(fd, "quote") || null,
      author: str(fd, "author"),
      order: count,
    },
  });
  refreshSite();
  revalidatePath("/admin/review");
}

/** Add a review from a freshly uploaded video file. */
export async function commitReviewVideo(fd: FormData) {
  await requireSession();
  const url = str(fd, "url");
  if (!url.startsWith("/uploads/review/")) throw new Error("Invalid video path.");
  const count = await prisma.review.count();
  await prisma.review.create({
    data: { videoUrl: url, author: "", order: count },
  });
  refreshSite();
  revalidatePath("/admin/review");
}

export async function updateReview(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  await prisma.review.update({
    where: { id },
    data: { quote: str(fd, "quote") || null, author: str(fd, "author") },
  });
  refreshSite();
  revalidatePath("/admin/review");
}

export async function deleteReview(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const r = await prisma.review.findUnique({ where: { id } });
  if (r) {
    await prisma.review.delete({ where: { id } });
    if (r.videoUrl.startsWith("/uploads/review/")) {
      try {
        await unlink(path.join(process.cwd(), "public", r.videoUrl));
      } catch {
        /* file already gone — ignore */
      }
    }
  }
  refreshSite();
  revalidatePath("/admin/review");
}

export async function moveReview(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const dir = str(fd, "dir");
  const all = await prisma.review.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  const i = all.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i !== -1 && j >= 0 && j < all.length) {
    await prisma.$transaction([
      prisma.review.update({ where: { id: all[i].id }, data: { order: j } }),
      prisma.review.update({ where: { id: all[j].id }, data: { order: i } }),
    ]);
  }
  refreshSite();
  revalidatePath("/admin/review");
}

/* ---------- Messages ---------- */

export async function toggleMessageRead(fd: FormData) {
  await requireSession();
  const id = str(fd, "id");
  const m = await prisma.contactMessage.findUnique({ where: { id } });
  if (m) {
    await prisma.contactMessage.update({
      where: { id },
      data: { read: !m.read },
    });
  }
  revalidatePath("/admin/messages");
}

export async function deleteMessage(fd: FormData) {
  await requireSession();
  await prisma.contactMessage.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/messages");
}
