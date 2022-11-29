<template>
  <div>
    <div class="mui-header">
      <div class="section">
        <div class="mui-fl-vert mui-fl-btw">
          <div class="mui-fl-vert">
            <div class="logo"></div>
            <ul v-if="pubKey" class="info mui-fl-vert">
              <li>
                <p>Balance</p>
                <p>${{ (userInfoAccount.balance) | subRadio }}</p>
              </li>
              <li>
                <p>Profit</p>
                <p :class="[plusAndMinus(userInfoDynamic?.profit || undefined).className || '', 'mui-fl-vert']">
                  <span>{{ plusAndMinus(userInfoDynamic?.profit).sign }}{{ (userInfoDynamic?.profit || 0) | subRadio }}</span>
                  <span>({{ plusAndMinus(userInfoDynamic?.profit).sign }}{{ (userInfoDynamic.profit_rate || 0) * 100 | subRadio }}%)</span>
                </p>
              </li>
              <li>
                <p>Margin</p>
                <p>${{ (userInfoAccount.margin_total || 0) | subRadio }}</p>
              </li>
              <li class="verbar">
                <p>Margin(%)</p>
                <p :class="[plusAndMinus(userInfoDynamic.profit).className]">
                  {{ plusAndMinus(userInfoDynamic.profit).sign }}{{ (userInfoDynamic.margin_percentage || 0)* 100 | subRadio }} %
                </p>
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
            <m-button v-if="!pubKey" class="sty1-btn" :class="[pubKey ? 'sty2-btn' : 'sty1-btn']" type="primary" size="small" round @click="handleClkConnect">
              <span v-if="!pubKey">Connect</span>
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
                <span>{{ pubKey | formatPubKey }}</span>
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
      :visible="_connectDialogVisible"
      custom-class="sty1-dialog"
      width="386px"
      @close="handleConnectClose">
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
      width="386px">
      <template>
        <div class="mui-fl-vert mui-fl-btw wallet-info">
          <p>Wallet</p>
          <p class="pubkey mui-fl-vert">
            {{ pubKey | formatPubKey }}
            <!-- <img src="~@/assets/img/arrow-right.png" alt=""> -->
          </p>
        </div>
        <div class="sty2-gp">
          <m-input class="mui-fl-1 sty1-input" placeholder="USDC" type='number' v-model="amount"></m-input>
        </div>
        <p v-if="tradeInfo.type === 'Withdraw'" class="sty1-tip">
          Your balance: ${{ (userInfoAccount.balance) | subRadio }}
        </p>
        <p v-if="tradeInfo.type === 'Deposit'" class="sty1-tip">
          Your wallet: ${{ userInfoAccount.balance | subRadio }} / USDC
        </p>
      </template>
      <span slot="footer" class="mui-fl-central">
        <m-button class="sty5-btn grey" round @click="tradeInfo.visible = false">Cancel</m-button>
        <m-button type="primary" class="sty5-btn black" round :disabled="amount === ''" :loading="confirmLoading" @click="handleConfirm">Confirm</m-button>
      </span>
    </m-dialog>

    <m-dialog
      :visible.sync="welcomeDialog"
      custom-class="sty1-dialog"
      width="386px">
      <template>
        <div class="welcome mui-fl-col mui-fl-vert">
          <img src="~@/assets/img/welcome.png" alt="">
          <p class="t1">Welcome !</p>
          <p class="t2">If you are new to Scale, please read our introduction, it may help you</p>
        </div>
      </template>
      <span slot="footer" class="mui-flex">
        <m-button class="mui-fl-1 sty7-button" round @click="goGitbook">Go</m-button>
        <!-- <m-button class="sty5-btn grey" round @click="tradeInfo.visible = false">Cancel</m-button>
        <m-button type="primary" class="sty5-btn black" round :disabled="amount === ''" :loading="confirmLoading" @click="handleConfirm">Confirm</m-button> -->
      </span>
    </m-dialog>

  </div>
</template>

