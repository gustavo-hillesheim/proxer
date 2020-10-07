import {
  RequestDetailsMessage,
  ResponseDetailsMessage,
} from "@/model/proxy-request.model";
import Vue from "vue";
import Vuex from "vuex";
import { websocketPlugin } from "./websocket-plugin";
import { ProxyRequestInfo } from "./../model/proxy-request.model";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    requests: {} as Record<number, ProxyRequestInfo>,
  },
  mutations: {
    receivedRequest(
      state,
      { id, request }: RequestDetailsMessage
    ): void | never {
      console.debug(`Received request of id ${id} to url ${request.url}`);
      if (state.requests[id]) {
        throw new Error(`Request of id ${id} already exists!`);
      }
      Vue.set(state.requests, id, {
        id,
        requestDetails: request,
      });
    },
    receivedResponse(state, { id, response }: ResponseDetailsMessage): void {
      console.debug(`Received response for request of id ${id}`);
      if (state.requests[id]) {
        Vue.set(state.requests[id], "responseDetails", response);
      } else {
        throw new Error(`Request of id ${id} does not exist!`);
      }
    },
  },
  actions: {
    receiveMessage({ commit }, message: string): void {
      const parsedMessage = JSON.parse(message);
      commit(parsedMessage.type, parsedMessage.content);
    },
  },
  modules: {},
  plugins: [websocketPlugin()],
});
