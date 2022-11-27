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
            <!-- <m-popover
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
            </m-popover> -->
            <p class="profit">
              <span>Profit:</span>
              <span class="green">+$62022.31</span>
            </p>
          </div>
        </div>
        <div>
          <m-table
            v-if="activeName === 'position'"
            :data="tableData"
            class="sty1-table"
            style="width: 100%"
            :row-class-name="tableRowClassName">
            <m-table-column prop="orderNum" label="Order Number" min-width="120" #default="{ row }">
              <p class="mui-fl-vert order-num">
                <img :src="row.logo" alt="">#{{ row.account.position_seed_offset }}
              </p>
            </m-table-column>

            <m-table-column prop="type" label="Type" min-width="90" #default="{ row }">
              <p :class="{ 'green': row.account.direction === 'Buy', 'red': row.account.direction === 'Sell' }">{{ row.account.direction }}</p>
            </m-table-column>
            <m-table-column prop="size" label="Size" min-width="90" #default="{ row }">
              {{ row.account.size }}
            </m-table-column>
            <m-table-column prop="leverage" label="Leverage" min-width="90" #default="{ row }">
              <p class="leverage">{{ row.account.leverage }}X</p>
            </m-table-column>
            <m-table-column prop="open" label="Open" min-width="90">
              <template #default="{ row }">
                ${{ row.account.open_price }}
              </template>
            </m-table-column>
            <m-table-column prop="latest" label="Latest" min-width="110" />
            <m-table-column prop="profit" label="Profit" min-width="110" #default="{ row }">
              <p :class="{ 'green': row.account.profit > 0, 'red': row.account.profit < 0 }">
                {{ row.account.profit > 0 ? '+$' : '-$' }}{{ row.account.profit }}
              </p>
            </m-table-column>
            <m-table-column prop="margin" label="Magrin" min-width="100" #default="{ row }">
              ${{ row.account.margin }}
            </m-table-column>
            <m-table-column prop="opentime" label="Open Time" min-width="150" #default="{ row }">
              {{ row.account.open_time | timestampDate }}
            </m-table-column>
            <m-table-column prop="address" label="Action" min-width="120">
              <template #default="{ row, index }">
                <m-button round class="sty5-btn grey sty6-btn taplight" :loading="row.loading" @click="closePosition(row, index)">Close</m-button>
              </template>
            </m-table-column>
          </m-table>

          <m-table
            v-if="activeName === 'history'"
            :data="tableData"
            class="sty1-table"
            style="width: 100%">
            <m-table-column prop="orderNum" label="Order Number" min-width="120" #default="{ row }">
              <p class="mui-fl-vert order-num">
                <img :src="row.logo" alt="">#{{ row.account.position_seed_offset }}
              </p>
            </m-table-column>

            <m-table-column prop="type" label="Type" min-width="90" #default="{ row }">
              <p :class="{ 'green': row.account.direction === 'Buy', 'red': row.account.direction === 'Sell' }">{{ row.account.direction }}</p>
            </m-table-column>
            <m-table-column prop="size" label="Size" min-width="90" #default="{ row }">
              {{ row.account.size }}
            </m-table-column>
            <m-table-column prop="leverage" label="Leverage" min-width="90" #default="{ row }">
              <p class="leverage">{{ row.account.leverage }}X</p>
            </m-table-column>
            <m-table-column prop="closePrice" label="Close Price" min-width="125" #default="{ row }">
              ${{ row.account.close_price }}
            </m-table-column>
            <m-table-column prop="profit" label="Profit" min-width="110" #default="{ row }">
              <p :class="{ 'green': row.account.profit > 0, 'red': row.account.profit < 0 }">
                {{ row.account.profit > 0 ? '+$' : '-$' }}{{ row.account.profit }}
              </p>
            </m-table-column>
            <m-table-column prop="closetime" label="Close Time" min-width="150" #default="{ row }">
              {{ row.account.close_time | timestampDate('minute') }}
            </m-table-column>
            <m-table-column label="Status" min-width="90">
              Closed
            </m-table-column>
            <m-table-column prop="address" label="Action" min-width="120" #default="{ row }">
              <m-button round class="sty5-btn grey sty6-btn taplight" @click="handleView(row)">View</m-button>
            </m-table-column>
          </m-table>
          <div v-if="tableData.length === 0" class="nodata mui-fl-col mui-fl-central">
            <p class="img-nodata"></p>
            <span>{{ userAccount ? '' : 'Please connect the wallet first.' }}</span>
          </div>
        </div>
      </div>
    </div>

    <m-dialog
      title="Close Position"
      :visible.sync="dialogVisible"
      custom-class="sty1-dialog"
      width="386px"
      :before-close="handleClose">
      <template>
        <div class="sty2-gp mui-fl-vert">
          <p>Close</p>
          <m-input class="mui-fl-1 sty1-input" placeholder="Size" v-model="positionSizeFormate"></m-input>
        </div>
        <ul class="process mui-fl-vert">
          <li v-for="(i, index) of process" :key="index" :class="{'mui-fl-1': 1, 'active': processActiveIndex === index}" @click="handleProcee(i, index)">{{ i }}%</li>
        </ul>
        <ul class="profit-ul">
          <li class="mui-fl-vert mui-fl-btw">
            <span>Profit</span>
            <span class="green">+$45632.48</span>
          </li>
          <li class="mui-fl-vert mui-fl-btw">
            <span>Expected return margin</span>
            <span>$32.48</span>
          </li>
        </ul>
      </template>
      <span slot="footer" class="mui-fl-central">
        <m-button class="sty5-btn grey" round @click="dialogVisible = false">Cancel</m-button>
        <m-button type="primary" class="sty5-btn black" round @click="confirmClosePosition">Close</m-button>
      </span>
    </m-dialog>
  </div>
