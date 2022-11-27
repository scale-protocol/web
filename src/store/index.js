import Vue from 'vue'
import Vuex from 'vuex'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { PythConnection, getPythProgramKeyForCluster } from '@pythnetwork/client'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    pubKey: '',
    currencyInfo: null,
    endpoint: 'devnet',
    userAccount: '',

    userInfo: null,
    positionsList: null,
    hisPositionsList: null,
    connectDialogVisible: false
  },
  getters: {
    conn (state) {
      return new Connection(clusterApiUrl(state.endpoint), 'confirmed')
    }
  },
  mutations: {
    SET_CURRENCY_PRICE (state, payload) {
      state.currencyInfo = payload
    },
    SET_PUBLICYKEY (state, payload) {
      state.pubKey = payload
    },
    SET_USERACCOUNT (state, payload) {
      state.userAccount = payload
    },
    SET_USER_INFO (state, payload) {
      state.userInfo = payload
    },
    SET_POSITIONS (state, payload) {
      state.positionsList = payload
    },
    SET_HISTORY_POSITIONS (state, payload) {
      state.hisPositionsList = payload
    },
    SET_CONNECTDIALOGVISIBLE (state, payload) {
      state.connectDialogVisible = payload
    }
  },
  actions: {
    getCurrencyPrice ({ state, getters, commit }) {
      const pythConnection = new PythConnection(getters.conn, getPythProgramKeyForCluster(state.endpoint))
      pythConnection.onPriceChange((product, price) => {
        if (product) {
          if (product.symbol === 'Crypto.BTC/USD' || product.symbol === 'Crypto.ETH/USD' || product.symbol === 'Crypto.SOL/USD') {
            commit('SET_CURRENCY_PRICE', {
              product, price
            })
          }
        }
      })
      pythConnection.start()
    },
    async getUserInfo ({ state, commit }) {
      const rp = await Vue.prototype.$api.request('chain.getUserInfo', {
        userAccount: state.userAccount
      })
      if (rp.code === 0) {
        commit('SET_USER_INFO', rp.data)
      }
    },
    async getPositions ({ state, commit }, options = { prefix: 'active' }) {
      const rp = await Vue.prototype.$api.request('chain.positionsList', {
        prefix: options.prefix || 'active',
        userAccount: state.userAccount
      })
      if (rp.code === 0) {
        rp.data.forEach(v => {
          v.loading = false
        })
        options.prefix === 'active' && commit('SET_POSITIONS', rp.data)
        options.prefix === 'history' && commit('SET_HISTORY_POSITIONS', rp.data)
      }
    }
  },
  modules: {
  }
})
