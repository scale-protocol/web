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
                <p class="price">{{ i.price }}</p>
              </div>
            </div>
            <p :class="{'change': 1, 'green': i.changeP > 0, 'red': i.changeP < 0}">{{ i.changeP > 0 ? '+' + i.changeP : i.changeP }}%</p>
          </li>
        </ul>

        <div class="echars">
          <div class="currency-info">
            <div class="mui-fl-vert c1">
              <img :src="activeCurrency.icon">
              <span>{{ activeCurrency.symbol }}</span>
            </div>

            <div class="mui-fl-vert c2">
              <p class="p">{{ activeCurrency.price }}</p>
              <ul class="mui-fl-vert">
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
              </ul>
            </div>
            
            <ul class="time-type mui-fl-vert">
              <li v-for="(i, index) of timeType" :key="index" :class="{'taplight2': 1, 'active': timeTypeActive === i}" @click="switchTimeType(i)">{{ i }}</li>
            </ul>
          </div>
          <div v-loading="loading" id="main" style="width: 675px;height:290px;"></div>
        </div>

        <div class="market">
          <p class="t1">Market</p>
          <ul class="sell-btn mui-fl-vert">
            <li :class="{'mui-fl-col mui-fl-central mui-fl-1 red taplight': 1, 'active': form.type === 'SELL'}" @click="form.type = 'SELL'">
              <p>SELL</p>
              <p>{{ activeCurrency.sellPrice }}</p>
            </li>
            <li :class="{'mui-fl-col mui-fl-central mui-fl-1 green taplight' : 1, 'active': form.type === 'BUY'}" @click="form.type = 'BUY'">
              <p>BUY</p>
              <p>{{ activeCurrency.buyPrice }}</p>
            </li>
          </ul>
          <m-form class="sty1-form">
            <m-form-item prop="orderSize">
              <div class="mui-fl-vert mui-fl-btw">
                <p>Size</p>
                <m-input-number class="sty1-input-number" :min="0.01" :step="0.01" v-model="form.orderSize" controls-position="right" ></m-input-number>
              </div>
            </m-form-item>
            <m-form-item>
              <div class="mui-fl-vert mui-fl-btw">
                <p>Leverage</p>
                <m-input-number class="sty1-input-number" :min="1" :max="50" :step="1"  v-model="form.leverage" controls-position="right" placeholder="1-50X"></m-input-number>
              </div>
            </m-form-item>
          </m-form>
          <ul class="progress mui-fl-vert mui-fl-btw" >
            <p v-if="form.leverage" class="active" :style="{ width: `${form.leverage / 50 * 100}%` }"></p>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
          <ul class="progress-txt mui-fl-vert mui-fl-btw">
            <li>1X</li>
            <li>12X</li>
            <li>25X</li>
            <li>37X</li>
            <li>50X</li>
          </ul>

          <ul class="info">
            <li class="mui-fl-vert mui-fl-btw">
              <p>Available</p>
              <p>$45632.48</p>
            </li>
            <li class="mui-fl-vert mui-fl-btw">
              <p>Margin</p>
              <p>$60000</p>
            </li>
            <li class="mui-fl-vert mui-fl-btw">
              <p>Gas Fee</p>
              <p class="grey">0.00005 SOL</p>
            </li>
          </ul>
          <m-button class="sty4-btn" round @click="placeOrder" :disabled="form.type === ''">Place Order</m-button>
        </div>
      </div>
    </div>

    <positions></positions>

    <m-dialog
      title="Close Position"
      :visible.sync="dialogVisible"
      custom-class="sty1-dialog"
      width="386px"
      :before-close="handleClose">
      <!-- <template>
        <div class="sty2-gp mui-fl-vert mui-fl-btw">
          <p class="mui-shr-0 lab">Close</p>
          <m-input class="mui-fl-1 sty1-input" placeholder="Size"></m-input>
        </div>
        <ul class="sty3-gp mui-fl-vert">
          <li class="mui-fl-1 active">25%</li>
          <li class="mui-fl-1">50%</li>
          <li class="mui-fl-1">75%</li>
          <li class="mui-fl-1">100%</li>
        </ul>
        <ul class="sty4-gp">
          <li class="mui-fl-vert mui-fl-btw">
            <p>Profit</p>
            <p class="green">+$45632.48</p>
          </li>
          <li class="mui-fl-vert mui-fl-btw">
            <p>Expected return margin</p>
            <p>$32.48</p>
          </li>
        </ul>
      </template> -->
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
    </m-dialog>
  </div>
</template>

<script>
import { parseMappingData, parsePriceData, parseProductData, PythConnection } from '@pythnetwork/client'
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js'
import axios from 'axios'
import * as echarts from 'echarts'
import fakedata from '@/utils/fake-data'

const publicKey = new PublicKey('AHtgzX45WTKfkPG53L6WYhGEXwQkN1BVknET3sVsLL8J')
import Positions from './Positions.vue'

