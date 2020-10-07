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
  headersRecord: Record<string, string>;
  headers: Headers;
  body: string | Uint8Array;
}

interface ResponseDetails {
  status: number;
  headersRecord: Record<string, string>;
  headers: Headers;
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
    const requestDetails = await RequestDetailsExtractor.extractDetails(
      this.request
    );

    if (requestDetails.url.startsWith("http")) {
      this.notifyRequestReceived(requestDetails);
      this.redirectRequest(requestDetails);
    }
  }

  redirectRequest(requestDetails: RequestDetails): void {
    this.sendRequest(requestDetails).then((response) => {
      this.notifyResponseReceived(response);
      this.sendResponse(response);
    });
  }

  private sendRequest({
    url,
    headers,
    body,
    method,
  }: RequestDetails): Promise<ResponseDetails> {
    console.debug("Sending request to", url);
    const options = { headers: new Headers(headers), body, method };
    return fetch(new URL(url), options).then((response) => {
      console.debug(`${url} responded with status ${response.status}`);
      return this.handleResponse(response);
    });
  }

  private sendResponse(response: ResponseDetails): void {
    this.request.respond({
      status: response.status,
      headers: new Headers(response.headers),
      body: response.body,
    });
  }

  private notifyRequestReceived(request: RequestDetails): void {
    this.websocketServer.send({
      receiver: this.sender,
      type: "received-request",
      content: {
        requestId: this.requestId,
        request: {
          url: request.url,
          body: request.body,
          headers: request.headersRecord,
          method: request.method,
        },
      },
    });
  }

  private notifyResponseReceived(response: ResponseDetails): void {
    this.websocketServer.send({
      receiver: this.sender,
      type: "received-response",
      content: {
        requestId: this.requestId,
        response: {
          status: response.status,
          headers: response.headersRecord,
          body: response.body,
        },
      },
    });
  }

  private async handleResponse(response: Response): Promise<ResponseDetails> {
    const body = await this.readResponseBody(response);
    const status = response.status;
    const headers = response.headers;
    const headersRecord = Object.fromEntries(headers);
    return { status, headers, headersRecord, body };
  }

  private async readResponseBody(response: Response): Promise<string> {
    const body = await response.text();
    return body;
  }
}

class RequestDetailsExtractor {
  static async extractDetails(
    request: http.ServerRequest
  ): Promise<RequestDetails> {
    const method = request.method;
    const url = request.url.substring(1);
    const headers = request.headers;
    const headersRecord = Object.fromEntries(headers);
    const body = await RequestDetailsExtractor.readRequestBodyString(request);
    return { url, headers, headersRecord, body, method };
  }

  private static async readRequestBodyBytes(
    request: http.ServerRequest
  ): Promise<Uint8Array> {
    const bodyBytes = await Deno.readAll(request.body);
    return bodyBytes;
  }

  private static async readRequestBodyString(
    request: http.ServerRequest
  ): Promise<string> {
    const bodyBytes = await this.readRequestBodyBytes(request);
    return new TextDecoder(this.getBodyCharset(request)).decode(bodyBytes);
  }

  private static getBodyCharset(request: http.ServerRequest): string {
    const contentType = request.headers.get("Content-Type");
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

  private static getCharset(contentType: string): string | null {
    const charsetRegex: RegExp = /charset=([^;]+)/g;
    const matches = charsetRegex.exec(contentType);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    return null;
  }
}
