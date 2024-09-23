<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  $(function () {
  var demo = document.getElementById("demo");
  var demo1 = document.getElementById("demo1");
  var demo2 = document.getElementById("demo2");
  var speed = 15; //滚动速度值，值越大速度越慢
  demo2.innerHTML = demo1.innerHTML //克隆demo2为demo1
  function Marquee() {
    if (demo2.offsetTop - demo.scrollTop <= 45) {
      demo.scrollTop -= demo1.offsetHeight //demo跳到最顶端
    } else {
      demo.scrollTop++
    }
  }
  var MyMar = setInterval(Marquee, speed); //设置定时器
  demo.onmouseover = function () {
    clearInterval(MyMar)
  } //鼠标经过时清除定时器达到滚动停止的目的
  demo.onmouseout = function () {
    MyMar = setInterval(Marquee, speed)
  } //鼠标移开时重设定时器


    function apiFn() {
      this.hostname = ""
    }
    apiFn.prototype = {
      Init: function () {
        this.accidentInfo()
        this.workshopInfo()
        this.outputInfo()
        this.soldInfo()
        setInterval(function () {
          numInit()
        }, 6000)
      },
      accidentInfo: function () {
        var accidentChart = echarts.init(document.getElementById('accidentId'));
        var charts = [
          { name: "火灾事故", num: 5 },
          { name: "泄漏事故", num: 8 },
          { name: "运输事故", num: 16 },
          { name: "设备故障", num: 24 },
          { name: "操作失误", num: 12 },
          { name: "自然灾害", num: 3 },
        ]
        var color = ['rgba(100,255,249', 'rgba(100,255,249', 'rgba(100,255,249', 'rgba(100,255,249', 'rgba(100,255,249']

        let lineY = []
        for (var i = 0; i < charts.length; i++) {
          var x = i
          if (x > color.length - 1) {
            x = color.length - 1
          }
          var data = {
            name: charts[i].name,
            color: color[x] + ')',
            value: charts[i].num,
            itemStyle: {
              normal: {
                show: true,
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                  offset: 0,
                  color: color[x] + ', 0.3)'
                }, {
                  offset: 1,
                  color: color[x] + ', 1)'
                }], false),
                barBorderRadius: 10
              },
              emphasis: {
                shadowBlur: 15,
                shadowColor: 'rgba(0, 0, 0, 0.1)'
              }
            }
          }
          lineY.push(data)
        }
        var option = {
          title: {
            show: false
          },
          grid: {
            // borderWidth: 1,
            top: '10%',
            left: '30%',
            right: '20%',
            bottom: '3%'
          },
          color: color,
          yAxis: [{
            type: 'category',
            inverse: true,
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false,
              inside: false
            },
            data: charts.name
          }, {
            type: 'category',
            inverse: true,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              inside: false,
              textStyle: {
                color: '#38E1E1',
                fontSize: '12',
              },
              formatter: function (val, index) {
                return `${charts[index].num}`
              }
            },
            splitArea: {
              show: false
            },
            splitLine: {
              show: false
            },
            data: charts
          }],
          xAxis: {
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            }
          },
          series: [{
            name: '',
            type: 'bar',
            zlevel: 2,
            barWidth: '5px',
            data: lineY,
            animationDuration: 1500,
            label: {
              normal: {
                color: 'white',
                show: true,
                position: [-65, -2],
                textStyle: {
                  fontSize: 12
                },
                formatter: function (a, b) {
                  return a.name
                }
              }
            }
          }],
          animationEasing: 'cubicOut'
        }
        accidentChart.setOption(option)
        setInterval(function () {
          accidentChart.clear()
          accidentChart.setOption(option)
        }, 6000)
      },
      workshopInfo: function () {
        var resArr = [
          { name: '原料车间', value: 300 },
          { name: '反应车间', value: 500 },
          { name: '分离车间', value: 400 },
          { name: '包装车间', value: 350 },
          { name: '储备车间', value: 363 },
          { name: '维修车间', value: 800 },
        ]
        var indicatorArr = []
        var numArr = []
        for (var i = 0; i < resArr.length; i++) {
          indicatorArr.push({ name: resArr[i].name, max: 900 })
          numArr.push(resArr[i].value)
        }
        var data = [
          {
            value: numArr,
          }
        ]
        var workshopChart = echarts.init(document.getElementById('workshopId'));
        var option = {
          legend: {
            show: true,
            icon: "circle",
            bottom: 30,
            center: 0,
            itemWidth: 14,
            itemHeight: 14,
            itemGap: 21,
            orient: "horizontal",
            data: ['a', 'b'],
            textStyle: {
              fontSize: '70%',
              color: '#0EFCFF'
            },
          },

          radar: {
            radius: '70%',
            triggerEvent: true,
            name: {
              textStyle: {
                color: '#38E1E1',
                fontSize: '10',
                padding: [10, 10]
              }
            },
            nameGap: '2',
            indicator: indicatorArr,
            splitArea: {
              areaStyle: {
                color: 'rgba(255,255,255,0)'
              }
            },
            axisLine: { //指向外圈文本的分隔线样式
              lineStyle: {
                color: 'rgba(255,255,255,.2)'
              }
            },
            splitLine: {
              lineStyle: {
                width: 1,
                color: 'rgba(255,255,255,.2)'
              }
            },

          },
          series: [{
            name: 'XXX区域占比',
            type: 'radar',
            animationDuration: 2000,
            areaStyle: {
              normal: {
                color: {
                  type: 'linear',
                  opacity: 1,
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  color: '#2EEFAD'
                }
              }
            },
            symbolSize: 0,
            lineStyle: {
              normal: {
                // color: 'rgba(252,211,3, 1)',
                width: 0
              }
            },
            data: data
          }]
        };
        workshopChart.setOption(option)
        setInterval(function () {
          workshopChart.clear()
          workshopChart.setOption(option)
        }, 8000)
      },
      outputInfo: function () {
        var outputChart = echarts.init(document.getElementById('output'));

        function fontSize(res) {
          let clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
          if (!clientWidth) return;
          let fontSize = 100 * (clientWidth / 1920);
          return res * fontSize;
        };

        var xData = ['2019', '2020', '2021', '2022', '2023'];
        var data1 = [50, 150, 180, 135, 95];
        var data5 = [];

        for (let i = 0; i < data1.length; i++) {
          data5.push(data1[i]);
        }

        let option = {
          tooltip: {
            trigger: 'axis',
            borderColor: 'rgba(255,255,255,.3)',
            backgroundColor: 'rgba(13,5,30,.6)',
            textStyle: {
              color: 'white', //设置文字颜色
            },
            borderWidth: 1,
            // padding: fontSize(0.05),
            formatter: function (parms) {
              var str =
                '年份：' +
                parms[0].axisValue +
                '</br>' +
                parms[0].marker +
                '产量：' +
                parms[0].value;
              return str;
            },
          },
          textStyle: {
            color: '#C9C9C9',
          },
          grid: {
            containLabel: true,
            left: '2%',
            top: '15%',
            bottom: '2%',
            right: '5%',
          },
          xAxis: {
            type: 'category',
            data: xData,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#3d4c75',
              },
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              textStyle: {
                fontFamily: 'Microsoft YaHei',
                color: '#adf3e6',
              },
              fontSize: 12,
              // fontStyle: 'bold',
            },
          },
          yAxis: [{
            type: 'value',
            name: '单位：吨',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#fff',
              },
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: true,
              textStyle: {
                fontFamily: 'Microsoft YaHei',
                color: '#adf3e6',
              },
              fontSize: 12,
            },
          },],
          series: [{
            type: 'bar',
            name: '产量',
            type: 'bar',
            data: data1,
            stack: 'zs',
            barMaxWidth: 'auto',
            barWidth: fontSize(0.2),
            itemStyle: {
              color: {
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                type: 'linear',
                global: false,
                colorStops: [{
                  offset: 0,
                  color: '#00e2cf',
                },
                {
                  offset: 1,
                  color: '#0203074D',
                }
                ],
              },
            },
          },

          // 顶
          {
            data: data5,
            type: 'pictorialBar',
            barMaxWidth: '20',
            symbolPosition: 'end',
            symbol: 'diamond',
            symbolOffset: [0, '-50%'],
            symbolSize: [fontSize(0.2), fontSize(0.1)],
            zlevel: 2,
            itemStyle: {
              normal: {
                color: '#6dfff3',
              },
            },
          },

          ],
        };
        outputChart.setOption(option)
        setInterval(function () {
          outputChart.clear()
          outputChart.setOption(option)
        }, 6000)
      },
      soldInfo: function () {
        var soldChart = echarts.init(document.getElementById('sold'));
        let option = {
          legend: {
            icon: "circle",
            top: "0",
            width: '100%',
            right: 'center',
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
              color: "rgba(255,255,255,.5)"
            },
          },

          tooltip: {
            trigger: 'axis',
            axisPointer: {
              lineStyle: {
                color: '#38E1E1'
              }
            }
          },
          grid: {
            left: '0',
            top: '30',
            right: '10',
            bottom: '-15',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLine: {
              show: true,
              lineStyle: {
                color: '#fff',
              },
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: true,
              textStyle: {
                fontFamily: 'Microsoft YaHei',
                color: '#adf3e6',
              },
              fontSize: 14,
              // fontStyle: 'bold',
            },
          },
          yAxis: [{
            type: 'value',
            name: '单位：吨',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#fff',
              },
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: true,
              textStyle: {
                fontFamily: 'Microsoft YaHei',
                color: '#adf3e6',
              },
              fontSize: 13,
            },
          },],
          series: [
            {
              type: 'line',
              smooth: true,
              symbol: 'circle',
              symbolSize: 5,
              showSymbol: false,
              lineStyle: {

                normal: {
                  color: '#38E1E1',
                  width: 2
                }
              },
              areaStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(14, 252, 255, 0.4)'
                  }, {
                    offset: 0.8,
                    color: 'rgba(14, 252, 255, 0.1)'
                  }], false),
                  shadowColor: 'rgba(0, 0, 0, 0.1)',
                }
              },
              itemStyle: {
                normal: {
                  color: '#1f7eea',
                  borderColor: 'rgba(31, 174, 234, .1)',
                  borderWidth: 5
                }
              },
              data: [3, 6, 3, 6, 3, 9, 3, 6, 3, 6, 3, 6]

            }
          ]

        };
        soldChart.setOption(option)
        setInterval(function () {
          soldChart.clear()
          soldChart.setOption(option)
        }, 6000)
      }
    }
    var start = new apiFn()
    start.Init()
  })
});
</script>

