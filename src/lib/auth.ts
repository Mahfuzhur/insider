import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "insecure-dev-secret"
);

export const SESSION_COOKIE = "insider_session";

export type SessionData = {
  uid: string;
  email: string;
};

export async function signSession(data: SessionData): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(
  token: string | undefined
): Promise<SessionData | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const p = payload as JWTPayload & Partial<SessionData>;
    if (!p.uid || !p.email) return null;
    return { uid: p.uid, email: p.email };
  } catch {
    return null;
  }
}
