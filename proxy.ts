import { NextResponse, type NextRequest } from "next/server";

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function isLoopback(value: string) {
  try {
    return loopbackHosts.has(new URL(value).hostname.toLowerCase());
  } catch {
    return false;
  }
}

function isSameOrigin(value: string, request: NextRequest) {
  try {
    const originUrl = new URL(value);
    const requestUrl = new URL(request.url);
    const hostHeader = request.headers.get("host");
    if (hostHeader) {
      requestUrl.host = hostHeader;
    }
    if (originUrl.origin === requestUrl.origin) return true;

    // In reverse-proxy setups (e.g. Render with HTTPS termination):
    const protoHeader = request.headers.get("x-forwarded-proto");
    if (protoHeader && hostHeader) {
      const reconstructed = `${protoHeader}://${hostHeader}`;
      if (originUrl.origin === reconstructed) return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const allowRemote = process.env.ALLOW_REMOTE_HOST === "1" || Boolean(process.env.RENDER) || Boolean(process.env.PORT);
  if (!allowRemote && !isLoopback(`http://${host}`)) {
    return NextResponse.json(
      { error: "Control Center only accepts requests from this computer." },
      { status: 403 },
    );
  }
  const origin = request.headers.get("origin");
  if (origin && !isSameOrigin(origin, request)) {
    return NextResponse.json(
      { error: "Cross-site requests are blocked." },
      { status: 403 },
    );
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
