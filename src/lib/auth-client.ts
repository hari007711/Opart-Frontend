import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? process.env.BETTER_AUTH_URL || "https://opart-frontend.vercel.app"
      : "https://opart-frontend.vercel.app",
});
