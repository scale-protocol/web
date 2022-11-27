import axios from 'axios'

import * as chain from './chain'

const apis = {
  chain
}

// 对外扩展配置
const defaults = {
  headers: {},
  successResponseHandler: () => {},
  errorResponseHandler: () => {}
}

/**
 * http 统一请求方法
 * @param {string} event 请求的接口类型
 * @param {object} data 提交的接口数据
 * @param {object} options 发出请求的可用配置选项
 */
const request = function (event, data = {}, options = {}) {
  const path = event.split('.')
  const cfg = Object.assign({
    baseURL: process.env.VUE_APP_API_URL // 设置 axios 的 http请求 baseURL
  }, apis[path[0]][path[1]](data))
  const {
    autoHandleSuccess = true,
    autoHandleError = true
  } = options || {}

  // cfg.headers = Object.assign({
  //   timestamp: Date.now(),
  //   sign: cfg.method.toLowerCase() === 'post' || cfg.method.toLowerCase() === 'put' ? cfg.data : cfg.params
  // }, defaults.headers, cfg.headers || {})

  return new Promise(resolve => {
    axios.request(cfg)
      .then(({ data }) => {
        resolve(data)
        if (data.code === 80000000 || Object.prototype.toString.call(data) === '[object Blob]') {
          autoHandleSuccess && defaults.successResponseHandler(data)
        } else {
          autoHandleError && defaults.errorResponseHandler(data)
        }
      })
      .catch(e => {
        resolve(e)
        if (!axios.isCancel(e)) { // 不是【取消请求】类型的错误才进行错误处理
          defaults.errorResponseHandler(e)
        }
      })
  })
}

export default {
  defaults,
  request
}
