import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

const ALLOWED = new Set([
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);

export async function POST(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Use an SVG, PNG, JPG or WebP logo." },
      { status: 400 }
    );
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Max logo size is 4MB." }, { status: 400 });
  }

  const ext =
    file.type === "image/svg+xml"
      ? "svg"
      : (file.name.split(".").pop() ?? "png").toLowerCase();
  const filename = `logo-${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  const url = `/uploads/${filename}`;
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { logoUrl: url },
    create: {
      id: 1,
      logoUrl: url,
      heroTagline:
        "An interior design studio in Dhaka turning spaces into experiences — from concept and 3D visualization to turnkey fit-out.",
      aboutBody:
        "Insider is an independent interior design studio based in Dhaka. From first sketch and 3D visualization to turnkey fit-out, we shape residential and commercial spaces with craft, restraint, and a feel for how people actually live.",
    },
  });

  return NextResponse.json({ url });
}
