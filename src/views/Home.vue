<template>
  <div class="home" v-loading="bigLoading">
    <div class="mui-content section">
      <div class="inner-content mui-flex">
        <ul class="currency-list">
          <li v-for="(i, index) of currencyList" :key="index" :class="{ 'eth': index === 1, active: index === activeIndex }" @click="switchCurrency(index)">
            <div class="mui-fl-vert">
              <img :src="i.icon" alt="">
              <div>
                <p class="symbol">{{ i.symbol }}</p>
                <p class="price">${{ i.price }}</p>
              </div>
            </div>
            <!-- <p :class="{'change': 1, 'green': i.changeP > 0, 'red': i.changeP < 0}">{{ i.changeP > 0 ? '+' + i.changeP : i.changeP }}%</p> -->
          </li>
        </ul>

        <div class="echars">
          <div class="currency-info">
            <div class="mui-fl-vert c1">
              <img :src="activeCurrency.icon">
              <span>{{ activeCurrency.symbol }}</span>
            </div>

            <div class="mui-fl-vert c2">
              <p class="p">${{ activeCurrency.price }}</p>
              <!-- <ul class="mui-fl-vert">
                <li>
                  <p>Change</p>
                  <p :class="{'green': activeCurrency.change >= 0, 'red': activeCurrency.change < 0}">
                    {{ activeCurrency.change > 0 ? '+' : '' }}{{ activeCurrency.change }}
                  </p>
                </li>
                <li>
                  <p>Change( %)</p>
                  <p :class="{'green': activeCurrency.change >= 0, 'red': activeCurrency.change < 0}">
                    {{ activeCurrency.changeP > 0 ? '+' : '' }}{{ activeCurrency.changeP }} %
                  </p>
                </li>
                <li>
                  <p>24H High</p>
                  <p>${{ activeCurrency.high }}</p>
                </li>
                <li>
                  <p>24H Low</p>
                  <p>${{ activeCurrency.low }}</p>
                </li>
              </ul> -->
            </div>

            <ul class="time-type mui-fl-vert">
              <li v-for="(i, index) of timeType" :key="index" :class="{'taplight2': 1, 'active': timeTypeActive === i}" @click="switchTimeType(i)">{{ i }}</li>
            </ul>
          </div>
          <div v-loading="loading" id="main" style="width: 675px;height:290px;"></div>
          <!-- <div v-loading="loading" ref="ndTV"></div> -->
        </div>

        <div class="market">
          <p class="t1">Market</p>
          <ul class="sell-btn mui-fl-vert">
            <li :class="{'mui-fl-col mui-fl-central mui-fl-1 red': 1, 'active': form.type === 'SELL'}" @click="form.type = 'SELL'">
              <p class="s1">SELL</p>
              <p class="s2">{{ activeCurrency.sellPrice }}</p>
            </li>
            <p class="spread mui-fl-shr-0 mui-fl-central">{{activeCurrency.symbol === 'BTC-USD' ? 50 : 5}}</p>
            <li :class="{'mui-fl-col mui-fl-central mui-fl-1 green' : 1, 'active': form.type === 'BUY'}" @click="form.type = 'BUY'">
              <p class="s1">BUY</p>
              <p class="s2">{{ activeCurrency.buyPrice }}</p>
            </li>
          </ul>
          <m-form class="sty1-form">
            <m-form-item prop="orderSize">
              <div class="mui-fl-vert mui-fl-btw">
                <p>Size</p>
                <m-input-number class="sty1-input-number" :min="0.01" :step="0.01" v-model="form.orderSize" controls-position="right" @blur="handleBlurSize"></m-input-number>
              </div>
            </m-form-item>
            <m-form-item>
              <div class="mui-fl-vert mui-fl-btw">
                <p>Leverage</p>
                <m-input-number class="sty1-input-number" :min="1" :max="125" :step="1"  v-model="form.leverage" controls-position="right" placeholder="1-125X"></m-input-number>
              </div>
            </m-form-item>
          </m-form>
          <m-slider v-model="form.leverage" :marks="marks" :max="125" class="sty1-slider"></m-slider>
          <ul class="info">
            <li class="mui-fl-vert mui-fl-btw">
              <p>Available</p>
              <p>${{ available | subRadio}}</p>
            </li>
            <li class="mui-fl-vert mui-fl-btw">
              <p>Margin</p>
              <p>${{ (userInfo?.account.margin_total || 0) | subRadio }}</p>
            </li>
            <li class="mui-fl-vert mui-fl-btw">
              <p>Gas Fee</p>
              <p class="grey">0.00005 SOL</p>
            </li>
          </ul>
          <m-button class="sty4-btn" round @click="placeOrder" :loading='placeOrderLoading' :disabled="form.type === '' && pubKey !== ''">{{ pubKey === '' ? 'Connect Wallet' : 'Place Order' }}</m-button>
        </div>
      </div>
    </div>

    <positions></positions>

    <!-- <m-dialog
      title="Close Position"
      :visible.sync="dialogVisible"
      custom-class="sty1-dialog"
      width="386px"
      :before-close="handleClose">
      <template>
        <div class="mui-fl-vert mui-fl-btw wallet-info">
          <p>Wallet</p>
          <p class="pubkey mui-fl-vert taplight2">
            AY4G...YqLQ
            <img src="~@/assets/img/arrow-right.png" alt="">
          </p>
        </div>
        <div class="sty2-gp">
          <m-input class="mui-fl-1 sty1-input" placeholder="USDC"></m-input>
        </div>
        <p class="sty1-tip">
          Your maigin: $45643.47
        </p>
      </template>
      <span slot="footer" class="mui-fl-central">
        <m-button class="sty5-btn grey" round @click="dialogVisible = false">Cancel</m-button>
        <m-button type="primary" class="sty5-btn black" round @click="dialogVisible = false">Close</m-button>
      </span>
    </m-dialog> -->

    <m-dialog
      :visible.sync="dialogVisible"
      custom-class="sty1-dialog"
      width="386px"
      :show-close="false"
      :before-close="handleClose">
      <template>
        <!-- <div class="mui-fl-vert mui-fl-btw wallet-info">
          <p>Wallet</p>
          <p class="pubkey mui-fl-vert taplight2">
            AY4G...YqLQ
            <img src="~@/assets/img/arrow-right.png" alt="">
          </p>
        </div> -->
        <!-- <div class="sty2-gp">
          <m-input class="mui-fl-1 sty1-input" placeholder="USDC"></m-input>
        </div>
        <p class="sty1-tip">
          Your maigin: $45643.47
        </p> -->
      </template>
      <span slot="footer" class="mui-fl-central">
        <m-button class="sty5-btn grey" round @click="dialogVisible = false">Cancel</m-button>
        <m-button type="primary" class="sty5-btn black" round @click="dialogVisible = false">Close</m-button>
      </span>
    </m-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as tv from 'lightweight-charts'
