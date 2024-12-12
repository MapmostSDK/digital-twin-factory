<script setup>
import { onMounted } from 'vue';

import MapApi from '../api/MapApi';
import SceneApi from '../api/SceneApi';
import CarApi from '../api/CarApi';

const style_opacity = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'land',
      type: 'background',
      paint: {
        'background-color': {
          stops: [
            [15, 'rgba(79, 143, 75, 0.8)'],
            [16, 'rgba(79, 143, 75, 0.8)'],
          ],
        },
      },
    },
  ],
};

onMounted(() => {
  // 地图初始化
  let map = new mapmost.Map({
    container: 'map-container',
    name: 'ditu',
    style: style_opacity,
    doubleClickZoom: false,
    center: [120.7290563605585, 31.288141509716326],
    zoom: 18.542327120640703,
    sky: 'light', //天空颜色
    pitch: 62.478852920710885,
    bearing: 90.88015604663417,
    userId: '***', // 请输入您申请的授权码，申请地址https://www.mapmost.com/#/productApply/webgl/?source_inviter=nqLdqFJp
    env3D: {
      defaultLights: false,
      envMap: './assets/hdr/yun.hdr',
      exposure: 2.53,
    },
  });

  window.map = map;
  let modelLayer;
  map.on('load', function () {
    let models_factory1 = [
      {
        type: 'glb',
        url: './assets/models/factory1.mm', // 模型路径
        decryptWasm:
          'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm',
      },
    ];

    // 添加树、路、路灯模型
    map.addLayer({
      id: 'model_id_1',
      models: models_factory1,
      outline: true,
      type: 'model',
      center: [120.73014920373011, 31.287414975761724, 0.1],
    });

    // 工厂模型路径
    let models_factory2 = [
      {
        type: 'glb',
        url: './assets/models/factory2.mm', // 模型路径
        decryptWasm:
          'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm',
      },
    ];
    // 添加工厂模型
    map.addLayer(
      {
        id: 'model_id_2',
        models: models_factory2,
        outline: true,
        type: 'model',
        funcRender: function (gl, matrix) {
          if (modelLayer) {
            modelLayer.renderMarker(gl, matrix);
          }
        },
        center: [120.73014920373011, 31.287414975761724, 0.1],
        callback: function (group, layer) {
          layer.onAfterRender(group).then(function () {
            document.getElementById('loading').style.display = 'none'
          })
          modelLayer = layer;
          // // 初始化场景
          new SceneApi(map, layer, group);
          // // 道路行驶车辆
          let car = new CarApi(map);
          car.initCar();

          let count = 0;
          setInterval(function () {
            //每隔6秒放一次车，放5次
            if (count < 5) {
              car.initCar();
              count++;
            }
          }, 6000);
          // 场景初始时压平工厂
          group.setScale({ x: 0, y: 0, z: 0.1 });

          // 获取MapApi接口
          window.mapApi = new MapApi(map, layer, group);
        },
      },
      'model_id_1'
    );
  });
});
</script>
<template>
  <div class="map-container" id="map-container"></div>
  <div class="loading" id="loading">Loading…</div>
</template>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  color: #fff;
  font-weight: bold;
}
</style>
