# 简介
本项目是基于 Mapmost SDK for WebGL 实现的一个数字孪生智慧化工厂案例，旨在助力厂区智能监控与安全管理。

![Static Badge](https://img.shields.io/badge/Author-Mapmost-blue)
![Static Badge](https://img.shields.io/badge/%40mapmost%2Fmapmost--webgl-9.2.0-green)
![Static Badge](https://img.shields.io/badge/Language-vue/javascript-green)
![Static Badge](https://img.shields.io/badge/License-MIT-rgb(245%2C%20128%2C%2066))



### 项目运行

> 运行前请确保已经安装以下环境
- node.js (http://www.nodejs.com.cn/)

    #### 安装
    ```
    npm install
    ```

    #### 修改授权码

    > 运行前请确保已经免费获取SDK授权码
    - [☞点击免费申请](https://www.mapmost.com/#/productApply/webgl/?source_inviter=nqLdqFJp)
    - 在`src\components\Map.vue`文件中找到如下代码，将`userId`替换为您获取的授权码。
        
        ```js
        // 地图初始化
        let map = new mapmost.Map({
            container: 'map-container',
            name: 'ditu',
            style: style_opacity,
            doubleClickZoom: false,
            center: [120.7290563605585, 31.288141509716326],
            zoom: 18.542327120640703,
            sky: 'light', 
            pitch: 62.478852920710885,
            bearing: 90.88015604663417,
            userId: "***", // 请输入您获取的授权码
            env3D: {
            defaultLights: false,
            envMap: './assets/data/yun(13).hdr',
            exposure: 2.53,
            },
        });
        ```

    #### 运行
    ```
    npm run dev
    ```

### 核心依赖

- Mapmost SDK for WebGL [https://www.mapmost.com/mapmost_docs/webgl/latest/](https://www.mapmost.com/mapmost_docs/webgl/latest/?source_inviter=nqLdqFJp)


### 更多参考
Mapmost  [https://www.mapmost.com/#/](https://www.mapmost.com/#/?source_inviter=nqLdqFJp).