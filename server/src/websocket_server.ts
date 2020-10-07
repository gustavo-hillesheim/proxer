import { websocket } from "./dependencies.ts";

const { WebSocketServer } = websocket;

export function startWebsocketServer({ port = 10001 }): WebSocketServerAdapter {
  const server = new WebSocketServer(port);
  server.on("connection", handleClientConnection);
  console.log(`Started WebSocket server at port: ${port}`);
  return new WebSocketServerAdapter(server);
}

function handleClientConnection(client: websocket.WebSocket): void {}

interface WebSocketMessage {
  type: string;
  content: object;
}

export interface WebSocketTargetedMessage extends WebSocketMessage {
  receiver: string | undefined;
}

export class WebSocketServerAdapter {
  constructor(private server: websocket.WebSocketServer) {}

  send({ type, receiver, content }: WebSocketTargetedMessage): void {
    if (receiver) {
      this.sendTo(receiver, { type, content });
    } else {
      this.sendAll({ type, content });
    }
  }

  private sendTo(receiver: string, message: WebSocketMessage): void {
    this.server.clients.forEach((client) => {
      if (this.isClient(receiver, client)) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private sendAll(message: WebSocketMessage): void {
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  }

  private isClient(receiver: string, client: websocket.WebSocket): boolean {
    return true; // TODO: Adicionar validação de IP do client === receiver
  }
}