<script>
import mixin from '@/utils/mixin'
import { mapState, mapGetters } from 'vuex'
import BigNumber from 'bignumber.js'
export default {
  name: 'Header',
  mixins: [mixin],
  data () {
    return {
      // connectDialogVisible: false,
      walletList: [
        {
          name: 'Phantom',
          logo: require('@/assets/img/phamtom.png')
        }, {
          name: 'Sollet',
          logo: require('@/assets/img/sollet.png')
        }, {
          name: 'Connet Wallet',
          logo: require('@/assets/img/connet-wallet.png')
        }
      ],
      tradeInfo: {
        visible: false,
        type: ''
      },
      amount: '',
      interval: null,
      confirmLoading: false,

      welcomeDialog: false
      // welcomeDialog: true
    }
  },
  computed: {
    ...mapState(['pubKey', 'userAccount', 'userInfo', 'connectDialogVisible']),
    ...mapGetters(['conn']),
    userInfoAccount () {
      return this.userInfo ? this.userInfo.account : {}
    },
    userInfoDynamic () {
      return this.userInfo ? this.userInfo.dynamic_data || {} : {}
    },
    _connectDialogVisible: {
      get () {
        return this.connectDialogVisible
      },
      set (v) {
        this.connectDialogVisible = v
      }
    }
  },
  created () {
    // pyth ws 获取链上价格
    this.$store.dispatch('getCurrencyPrice')

    // 轮询实时获取用户信息
    this.interval = setInterval(() => {
      this.getUserInfo()
    }, 5000)

    // 自动链接钱包
    setTimeout(() => {
      if (localStorage.getItem('walName')) {
        this.connectWallet({ name: 'Phantom' })
      }
    }, 500)
  },
  destroyed () {
    clearInterval(this.interval)
  },
  methods: {
    handleClkConnect () {
      if (!this.pubKey) {
        this.$store.commit('SET_CONNECTDIALOGVISIBLE', true)
      }
    },
    handleConnectClose () {
      this.$store.commit('SET_CONNECTDIALOGVISIBLE', false)
    },
    async connectWallet (i) {
      const loadingInstance = this.$loading({ fullscreen: true })
      if (i.name === 'Phantom') {
        if (!window.solana) {
          window.open('https://phantom.app/')
        }
        try {
          this.$store.commit('SET_CONNECTDIALOGVISIBLE', false)
          const s = window.solana
          const rp = await s.connect()
          const pubKey = rp.publicKey.toBase58()
          this.$store.commit('SET_PUBLICYKEY', pubKey)
          await this.createUserAccount()
          if (!localStorage.getItem('walName')) {
            this.welcomeDialog = true
          }
          localStorage.setItem('walName', i.name)
          this.getUserInfo()

          loadingInstance.close()
        } catch (e) {
          console.log('e', e)
          this.$message.error(e.message)
          loadingInstance.close()
        }
      } else {
        this.handleTip()
      }
    },
    disconnect () {
      const s = window.solana
      s.disconnect()
      localStorage.removeItem('walName', '')
      this.$store.commit('SET_PUBLICYKEY', '')
    },
    handleTrade (type) {
      this.tradeInfo.visible = true
      this.tradeInfo.type = type
    },
    handleTip () {
      this.$message.info('Coming soon!')
    },
    async handleConfirm () {
      this.confirmLoading = true
      if (this.tradeInfo.type === 'Deposit') {
        const aa = await this.deposit(this.amount)
        if (aa === true) {
          this.$message.success('Deposit success!')
        } else if (aa === 'no balance') {} else {
          this.$message('Deposit fail!')
        }
      } else if (this.tradeInfo.type === 'Withdraw') {
        this.handleTip()
      }
      this.confirmLoading = false
      this.tradeInfo.visible = false
      this.amount = ''
    },
    getUserInfo () {
      if (this.userAccount) {
        this.$store.dispatch('getUserInfo')
        this.$store.dispatch('getPositions', { prefix: 'active' })
        this.$store.dispatch('getPositions', { prefix: 'history' })
      }
    },
    plusAndMinus (num) {
      const flag = (new BigNumber(num)).gt(new BigNumber(0))
      return {
        sign: flag ? '+' : '-',
        className: flag ? 'green' : 'red'
      }
    },
    goGitbook () {
      window.open('https://scaleprotocol.gitbook.io/scale-protocol-1/')
      this.welcomeDialog = false
    }
  }
}
</script>
<style lang="scss" src="@/assets/css/components/_header.scss" scoped></style>