</template>

<script>
// import fakedata from '@/utils/fake-data'
import mixin from '@/utils/mixin'
import { mapState } from 'vuex'
import { PublicKey } from '@solana/web3.js'

export default {
  name: 'Position',
  mixins: [mixin],
  data () {
    return {
      activeName: 'position',
      positionType: 'All',
      // positionTypeList: ['All', 'BTC-USD', 'ETH-USD', 'SOL-USD'],
      positionList0: [],
      historyList0: [],
      dialogVisible: false,
      positionIndex: null,
      positionSize: null,
      positionSizeFormate: null,
      processActiveIndex: 0,
      process: [25, 50, 75, 100]
    }
  },
  computed: {
    ...mapState(['positionsList', 'hisPositionsList', 'userAccount', 'pubKey']),
    tableData () {
      if (!this.pubKey) {
        return []
      }
      let list = []
      // if (this.positionType === 'All') {
      //   list = (this.activeName === 'position' ? this.positionsList : this.hisPositionsList) || []
      // } else {
      //   list = (this.activeName === 'position' ? this.positionsList : this.hisPositionsList) || []
      //   // list = list.filter(v => v.symbol === this.positionType)
      // }
      list = (this.activeName === 'position' ? this.positionsList : this.hisPositionsList) || []
      return list
    }
  },
  methods: {
    tableRowClassName ({ row, rowIndex }) {
      row.index = rowIndex
    },
    handleClick () {
      this.$router.push({
        query: {
          prefix: this.activeName === 'position' ? 'active' : 'history'
        }
      })
    },
    handleView (row) {
      this.$message('Coming soon!')
      console.log(row)
      console.log(new PublicKey(row.pubkey).toBase58())
    },
    closePosition (row) {
      row.loading = true
      this.instructionClosePosition(new PublicKey(row.pubkey).toBase58())
      // this.dialogVisible = true
      // this.positionIndex = row.index
      // this.positionSize = row.size
      // this.positionSizeFormate = this.positionSize * 25 / 100
      row.loading = false
    },
    handleClose () {
      // this.dialogVisible = false
      // this.processActiveIndex = 0
      this.instructionClosePosition()
    },
    handleProcee (i, index) {
      this.processActiveIndex = index
      this.positionSizeFormate = this.positionSize * i / 100
    },
    confirmClosePosition () {
      this.positionList0.splice(this.positionIndex, 1)
      this.handleClose()
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/_positions.scss" scoped></style>
