<template>
  <div>
    <v-tabs v-model="tabs">
      <v-tab>Body</v-tab>
      <v-tab>Headers</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tabs">
      <v-tab-item>
        {{ message.body }}
      </v-tab-item>
      <v-tab-item>
        <v-data-table
          dense
          :headers="headersTableHeaders"
          :items="headersList"
          item-key="name"
        >
        </v-data-table>
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
    headersTableHeaders: [
      {
        text: "Name",
        value: "name",
        align: "start",
      },
      {
        text: "Value",
        value: "value",
        align: "start",
      },
    ],
  }),
  computed: {
    headersList() {
      return Object.entries(this.message.headers).map(([name, value]) => ({
        name,
        value,
      }));
    },
  },
});
</script>
