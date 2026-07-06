import { NextResponse, type NextRequest } from "next/server";
import { mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 80;

function altFromFilename(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base.length > 2 && !/^(img|image|photo|dsc|whatsapp)/i.test(base)
    ? base
    : null;
}

export async function POST(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const projectId = String(form.get("projectId") ?? "");
  const category = String(form.get("category") ?? "live");

  if (!(file instanceof File) || !projectId) {
    return NextResponse.json({ error: "Missing file or project." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP or AVIF images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > 30 * 1024 * 1024) {
    return NextResponse.json({ error: "Max file size is 30MB." }, { status: 400 });
  }

  // Optimize for web: resize to max 1920px wide, re-encode as progressive JPEG.
  const filename = `${randomUUID()}.jpg`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    await sharp(bytes)
      .rotate() // respect EXIF orientation
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toFile(path.join(dir, filename));
  } catch {
    return NextResponse.json(
      { error: "Could not process this image. Is the file a valid photo?" },
      { status: 400 }
    );
  }

  const url = `/uploads/${filename}`;
  const existingCount = await prisma.projectImage.count({ where: { projectId } });
  const hasCover = await prisma.projectImage.count({
    where: { projectId, isCover: true },
  });

  const image = await prisma.projectImage.create({
    data: {
      projectId,
      url,
      category: category === "3d" ? "3d" : "live",
      alt: altFromFilename(file.name),
      order: existingCount,
      isCover: hasCover === 0,
    },
  });

  return NextResponse.json({ image });
}
