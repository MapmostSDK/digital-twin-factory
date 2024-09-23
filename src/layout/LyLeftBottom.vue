<script setup>
import { onMounted } from 'vue';
onMounted(() => {
  //todo
});
</script>
<template>
  <div class="ly-leftBottom">
    <div class="baseBox baseBox2" style="margin-bottom:15px;height:28.8%">
      <img src="../assets/img/right2.png" alt="" class="second_border">

      <div class="boxTitle2">人员定位概况</div>
      <div class="people_data">
        <div class="people_top">
          <div class="centerList">
            <div class="centerListFont">当前在线人数</div>
            <div class="centerListNum">
              <span class="counter-value">2367</span>
            </div>
          </div>
          <div class="centerList">
            <div class="centerListFont">总人数</div>
            <div class="centerListNum">
              <span>3000</span>
            </div>
          </div>
        </div>
        <div class="people_bottom">
          <div class="every_line">
            <span>员工</span>
            <i>2224</i>
          </div>
          <div class="every_line">
            <span>外协人员</span>
            <i>546</i>
          </div>
          <div class="every_line">
            <span>临时人员</span>
            <i class="counter-value">230</i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ly-leftBottom {
  pointer-events: all;
  width: 17.85vw;
  height: 80vh;
}
</style>
