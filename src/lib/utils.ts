import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parseRooms(rooms: string | null | undefined): string[] {
  if (!rooms) return [];
  try {
    const parsed = JSON.parse(rooms);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    return rooms
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
  }
  return [];
}

export function stringifyRooms(rooms: string[]): string {
  return JSON.stringify(rooms.map((r) => r.trim()).filter(Boolean));
}

export function formatArea(sqft: number | null | undefined): string | null {
  if (!sqft && sqft !== 0) return null;
  return `${sqft.toLocaleString()} sqft`;
}

export function wordsToArray(words: string): string[] {
  return words
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
}

export type ReviewEmbed =
  | { kind: "youtube" | "vimeo" | "facebook"; src: string }
  | { kind: "file"; src: string }
  | { kind: "none" };

/** Turn a pasted review link into something we can render. */
export function parseReviewVideo(url: string): ReviewEmbed {
  const u = (url ?? "").trim();
  if (!u) return { kind: "none" };

  const yt =
    u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return { kind: "youtube", src: `https://www.youtube.com/embed/${yt[1]}` };
  }

  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return { kind: "vimeo", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  }

  // Facebook videos (watch links, /videos/ID, share/v/ links, fb.watch)
  // render through Facebook's own video plugin.
  if (/facebook\.com\/|fb\.watch\//.test(u)) {
    return {
      kind: "facebook",
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        u
      )}&show_text=false&width=560`,
    };
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u) || u.startsWith("/")) {
    return { kind: "file", src: u };
  }

  return { kind: "none" };
}
