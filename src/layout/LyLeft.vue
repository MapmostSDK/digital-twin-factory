<script setup>
import { onMounted } from 'vue';
onMounted(() => {
  var doublePI = Math.PI * 2;
  var canvas;
  var ctx;

  //画布的高度的一半
  var halfCanvasHeight = 100;
  //水平边距
  var horizontalMargin = 150;

  //衰减系数(越大, 边缘衰减的就越多, 震动宽度相应也越窄)
  var attenuationCoefficient = 2;
  //半波长个数-1
  var halfWaveCount = 20;
  //振幅是画布高度的一般的百分比[0,1]
  var amplitudePercentage = 0.3;
  //每帧增加的弧度[0,2PI](作用于sin曲线, 正值相当于原点右移, 曲线左移)
  var radianStep = 0.4;

  //当前弧度的偏移
  var radianOffset = 0;
  //画布宽度
  var canvasWidth;

  function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    window.addEventListener("resize", onResize);

    canvas.height = halfCanvasHeight * 2;
    onResize();
    loop();
  }

  function onResize() {
    //元素的大小不能加单位, 单位默认就是像素, 而style中的长度要加单位
    canvasWidth = canvas.width = window.innerWidth - horizontalMargin;
  }

  //设K=attenuationCoefficient, 计算信号衰减 (4K/(4K+x^4))^2K<=1 (x belong [-K,K])
  function calcAttenuation(x) {
    return Math.pow(4 * attenuationCoefficient / (4 * attenuationCoefficient + Math.pow(x, 4)), 2 * attenuationCoefficient);
  }

  //heightPercentage为振幅的显示比例
  function drawAcousticWave(heightPercentage, alpha, lineWidth) {
    ctx.strokeStyle = "white";
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lineWidth || 1;
    ctx.beginPath();
    ctx.moveTo(0, halfCanvasHeight);
    var x, y;
    for (var i = -attenuationCoefficient; i <= attenuationCoefficient; i += 0.01) {
      //i是当前位置相对于整个长度的比率( x=width*(i+K)/(2*K))
      x = canvasWidth * (i + attenuationCoefficient) / (2 * attenuationCoefficient);
      //加offset相当于把sin曲线向右平移
      y = halfCanvasHeight + halfCanvasHeight * amplitudePercentage * calcAttenuation(i) * heightPercentage * Math.sin(halfWaveCount * i + radianOffset);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function loop() {
    radianOffset = (radianOffset + radianStep) % doublePI;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAcousticWave(1, 1, 2);
    for (var i = 2; i < 4; i++) {
      var reciprocal = 1 / i;
      drawAcousticWave(reciprocal, reciprocal / 4);
      drawAcousticWave(-reciprocal, reciprocal / 4);
    }
    requestAnimationFrame(loop);
  }

  init();
});

</script>
<template>
  <div class="ly-left">
    <div class="baseBoxLeft left">
      <div class="boxTitle">
        <img src="../assets/img/设备管理.png" style="width: 35px;">
        <label class="title">设备管理</label>
      </div>
      <img src="../assets/img/left.png" class="first_border" alt="">
      <div class="firstBox">
        <div class="first-line">
          <div class="first-unit">
            <img src="../assets/img/工艺设备.png" style="width: 60px;">
            <div class="equip-text">
              <div class="equip-title">工艺设备</div>
              <div class="equip-num">
                72
                <div class="equip-unit">台</div>
              </div>
            </div>
          </div>
          <div class="second-unit">
            <img src="../assets/img/储存设备.png" style="width: 60px;">
            <div class="equip-text">
              <div class="equip-title">储存设备</div>
              <div class="equip-num">
                58
                <div class="equip-unit">台</div>
              </div>
            </div>
          </div>
        </div>
        <div class="second-line">
          <div class="first-unit">
            <img src="../assets/img/机械设备.png" style="width: 60px;">
            <div class="equip-text">
              <div class="equip-title">机械设备</div>
              <div class="equip-num">
                65
                <div class="equip-unit">台</div>
              </div>
            </div>
          </div>
          <div class="second-unit">
            <img src="../assets/img/安全设备.png" style="width: 60px;">
            <div class="equip-text">
              <div class="equip-title">安全设备</div>
              <div class="equip-num">
                47
                <div class="equip-unit">台</div>
              </div>
            </div>
          </div>
        </div>

        <div class="voice_animation">
          <canvas id="canvas">Your browser can not support canvas</canvas>
        </div>
        <div class="progress">
          <span class="run">正常运行率:
            <span class="run-percent">85%</span>
          </span>
          <img src="../assets/img/progress.gif" alt="">
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ly-left {
  pointer-events: all;
  background: #02030780;
  width: 19vw;
  height: 37vh;
}
</style>
