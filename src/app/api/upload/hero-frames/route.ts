import { NextResponse, type NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

const SET_ID = /^[a-f0-9-]{8,40}$/;
const MAX_FRAME_BYTES = 2 * 1024 * 1024;

/** Receives one hero-film frame extracted in the admin's browser. */
export async function POST(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const setId = String(form.get("setId") ?? "");
  const index = Number(form.get("index"));

  if (!(file instanceof File) || !SET_ID.test(setId) || !Number.isInteger(index) || index < 0 || index > 9999) {
    return NextResponse.json({ error: "Bad frame payload." }, { status: 400 });
  }
  if (file.type !== "image/webp" || file.size > MAX_FRAME_BYTES) {
    return NextResponse.json({ error: "Frames must be WebP under 2MB." }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads", "hero", setId);
  await mkdir(dir, { recursive: true });
  const name = `frame-${String(index + 1).padStart(4, "0")}.webp`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ ok: true });
}
