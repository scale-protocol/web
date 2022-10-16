<template>
  <div>
    <div class="mui-header">
      <div class="section">
        <div class="mui-fl-vert mui-fl-btw">
          <div class="mui-fl-vert">
            <div class="logo"></div>
            <ul v-if="account" class="info mui-fl-vert">
              <li>
                <p>Balance</p>
                <p>$99,231,52.00</p>
              </li>
              <li>
                <p>Profit</p>
                <p class="green">+$31,52.00 (+153.23%)</p>
              </li>
              <li>
                <p>Margin</p>
                <p>$99,231,52.00</p>
              </li>
              <li class="verbar">
                <p>Margin(%)</p>
                <p>+1234.54%</p>
              </li>
              <div class="btns">
                <m-button type="text" class="sty3-btn" @click="handleTrade('Deposit')">Deposit</m-button>
                <i class="line" />
                <m-button type="text" class="sty3-btn" @click="handleTrade('Withdraw')">Withdraw</m-button>
              </div>
            </ul>
          </div>

          <div class="mui-flex">
            <div class="mui-fl-vert global verbar">
              <i class="icon-global" />
              <p class="mui-fl-vert taplight2" @click="handleTip">
                <span>US</span>
                <i class="icon-arrow" />
              </p>
            </div>
            <m-button v-if="!account" class="sty1-btn" :class="[account ? 'sty2-btn' : 'sty1-btn']" type="primary" size="small" round @click="handleClkConnect">
              <span v-if="!account">Connect</span>
              <i class='el-icon-arrow-right' />
            </m-button>
            
            <m-popover
              v-else
              placement="bottom-end"
              width="116"
              trigger="click"
              popper-class="sty2-popover"
              >
              <div class="disconnect taplight2 mui-fl-vert" @click="disconnect">
                <img src="~@/assets/img/disconnect.png" alt="">
                Disconnect
              </div>
              
              <m-button slot="reference" class="sty2-btn" type="primary" size="small" round @click="handleClkConnect">
                <span>{{ account | formatPubKey }}</span>
                <i class='el-icon-arrow-right' />
              </m-button>
            </m-popover>
          </div>
        </div>
      </div>
    </div>
    <router-view></router-view>

    
    <m-dialog
      title="Connect Wallet"
      :visible.sync="connectDialogVisible"
      custom-class="sty1-dialog"
      width="386px">
      <ul class="sty5-gp">
        <li v-for='(i, index) of walletList' :key="index" class="taplight mui-fl-vert mui-fl-btw" @click="connectWallet(i)">
          <div class="mui-fl-vert">
            <img :src="i.logo" alt="" class="img-logo">
            <p class="t1">{{ i.name }}</p>
          </div>
          <img src="~@/assets/img/arrow-right.png" alt="" class="img-arrow">
        </li>
      </ul>
    </m-dialog>

    <m-dialog
      :title="tradeInfo.type + ' Margin'"
      :visible.sync="tradeInfo.visible"
      custom-class="sty1-dialog"
      width="386px"
      @close="value = ''">
      <template>
        <div class="mui-fl-vert mui-fl-btw wallet-info">
          <p>Wallet</p>
          <p class="pubkey mui-fl-vert taplight2">
            {{ account | formatPubKey }}
            <img src="~@/assets/img/arrow-right.png" alt="">
          </p>
        </div>
        <div class="sty2-gp">
          <m-input class="mui-fl-1 sty1-input" placeholder="USDC" type='number' v-model="value"></m-input>
        </div>
        <p v-if="tradeInfo.type === 'Withdraw'" class="sty1-tip">
          Your maigin: $45643.47
        </p>
        <p v-if="tradeInfo.type === 'Deposit'" class="sty1-tip">
          Your wallet: $45643.47
        </p>
      </template>
      <span slot="footer" class="mui-fl-central">
        <m-button class="sty5-btn grey" round @click="tradeInfo.visible = false">Cancel</m-button>
        <m-button type="primary" class="sty5-btn black" round @click="tradeInfo.visible = false">Confirm</m-button>
      </span>
    </m-dialog>


  </div>
</template>

<script>
export default {
  name: 'Header',
  data () {
    return {
      account: '',
      connectDialogVisible: false,
      walletList: [
        {
          name: 'Phamtom',
          logo: require('@/assets/img/phamtom.png')
        },{
          name: 'Sollet',
          logo: require('@/assets/img/sollet.png')
        },{
          name: 'Connet Wallet',
          logo: require('@/assets/img/connet-wallet.png')
        }
      ],
      tradeInfo: {
        visible: false,
        type: ''
      },
      value: ''
    }
  },
  computed: {
    conn () {
      return this.$store.getters.conn
    }
  },
  created () {
    this.$store.dispatch('getCurrencyPrice')
  },
  methods: {
    handleClkConnect () {
      if (!this.account) {
        this.connectDialogVisible = true
      }
    },
    async connectWallet (i) {
      if (i.name === 'Phamtom') {
        if (!window.solana) {
          window.open('https://phantom.app/')
        }
        try {
          const s = window.solana
          const rp = await s.connect()
          this.account = rp.publicKey.toBase58()
          this.$store.commit('SET_PUBLICYKEY', this.account)
        } catch (e) {
          console.log('e', e)
        }
      } else {
        this.handleTip()
        return
      }
      this.connectDialogVisible = false
    },
    disconnect () {
      this.account = ''
      this.$store.commit('SET_PUBLICYKEY', this.account)
    },
    handleTrade (type) {
      this.tradeInfo.visible = true
      this.tradeInfo.type = type
    },
    handleTip () {
      this.$message('Coming soon!')
    }
  }
}
</script>
<style lang="scss" src="@/assets/css/components/_header.scss" scoped></style>
