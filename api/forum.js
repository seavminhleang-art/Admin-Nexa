export const config = { runtime: 'edge' };

export default async function handler(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) {
    return new Response('Forbidden origin', { status: 403 });
  }

  const path = url.searchParams.get('path') || '';
  url.searchParams.delete('path');
  const base = (process.env.VITE_BASE_FORUM_LOST_URL || process.env.VITE_API_BASE_URL ||
    'https://forum-istad-api.cheat.casa/api/v1').replace(/\/+$/, '');
  const target = new URL(`${base}/${path}${url.search}`);
  const backend = new URL(base);
  if (target.origin !== backend.origin || !target.pathname.startsWith(`${backend.pathname}/`)) {
    return new Response('Invalid API path', { status: 400 });
  }

  // Match the local Vite proxy: browser Origin is not forwarded upstream.
  // Pass bearer credentials explicitly; never forward browser cookies.
  const headers = new Headers();
  for (const name of ['accept', 'content-type', 'authorization']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      redirect: 'manual',
    });
    const responseHeaders = new Headers({ 'Cache-Control': 'no-store' });
    for (const name of ['content-type', 'www-authenticate', 'retry-after']) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ message: 'Unable to reach the API server.' }, { status: 502 });
  }
}