<template>
  <div class="ly-bottom">

    <div class="baseBox centerMainBox2" style="height:26.5%;">
      <div class="main_bottom_bottom">
        <div class="main_bottom_b_left">
          <img src="../assets/img/main_bottom_bottom.png">
          <div class="main_bottom_b_title">事故类型分析</div>
          <div class="main_top_left_top main_top_left_bottom">
            <div id="accidentId" class="main_top_left_top_con"></div>
          </div>
        </div>
        <div class="main_bottom_b_middle1">
          <img src="../assets/img/main_bootm_middle.png">
          <div class="main_bottom_b_title">车间分布占比</div>
          <div class="main_top_left_top main_top_left_bottom">
            <div id="workshopId" class="main_top_left_top_con workshop_table">
            </div>
          </div>
        </div>
        <div class="main_bottom_b_middle2">
          <img src="../assets/img/main_bootm_middle.png">
          <div class="main_bottom_b_title">历年产量情况</div>
          <div class="main_top_left_top_con output_table" id="output"></div>
        </div>
        <div class="main_bottom_b_right">
          <img src="../assets/img/main_bottom_bottom.png">
          <div class="main_bottom_b_title">每月销量情况</div>
          <div class="main_top_left_top_con sold_table" id="sold"></div>
        </div>
        <div class="main_bottom_b_right main_bottom_b_right2">
          <img src="../assets/img/main_bottom_bottom.png">
          <div class="main_bottom_b_title">设备数据日志</div>
          <div class="data_title_box">
            <span class="data_title1">编号</span>
            <span class="data_title2">名称</span>
            <span class="data_title3">情况</span>
            <span class="data_title4">日期</span>
          </div>
          <div class="data_day" id="demo">
            <table style="text-align: left;margin-left:10%;height:80%;">
              <tbody id="demo1">

                <tr>
                  <td>u78</td>
                  <td>传感器数据</td>
                  <td style="color:#0EFCFF">正常</td>
                  <td>2024年4月26日</td>
                </tr>

                <tr>
                  <td>006</td>
                  <td>分离机数据</td>
                  <td style="color:red">异常</td>
                  <td>2024年4月25日</td>
                </tr>

                <tr>
                  <td>s07</td>
                  <td>控制器数据</td>
                  <td style="color:#0EFCFF">正常</td>
                  <td>2024年4月25日</td>
                </tr>
                <tr>
                  <td>872</td>
                  <td>监视器数据</td>
                  <td style="color:#0EFCFF">正常</td>
                  <td>2024年4月24日</td>
                </tr>
                <tr>
                  <td>d59</td>
                  <td>换热器数据</td>
                  <td style="color:#0EFCFF">正常</td>
                  <td>2024年4月23日</td>
                </tr>

                <tr>
                  <td>299</td>
                  <td>塔器数据</td>
                  <td style="color:#0EFCFF">正常</td>
                  <td>2024年4月23日</td>
                </tr>
                <tr>
                  <td>256</td>
                  <td>传感器数据</td>
                  <td style="color:#0EFCFF">正常</td>
                  <td>2024年4月22日</td>
                </tr>
                <tr>
                  <td>026</td>
                  <td>分离机数据</td>
                  <td style="color:red">异常</td>
                  <td>2024年4月20日</td>
                </tr>
                <tr>
                  <td>037</td>
                  <td>换热器数据</td>
                  <td style="color:#0EFCFF">正常</td>
                  <td>2024年4月22日</td>
                </tr>
              </tbody>
              <tbody id="demo2" style="text-align: left;margin-left:10%"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
