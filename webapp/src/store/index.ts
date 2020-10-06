import Vue from "vue";
import Vuex from "vuex";
import { websocketPlugin } from "./websocket-plugin";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    messages: [] as string[],
  },
  mutations: {
    receiveMessage(state, message): void {
      state.messages.push(message);
    },
  },
  actions: {},
  modules: {},
  plugins: [websocketPlugin()],
});
