const isProd = process.env.NODE_ENV === "production";
export const API_HOST =
  process.env["NEXT_PUBLIC_API_HOST"] ?? "http://localhost:3000";
