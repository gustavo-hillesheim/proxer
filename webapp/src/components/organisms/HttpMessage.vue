<template>
  <div>
    <v-tabs v-model="tabs">
      <v-tab>Body</v-tab>
      <v-tab>Headers</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tabs">
      <v-tab-item>
        <pre class="message-body" v-if="message.body">{{ body }}</pre>
        <div class="empty" v-else>
          <v-alert outlined type="info">
            A requisição não possui body
          </v-alert>
        </div>
      </v-tab-item>
      <v-tab-item>
        <v-simple-table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="header in headers" :key="header.name">
              <td class="text-start">{{ header.name }}</td>
              <td class="text-start">{{ header.value }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "HttpMessage",
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    tabs: null,
  }),
  computed: {
    headers() {
      return Object.entries(this.message.headers).map(([name, value]) => ({
        name,
        value,
      }));
    },
    body(): string {
      try {
        return JSON.stringify(JSON.parse((this.message as any).body), null, 2);
      } catch {
        return (this.message as any).body;
      }
    },
  },
});
</script>
<style lang="sass" scoped>
.empty
  padding: 16px

.text-start
  text-align: start

.message-body
  text-align: start
  padding: 8px
  overflow: auto

.v-data-table, .message-body
  background-color: #f8f8f8 !important
  border: 1px solid #f2f2f2
  max-height: 500px
  overflow: auto
</style>
