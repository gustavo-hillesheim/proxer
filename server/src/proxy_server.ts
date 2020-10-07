import { http } from "./dependencies.ts";
import { WebSocketServerAdapter } from "./websocket_server.ts";

export interface ProxyServerArgs {
  hostname?: string;
  port?: number;
  websocketServer: WebSocketServerAdapter;
}

export async function startProxyServer({
  hostname = "0.0.0.0",
  port = 80,
  websocketServer,
}: ProxyServerArgs) {
  const server = http.serve({ hostname, port });
  console.log(`Started proxy server. Access it at: http://${hostname}:${port}`);

  for await (const request of server) {
    console.log("=================================");
    console.log("Received request to:", request.url);
    const requestHandler = new ProxyRequestHandler(websocketServer, request);
    requestHandler.handleRequest();
  }
}

interface RequestDetails {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | Uint8Array;
}

interface RedirectResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

class ProxyRequestHandler {
  private static requestIdSequence = 1;
  private sender: string | undefined;
  private requestId: number;

  constructor(
    private websocketServer: WebSocketServerAdapter,
    private request: http.ServerRequest
  ) {
    this.sender = (request.conn.remoteAddr as any)["hostname"];
    this.requestId = ProxyRequestHandler.requestIdSequence++;
  }

  async handleRequest(): Promise<void> {
    const requestDetails = await this.extractDetails();

    if (requestDetails.url.startsWith("http")) {
      this.websocketServer.send({
        receiver: this.sender,
        type: "received-request",
        content: {
          requestId: this.requestId,
          request: requestDetails,
        },
      });
      this.redirectRequest(requestDetails);
    }
  }

  redirectRequest(requestDetails: RequestDetails): void {
    this.sendRequest(requestDetails).then((response) => {
      this.websocketServer.send({
        receiver: this.sender,
        type: "received-response",
        content: {
          requestId: this.requestId,
          response: {
            status: response.status,
            headers: response.headers,
            body: response.body,
          },
        },
      });
      this.request.respond({
        status: response.status,
        headers: new Headers(response.headers),
        body: response.body,
      });
    });
  }

  sendRequest({
    url,
    headers,
    body,
    method,
  }: RequestDetails): Promise<RedirectResponse> {
    console.debug("Sending request to", url);
    return fetch(url, { headers: new Headers(headers), body, method }).then(
      async (response) => {
        console.debug(`${url} responded with status ${response.status}`);

        const body = await this.readResponseBody(response);
        const status = response.status;
        const headers = Object.fromEntries(response.headers);

        return { status, headers, body };
      }
    );
  }

  async extractDetails(): Promise<RequestDetails> {
    const method = this.request.method;
    const url = this.request.url.substring(1);
    const headers = this.createRedirectHeaders();
    const body = await this.readRequestBodyString();
    return { url, headers, body, method };
  }

  async readResponseBody(response: Response): Promise<string> {
    const body = await response.text();
    return body;
  }

  async readRequestBodyBytes(): Promise<Uint8Array> {
    const bodyBytes = await Deno.readAll(this.request.body);
    return bodyBytes;
  }

  async readRequestBodyString(): Promise<string> {
    const bodyBytes = await this.readRequestBodyBytes();
    return new TextDecoder(this.getBodyCharset()).decode(bodyBytes);
  }

  createRedirectHeaders(): Record<string, string> {
    return Object.fromEntries(this.request.headers);
  }

  getBodyCharset(): string {
    const contentType = this.request.headers.get("Content-Type");
    const defaultCharset = "utf-8";
    if (!contentType) {
      return defaultCharset;
    }
    const specifiesCharset = contentType.includes("charset");
    const charset = specifiesCharset
      ? this.getCharset(contentType)
      : defaultCharset;
    return charset || defaultCharset;
  }

  getCharset(contentType: string): string | null {
    const charsetRegex: RegExp = /charset=([^;]+)/g;
    const matches = charsetRegex.exec(contentType);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    return null;
  }
}
