<script setup>
import { onMounted } from 'vue';

import MapApi from '../api/MapApi';
import InitApi from '../api/InitApi';
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
    userId: "***", // 请输入您申请的授权码，申请地址https://www.mapmost.com/#/productApply/webgl/?source_inviter=nqLdqFJp
    env3D: {
      defaultLights: false,
      envMap: './assets/data/yun(13).hdr',
      exposure: 2.53,
    },
  });

  window.THREE = mapmost.THREE; //Three.js接口
  let Layer;
  map.on('load', function () {
    let models_obj1 = ["factory1"].map(item => ({
      type: 'glb',
      url: "./assets/models/" + item + ".mm", // 模型路径:树、路、路灯
      decryptWasm:'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm' //模型解密
    }));

    // 图层参数
    let options1 = {
      id: 'model_id1',
      models: models_obj1,
      outline: true, // 允许轮廓高亮
      type: 'model',
      center: [120.73014920373011, 31.287414975761724, 0.1],
      callback: function (group, layer) {
       
      }
    };
    // 添加树、路、路灯模型
    map.addLayer(options1);
    // 工厂模型路径
    let models_obj = ["factory2"].map(item => ({
      type: 'glb',
      url: "./assets/models/" + item + ".mm", // 模型路径
      decryptWasm:'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm' //模型解密
    }));

    // 图层参数
    let options = {
      id: 'model_id124',
      models: models_obj,
      outline: true, // 允许轮廓高亮
      type: 'model',
      funcRender: function (gl, matrix) {
        if (Layer) {
         Layer.renderMarker(gl, matrix)
        }
      },
      center: [120.73014920373011, 31.287414975761724, 0.1],
      callback: function (group, layer) {
        Layer = layer;
        // 初始化场景
        new InitApi(map, layer, group)
        // 道路行驶车辆
        let car = new CarApi(map);
        car.Car()
        let count = 0;
        setInterval(function () { //每隔6秒放一次车，放5次
          if (count < 5) {
            car.Car()
            count++;
          }
        }, 6000)
        // 场景初始时压平工厂
        group.setScale({ x: 0, y: 0, z: 0.1 });
        // 获取MapApi接口
        window.mapApi = new MapApi(map, layer,group)
      }
    };
    // 添加工厂模型
    map.addLayer(options,'model_id1');


  
  })
  window.map = map;
});

</script>
<template>
  <div class="map-container" id="map-container"></div>
</template>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
