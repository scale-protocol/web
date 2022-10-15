<template>
  <div class="section">
    <div class="position">
      <div class="inner-position">
        <div class="header-title mui-fl-vert mui-fl-btw">
          <m-tabs v-model="activeName" @tab-click="handleClick" class="sty1-tabs">
            <m-tab-pane label="Position" name="position" />
            <m-tab-pane label="History" name="history" />
          </m-tabs>
          <div class="mui-fl-vert">
            <m-popover
              placement="bottom-end"
              width="116"
              trigger="click"
              popper-class="sty1-popover"
              >
              <ul class="sty1-gp">
                <li v-for="(i, index) of positionTypeList" :key="index" :class="{'active': i === positionType, 'taplight2': 1}" @click="positionType = i">{{ i }}</li>
              </ul>
              <div slot="reference" class="funnel mui-fl-vert taplight2">
                <img src="~@/assets/img/funnel.png" alt="" class="img-funnel">
                {{ positionType }}
                <img src="~@/assets/img/arrow-right.png" alt="" class="img-arrow">
              </div>
            </m-popover>
            <p class="profit">
              <span>Profit:</span>
              <span class="green">+$62022.31</span>
            </p>
          </div>
        </div>
        <div>
          <m-table
            v-if="activeName === 'position'"
            :data="positionList"
            class="sty1-table"
            style="width: 100%">
            <m-table-column prop="orderNum" label="Order Number" min-width="120" #default="{ row }">
              <p class="mui-fl-vert order-num">
                <img :src="row.logo" alt="">{{ row.orderNum }}
              </p>
            </m-table-column>

            <m-table-column prop="type" label="Type" min-width="90" #default="{ row }">
              <p :class="{ 'green': row.type === 'BUY', 'red': row.type === 'SELL' }">{{ row.type }}</p>
            </m-table-column>
            <m-table-column prop="size" label="Size" min-width="90"/>
            <m-table-column prop="leverage" label="Leverage" min-width="90" #default="{ row }">
              <p class="leverage">{{ row.leverage }}X</p>
            </m-table-column>
            <m-table-column prop="open" label="Open" min-width="90">
              <template #default="{ row }">
                ${{ row.open }}
              </template>
            </m-table-column>
            <m-table-column prop="latest" label="Latest" min-width="110" />
            <m-table-column prop="profit" label="Profit" min-width="110" #default="{ row }">
              <p :class="{ 'green': row.profit > 0, 'red': row.profit < 0 }">
                {{ row.profit > 0 ? '+$' : '-$' }}{{ row.profit }}
              </p>
            </m-table-column>
            <m-table-column prop="margin" label="Magrin" min-width="100" />
            <m-table-column prop="opentime" label="Open Time" min-width="150" />
            <m-table-column prop="address" label="Action" min-width="120">
              <m-button round class="sty5-btn grey sty6-btn taplight" @click="handleTip">Close</m-button>
            </m-table-column>
          </m-table>


          
          <m-table
            v-if="activeName === 'history'"
            :data="positionList"
            class="sty1-table"
            style="width: 100%">
            <m-table-column prop="orderNum" label="Order Number" min-width="120" #default="{ row }">
              <p class="mui-fl-vert order-num">
                <img :src="row.logo" alt="">{{ row.orderNum }}
              </p>
            </m-table-column>

            <m-table-column prop="type" label="Type" min-width="90" #default="{ row }">
              <p :class="{ 'green': row.type === 'BUY', 'red': row.type === 'SELL' }">{{ row.type }}</p>
            </m-table-column>
            <m-table-column prop="size" label="Size" min-width="90"/>
            <m-table-column prop="leverage" label="Leverage" min-width="90" #default="{ row }">
              <p class="leverage">{{ row.leverage }}X</p>
            </m-table-column>
            <m-table-column prop="closePrice" label="Close Price" min-width="90" />
            <m-table-column prop="profit" label="Profit" min-width="110" #default="{ row }">
              <p :class="{ 'green': row.profit > 0, 'red': row.profit < 0 }">
                {{ row.profit > 0 ? '+$' : '-$' }}{{ row.profit }}
              </p>
            </m-table-column>
            <m-table-column prop="closetime" label="Close Time" min-width="150" />
            <m-table-column label="Status" min-width="90">
              Closed
            </m-table-column>
            <m-table-column prop="address" label="Action" min-width="120">
              <m-button round class="sty5-btn grey sty6-btn taplight" @click="handleTip">View</m-button>
            </m-table-column>
          </m-table>
          <div v-if="positionList.length === 0" class="nodata mui-fl-col mui-fl-central">
            <p class="img-nodata"></p>
            <span>Please connect the wallet first.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fakedata from '@/utils/fake-data'

export default {
  name: 'Position',
  data () {
    return {
      activeName: 'position',
      positionType: 'All',
      positionTypeList: ['All', 'BTC-USD', 'ETH-USD', 'SOL-USD'],
    }
  },
  computed: {
    positionList () {
      if (!this.pubKey) {
        return []
      }
      let list = []
      if (this.positionType === 'All') {
        list = this.activeName === 'position' ? fakedata.positionList : fakedata.historyList
      } else {
        list = this.activeName === 'position' ? fakedata.positionList : fakedata.historyList
        list = list.filter(v => v.symbol === this.positionType)
      }
      return list
    },
    pubKey () {
      return this.$store.state.pubKey
    }
  },
  methods: {
    handleClick () {},
    handleTip () {
      this.$message('Coming soon!')
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/_positions.scss" scoped></style>
