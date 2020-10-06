import { http } from "./dependencies.ts";

export async function startProxyServer(
  { hostname, port } = { hostname: "0.0.0.0", port: 80 }
) {
  const server = http.serve({ hostname, port });
  console.log(`Started proxy server. Access it at: http://${hostname}:${port}`);

  for await (const request of server) {
    console.log("=================================");
    console.log("Received request to:", request.url);
    handleRequest(request);
  }
}

interface RedirectRequest {
  method: string;
  url: string;
  headers: Headers;
  body: string | Uint8Array;
}

interface RedirectResponse {
  status: number;
  headers: Headers;
  body: string;
}

async function handleRequest(request: http.ServerRequest): Promise<void> {
  const redirectDetails = await extractDetails(request);
  if (redirectDetails.url.startsWith("http")) {
    redirectRequest(redirectDetails, request);
  }
}

function redirectRequest(
  redirectRequest: RedirectRequest,
  request: http.ServerRequest
): void {
  sendRequest(redirectRequest).then((response) => {
    request.respond({
      status: response.status,
      headers: response.headers,
      body: response.body,
    });
  });
}

function sendRequest({
  url,
  headers,
  body,
  method,
}: RedirectRequest): Promise<RedirectResponse> {
  console.debug("Sending request to", url);
  return fetch(url, { headers, body, method }).then(async (response) => {
    console.debug(`${url} responded with status ${response.status}`);

    const body = await readResponseBody(response);
    const status = response.status;
    const headers = response.headers;

    return { status, headers, body };
  });
}

async function extractDetails(
  request: http.ServerRequest
): Promise<RedirectRequest> {
  const method = request.method;
  const url = request.url.substring(1);
  const headers = createRedirectHeaders(request);
  const body = await readRequestBodyBytes(request);
  return { url, headers, body, method };
}

async function readResponseBody(response: Response): Promise<string> {
  const body = await response.text();
  return body;
}

async function readRequestBodyBytes(
  request: http.ServerRequest
): Promise<Uint8Array> {
  const bodyBytes = await Deno.readAll(request.body);
  return bodyBytes;
}

async function readRequestBodyString(
  request: http.ServerRequest
): Promise<string> {
  const bodyBytes = await readRequestBodyBytes(request);
  return new TextDecoder(getBodyCharset(request)).decode(bodyBytes);
}

function createRedirectHeaders(request: http.ServerRequest): Headers {
  const redirectHeaders = new Headers();
  for (const header in request.headers.keys()) {
    const headerValue = request.headers.get(header) as string;
    redirectHeaders.set(header, headerValue);
  }
  return redirectHeaders;
}

function getBodyCharset(request: http.ServerRequest): string {
  const contentType = request.headers.get("Content-Type");
  const defaultCharset = "utf-8";
  if (!contentType) {
    return defaultCharset;
  }
  const specifiesCharset = contentType.includes("charset");
  const charset = specifiesCharset ? getCharset(contentType) : defaultCharset;
  return charset || defaultCharset;
}

function getCharset(contentType: string): string | null {
  const charsetRegex: RegExp = /charset=([^;]+)/g;
  const matches = charsetRegex.exec(contentType);
  if (matches && matches.length > 1) {
    return matches[1];
  }
  return null;
}
