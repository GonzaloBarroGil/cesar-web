import { http, HttpResponse } from "msw";
import { accountantUser, adminUser } from "../fixtures/data";
import type { UserData } from "../fixtures/data";
import { toLoginResponse, toMeResponse } from "./authTransform";

const users: UserData[] = [adminUser, accountantUser];

export const authHandlers = [
  http.post("http://localhost:3000/api/v1/auth/login", async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    const user = users.find((u) => u.username === body?.username);

    // Check password: only admin123 for admin, contador123 for contador
    const validPasswords: Record<string, string> = {
      admin: "admin123",
      contador: "contador123",
    };

    if (!user || validPasswords[user.username] !== body?.password) {
      return HttpResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid credentials" } },
        { status: 401 },
      );
    }
    const token = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ sub: user.id, username: user.username, role: user.role, consorcio_id: user.consorcio_id, exp: Math.floor(Date.now() / 1000) + 86400, iat: Math.floor(Date.now() / 1000), jti: crypto.randomUUID() }))}.fake_signature`;
    return HttpResponse.json(toLoginResponse(user, token), { status: 200 });
  }),

  http.get("http://localhost:3000/api/v1/auth/me", ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return HttpResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Missing or invalid JWT" } },
        { status: 401 },
      );
    }
    try {
      const tokenParts = auth.split(".");
      if (!tokenParts[1]) throw new Error("Invalid token format");
      const payload = JSON.parse(atob(tokenParts[1]));
      const user = users.find((u) => u.username === payload.username);
      if (!user) {
        return HttpResponse.json(
          { error: { code: "UNAUTHORIZED", message: "User not found" } },
          { status: 401 },
        );
      }
      return HttpResponse.json(toMeResponse(user), { status: 200 });
    } catch {
      return HttpResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid token" } },
        { status: 401 },
      );
    }
  }),

  http.get("http://localhost:3000/api/v1/health", () => {
    return HttpResponse.json(
      {
        status: "ok" as "ok" | "degraded" | "down",
        dependencies: {
          postgres: { status: "healthy" as "healthy" | "unhealthy" },
          redis: { status: "healthy" as "healthy" | "unhealthy" },
          nats: { status: "healthy" as "healthy" | "unhealthy" },
        },
      },
      { status: 200 },
    );
  }),
];
