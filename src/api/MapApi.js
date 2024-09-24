
class MapApi {
  constructor(map, layer, group) {
    this._map = map;
    this._layer = layer;
    this._group = group;
    this.workerMarkers = [];
    this.coord = [];
    this.clickEvent()
    this.escapeLines = []; // 存放逃生路径的数组
    this.deviceMarkers = []; //存放重点设备标签的数组
    this.videoMarkers = []; //存放监控标签的数组
    this.flows = []; // 存放管道数据的数组
    this.workerMarkerInfo = [];
    this.rescue = false;
  }

  clickEvent() {
    let that = this;
    let options = {
      id: 'workerMar',
      outline: true, // 允许轮廓高亮
      type: 'model',
      funcRender: function (gl, matrix) {
        if (that.CopyLayer && that.allWorkerMesh && that.allWorkerMesh.length > 0) {
          that._layer.renderMarker3D(that.allWorkerMesh)
        }
      },
      center: [120.73014920373011, 31.287414975761724, 0.1],
      callback: function (group, layer) {
        that.CopyLayer = layer;
      }
    };
    // 添加工厂模型
    this._map.addLayer(options);
    // 人员管理-》人员定位功能，点击人员标签显示信息
    this._map.on('click', function (e) {
      if (that.allWorkerMesh && that.allWorkerMesh.length > 0) {
        // 点击工人allWorkerMesh
        let info = that._layer.getMarker3DId(e.point, that.allWorkerMesh);
        if (info != "undefined") {
          // 若之前存在人员标签，先清除
          if (that.workerMarkers.length > 0) {
            that.workerMarkers.forEach(m => {
              if (m.remove) m.remove();
              m = null;
            });
            that.workerMarkers = [];
          }
          if (that.coord[info]) {
            let infoW = {
              name: that.coord[info].name,
              department: that.coord[info].depart,
              post: that.coord[info].post
            }
            let infoWorker = that._layer.addMarker({
              id: "worker111",
              data: [{
                name: "a1",
                element: that.viewWorkerInfo(infoW, true),
                position: that.coord[info].coordinate
              }]
            })
            that.workerMarkers.push(infoWorker);
            infoWorker.element.children[0].element.addEventListener('click', (e) => {
              if (that.intervalInspect) {
                clearInterval(that.intervalInspect)
              }
              let target = e.target; // 获取当前点击的目标子元素
              if (target.className == "closeVideo") {
                if (that.workerMarkers.length > 0) {
                  that.workerMarkers.forEach(m => {
                    if (m.remove) m.remove();
                    m = null;
                  });
                  that.workerMarkers = [];
                }
              }
            })
          }


        }
      }
    });
  }

  get map() {
    return this._map
  }

