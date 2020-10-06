import { websocket } from "./dependencies.ts";

const { WebSocketServer } = websocket;

export function startWebsocketServer({ port } = { port: 10001 }) {
  const server = new WebSocketServer(port);
  server.on("connection", handleClientConnection);
  console.log(`Started WebSocket server at port: ${port}`);
}

function handleClientConnection(client: websocket.WebSocket): void {
  let messageNumber = 1;
  setInterval(() => {
    if (!client.isClosed) {
      client.send(
        "Hi client, I'm server, and this is message #" + messageNumber++
      );
    }
  }, 1000);
}
