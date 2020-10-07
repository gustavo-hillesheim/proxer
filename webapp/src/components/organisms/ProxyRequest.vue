<template>
  <div>
    {{ request }}
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProxyRequest",
  props: {
    request: {
      type: Object,
      required: true,
    },
  },
});
</script>