  // 厂区总览
  addBuildMarker(locations, datas, isScaleZ, callback) {
    let buildMarker1;
    let that = this;
    if (isScaleZ) { // 厂区从压平恢复正常
      let timeStart1 = 0.1;
      const fireSize = { x: 0.1 };
      const tween = new TWEEN.Tween(fireSize, false)
        .to({ x: 1 }, 100000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          let scaleZ = 10 / (timeStart1 / 0.1);
          timeStart1 += 0.01;
          if (timeStart1 <= 1.0) {
            // 对z轴进行方大
            that._group.setScale({ x: 0, y: 0, z: scaleZ * timeStart1 })
          }
        })
        .start()
      function animateB(time) {
        tween.update(time)
        requestAnimationFrame(animateB)
      }
      requestAnimationFrame(animateB)
    }
    setTimeout(() => {
      // 视角飞行
      this.changeViewers(locations)
      buildMarker1 = this._layer.addMarker({
        id: "marker_building",
        data: datas
      })
      callback && callback(buildMarker1);
    }, 1300)
  }

  // 人员定位
  workerLocation(coord, callback) {
    this.coord = coord;
    this._group.children[0].children[2].traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        const str = obj.name;
        if (str.indexOf("Mesh1") == -1) {
          obj.material.transparent = true
          obj.material.opacity = 0.3
        }
      }
    })
    this._group.children[0].children.forEach(item => {
      const strName = item.name;
      if (strName.indexOf("part") != -1 && strName.indexOf("part01") == -1) {
        item.material.transparent = true
        item.material.opacity = 0.3
      }
    })
    this._group.children[0].children[0].traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.material.transparent = true
        obj.material.opacity = 0.3
      }
    })
    let that = this;
    this._layer.addMarker3D(
      {
        width: 2.5,
        height: 2.5,
        element: this.createDom("./assets/images/人员4.png"),
        data: coord,
        depthTest: false
      }, function (group) {
        // callback && callback(group);
        that.workerMarker = group;
        that.allWorkerMesh = [group];
      }
    );
  }

  // 移除工人显示
  removeWorker() {
    this._layer.removeModel(this.workerMarker);
    this.workerMarker = null
    this.allWorkerMesh = [];
    if (this.workerMarkers && this.workerMarkers.length > 0) {
      this.workerMarkers.forEach(m => {
        if (m.remove) m.remove();
        m = null;
      })
      this.workerMarkers = [];
    }
    this._group.children[0].children[2].traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        const str = obj.name;
        if (str.indexOf("Mesh1") == -1) {
          obj.material.opacity = 1.0
        }
      }
    })
    this._group.children[0].children.forEach(item => {
      const strName = item.name;
      if (strName.indexOf("part") != -1 && strName.indexOf("part01") == -1) {
        item.material.opacity = 1.0
      }
    })
    this._group.children[0].children[0].traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.material.opacity = 1.0
      }
    })
  }

  // 人员巡检
  Inspection(callback) {
    let _this = this;
    // 行走的工人
    let models_obj1 = ["./assets/models/walk.fbx"].map(item => ({
      type: 'fbx',
      url: item
    }));
    let mixer1;
    const clock = new THREE.Clock()
    let options1 = {
      id: 'walk_worker',
      type: 'model',
      models: models_obj1,
      funcRender: function () {
        const time = clock.getDelta();
        if (mixer1) {
          mixer1.update(time);
        }
      },
      center: [120.72954599951584, 31.288512032525986, 0.24],
      callback: function (group, layer) {
        let path = [
          [120.72954599951584, 31.288512032525986], [120.72954804654114, 31.28836513844857]
        ]
        let infoW = {
          name: "张三",
          department: "检修部",
          post: "巡检员"
        }
        let pinfo = layer.addMarker({
          id: "worker1",
          data: [{
            name: "a1",
            element: _this.viewWorkerInfo(infoW),
            position: [120.72954599951584, 31.288512032525986, 1.0]
          }]
        })
        _this.workerMarkers.push(pinfo)
        // 开启模型动画
        let object = group.children[0];
        mixer1 = new THREE.AnimationMixer(object);
        const action = mixer1.clipAction(object.animations[0]);
        action.play();
        object.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        group.setScale({ x: 0.015, y: 0.015, z: 0.015 });
        group.setRotation({ x: 0, y: 0, z: 90 });
        _this.moveModel(action, path, group, pinfo, "a1", '巡检', _this)
        callback && callback(pinfo)
      }
    };
    this._map.addLayer(options1);
  }

  removeInspection() {
    if (this.intervalInspect) {
      clearInterval(this.intervalInspect)
    }
    if (this._map.getLayer('walk_worker')) { //人员巡检
      this._map.removeLayer("walk_worker");
    }
    if (this.workerMarkers && this.workerMarkers.length > 0) {
      this.workerMarkers.forEach(m => {
        if (m.remove) m.remove();
        m = null;
      })
      this.workerMarkers = [];
    }
  }

  // 模型位置移动
  moveModel(action, coordinates, group, workerInfo, name, type, that) {
    let orignAngle = 0; // 初始模型角度
    let nextAngle = 90; // 下个点位角度
    // 从首个点开始，遍历路径点位依次移动

    var index = 0;
    const sliced = turf.lineChunk(turf.lineString(coordinates), 0.00008, { units: 'kilometers' });
    const route = this.handleConcentrated(sliced.features)
    if (index === route.length - 1) {
      setTimeout(() => {
        index = 0
      }, 1000);
    }
    this.intervalInspect = setInterval(function () {
      if (index < route.length) {
        let p = route[index]
        group.setCoords(p);
        group.setScale({ x: 0.015, y: 0.015, z: 0.015 })
        orignAngle = nextAngle;
        // 利用下一个点计算当前点位模型的方位角，最后一个点位不更新
        if (index < route.length - 1) {
          nextAngle = that.calculateAngle(route[index], route[index + 1])
        }
        // 设置旋转值，计算方位角的更新值
        group.setRotation({ x: 0, y: 0, z: -(nextAngle - orignAngle) }) // 方位角顺时针为正，旋转角逆时针为正，所以需要取反
        // 相机跟随
        if (type === '巡检') {
          let options = {
            position: [route[index][0], route[index][1], 0],
            distance: 30,
            pitch: 71.00273364089239,
            duration: 100,
            bearing: 180,
            complete: function () {
              // that.moveModel()
            }
          }
          window.mapApi.map.cameraFlyTo(options);
        }
        if (workerInfo) {
          workerInfo.update([{
            name: name,
            position: p
          }])
        }
        index++
      } else {
        action.stop()
        clearInterval(this.intervalInspect)
      }
    }, 20)
  }

  handleConcentrated(line) {
    let codes = [];
    if (line.length) {
      line.map(item => {
        item.geometry.coordinates.map(d => {
          codes.push([...d, 0.24]);
        })
        codes.pop()
      })
    }
    return codes
  }

  calculateAngle(startPoint, endPoint) {
    let bearing;
    if (endPoint[0] === startPoint[0]) {
      bearing = endPoint[1] > startPoint[1] ? 0 : 180;
    } else {
      let k = (endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0])
      let radian = Math.atan(k);
      if (startPoint[0] < endPoint[0]) {
        bearing = -radian + Math.PI / 2
      } else {
        bearing = -radian + Math.PI * 3 / 2
      }
    }
    return bearing * 180 / Math.PI;
  }

  createDom(imageUrl) {
    const container = document.createElement('div');
    container.style.width = '200px';
    container.style.height = '200px';
    const element = document.createElement('div');
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.backgroundImage = "url(" + imageUrl + ")";
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundSize = "100% 100%";
    element.style.margin = "0px";
    element.style.backgroundPosition = 'center 0';
    element.style.zIndex = -999;
    container.appendChild(element);
    return container;
  }

  // 工人信息框
  viewWorkerInfo(infoW, po = false) {
    let _this = this;
    let container = _this.createInfoDom("员工信息");
    container.style.backgroundColor = "rgba(40,87,151,0.8)";
    if (po) {
      container.style.marginLeft = "120px";
      container.style.marginTop = "-25px"
    } else {
      container.style.marginTop = "-210px"
    }
    let box1 = document.createElement('div');
    box1.className = "b1";
    container.appendChild(box1);
    let c1 = document.createElement('div');
    box1.appendChild(c1);
    c1.className = "c1";
    let headshotBox = document.createElement("img");
    headshotBox.className = "headshotBox";
    headshotBox.src = "./assets/images/worker1.png"
    c1.appendChild(headshotBox);
    let infoBox = document.createElement('div');
    infoBox.className = "in";
    let i1 = document.createElement('div');
    i1.innerText = "姓名：" + infoW.name;
    let i2 = document.createElement('div');
    i2.innerText = "部门：" + infoW.department;
    let i3 = document.createElement('div');
    i3.innerText = "岗位：" + infoW.post;
    infoBox.appendChild(i1);
    infoBox.appendChild(i2);
    infoBox.appendChild(i3);
    c1.appendChild(infoBox);
    let c2 = document.createElement('div');
    box1.appendChild(c2);
    let view1 = document.createElement("img");
    c2.className = "c2";
    view1.src = "./assets/images/电话.png";
    view1.className = "imgW";
    c2.appendChild(view1);
    let view2 = document.createElement("img");
    view2.src = "./assets/images/首页-短信催付.png";
    view2.className = "imgW";
    c2.appendChild(view2);
    let view3 = document.createElement("img");
    view3.className = "imgW";
    view3.src = "./assets/images/查看解析.png";
    c2.appendChild(view3);
    let view4 = document.createElement("img");
    view4.className = "imgW";
    view4.src = "./assets/images/路线.png";
    c2.appendChild(view4);
    let view5 = document.createElement("img");
    view5.className = "imgW";
    view5.src = "./assets/images/监控1.png";
    c2.appendChild(view5);
    return container;
  }

  createInfoDom(text) {
    let dom = document.createElement('div')
    dom.innerHTML = '';
    dom.className = "videoDom";
    let infoDom = document.createElement('div');
    infoDom.className = "infoDom";
    let infoText = document.createElement('div');
    infoText.fontSize = "10px"
    infoText.innerText = text;
    let closeIcon = document.createElement("div");
    closeIcon.className = "closeVideo";
    infoDom.appendChild(infoText);
    infoDom.appendChild(closeIcon);
    dom.appendChild(infoDom);
    return dom;
  }

  // 巡检轨迹
  viewLine() {
    let vPath = [
      [120.72851832001594, 31.28755587230927, 1.0000030738306662], [120.72851522469777, 31.287613533403206, 1.0000024622414412], [120.72863034602567, 31.287615226732807, 1.0000024442809254], [120.72864616299091, 31.28791933729826, 0.9999992186793444], [120.72852415385313, 31.287927506857528, 0.9999991320270905], [120.72855565270325, 31.288791966664142, 0.9999899628278878], [120.72884212174476, 31.28880165584852, 0.9999898600547857], [120.72880061549185, 31.288465547569025, 0.9999934251344106], [120.72886892238581, 31.28846740511217, 0.9999934054316608], [120.72886499767233, 31.288234861848668, 0.9999958719835995], [120.72913860564645, 31.288266805747092, 0.9999955331603824], [120.72914114449425, 31.28858236931436, 0.9999921860173329], [120.72914482742175, 31.28880027088362, 0.9999898747451229], [120.72954426741524, 31.288703521111287, 0.999990963429055], [120.72954804654114, 31.28836513844857, 0.999990918983698], [120.72954804654114, 31.28836513844857, 0.9999945359840603], [120.7298687189919, 31.288346098117376, 0.9999946921190196], [120.72989291901943, 31.28853858739622, 0.9999926504084375], [120.72991574093457, 31.28882225988471, 0.9999896415079671], [120.73017939377972, 31.288849862338846, 0.9999893487287526], [120.7301668961847, 31.288096309157844, 0.9999973415835826], [120.7301443003407, 31.287841410384885, 1.000000045227383], [120.72977488934671, 31.287849009062654, 0.9999999646305058], [120.72977444082206, 31.287563347531062, 1.0000029945438846], [120.72956351230985, 31.28755766447937, 1.0000030548218177], [120.7295508476269, 31.287174939315715, 1.000007114216053], [120.73011793462527, 31.287184068002546, 1.0000070173926385], [120.73010587193824, 31.286856943213184, 1.0000104870242013], [120.72929698757832, 31.286731689004515, 1.0000118155176172], [120.72889964025318, 31.286766435031968, 1.0000114469886137], [120.72889520909622, 31.287237420360277, 1.000006451510686], [120.72893784920592, 31.287219081996973, 1.0000066460166686]
    ];
    this.workerLine = this._layer.addFlowLine({
      type: "image",
      color: '#FFF200',
      speed: 5,
      opacity: 0.8,
      width: 1.6,
      textureFactor: 3,
      towards: "ground",
      image: "./assets/images/arrow8.png",
      data: {
        name: "name5",
        coordinate: vPath
      }
    });
    this._group.children[0].children[3].traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        const str = obj.name;
        if (str.indexOf("Mesh1") == -1) {
          obj.material.transparent = true
          obj.material.opacity = 0.5
        }
      }
    })
    this._group.children[0].children.forEach(item => {
      const strName = item.name;
      if (strName.indexOf("part") != -1 && strName.indexOf("part01") == -1) {
        item.material.transparent = true
        item.material.opacity = 0.5
      }
    })
    this._group.children[0].children[0].traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.material.transparent = true
        obj.material.opacity = 0.5
      }
    })
  }

  // 巡检路径移除
  removeViewLine() {
    if (this.workerLine) {
      this._layer.removeModel(this.workerLine);
      this.workerLine = null;
      this._group.children[0].children.forEach(item => {
        const strName = item.name;
        if (strName.indexOf("part") != -1 && strName.indexOf("part01") == -1) {
          item.material.opacity = 1.0
        }
      })
      this._group.children[0].children[0].traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.material.opacity = 1.0
        }
      })
    }
  }

  // 非法闯入
  trespassing() {
    let model = ["./assets/models/3d_person.mm"].map(item => ({
      type: 'glb',
      url: item,
      decryptWasm:'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm' //模型解密
    }));
    let optionsPer = {
      id: 'Trespass_person',
      type: 'model',
      models: model,
      funcRender: function () {
      },
      center: [120.72918250343025, 31.28827092638799, 0.23999891746882296],
      callback: function (group, layer) {
        group.setScale({ x: 2, y: 2, z: 2 });
        group.setRotation({ x: 0, y: 0, z: 90 })

      }
    };
    this._map.addLayer(optionsPer);
    this.Fence = this._layer.addGeoFencing({
      type: "fade",
      color: "#ED1C24",
      speed: 3,
      opacity: 0.8,
      height: 30,
      data: {
        name: "name2",
        coordinate: [
          [120.72917927477114, 31.28821929110349, 0.6359581932964588],
          [120.72944340424843, 31.28820032444006, 0.6359583212363746],
          [120.72945790732305, 31.288691627176174, 0.635955007124611],
          [120.72918804679018, 31.28870614517714, 13.137327241937482],
          [120.72917927477114, 31.28821929110349, 0.6359581932964588],
        ]
      }
    });

    let n = 0;
    let _this = this;
    this.Trespass = setInterval(function () {
      if (_this.TrespassMarker) {
        _this.TrespassMarker.remove();
        _this.TrespassMarker = null;
      }
      let imgUrl;
      if (n % 2 == 0) {
        imgUrl = './assets/images/非法闯入1.png';
      } else {
        imgUrl = './assets/images/非法闯入2.png';
      }
      n++;
      let box = _this.createTrespassingDom(imgUrl);
      _this.TrespassMarker = _this._layer.addMarker({
        id: "markerSevice",
        data: [{
          element: box,
          position: [120.72922671518234, 31.288444646404223, 40.29363455956531]
        }]
      })
    }, 200);
    let box = this.createDeviceDom("persomMarker", "./assets/images/定位.png", "50px", "50px");
    this.banMarker = _this._layer.addMarker({
      id: _this.getUuid(),
      data: [{
        name: "per",
        element: box,
        position: [120.72918224724452, 31.2882738243612, 6]
      }]
    })
    let count = 0;
    this.banPersonTime = setInterval(function () {
      let height = Math.abs(Math.sin(count)) * 4;
      let updateDatas = [{
        name: "per",
        position: [120.72918224724452, 31.2882738243612, 6 + height]
      }]
      _this.banMarker.update(updateDatas)
      count += 0.1;;
    }, 10);
  }

  // 移除非法闯入效果
  removeTrespass() {
    if (this.banMarker && this._map.getLayer('Trespass_person')) {
      this._map.removeLayer("Trespass_person");
      this.TrespassMarker.remove();
      this.TrespassMarker = null;
      clearInterval(this.banPersonTime)
      clearInterval(this.Trespass);
      this.banMarker.remove();
      this.banMarker = null;
      this._layer.removeModel(this.Fence);
    }
  }

  // 非法闯入警告文本
  createTrespassingDom(imageUrl = "./assets/images/非法闯入1.png") {
    let container = document.createElement('div');
    container.className = "trespassing";
    container.style.width = "250px";
    container.style.height = "50px";
    container.style.backgroundImage = "url(" + imageUrl + ")";
    container.style.backgroundRepeat = "no-repeat";
    container.style.backgroundSize = "100% 100%";
    container.style.margin = "0px";
    container.style.backgroundPosition = "center 0";
    container.style.color = "white";
    container.style.fontSize = "40px";
    container.style.paddingTop = "25px"
    container.style.letterSpacing = "10px"
    container.innerText = "非法闯入";
    container.style.textAlign = "center";
    return container;
  }

  // 火灾报警
  fireAlert() {
    let that = this;
    let options = {
      id: "fire_id",
      type: "model",
      callback: function (group, layer) {
        that.fireMesh = layer.addFlame(
          {
            coordinate: [120.72861748165724, 31.28791655934667, 4 / 2], //火焰位置和高度
            size: [4, 4, 6], // 火焰尺寸
            imgUrl: "./assets/images/Fire.png" //火焰贴图
          }
        );
        const fireSize = { x: 1 };
        const tween = new TWEEN.Tween(fireSize, false)
          .to({ x: 4 }, 10000)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            that.fireMesh.setCoords([120.72939874990648, 31.288295162912682, 6 / 2 * fireSize.x]);
            that.fireMesh.setScale({ x: fireSize.x, y: fireSize.x, z: fireSize.x })
          })
          .start()
        function animate(time) {
          tween.update(time)
          requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      },
    };
    if (!this._map.getLayer('fire_id')) {
      this._map.addLayer(options);
    }
  }

  removeFire() {
    if (this._map.getLayer('fire_id')) {
      try {
        this._map.removeLayer("fire_id");
        this.fireMesh = null;
      } catch (e) {
      }

    }
  }

  removeFireFight() {
    if (this.fireHydrantMarker) {// 消防栓
      this._group.children[0].children[3].traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          const str = obj.name;
          if (str.indexOf("Mesh1") != -1 && str.indexOf("Mesh1_1_2" == -1)) {
            obj.material.depthTest = true;
          }
        }
      })
      this.fireHydrantMarker.remove();
      this.fireHydrantMarker = null
      clearInterval(this.fireHydrantTime);
      this.fireHydrantTime = null;
    }
  }

  // 消防设备
  fireFightEquipment(datas) {
    this._group.children[0].children[3].traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        const str = obj.name;
        if (str.indexOf("Mesh1") != -1 && str.indexOf("Mesh1_1_2" == -1)) {
          obj.material.transparent = true
          obj.material.depthTest = false
        }
      }
    })

    this.fireHydrantMarker = this._layer.addMarker({
      id: "FireHydrant",
      data: datas
    })
    let count = 0;
    let that = this;
    this.fireHydrantTime = setInterval(function () {
      let height = Math.abs(Math.sin(count)) * 10;
      let updateDatas = [{
        name: "aa",
        position: [120.72859324566448, 31.28794593160938, 2.115319087316013 + height]
      }, {
        name: "bb",
        position: [120.72891221958787, 31.288347777834485, 2.0342198718630784 + height]
      }, {
        name: "cc",
        position: [120.72922300174834, 31.288298861952736, 2.1133463237631194 + height]
      }, {
        name: "dd",
        position: [120.72921948542981, 31.28851478212164, 2.194335662650372 + height]
      }, {
        name: "ee",
        position: [120.72869255536168, 31.28878685356426, 2.0882700928097746 + height]
      }, {
        name: "ff",
        position: [120.72984315356015, 31.288487321448162, 2.1153069402534324 + height]
      }, {
        name: "gg",
        position: [120.72971605679086, 31.288768061185273, 2.088270509069682 + height]
      }, {
        name: "hh",
        position: [120.72890353299243, 31.287674964788746, 2.115325166876981 + height]
      }, {
        name: "ii",
        position: [120.72966078133251, 31.286964818290024, 2.115341099890847 + height]
      }, {
        name: "jj",
        position: [120.72891596681363, 31.286949074659432, 2.0342500507694568 + height]
      }, {
        name: "kk",
        position: [120.73011243507135, 31.287928216085344, 2.1153194847927224 + height]
      }]

      that.fireHydrantMarker.update(updateDatas)
      count += 0.1;;
    }, 12);
  }

  // 救援路径
  rescuePaths() {
    let that = this;
    this.rescue = true;
    // 消防车模型
    let models_obj2 = ["./assets/models/car2.mm"].map(item => ({
      type: 'glb',
      url: item,
      decryptWasm:'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm' //模型解密
    }));
    // 喷水模型
    let models_obj3 = ["./assets/models/s.mm"].map(item => ({
      type: 'glb',
      url: item,
      decryptWasm:'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm' //模型解密
    }));
    let options1 = {
      id: 'model_id1_1',
      type: 'model',
      models: models_obj2,
      funcRender: function () {
      },
      center: [120.72964963829233, 31.287934997837798, 1.5],
      callback: function (group, layer) {
        group.setScale({ x: 0.1, y: 0.1, z: 0.1 });
        let path = [
          [120.72945324310054, 31.287541752703465, 0.26], [120.72943211297542, 31.288230349744236, 0.26], [120.72943305699131, 31.288175553509255, 0.26]
        ]
        that.line_image = that._layer.addFlowLine({
          type: "image",
          color: '#FF7F27',
          speed: 4,
          depth: true,
          opacity: 0.8,
          width: 0.8,
          textureFactor: 4,
          towards: "ground",
          image: "./assets/images/arrow.png",
          data: {
            name: "name5",
            coordinate: path
          }
        });
        // 隐藏原有消防车喷水模型
        group.children[0].children[0].visible = false;
        // 消防车移动动画
        group.followPath({ path: path, duration: 5000 }, () => {
          //在动画结束后执行下面代码
          let options4 = {
            id: 'model_id111',
            type: 'model',
            models: models_obj3,
            funcRender: function () {
            },
            center: [120.72943662244022, 31.28819739860292, 3.6349483699713105],
            callback: function (group, layer) {
              group.setScale({ x: 0.02, y: 0.02, z: 0.02 });
              group.setRotation({ x: 60, y: 0, z: 0 })
            }
          };
          if (!that._map.getLayer("model_id111") && that.rescue) {
            // 加载喷水模型
            that._map.addLayer(options4);
            // 火焰逐渐变小效果
            const fireSize = { x: 4 };
            const tween = new TWEEN.Tween(fireSize, false)
              .to({ x: 0.0001 }, 10000)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {
                if (that.fireMesh && that.fireMesh.children) {
                  that.fireMesh.setCoords([120.72939874990648, 31.288295162912682, 6 / 2 * fireSize.x]);
                  that.fireMesh.setScale({ x: fireSize.x, y: fireSize.x, z: fireSize.x })
                }
              })
              .start()
            function animate(time) {
              tween.update(time)
              requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
          }
        })
      }
    };
    this._map.addLayer(options1);

    let options2 = {
      id: 'model_id2',
      type: 'model',
      models: models_obj2,
      funcRender: function () {
      },
      center: [120.72964963829233, 31.287934997837798, 1.5],
      callback: function (group, layer) {
        group.setScale({ x: 0.1, y: 0.1, z: 0.1 });
        let path = [
          [120.7301737195251, 31.28813731046964, 0.26], [120.7296192115023, 31.28813457226826, 0.26], [120.72963425436238, 31.28828483530879, 0.26], [120.72945161819551, 31.28828611006086, 0.26], [120.7295042223372, 31.28828611006086, 0.26]
        ]
        that.line_image1 = that._layer.addFlowLine({
          type: "image",
          color: '#FF7F27',
          speed: 4,
          depth: true,
          opacity: 0.8,
          width: 0.8,
          textureFactor: 4,
          towards: "ground",
          repeat: { x: 1, y: 1 },
          image: "./assets/images/arrow.png",
          data: {
            name: "name5",
            coordinate: path
          }
        });
        group.children[0].children[0].visible = false;
        group.followPath({ path: path, duration: 5000 }, (eve) => {
          if (!that._map.getLayer("model_id222") && that.rescue) {
            let options4 = {
              id: 'model_id222',
              type: 'model',
              models: models_obj3,
              funcRender: function () {
              },
              center: [120.72947864891778, 31.288289274259753, 3.6382321451727098],
              callback: function (group, layer) {
                group.setScale({ x: 0.02, y: 0.02, z: 0.02 });
                group.setRotation({ x: 120, y: 100, z: -50 })

              }
            };
            that._map.addLayer(options4);
          }
        })
      }
    };
    this._map.addLayer(options2);
  }

  removeRescueLine() {
    this.rescue = false;
    if (this.line_image && this.line_image1) { // 逃生路径
      this._layer.removeModel(this.line_image);
      this._layer.removeModel(this.line_image1);
      this.line_image = null;
      this.line_image1 = null;
    }
    if (this._map.getLayer('model_id1_1')) { // 救援路径
      this._map.removeLayer("model_id1_1");
      if (this.line_image) this._layer.removeModel(this.line_image)
    }
    if (this._map.getLayer('model_id2')) { // 救援路径
      this._map.removeLayer("model_id2");
      if (this.line_image1) this._layer.removeModel(this.line_image1)
    }
    if (this._map.getLayer('model_id222')) { // 救援路径
      this._map.removeLayer("model_id222");
    }
    if (this._map.getLayer('model_id3')) { // 救援路径
      this._map.removeLayer("model_id3");
    }
    if (this._map.getLayer('model_id333')) { // 救援路径
      this._map.removeLayer("model_id333");
    }
    if (this._map.getLayer('model_id111')) { // 救援路径
      this._map.removeLayer("model_id111");
    }
  }

  // 逃生路径
  eacapePaths() {
    let escapepath1 = [
      [120.72989770179746, 31.288418248465636, 0.9999939268302935], [120.72990273820977, 31.28881659576737, 0.9999897015872131], [120.73014701447795, 31.28882389776796, 0.999989624134962], [120.73014663149901, 31.28902804341051, 0.9999874587566451]
    ]
    // 巡查员路径
    let escape1 = this._layer.addFlowLine({
      type: "image",
      color: '#31FF6D',
      speed: 3,
      depth: true,
      opacity: 0.8,
      width: 1.5,
      textureFactor: 3,
      towards: "ground",
      image: "./assets/images/arrow8.png",
      data: {
        name: "name5",
        coordinate: escapepath1
      }
    });
    this.escapeLines.push(escape1);

    let escapepath2 = [
      [120.72910356487955, 31.288254204725593, 8.076116927909876], [120.72883611664234, 31.28826951578039, 0.9999955044154999], [120.72880603389078, 31.288729462510435, 0.9999906258079599], [120.72873047285634, 31.2890066749364, 0.9999876854132176]
    ]
    // 巡查员路径
    let escape2 = this._layer.addFlowLine({
      type: "image",
      color: '#31FF6D',
      speed: 3,
      depth: true,
      opacity: 0.8,
      width: 1.5,
      textureFactor: 3,
      towards: "ground",
      image: "./assets/images/arrow8.png",
      data: {
        name: "name5",
        coordinate: escapepath2
      }
    });
    this.escapeLines.push(escape2);

    let escapepath3 = [
      [120.72962749368061, 31.28792973252145, 1.3999991084201045], [120.72961913992484, 31.287854494366158, 1.3999999064495394], [120.72944501882807, 31.28785677240911, 1.3999998822869602], [120.7294482801036, 31.286749620697975, 1.3000116253276603]
    ]
    let escape3 = this._layer.addFlowLine({
      type: "image",
      color: '#31FF6D',
      speed: 3,
      depth: true,
      opacity: 0.8,
      width: 1.5,
      textureFactor: 3,
      towards: "ground",
      image: "./assets/images/arrow8.png",
      data: {
        name: "name5",
        coordinate: escapepath3
      }
    });
    this.escapeLines.push(escape3);
    let escapepath4 = [
      [120.72850526422451, 31.28729379910627, 1.5000058535283012], [120.72834892756711, 31.287324414676053, 1.5000055288032108], [120.72835296327325, 31.286754743606867, 1.5000115709921316], [120.72941157815431, 31.286743407274106, 1.5000116912294292]
    ]
    let escape4 = this._layer.addFlowLine({
      type: "image",
      color: '#31FF6D',
      speed: 3,
      depth: true,
      opacity: 0.8,
      width: 1.5,
      textureFactor: 3,
      towards: "ground",
      image: "./assets/images/arrow8.png",
      data: {
        name: "name5",
        coordinate: escapepath4
      }
    });
    this.escapeLines.push(escape4);

    let escapepath5 = [
      [120.72944042289602, 31.288513823503425, 0.9999929130767264], [120.72940288351883, 31.287959047541158, 0.9999987974836553], [120.72890590634589, 31.28796395106264, 0.9999987454733419], [120.7289010922606, 31.287864011099185, 0.9999998055083896], [120.72830910764758, 31.287880576370934, 0.9999996298054251]
    ]
    let escape5 = this._layer.addFlowLine({
      type: "image",
      color: '#31FF6D',
      speed: 3,
      depth: true,
      opacity: 0.8,
      width: 1.5,
      textureFactor: 3,
      towards: "ground",
      image: "./assets/images/arrow8.png",
      data: {
        name: "name5",
        coordinate: escapepath5
      }
    });
    this.escapeLines.push(escape5);

    let escapepath6 = [
      [120.72889081757334, 31.28737035208928, 1.0000050415659272], [120.72889057994504, 31.286755207066125, 1.787353335661914]
    ]
    let escape6 = this._layer.addFlowLine({
      type: "image",
      color: '#31FF6D',
      speed: 3,
      depth: true,
      opacity: 0.8,
      width: 1.5,
      textureFactor: 3,
      towards: "ground",
      image: "./assets/images/arrow8.png",
      data: {
        name: "name5",
        coordinate: escapepath6
      }
    });
    this.escapeLines.push(escape6);
  }

  removeEacapePaths() {
    if (this.escapeLines.length > 0) { // 逃生路径
      this.escapeLines.forEach(e => {
        this._layer.removeModel(e);
      })
      this.escapeLines = [];
    }
  }

  // 重点设备
  imporDevice() {
  
    let that = this;
  console.log("mxing:",this._group.children[0])
    let datas = [{
      id: 0,
      info: ["DBJ123-135", "338天", "2024-04-20", "张三", "12345678985"],
      element: this.createDeviceDom(),
      object: [this._group.children[0].children[0]],
      position: [120.72921676180644, 31.28839591136319, 35.06151110236803]
    }, {
      id: 1,
      info: ["DBJ123-136", "526天", "2023-01-25", "李伟", "13947702563"],
      element: this.createDeviceDom(),
      object: [this._group.children[0].children[4]],
      position: [120.72886649975871, 31.28870496465847, 10.435824397032203]
    }, {
      id: 2,
      info: ["DBJ123-137", "223天", "2024-01-20", "李四", "13399824112"],
      element: this.createDeviceDom(),
      object: [this._group.children[0].children[6]],
      position: [120.72980949403001, 31.288439683052893, 28.57758424870057]
    }, {
      id: 3,
      info: ["DBJ123-138", "4856天", "2020-05-12", "王五", "17826260023"],
      element: this.createDeviceDom(),
      object: [this._group.children[0].children[5]],
      position: [120.72980864558616, 31.288375987824637, 28.547436596912537]
    }]
    this.importantDevice = this._layer.addMarker({
      id: "markerSevice",
      data: datas
    })

    let deviceIn = ['设备型号:', '运作时长:', '检修日期:', '负责人:', '报修电话:']
    this.importantDevice.element.children.forEach((dom, index) => {
      dom.element.addEventListener('click', (e) => {

        if (that.deviceMarkers.length > 0) {
          that.deviceMarkers.forEach(m => {
            if (m.remove) m.remove();
            m = null;
          });
          that.deviceMarkers = [];
        }
        let container = this.createInfoDom("设备信息");
        container.style.marginLeft = "130px"
        container.style.backgroundColor = "rgba(0,0,0,0.5)";
        let infoDom = document.createElement('div');
        infoDom.className = "deviceInfos";
        for (let i = 0; i < 5; i++) {
          let info = document.createElement('div');
          info.className = "infoBox";
          info.style.color = "rgb(255,255,255)";
          let textInfo1 = document.createElement('div');
          textInfo1.innerText = deviceIn[i];
          info.appendChild(textInfo1);
          let textInfo2 = document.createElement('div');
          textInfo2.innerText = datas[index].info[i];
          textInfo2.style.marginLeft = "30px"
          info.appendChild(textInfo2);
          infoDom.appendChild(info);
        }
        container.appendChild(infoDom);
        let deviceMarker = this._layer.addMarker({
          id: "sdf5" + index,
          data: [{
            name: "ggha",
            element: container,
            position: datas[index].position
          }]
        })
        // 模型轮廓效果
        this._layer.outlineModel(datas[index].object, {
          scope: 'default', // 模型轮廓范围：layer、model、default
          edgeStrength: 3.0, // 轮廓强度系数
          edgeGlow: 0.0, // 轮廓发光稀释
          edgeColor: '#17FFFA', // 轮廓颜色
          enableFillColor: true,  // 轮廓内部是否填充
          fillColorOpacity: 0.2,  // 轮廓内部填充颜色不透明度
        });
        this.importanBool = true;
        // 延迟0.8秒切换视角
        setTimeout(() => {
          let location = {
            "center": {
              "lng": datas[index].position[0],
              "lat": datas[index].position[1]
            },
            "zoom": 19.000602613940182,
            "bearing": -89.10307825664734,
            "pitch": 29.519197008631362,
            "speed": 0.5,
            "curve": 1
          }
          that.fly(location)
        }, 800);
        that.deviceMarkers.push(deviceMarker);
        // 为信息框中关闭图标绑定事件
        deviceMarker.element.children[0].element.addEventListener('click', (e) => {
          let target = e.target; // 获取当前点击的目标子元素
          if (target.className == "closeVideo") {
            if (that.deviceMarkers.length > 0) {
              that.deviceMarkers.forEach(m => {
                if (m.remove) m.remove();
                m = null;
              });
              that.deviceMarkers = [];
            }
          }
        })

      })
    })
  }

  // 移除重点设备
  removeImporDevice() {
    if (this.importantDevice || this.deviceMarkers.length > 0) {
      this.importantDevice.remove();
      this.importantDevice = null;
      this.deviceMarkers.forEach(e => {
        e.remove();
      })
      this.deviceMarkers = [];
    }
    if (this.importanBool) {
      this.importanBool = false;
      this._layer.unOutlineModel();
    }
  }

  // 监控视频
  video() {
    let that = this;
    let cameraPoints = [{
      element: this.createDeviceDom("11", "./assets/images/camera4.png"),
      position: [120.72821479195228, 31.28733477033432, 5.0765094133310445],
    }, {
      element: this.createDeviceDom("22", "./assets/images/camera4.png"),
      position: [120.7287192317165, 31.28819863308189, 14.71560801405274],
    }, {
      element: this.createDeviceDom("331", "./assets/images/camera4.png"),
      position: [120.72896733811346, 31.288163046674487, 12.603560646055914],
    }, {
      element: this.createDeviceDom("44", "./assets/images/camera4.png"),
      position: [120.73009256940496, 31.28752536411183, 22.835939594248025],
    }, {
      element: this.createDeviceDom("55", "./assets/images/camera4.png"),
      position: [120.72953782729458, 31.287951312566875, 16.753105620297802],
    }, {
      element: this.createDeviceDom("66", "./assets/images/camera4.png"),
      position: [120.72940651551471, 31.2883226536222, 16.46548992663696],
    }, {
      element: this.createDeviceDom("77", "./assets/images/camera4.png"),
      position: [120.72940944686258, 31.28865649532174, 8.465536969130934],
    }, {
      element: this.createDeviceDom("88", "./assets/images/camera4.png"),
      position: [120.72928036873112, 31.288652834298727, 8.465537297869778],
    }]

    this.cameraVideo = this._layer.addMarker({
      id: "cameraSevice11",
      data: cameraPoints
    })

    this.cameraVideo.element.children.forEach((dom, index) => {
      dom.element.addEventListener('click', (e) => {
        if (that.videoMarkers.length > 0) {
          that.videoMarkers.forEach(m => {
            if (m.remove) m.remove();
            m = null;
          });
          that.videoMarkers = [];
        }
        let dom = that.createInfoDom("实时监控");
        dom.style.marginLeft = "210px"
        dom.style.marginTop = "-30px"
        dom.style.backgroundColor = "rgba(0,0,0,0.5)";
        const video = document.createElement('video');
        video.src =
          './assets/images/工人检修.mp4';
        video.controls = false;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.height = 160;
        video.width = 320;
        dom.appendChild(video);
        video.style.opacity = 1.0;
        let cameraMarker = that._layer.addMarker({
          id: "marker03345",
          data: [{
            name: "a",
            element: dom,
            position: cameraPoints[index].position
          }]
        })
        that.videoMarkers.push(cameraMarker);
        cameraMarker.element.children[0].element.addEventListener('click', (e) => {
          let target = e.target; // 获取当前点击的目标子元素
          if (target.className == "closeVideo") {
            if (that.videoMarkers.length > 0) {
              that.videoMarkers.forEach(m => {
                if (m.remove) m.remove();
                m = null
              });
              that.videoMarkers = [];
            }
          }
        })
      })
    })
  }

  // 温度传感
  temperature(dataPoints) {
    let coordinates = [
      [120.72830116955181, 31.28665784485186, 2],
      [120.73036136264517, 31.286674994613204, 2],
      [120.73032075492046, 31.288998262389292, 2],
      [120.72831959808214, 31.288936698256688, 2]
    ]
    let op = {
      id: 'heatmap',
      type: 'heatmap-3d',
      data: dataPoints[0], // dataPoints = [[lon,lat,value]]，参数分别为经度，纬度，属性值
      coordinates: coordinates,
      width: 128, // 热力图容器宽度，默认 256
      heightRatio: 0.01, // 3D热力图拉伸高度，默认 100
      proj: "4326", // 坐标系支持 '3857' 和 '4326'，默认 '4326'
      blur: 0.85, // [0,1] 可选参数 default = 0.85 ，应用于所有点数据。系数越高，渐变越平滑，默认是 0.85
      radius: 10, // 每个数据点的半径，默认 6
      depthTest: false,
      opacity: 0.6,
      gradient: {
        '0.1': 'rgb(0,102,255)',
        '0.2': 'rgb(102,255,255)',
        '0.3': 'rgb(102,255,153)',
        '0.4': 'rgb(125,255,0)',
        '0.5': 'rgb(255,255,0)',
        '0.6': 'rgb(255,204,0)',
        '0.7': 'rgb(255,128,0)',
        '0.8': 'rgb(255,102,0)',
        '0.9': 'rgb(255,0,0)',
      }, // 表示渐变的色带对象,不设置则使用默认样式
      callback(object, layer, updateHeatmap) {
        let count = 1;
        setInterval(function () {
          updateHeatmap(dataPoints[count]);
          count++;
          if (count >= 4) count = 0;
        }, 1000);
      }
    };

    this._map.addLayer(op);
  }
  removeTemperature() {
    if (this._map.getLayer('heatmap')) {//移除热力图
      this._map.removeLayer("heatmap");
    }
  }

  // 管道可视
  pipe() {
    let pipeData = [
      {
        speed: 2,
        coords: [
          [120.72924580480148, 31.286779539314953, 4.363526687354781],
          [120.72921982796709, 31.287742681391006, 4.363435122757448],
          [120.72922021434559, 31.287747147268522, 5.934334246039427],
          [120.72921977633057, 31.28775383322483, 6.172384422871447],
          [120.72921955962364, 31.287783407251936, 6.1733467301701275],
          [120.72921982796709, 31.287742681391006, 4.363435122757448],
          [120.7292177345822, 31.287787151945953, 6.173224353073571],
          [120.72921416651033, 31.287787689466157, 6.173136647061232],
          [120.72843937582685, 31.287792766462214, 6.162164698127572],
          [120.72847232826427, 31.28895325975569, 6.172365042542717]
        ]
      }, {
        speed: 2,
        coords: [
          [120.72923204764788, 31.286777874480904, 4.366051906137673],
          [120.72920682877229, 31.28774397270926, 4.364364526211679],
          [120.72920675620772, 31.287747637802568, 5.7823224141219995],
          [120.72920693461708, 31.28775202720321, 6.154884048693634],
          [120.72920639680606, 31.28777364185167, 6.1744256788737815],
          [120.72920318386223, 31.287776243162842, 6.173457493825896],
          [120.72842720785367, 31.28778322542937, 6.174429569163689],
          [120.72845901697343, 31.288954075102257, 6.17174862170531],
        ]
      }, {
        speed: 2,
        coords: [
          [120.72921769161472, 31.286777830488035, 4.363765068047907],
          [120.72919242874157, 31.287739502742443, 4.363721994122127],
          [120.7291925674723, 31.287744101505645, 5.76579176416912],
          [120.72919285875389, 31.287748455500964, 6.144275714575415],
          [120.72919187639266, 31.28776301270601, 6.172330641215685],
          [120.729189180338, 31.2877640872762, 6.172305451981144],
          [120.72841241967545, 31.28777105629717, 6.1723178244886485],
          [120.72844483983101, 31.28895394562661, 6.171973778511544]
        ]
      }, {
        speed: 2,
        coords: [
          [120.72920551732726, 31.286778957885257, 4.363765021936223],
          [120.72917950547067, 31.287739598538945, 4.363726402210476],
          [120.7291792039348, 31.28774399317908, 5.746757102824236],
          [120.7291795693483, 31.28774901776283, 6.161040296606829],
          [120.72917957832543, 31.28775183681872, 6.1731153181027665],
          [120.72917553017929, 31.287753419061342, 6.17278427844648],
          [120.72839848928133, 31.28775964296313, 6.172001342838552],
          [120.72843183854938, 31.288954603912604, 6.172433310772251]
        ]
      }, {
        speed: 2.5,
        coords: [
          [120.72883630338963, 31.28678313731545, 3.9661710990875925],
          [120.72886343497835, 31.287749847437567, 3.96212445261088],
          [120.72886306907847, 31.287752761034834, 5.600788535032175]
        ]
      }, {
        speed: 2.5,
        coords: [
          [120.72882235989104, 31.286782381120712, 3.9738754473773428], [120.72884981547853, 31.287751322254156, 3.969660239867464], [120.72884986795611, 31.287752933707555, 5.621350633625025]
        ]
      }, {
        speed: 2.5,
        coords: [
          [120.72882235989104, 31.286782381120712, 3.9738754473773428], [120.72884981547853, 31.287751322254156, 3.969660239867464], [120.72884986795611, 31.287752933707555, 5.621350633625025]
        ]
      }, {
        speed: 2.5,
        coords: [
          [120.7288087117162, 31.2867818882685, 3.9637641364807767], [120.72883555805099, 31.287746980823936, 3.9646439925034653], [120.7288357401609, 31.287753407866504, 5.652084395859311]
        ]
      }, {
        speed: 2.5,
        coords: [
          [120.72879714244743, 31.286783163391064, 3.9637640872749635], [120.72882257581726, 31.287747587192182, 4.0053420605725405], [120.72882233285819, 31.28775315859613, 5.616165248254115]
        ]
      }

    ]
    // 管道流动
    pipeData.forEach((item, i) => {
      let pipe = this._layer.addFlowLine({
        type: "trail",
        color: '#34E4F2',
        speed: item.speed,
        opacity: 0.8,
        percent: 0.9,
        width: 8,
        data: {
          coordinate: item.coords
        }
      });
      pipe.enableBloom = true;
      mapmost.BloomTarget.bloomStrength = 5;
      this.flows.push(pipe);
    })


    let pipeData1 = [
      {
        speed: 1.0,
        coords: [
          [120.72875114478248, 31.288842957773497, 0.9999894219654948], [120.72875091045807, 31.28884178647284, 3.7553505968631717], [120.72875088721702, 31.28884082527171, 4.090431245080613], [120.72875098919731, 31.288838489508176, 4.24187760093165], [120.72876151998369, 31.288548119963878, 4.243922669305454], [120.72876521320956, 31.288543844575383, 4.2463178016566125], [120.72877247792022, 31.288541927932954, 4.250075160800773], [120.72888961213425, 31.288541723431074, 4.251429061248308]
        ]
      }, {
        speed: 1.0,
        coords: [
          [120.72875668434038, 31.288846026008546, 0.9999893894207197], [120.72875609368587, 31.288842073405714, 3.6956373504040436], [120.72875619901242, 31.28884121028775, 4.082288657854024], [120.72875597582131, 31.28883870668457, 4.236841199094056], [120.72876657808055, 31.288552985722607, 4.249633697148088], [120.72876905685885, 31.28854857346823, 4.2492283397077655], [120.72877524302946, 31.288546293530096, 4.25037443831813], [120.72888987693975, 31.288546111763075, 4.2504232892938925]
        ]
      }, {
        speed: 1.0,
        coords: [
          [120.7287627019429, 31.288845682355692, 0.9999893930658481], [120.72876247752906, 31.288842495749865, 3.7763721177521683], [120.72876264045406, 31.288841438347745, 4.110178720942334], [120.72876236937617, 31.28883841304072, 4.245170650666176], [120.72877276821255, 31.288557776014077, 4.251055425589999], [120.72877514627517, 31.288554217132468, 4.243632004425798], [120.72878139090496, 31.288551243110387, 4.249521102641073], [120.72888968160493, 31.288551472471966, 4.246445701764383]
        ]
      }, {
        speed: 1.0,
        coords: [
          [120.72876768872142, 31.288845139193008, 0.9999893988271703], [120.72876693957298, 31.288842590851452, 3.635005432240413], [120.72876708517654, 31.288841613611854, 4.098226855577884], [120.72876698410494, 31.288839769887307, 4.226948541675488], [120.7287774691398, 31.288561451830255, 4.24497041617033], [120.72877993471842, 31.288557751208092, 4.244373266525445], [120.72878440729156, 31.288555779007403, 4.241658856521556], [120.72888992279155, 31.288555407267072, 4.245577491051557]
        ]
      }, {
        speed: 1.0,
        coords: [
          [120.7287721328338, 31.28884487884926, 0.9999894015886406], [120.72877299597906, 31.288842268819554, 3.9641371059742427], [120.72877315160332, 31.288841061512063, 4.153819323984908], [120.72877313099389, 31.28883774094547, 4.251853389843245], [120.72878256653605, 31.28856529025453, 4.241794753128405], [120.72878506020231, 31.288562408083564, 4.245615802393041], [120.72879038554414, 31.288560779840246, 4.242145799188263], [120.72888946734749, 31.288560502738516, 4.248335452559745]
        ]
      }, {
        speed: 1.0,
        coords: [
          [120.72877854303484, 31.28884537122984, 0.9999893963659607], [120.72877785982394, 31.288842303063493, 3.956324895008575], [120.72877786066013, 31.288840740205483, 4.174443777494518], [120.72877784023777, 31.288838418827524, 4.246481779973611], [120.72878777035, 31.2885688067222, 4.244000839364259], [120.72879088833415, 31.288565957599662, 4.247701032364186], [120.72879452589113, 31.28856496794287, 4.246592705220709], [120.72889023604667, 31.288564921478454, 4.245468095119562]
        ]
      }
    ]
    // 管道流动
    pipeData1.forEach((item, i) => {
      let pipe = this._layer.addFlowLine({
        type: "trail",
        color: '#3FF091',
        speed: item.speed,
        opacity: 0.8,
        percent: 0.9,
        width: 6,
        data: {
          coordinate: item.coords
        }
      });
      pipe.enableBloom = true;
      mapmost.BloomTarget.bloomStrength = 5;
      this.flows.push(pipe);
    })

    let pipeData2 = [
      {
        speed: 1.5,
        coords: [
          [120.7301909531993, 31.28895601382018, 0.9999882227778897], [120.73019095797673, 31.28894887364911, 8.339056392385748], [120.7301908886345, 31.28894820935276, 8.820386122649253], [120.73019132106928, 31.288943754500373, 9.225783433050905], [120.73019080618866, 31.28880999669234, 9.2344460095493], [120.73019108585757, 31.28880521993273, 8.915460688173557], [120.73019106499885, 31.288804533263136, 8.403791791833438], [120.73019078097357, 31.28880438781991, 6.320053547928708], [120.73019082603543, 31.288800850184405, 6.307074454873634], [120.73019696329943, 31.288365944704037, 6.308216600637727], [120.73019691707384, 31.288365418631845, 8.487758481119524], [120.73019683454953, 31.28836489268924, 8.861815261243947], [120.73019706561303, 31.288361968471847, 9.23678749394859], [120.73019742470197, 31.288308533703223, 9.235338148067127], [120.73019753123413, 31.288306164260618, 8.995052710559763], [120.7301979461118, 31.288305309780302, 8.406943231589953], [120.73019742926087, 31.288304657259385, 6.3078194678550465], [120.73020212434605, 31.28784873439089, 6.307749490529917], [120.73020233060684, 31.28784790757372, 8.45425404136987], [120.73020221821741, 31.287846897583798, 9.037251399572899], [120.73020225658554, 31.287844835792406, 9.235939689013753], [120.73020243083965, 31.28779283536328, 9.228568630270988], [120.73020262567196, 31.28778972259243, 9.220357318955338], [120.73020287027248, 31.287787578250377, 8.579855030406943], [120.73020224817145, 31.287787214576035, 6.294249607742811], [120.73020758788385, 31.28732986298976, 6.300574872839445], [120.73020717818343, 31.28732952346448, 8.408326143350402], [120.73020718943087, 31.28732882427322, 8.921954693239758], [120.73020727991928, 31.28732546138492, 9.231892592909707], [120.73020742411802, 31.287272734047786, 9.219052399144712], [120.73020816182098, 31.287270611117457, 8.873218014000807], [120.73020788607634, 31.287270013229588, 8.421973751089288], [120.73020729882707, 31.28726951675454, 6.285589841100257], [120.73021232006661, 31.286782054703618, 6.293686693484457], [120.73021242396268, 31.28677983226704, 6.0969475787487], [120.73021256839809, 31.28677878593012, 5.433174341280456], [120.73021276934054, 31.286772000824932, 1.0000113879557533]
        ]
      },
      {
        speed: 1.5,
        coords: [
          [120.73020198076958, 31.28895362794731, 0.9999882480849263], [120.73020088594083, 31.28894873883779, 8.449888201924923], [120.73020144026775, 31.288947968820615, 8.896506441090729], [120.73020199711792, 31.288945649527548, 9.164027155193569], [120.73020143059253, 31.288807259887196, 9.226123340746666], [120.73020141644788, 31.288805125039534, 8.899696687800851], [120.73020102476572, 31.288804452232732, 8.31557456438239], [120.73020107125086, 31.28880403105088, 6.304872575192353], [120.73020705767347, 31.28836581323525, 6.296751215940454], [120.73020728413582, 31.28836536709373, 8.512401825731677], [120.73020725875885, 31.288364868696, 8.857863510363197], [120.73020742616774, 31.288362662697956, 9.235530080659878], [120.73020755913421, 31.28830885447832, 9.225861898574003], [120.73020710558868, 31.28830605866666, 8.931924717719117], [120.73020693403737, 31.288305346507823, 8.474377152883807], [120.7302076323989, 31.28830474471227, 6.301517959804047], [120.73021251431817, 31.287848248036347, 6.310010281228376], [120.73021263411708, 31.287847794193254, 8.559410920498966], [120.73021229584519, 31.287847159018064, 8.920355245086327], [120.73021260080445, 31.28784530308232, 9.230964064927075], [120.73021292167549, 31.287790069684835, 9.233802742566752], [120.7302118312114, 31.287788013214662, 8.807888804599646], [120.73021232249528, 31.287787487098836, 8.417523203199963], [120.73021273066512, 31.28778682503905, 6.298303950950956], [120.73021721820221, 31.287329549086213, 6.314010743513106], [120.73021754241904, 31.287329370745336, 8.579442209950606], [120.73021749325193, 31.287328676983005, 8.953513964046154], [120.7302176735052, 31.287327151117495, 9.221578572759414], [120.73021771439052, 31.287273550918957, 9.217136279789116], [120.73021772537187, 31.287271008624554, 9.01547974676161], [120.7302177732623, 31.28727006368896, 8.52502946601889], [120.73021819984905, 31.28726971058373, 6.3117115206568695], [120.73022315378495, 31.28678256684503, 6.305149905452994], [120.73022247453744, 31.28678007010673, 6.1419836457419485], [120.73022263353808, 31.28677896760165, 5.712587155586579], [120.73022443987487, 31.286773988268568, 1.0000113668761907]
        ]
      },
      {
        speed: 1.5,
        coords: [
          [120.73022083611315, 31.28779115782007, 9.204650905046787], [120.73022107858671, 31.287788521699586, 9.038719323510444], [120.73022219066912, 31.2877875539145, 8.579452889762498], [120.73022190655072, 31.28778736175707, 6.370332809605786], [120.73022621152067, 31.287329637805776, 6.31404896677819], [120.73022613718045, 31.287329476949274, 8.20559997359358], [120.73022589873636, 31.287328674609572, 8.930658425574364], [120.73022609587089, 31.287326315558147, 9.22831045078227], [120.73022639678582, 31.28727319628047, 9.222749875098671], [120.73022723810654, 31.287271061248664, 9.031170573608359], [120.73022716651725, 31.28726998955832, 8.448141414113364], [120.73022684983899, 31.287269903192293, 6.442756416516747], [120.73023106703103, 31.286785680782586, 6.288232534947408], [120.73023095852537, 31.286780173957133, 6.168187437357223], [120.73023177854778, 31.286778874599403, 5.69665261922877], [120.7302303302496, 31.286769043723247, 1.0000114193198684]
        ]
      }
      , {
        speed: 1.5,
        coords: [
          [120.73021943267202, 31.288954296647077, 0.9999882409920062], [120.73021765808625, 31.28894857584454, 8.483540093527079], [120.73021840476868, 31.288947476396352, 8.974690367494073], [120.73021791119255, 31.288942984125704, 9.208344246535104], [120.73021832509924, 31.28880814112707, 9.236610849864359], [120.73021736512786, 31.288805132071534, 8.8815298238551], [120.73021778851128, 31.288804423464562, 8.260494034241416], [120.73021811802442, 31.288803832279445, 6.301229993806489], [120.73022411278362, 31.288366282893254, 6.29393371952597], [120.73022441826679, 31.288365239907673, 8.560919979607656], [120.73022432818321, 31.288364343029595, 9.013190449797362], [120.73022439420636, 31.288361737006447, 9.23087377550545], [120.7302250468607, 31.288307917400882, 9.231500306072812], [120.73022477298571, 31.288305929319378, 8.949908837210588], [120.73022485244766, 31.28830534144461, 8.668560208938992], [120.73022499837852, 31.288304913491434, 6.312168173845513], [120.7302297332215, 31.287848568103172, 6.30758556318172], [120.7302293370515, 31.287847649454406, 8.586974280611813], [120.73022995002316, 31.287846899608816, 8.981463218390859], [120.730229560142, 31.28784377487773, 9.230470291957559], [120.7302303461736, 31.28779078693994, 9.225445000126841], [120.73023028813701, 31.287789036473022, 9.15633138117551], [120.73022971081451, 31.287787518430175, 8.613647308214672], [120.73023002990986, 31.28778671812117, 6.306652284490235], [120.73023473901807, 31.28732983870134, 6.307819580491224], [120.73023503223453, 31.287329222498155, 8.641016304321866], [120.73023458570776, 31.287328085560972, 9.086767868009295], [120.73023477416184, 31.28732574240013, 9.233650239478374], [120.73023529864135, 31.28727284730225, 9.235459727251268], [120.73023467546876, 31.287270885902775, 8.989206656939558], [120.7302350320569, 31.28726988391167, 8.272199443870441], [120.73023517061763, 31.287269175140043, 6.304985799600013], [120.73024000498584, 31.28678195042328, 6.304336942463009], [120.7302400575838, 31.286779786935483, 6.123217286101419], [120.73024048122377, 31.28677890557231, 5.743283966140951], [120.7302398780978, 31.28676814344895, 1.0000114288685125]
        ]
      }, {
        speed: 1.5,
        coords: [
          [120.7302280511674, 31.288955004752236, 0.9999882334811093], [120.73022692509693, 31.288948610655076, 8.513170712553931], [120.73022664840207, 31.288947802724646, 8.885822117674977], [120.73022716809923, 31.288943469284156, 9.23374514143037], [120.73022650237587, 31.28880760352626, 9.219737023686895], [120.73022646476265, 31.288805294208732, 8.983027690430257], [120.73022666005252, 31.28880450006392, 8.594908036939453], [120.73022694845565, 31.28880375152259, 6.308253905134428], [120.73023221490365, 31.28836531773134, 6.299641673613219], [120.73023261816957, 31.28836521284932, 8.478268733542803], [120.73023263367679, 31.288364668903657, 8.874011493830235], [120.73023287889164, 31.288361655217667, 9.227228381844421], [120.7302336029625, 31.288309333586795, 9.231257331276925], [120.73023369615186, 31.2883064047161, 9.085791653848936], [120.73023377790783, 31.28830522268926, 8.570391417075754], [120.73023354707344, 31.28830374230978, 6.310034522764329], [120.73023760302067, 31.287848091856176, 6.281810182553554], [120.73023831200307, 31.287847796769963, 8.279677209786895], [120.73023782186553, 31.28784743316007, 8.72509536196441], [120.73023821582643, 31.28784513815303, 9.232808754044838], [120.7302384641784, 31.287790151598266, 9.228249663423943], [120.73023817586324, 31.287788148862393, 8.951358141944652], [120.73023865790265, 31.28778727861065, 8.406909712785396], [120.73023877101552, 31.287786181368674, 6.30737834515566], [120.73024290522488, 31.287329825166196, 6.289110740810011], [120.73024299824795, 31.287328955942613, 8.771891997612089], [120.73024301931437, 31.28732819197162, 9.048711353212704], [120.7302430687168, 31.287326466126064, 9.221288378095615], [120.7302438899867, 31.2872731499304, 9.234019245255725], [120.73024402970164, 31.2872713242571, 9.121220990829272], [120.73024356992491, 31.287269976631986, 8.567496314060865], [120.73024404329075, 31.287269519753423, 6.302807774868819], [120.73024913649219, 31.286782693012903, 6.291925044057571], [120.73024871852117, 31.286779243203352, 5.972249414994713], [120.7302485628561, 31.286778614854445, 5.197653750777559], [120.73025129661299, 31.286775052472088, 1.000011355588855]
        ]
      }, {
        speed: 1.5,
        coords: [
          [120.7302362284844, 31.288954335851713, 0.999988240576163], [120.73023569165036, 31.288948525699634, 8.57864495751876], [120.73023563593333, 31.288947795394435, 8.903337090755466], [120.730235648815, 31.28894379268082, 9.235980804509992], [120.73023531996765, 31.28880697768597, 9.230160635228664], [120.73023514727474, 31.28880521551962, 8.977287293228596], [120.73023541378565, 31.288804312933316, 8.41895623050783], [120.73023541669023, 31.28880372220579, 6.309458606899858], [120.73024085862198, 31.288365726927207, 6.275931735646862], [120.7302411417541, 31.288365223457028, 8.252014326843684], [120.73024133034188, 31.288364440610135, 8.946646790913162], [120.73024174497164, 31.288360007612813, 9.233120927748619], [120.73024209477559, 31.288308453119697, 9.234599091765018], [120.73024220167491, 31.288305837931027, 8.947413754014423], [120.73024148166122, 31.288305097813126, 8.238339110695197], [120.73024220680533, 31.28830458081679, 6.305308384342464], [120.73024660080131, 31.28784829676555, 6.302583140779302], [120.73024687156784, 31.287847525637574, 8.667252413572124], [120.73024700348006, 31.287847070655843, 8.902906669339751], [120.73024694754885, 31.287844461920898, 9.231252760332165], [120.73024727606762, 31.287790059910915, 9.234142946925047], [120.73024704071777, 31.287788162509365, 8.988569568161198], [120.7302471176944, 31.287787293938177, 8.514392987296153], [120.73024715950449, 31.28778656822776, 6.306936985345536], [120.73025211477741, 31.287329535955358, 6.307285860595657], [120.73025172313031, 31.28732916527214, 8.618731022602327], [120.7302519937624, 31.287328367369696, 9.017063053332453], [120.73025179218169, 31.287325756988217, 9.228717663990501], [120.73025206630867, 31.28727338497441, 9.222171176124563], [120.73025183903023, 31.28727043288103, 8.86463472580462], [120.73025170358422, 31.28726989270939, 8.391270392753055], [120.73025248801234, 31.28726915357843, 6.308080394039941], [120.73025719149094, 31.28678224806292, 6.3075315486861045], [120.73025680588168, 31.28677947241692, 6.031504931603267], [120.73025753750728, 31.28677870983927, 5.639503964181392], [120.73025787164696, 31.286769076518404, 1.000011418972033]
        ]
      }
    ]
    // 管道流动
    pipeData2.forEach((item, i) => {
      let pipe = this._layer.addFlowLine({
        type: "trail",
        color: '#036AFF',
        speed: item.speed,
        opacity: 0.8,
        percent: 0.9,
        width: 6,
        data: {
          coordinate: item.coords
        }
      });
      pipe.enableBloom = true;
      mapmost.BloomTarget.bloomStrength = 5;
      this.flows.push(pipe);
    })
  }
  // 移除管道效果
  removePipe() {
    if (this.flows.length > 0) { //管道
      this.flows.forEach(e => {
        this._layer.removeModel(e);
      })
      this.flows = [];
    }
  }
  removeVideo() {
    if (this.cameraVideo || this.videoMarkers.length > 0) {//监控
      this.cameraVideo.remove();
      this.cameraVideo = null;
      this.videoMarkers.forEach(e => {
        e.remove();
        e = null
      })
      this.videoMarkers = [];
    }
  }
  fly(location) {
    this._map.flyTo({
      ...location,
    });
  }

  createDeviceDom(id, imageUrl = "./assets/images/device.png", w = "50px", h = "70px") {
    let container = document.createElement('div');
    container.setAttribute('id', id);
    container.className = "markerDevice";
    container.style.width = w;
    container.style.height = h;
    container.style.backgroundImage = "url(" + imageUrl + ")";
    container.style.backgroundRepeat = "no-repeat";
    container.style.backgroundSize = "100% 100%";
    container.style.margin = "0px";
    container.style.backgroundPosition = "center 0";
    return container;
  }

  getUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // 改变相机视角
  changeViewers(locations) {
    let count = 0;
    this.changeViewer(locations[count]);
    let that = this;
    let moveFunc = function () {
      if (count === locations.length - 1) {
        that._map.off('moveend', moveFunc);
        return
      }
      that.changeViewer(locations[count++])
    };
    if (count < locations.length - 1) {
      that._map.on('moveend', moveFunc);
    }
  }
  changeViewer(location) {
    this._map.flyTo({
      ...location,
    });
  }
}

export default MapApi;