export default {
  name: "Home",
  components: {
    Positions
  },
  data () {
    return {
      bigLoading: true,
      loading: false,
      account: '',
      RP: null,
      activeIndex: 0,
      currencyList: [{
        icon: require('@/assets/img/btc.png'),
        symbolOrigin: 'Crypto.BTC/USD',
        symbol: 'BTC-USD',
        change: 2234.10,
        changeP: 111.23,
        price: '$62022.31',
        high: 62022.31,
        low: 62022.31,
        sellPrice: '',
        buyPrice: ''
      },{
        icon: require('@/assets/img/eth.png'),
        symbolOrigin: 'Crypto.ETH/USD',
        symbol: 'ETH-USD',
        change: 2234.10,
        changeP: -1.23,
        price: '$62022.31',
        high: 62022.31,
        low: 62022.31,
        sellPrice: '',
        buyPrice: ''
      },{
        icon: require('@/assets/img/sol.png'),
        symbolOrigin: 'Crypto.SOL/USD',
        symbol: 'SOL-USD',
        change: 2234.10,
        changeP: 111.23,
        price: '$62022.31',
        high: 62022.31,
        low: 62022.31,
        sellPrice: '',
        buyPrice: ''
      }],
      timeTypeActive: '1D',
      timeType: ['1D', '1W', '1M'],

      form: {
        type: '',
        orderSize: '0.01',
        leverage: '1'
      },

      dialogVisible: false
    }
  },
  computed: {
    conn () {
      return new Connection(clusterApiUrl('testnet'), 'confirmed')
    },
    activeCurrency () {
      return this.currencyList[this.activeIndex]
    },
    currencyInfo () {
      return this.$store.state.currencyInfo || {}
    },
    pubKey () {
      return this.$store.state.pubKey
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
          v.sellPrice = (n.price.price - n.price.confidence).toFixed(2)
          v.buyPrice = (n.price.price + n.price.confidence).toFixed(2)
        }
      })
    }
  },
  mounted () {
    this.fetchData()
    // this.aa()
  },
  methods: {
    switchCurrency (idx) {
      this.activeIndex = idx
      this.timeTypeActive = '1D'
      this.fetchData()
    },
    async fetchData () {
      this.loading = true
      // const rp = await axios.get(`https://7ygpu46ohh.execute-api.us-east-2.amazonaws.com/prod/history?symbol=${this.activeCurrency.symbolOrigin}&range=${this.timeTypeActive}&cluster=mainnet-beta`)
      const rp = await axios.get(`https://7ygpu46ohh.execute-api.us-east-2.amazonaws.com/prod/history?symbol=${this.activeCurrency.symbolOrigin}&range=${this.timeTypeActive}&cluster=${this.$store.state.endpoint}`)
      if (rp.status === 200) {
        this.RP = rp.data
        this.getEcharts()
      }
      this.loading = false
    },
    getEcharts () {
      var myChart = echarts.init(document.getElementById('main'));
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
      });
    },
    switchTimeType (i) {
      this.timeTypeActive = i
      this.fetchData()
    },
    placeOrder () {
      if (!this.pubKey) {
        this.$message('Please connect the wallet first.')
      }
      fakedata.positionList.push({
        logo: this.activeCurrency.icon,
        currency: 'bsc',
        symbol: this.activeCurrency.symbol,
        orderNum: '#123456',
        type: this.form.type,
        size: this.form.orderSize,
        leverage: this.form.leverage,
        open: '23452.23',
        latest: '$62022.31',
        profit: '62022.31',
        margin: '$456.48',
        opentime: '2021-02-02 14:58'
      })
    },
    async aa () {
      const accountInfo  = await this.conn.getAccountInfo(publicKey)
      console.log(accountInfo)
      const { productAccountKeys } = parseMappingData(accountInfo.data)
      console.log(productAccountKeys)

      const accounts = await this.conn.getMultipleAccountsInfo(productAccountKeys)
      console.log(accounts)
      accounts.forEach(async (v) => {
        if (v) {
          const rp = parseProductData(v.data)
          
          if (rp.product && rp.product.symbol === 'Crypto.SOL/USD') {
              console.log(rp)
              
              const priceAccountInfos = await this.conn.getMultipleAccountsInfo([rp.priceAccountKey])
              console.log(priceAccountInfos)
              priceAccountInfos.forEach(m => {
                if (m) {
                const rp0 = parsePriceData(m.data)
                console.log(rp0)
                }
              })
          }
        }
      })
    },
    bb () {
      const pythConnection = new PythConnection(this.conn, new PublicKey('FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH'))
      pythConnection.onPriceChange((product, price) => {
        // sample output:
        // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
        if (product && product.symbol === 'Crypto.SOL/USD') {
          console.log(product)
          console.log(price)
          console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence}`)
        }
      })

      // Start listening for price change events.
      pythConnection.start()
    },
    handleClose () {}
  },
};
</script>

<style lang="scss" src="@/assets/css/views/_home.scss" scoped></style>
