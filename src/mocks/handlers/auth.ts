import { http, HttpResponse } from "msw";
import { adminUser, accountantUser } from "../fixtures/data";
import type { UserData } from "../fixtures/data";

const users: UserData[] = [adminUser, accountantUser];

export const authHandlers = [
  http.post("http://localhost:3000/api/v1/auth/login", async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    const user = users.find((u) => u.username === body?.username);
    if (!user) {
      return HttpResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid credentials" } },
        { status: 401 },
      );
    }
    const token = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ sub: user.id, username: user.username, role: user.role, consorcio_id: user.consorcio_id, exp: Math.floor(Date.now() / 1000) + 86400, iat: Math.floor(Date.now() / 1000), jti: crypto.randomUUID() }))}.fake_signature`;
    return HttpResponse.json({ token, user }, { status: 200 });
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
      const payload = JSON.parse(atob(auth.split(".")[1]!));
      const user = users.find((u) => u.username === payload.username);
      if (!user) {
        return HttpResponse.json(
          { error: { code: "UNAUTHORIZED", message: "User not found" } },
          { status: 401 },
        );
      }
      return HttpResponse.json(user, { status: 200 });
    } catch {
      return HttpResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid token" } },
        { status: 401 },
      );
    }
  }),

  http.get("http://localhost:3000/api/v1/health", () => {
    return HttpResponse.json(
      { status: "ok", postgres: "connected", redis: "connected", nats: "connected" },
      { status: 200 },
    );
  }),
];
