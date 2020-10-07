<template>
  <v-expansion-panel>
    <v-expansion-panel-header>{{
      request.requestDetails.method + " - " + request.requestDetails.url
    }}</v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-row>
        <v-col cols="12" sm="12" md="6">
          Request
          <HttpMessage :message="request.requestDetails" />
        </v-col>
        <v-col cols="12" sm="12" md="6">
          Response
          <HttpMessage :message="request.responseDetails" />
        </v-col>
      </v-row>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>
<script lang="ts">
import Vue from "vue";

import HttpMessage from "./HttpMessage.vue";

export default Vue.extend({
  name: "ProxyRequest",
  components: { HttpMessage },
  props: {
    request: {
      type: Object,
      required: true,
    },
  },
});
</script>
