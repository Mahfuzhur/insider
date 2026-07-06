/**
 * One-off importer for the Sam Residence (Munshiganj) project.
 * Optimizes source images with sharp, copies them to public/uploads/sam-munshiganj,
 * and creates the Project + ProjectImage records.
 *
 * Run: npx tsx scripts/import-sam-munshiganj.ts
 */
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { mkdir, readdir } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

const SOURCE = "D:/Sam_Munshiganj-20260701T100605Z-3-001/Sam_Munshiganj";
const SLUG = "sam-residence-munshiganj";
const OUT_DIR = path.join(process.cwd(), "public", "uploads", SLUG);
const MAX_WIDTH = 1920;
const QUALITY = 80;
const COVER_SOURCE = "Dining-1.jpg"; // wide living/dining shot — strongest frame

function cleanAlt(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+\d+$/, "")
    .trim();
}

async function listImages(dir: string) {
  const entries = await readdir(dir);
  return entries
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function optimize(src: string, destName: string) {
  await sharp(src)
    .rotate() // respect EXIF orientation
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    .toFile(path.join(OUT_DIR, destName));
  return `/uploads/${SLUG}/${destName}`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const residential = await prisma.projectType.findUnique({
    where: { slug: "residential" },
  });
  if (!residential) throw new Error("Residential project type not found");

  const existing = await prisma.project.findUnique({ where: { slug: SLUG } });
  if (existing) {
    console.log("Project already exists — deleting and re-importing.");
    await prisma.project.delete({ where: { id: existing.id } });
  }

  const project = await prisma.project.create({
    data: {
      title: "Sam Residence",
      slug: SLUG,
      typeId: residential.id,
      location: "Munshiganj",
      yearCompleted: 2026,
      rooms: JSON.stringify([
        "Drawing Room",
        "Dining",
        "Kitchen",
        "Master Bedroom",
        "Guest Bedroom",
      ]),
      shortDescription:
        "A full-home interior for a private residence in Munshiganj — layered cove ceilings, warm brass-lined panelling and a floral relief feature wall bring quiet luxury to the drawing and dining spaces, while the bedrooms pair muted sage and walnut tones for calm, restful living.",
      designStyle: "Modern Classic",
      featured: true,
      published: true,
      order: 0,
    },
  });
  console.log("Created project:", project.title);

  let order = 0;
  let imported = 0;

  // Live photos
  const liveDir = path.join(SOURCE, "Live Project", "Picture");
  for (const file of await listImages(liveDir)) {
    const destName = `live-${String(order + 1).padStart(2, "0")}.jpg`;
    const url = await optimize(path.join(liveDir, file), destName);
    await prisma.projectImage.create({
      data: {
        projectId: project.id,
        url,
        category: "live",
        alt: cleanAlt(file),
        isCover: file === COVER_SOURCE,
        order: order++,
      },
    });
    imported++;
    process.stdout.write(`\rlive: ${imported}`);
  }
  console.log();

  // 3D renders (both design options, Option_1 first)
  for (const option of ["Option_1", "Option_2"]) {
    const dir = path.join(SOURCE, option);
    let n = 0;
    for (const file of await listImages(dir)) {
      n++;
      const destName = `3d-${option.toLowerCase()}-${String(n).padStart(2, "0")}.jpg`;
      const url = await optimize(path.join(dir, file), destName);
      await prisma.projectImage.create({
        data: {
          projectId: project.id,
          url,
          category: "3d",
          alt: `3D render — ${option.replace("_", " ")}`,
          isCover: false,
          order: order++,
        },
      });
      imported++;
      process.stdout.write(`\r${option}: ${n}`);
    }
    console.log();
  }

  const cover = await prisma.projectImage.count({
    where: { projectId: project.id, isCover: true },
  });
  if (cover === 0) {
    const first = await prisma.projectImage.findFirst({
      where: { projectId: project.id, category: "live" },
      orderBy: { order: "asc" },
    });
    if (first)
      await prisma.projectImage.update({
        where: { id: first.id },
        data: { isCover: true },
      });
  }

  console.log(`Done. ${imported} images imported for ${project.title}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
