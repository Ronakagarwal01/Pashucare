// Cloudflare Pages Function: Reverse Proxy for PashuCare API
// Intercepts /api/* requests and forwards them to the backend server
// Eliminates CORS issues and keeps API requests on the same domain.

export async function onRequest(context) {
  const { request, env, params } = context;

  // Read backend URL from Cloudflare environment variable BACKEND_URL
  // e.g. BACKEND_URL = "https://pashucare-api.onrender.com"
  const backendBase = (env.BACKEND_URL || '').replace(/\/$/, '');

  if (!backendBase) {
    // If BACKEND_URL is not set in Cloudflare Pages dashboard
    return new Response(
      JSON.stringify({
        detail: 'Cloudflare Pages Proxy: BACKEND_URL environment variable is not configured. Please set BACKEND_URL in Cloudflare Pages settings (Settings > Variables and Secrets).',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Construct target URL
  const incomingUrl = new URL(request.url);
  const targetUrl = `${backendBase}${incomingUrl.pathname}${incomingUrl.search}`;

  // Clone headers and remove CF-specific or conflicting headers
  const headers = new Headers(request.headers);
  headers.set('Host', new URL(backendBase).host);
  headers.set('X-Forwarded-Host', incomingUrl.host);
  headers.set('X-Forwarded-Proto', incomingUrl.protocol.replace(':', ''));

  // Prepare proxy request options
  const proxyOptions = {
    method: request.method,
    headers: headers,
    redirect: 'follow',
  };

  // Attach body if method has body
  if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
    proxyOptions.body = request.body;
    // Duplex streaming flag for Cloudflare Workers fetch
    proxyOptions.duplex = 'half';
  }

  try {
    const response = await fetch(targetUrl, proxyOptions);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        detail: `Cloudflare Pages Proxy Error: Unable to reach backend at ${backendBase}. Error: ${error.message}`,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
