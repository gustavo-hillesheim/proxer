<template>
  <div class="home">
    <v-expansion-panels multiple accordion>
      <ProxyRequest
        :request="request"
        v-for="request in requests"
        :key="request.id"
      />
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

import ProxyRequest from "../components/organisms/ProxyRequest.vue";

export default Vue.extend({
  name: "HomePage",
  components: { ProxyRequest },
  computed: mapState(["requests"]),
});
</script>
<style lang="sass" scoped>
.home
  display: flex
  flex-direction: column
</style>
