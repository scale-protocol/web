import Vue from 'vue'
import Vuex from 'vuex'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { PythConnection, getPythProgramKeyForCluster } from '@pythnetwork/client'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    pubKey: '',
    currencyInfo: null,
    endpoint: 'testnet'
  },
  getters: {
    conn (state) {
      return new Connection(clusterApiUrl(state.endpoint), 'confirmed')
      // https://slope.rpcpool.com
    }
  },
  mutations: {
    SET_CURRENCY_PRICE (state, payload) {
      state.currencyInfo = payload
    },
    SET_PUBLICYKEY (state, payload) {
      state.pubKey = payload
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
    }
  },
  modules: {
  }
})
