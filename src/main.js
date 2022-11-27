import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import api from './api'
import { Loading } from 'element-ui'
import Mui from './components/_mui'
import filters from './utils/filters'
import './assets/css/main.scss'

Vue.config.productionTip = false

Vue.use(Mui) // 全局注册自定义组件
Vue.use(filters)
Vue.use(Loading.directive) // element-ui 的 loading 指令，用于在组件中使用“v-loading”来实现菊花加载
// Vue的原型扩展
Object.defineProperty(Vue.prototype, '$api', { value: api }) // 服务端 api 请求

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
