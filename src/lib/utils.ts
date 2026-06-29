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
