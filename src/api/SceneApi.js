// 该类主要用于初始化场景

class SceneApi {
  constructor(map, layer, group) {
    this._map = map;
    this._layer = layer || null;
    this._group = group || null;
    this.initSky();
    this.initLight();
    this.initLine();
    this.addFLowCircle();
    this.resetModelMaterial();
    this.addParkCar();
    this.allFlash = [];
  }

  // 灯光
  initLight() {
    // 场景灯光1
    let light1 = new mapmost.DirectionalLight({
      color: '#f4f6f6',
      intensity: 5,
      position: [291218.1880671615, -359034.8940693505, 220067.97081694918],
    });
    // 场景灯光2
    let light2 = new mapmost.DirectionalLight({
      color: '#767676',
      intensity: 3.46,
      position: [-291218.1880671615, 359034.8940693505, 220067.97081694918],
    });
    this._map.addLight(light1);
    this._map.addLight(light2);
    // 场景灯光3
    const light3 = new window.THREE.HemisphereLight();
    light3.color.setRGB(0.004799999999999999, 0.012633599999999905, 0.2352);
    light3.position.set(0, 0, 50);
    light3.name = 'main_light3';
    this._layer.tb.scene.add(light3);
  }

  // 初始化天空盒
  initSky() {
    this._map.addLayer({
      id: 'sky',
      type: 'mapmost_sky',
      enableCloud: true,
      paint: {
        'sky-url': './assets/images/CubeRT_Capture_Tex_2048.png',
        'sky-angle': 0,
        'sky-exposure': 1,
        'sky-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          0,
          5,
          0.3,
          8,
          1,
        ],
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [227.02725700614292, 110.95561210040023],
        'sky-atmosphere-sun-intensity': 5,
      },
    });
  }

  // 初始化工厂边界线和四角垂直线
  initLine() {
    // 包围工厂的线
    this._layer.addLines({
      type: 'pipe',
      color: '#ffff00',
      opacity: 0.2,
      width: 3,
      data: [
        {
          coordinate: [
            [120.72826533407661, 31.286659681235637, 0.6359780581845262],
            [120.73038873799919, 31.286663764033225, 0.63597796957936],
            [120.73037894874011, 31.2890677673872, 0.6359524698169057],
            [120.72826736153714, 31.289074198644304, 0.6359524264336855],
            [120.72826533407661, 31.286659681235637, 0.6359780581845262],
          ],
        },
      ],
    });

    let coords = [
      [
        [120.72826533407661, 31.286659681235637, 130.6359684117686807],
        [120.72826533407661, 31.286659681235637, 0.6359684117686807],
      ],
      [
        [120.73038873799919, 31.286663764033225, 130.6359532818435156],
        [120.73038873799919, 31.286663764033225, 0.6359532818435156],
      ],

      [
        [120.73037894874011, 31.2890677673872, 130.6359532744283511],
        [120.73037894874011, 31.2890677673872, 0.6359532744283511],
      ],

      [
        [120.72826736153714, 31.289074198644304, 130.6359684078200644],
        [120.72826736153714, 31.289074198644304, 0.6359684078200644],
      ],
    ];
    coords.forEach((item) => {
      // 四个垂直线
      this._layer.addFlowLine({
        type: 'trail',
        color: '#ffff00',
        speed: 0.0000001,
        opacity: 0.6,
        width: 8,
        data: {
          coordinate: item,
        },
      });
    });
  }

  // 添加扩散圆
  addFLowCircle() {
    // 扩散圆
    this._layer.addCircle({
      type: 'scan',
      color: '#FFFFFF',
      radius: 800,
      segment: 256,
      speed: 0.3,
      opacity: 0.4,
      center: [120.72934370472039, 31.28784567442511, 0.24],
    });
  }

  // 修改白模透明度和颜色
  resetModelMaterial() {
    let _this = this;
    let obj = _this._group.children[0].children[3];
    obj.material.transparent = true;
    obj.material.depthTest = true;
    obj.material.color.set('#99D9EA');
    obj.material.opacity = 0.7;
  }

  // 工厂停车位车辆
  addParkCar() {
    // 停车位加载车
    let models_car1 = ['./assets/models/car2.mm'].map((item) => ({
      type: 'glb',
      url: item,
      decryptWasm:
        'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm', 
    }));
    let caroptions1 = {
      id: 'caroptions1',
      type: 'model',
      models: models_car1,
      center: [120.72976721245632, 31.286710152245067, 0.24],
      callback: function (group, layer) {
        group.setScale({ x: 0.05, y: 0.05, z: 0.05 });
        group.children[0].children[0].visible = false;
      },
    };
    this._map.addLayer(caroptions1);

    // 停车位加载车
    let models_car2 = ['./assets/models/car3.mm'].map((item) => ({
      type: 'glb',
      url: item,
      decryptWasm:
        'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm', 
    }));
    let caroptions2 = {
      id: 'caroptions2',
      type: 'model',
      models: models_car2,
      center: [120.72985361686803, 31.286712381086062, 0.2427527190453946],
      callback: function (group, layer) {},
    };
    this._map.addLayer(caroptions2);
  }
}
export default SceneApi;
