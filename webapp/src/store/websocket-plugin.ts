import { Plugin, Store } from "vuex";

type WebSocketPluginArgs = {
  host: string;
  port: number;
  protocol: string | undefined;
};

export function websocketPlugin(
  connectionArgs: WebSocketPluginArgs = {
    host: "127.0.0.1",
    port: 10001,
    protocol: undefined,
  }
): Plugin<any> {
  const websocket: WebSocket = connectWebsocket(connectionArgs);
  const adapter = new WebSocketAdapter(websocket);

  return (store: Store<any>) => {
    adapter.onMessage((message) => {
      store.dispatch("receiveMessage", message);
    });
  };
}

function connectWebsocket({
  host,
  port,
  protocol,
}: WebSocketPluginArgs): WebSocket {
  const url = `ws://${host}:${port}`;
  return new WebSocket(url, protocol);
}

type MessageListener = (message: any) => void;

class WebSocketAdapter {
  private messageListeners: MessageListener[];

  constructor(private websocket: WebSocket) {
    this.websocket.onmessage = this.handleMessage.bind(this);
    this.messageListeners = [];
  }

  onMessage(listener: MessageListener): void {
    if (listener) {
      this.messageListeners.push(listener);
    }
  }

  private handleMessage(message: MessageEvent): void {
    //const content = JSON.parse(message.data);
    this.notifyListeners(message.data);
  }

  private notifyListeners(message: any): void {
    this.messageListeners.forEach((listener) => listener(message));
  }
}
