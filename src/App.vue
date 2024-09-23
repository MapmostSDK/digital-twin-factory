<script setup>
import LyTop from './layout/LyTop.vue';
import LyLeft from './layout/LyLeft.vue';
import LyLeftBottom from './layout/LyLeftBottom.vue';
import LyBottom from './layout/LyBottom.vue';
import Map from './components/Map.vue';
</script>

<template>
  <div class="container">
    <Map></Map>
    <div class="layout">
      <ly-top></ly-top>
      <ly-left></ly-left>
      <ly-leftBottom></ly-leftBottom>
      <ly-bottom></ly-bottom>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .layout {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
    pointer-events: none;
  }
}
</style>
