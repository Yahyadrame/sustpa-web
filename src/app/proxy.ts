import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export async function proxyRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  const targetPath = pathname.replace(/^\/api/, "");
  const targetUrl = `${BACKEND_BASE}/api${targetPath}${search}`;

  const headers = new Headers(request.headers);
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-for", request.headers.get("x-real-ip") ?? "");
  headers.delete("host");

  const hasBody = !["GET", "HEAD"].includes(request.method);

  // ✅ Pour les routes GET (stream inclus), ne pas toucher au body.
  // Pour les requêtes avec body (POST, PATCH…), on bufferise normalement.
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body ? Buffer.from(body) : undefined,
      redirect: "manual",
      credentials: "include",
    });

    const responseHeaders = new Headers(upstream.headers);

    // ✅ CORRIGÉ — Ne PAS supprimer transfer-encoding pour les réponses
    // streamées (Content-Disposition: inline, Content-Type: application/pdf…)
    // On ne le supprime que si Content-Length est déjà présent,
    // sinon Next.js ne sait pas quand la réponse se termine.
    const isStreamed =
      !upstream.headers.has("content-length") &&
      upstream.headers.has("transfer-encoding");

    if (!isStreamed) {
      responseHeaders.delete("transfer-encoding");
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[proxy] Erreur upstream:", err, "→", targetUrl);
    return NextResponse.json(
      { message: "Service temporairement indisponible" },
      { status: 503 },
    );
  }
}
