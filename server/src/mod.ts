import { startProxyServer } from "./proxy_server.ts";
import { startWebsocketServer } from "./websocket_server.ts";

startWebsocketServer();
startProxyServer();
