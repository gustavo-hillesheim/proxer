<template>
  <div class="home">
    <span v-for="(message, index) in messages" :key="index">
      {{ message }}
    </span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

export default Vue.extend({
  name: "HomePage",
  computed: mapState(["messages"]),
});
</script>
<style lang="sass" scoped>
.home
  display: flex
  flex-direction: column
</style>
