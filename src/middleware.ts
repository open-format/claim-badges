import { type NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");
  const xForwardedHost = req.headers.get("x-forwarded-host");

  // Allow requests without an origin (e.g., server-to-server)
  if (!origin) return NextResponse.next();

  // Normalize x-forwarded-host to match origin host
  const originHost = new URL(origin).host;

  if (xForwardedHost !== originHost) {
    req.headers.set("x-forwarded-host", originHost); // Normalize header
  }

  return NextResponse.next();
}
