import { startProxyServer } from "./proxy_server.ts";
import { startWebsocketServer } from "./websocket_server.ts";

const websocketServer = startWebsocketServer({});
startProxyServer({
  websocketServer,
});
