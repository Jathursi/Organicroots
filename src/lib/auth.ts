import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "auth_token";

const authSecret = process.env.AUTH_SECRET ?? "change-this-in-production";
const secretKey = new TextEncoder().encode(authSecret);

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: string;
  fullName: string | null;
};

export async function createAuthToken(payload: AuthTokenPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    fullName: payload.fullName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      sub: typeof payload.sub === "string" ? payload.sub : "",
      email: typeof payload.email === "string" ? payload.email : "",
      role: typeof payload.role === "string" ? payload.role : "user",
      fullName: typeof payload.fullName === "string" ? payload.fullName : null,
    };
  } catch {
    return null;
  }
}
