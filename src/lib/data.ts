import { prisma } from "./prisma";

export const SETTINGS_DEFAULTS = {
  id: 1,
  brandName: "INSIDER",
  brandTagline: "Adorn Your World",
  heroLine: "Adorn your world",
  heroWords: "residences,workspaces,interiors,commercial",
  heroTagline:
    "An interior design studio in Dhaka turning spaces into experiences — from concept and 3D visualization to turnkey fit-out.",
  aboutTitle: "We craft interiors that feel unmistakably yours",
  aboutBody:
    "Insider is an independent interior design studio based in Dhaka. From first sketch and 3D visualization to turnkey fit-out, we shape residential and commercial spaces with craft, restraint, and a feel for how people actually live.",
  email: "info@insider.com.bd",
  phone: "+8801733-516028",
  address: "House 07, Road 1/C, Block L, Banani Chairman Bari, Dhaka-1212",
  facebook: "https://www.facebook.com/insiderltd",
  logoUrl: null as string | null,
  heroFrameDir: "/hero-frames",
  heroFrameCount: 361,
  heroSpeed: 2,
  heroCaption: "The Bedroom",
  heroSlowSegments: null as string | null,
  heroSlowFps: 12,
  heroFastFps: 3,
};

export async function getSettings() {
  const existing = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  return existing ?? SETTINGS_DEFAULTS;
}

export async function getProjectTypes() {
  return prisma.projectType.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

export async function getProjects(opts?: { typeSlug?: string }) {
  return prisma.project.findMany({
    where: {
      published: true,
      ...(opts?.typeSlug ? { type: { slug: opts.typeSlug } } : {}),
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { type: true, images: { orderBy: { order: "asc" } } },
  });
}

export async function getFeaturedProjects(limit = 6) {
  const featured = await prisma.project.findMany({
    where: { published: true, featured: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { type: true, images: { orderBy: { order: "asc" } } },
    take: limit,
  });
  if (featured.length > 0) return featured;
  return prisma.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { type: true, images: { orderBy: { order: "asc" } } },
    take: limit,
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: { type: true, images: { orderBy: { order: "asc" } } },
  });
}

export async function getServices() {
  return prisma.service.findMany({ orderBy: { order: "asc" } });
}

export type ProjectWithRelations = Awaited<
  ReturnType<typeof getProjects>
>[number];