import axios from 'axios'
import * as echarts from 'echarts'
import mixin from '@/utils/mixin'
import tradePair from '@/utils/trade-pair'
import Positions from './Positions.vue'
import BigNumber from 'bignumber.js'

let chart = null
let candleSeries = null

export default {
  name: 'Home',
  mixins: [mixin],
  components: {
    Positions
  },
  data () {
    return {
      bigLoading: false,
      loading: false,
      account: '',
      RP: null,
      activeIndex: 0,
      currencyList: tradePair,
      timeTypeActive: '1D',
      timeType: ['1D', '1W', '1M'],

      form: {
        type: '',
        orderSize: '0.01',
        leverage: 1
      },

      marks: {
        1: '1X',
        25: '25X',
        50: '50X',
        75: '75X',
        100: '100X',
        125: '125X'
      },

      dialogVisible: false,
      placeOrderLoading: false
      // dialogVisible: true
    }
  },
  computed: {
    ...mapState(['endpoint', 'userInfo']),
    activeCurrency () {
      return this.currencyList[this.activeIndex]
    },
    currencyInfo () {
      return this.$store.state.currencyInfo || {}
    },
    pubKey () {
      return this.$store.state.pubKey
    },
    available () {
      return new BigNumber(this.userInfo?.account?.margin_total || 0).minus(new BigNumber(this.userInfo?.dynamic_data?.equity || 0))
    }
  },
  watch: {
    'currencyInfo' (n) {
      if (n) {
        this.bigLoading = false
      }
      this.currencyList.forEach(v => {
        if (n && n.product && v.symbolOrigin === n.product.symbol) {
          v.price = n.price.price.toFixed(2)
          v.sellPrice = (n.price.price - (v.symbol === 'ETH-USD' ? 10 : 50)).toFixed(2)
          v.buyPrice = (n.price.price + (v.symbol === 'ETH-USD' ? 10 : 50)).toFixed(2)
        }
      })
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    switchCurrency (idx) {
      this.activeIndex = idx
      this.timeTypeActive = '1D'
      this.fetchData()
    },
    async fetchData () {
      this.loading = true
      const rp = await axios.get(`https://web-api.pyth.network/history?symbol=${this.activeCurrency.symbolOrigin}&range=${this.timeTypeActive}&cluster=${this.endpoint}`)
      this.loading = false
      if (rp.status === 200) {
        rp.data.forEach(v => {
          v.value = v.avg_price
        })
        this.RP = rp.data
      }
      this.getEcharts()
    },
    getEcharts () {
      var myChart = echarts.init(document.getElementById('main'))
      myChart.setOption({
        grid: {
          left: '0',
          right: '120'
        },
        xAxis: {
          show: false,
          type: 'category',
          boundaryGap: false,
          data: this.RP.map(v => v.timestamp)
        },
        yAxis: {
          type: 'value',
          position: 'right',
          axisLabel: {
            color: 'rgba(0, 0, 0, 0.45)',
            padding: [0, 0, 0, 48]
          },
          splitLine: {
            show: false
          },
          scale: true
        },
        series: [
          {
            data: this.RP.map(v => v.avg_price),
            type: 'line',
            itemStyle: {
              opacity: 0
            },
            lineStyle: {
              color: '#69D2F5',
              width: 1.5
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(105, 210, 245, 0.16)' // 0% 处的颜色
                }, {
                  offset: 1, color: 'rgba(105, 210, 245, 0)' // 0% 处的颜色
                }],
                global: false // 缺省为 false
              }
            }
          }
        ]
      })
    },
    setChartData () {
      if (chart) {
        candleSeries.setData(this.RP)
        candleSeries.applyOptions({
          priceFormat: {
            minMove: 0.1,
            precision: 0.1
          }
        })
      }
      const nd = this.$refs.ndTV
      chart = tv.createChart(nd, {
        width: 700,
        height: 300,
        layout: {
          fontFamily: 'Nunito',
          backgroundColor: '#FFFFFF',
          textColor: 'rgba(0, 0, 0, 0.45)'
        },
        rightPriceScale: {
          borderColor: '#fff'
        },
        timeScale: {
          borderColor: '#fff'
        },
        grid: {
          vertLines: {
            color: '#1F2533',
            style: tv.LineStyle.Dashed,
            visible: false
          },
          horzLines: {
            color: '#1F2533',
            style: tv.LineStyle.Dashed,
            visible: false
          }
        }
      })
      candleSeries = chart.addAreaSeries({
        topColor: 'rgba(105, 210, 245, 0.16)',
        bottomColor: 'rgba(105, 210, 245, 0)',
        lineColor: '#69D2F5',
        lineWidth: 2
      })
      candleSeries.setData(this.RP)
    },
    switchTimeType (i) {
      this.timeTypeActive = i
      this.fetchData()
    },
    async placeOrder () {
      if (!this.pubKey) {
        this.$store.commit('SET_CONNECTDIALOGVISIBLE', true)
      } else {
        this.placeOrderLoading = true
        const aa = await this.openPosition(this.activeCurrency.pair, this.form.orderSize, this.form.leverage, 1, this.form.type === 'SELL' ? 2 : 1)
        if (aa) {
          this.$message.success('Success!')
        }
        this.placeOrderLoading = false
      }
    },
    handleClose () {},
    // 失焦判断用户是否输入size，如果没有默认为0.01
    handleBlurSize () {
      this.form.orderSize = this.form.orderSize === undefined ? '0.01' : this.form.orderSize
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/_home.scss" scoped></style>
