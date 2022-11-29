// import Vue from 'vue'
import np from './number-precision'
import BigNumber from 'bignumber.js'

export const formatPubKey = (account) => {
  return account ? account.substr(0, 4) + '...' + account.substr(-4, 4) : ''
}

/**
 * 时间戳转为时间格式
 * @param {string} type 显示时间的格式 1.minute 显示到分
 */
export const timestampDate = (timestamp, type) => {
  const length = timestamp.toString().length
  if (length === 10 || length === 13) {
    const time = length === 10 ? new Date(Number(timestamp + '000')) : new Date(Number(timestamp))
    const Y = time.getFullYear()
    const M = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1
    const d = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
    const h = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
    const m = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
    const s = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds()
    if (type === 'minute') {
      return Y + '-' + M + '-' + d + '' + h + ':' + m
    } else {
      return Y + '-' + M + '-' + d + '' + h + ':' + m + ':' + s
    }
  } else {
    return timestamp
  }
}
/**
 * 返回加减符号
 * @param {*} num 接收的值
 */
export const plusAndMinus = (num) => {
  const flag = (new BigNumber(num)).gt(new BigNumber(0))
  return {
    sign: flag ? '+' : '-',
    className: flag ? 'green' : 'red'
  }
}

/**
 * 保留两位小数
 * @param {*} num 传值
 */
export const formatNum = (num) => {
  const BN_DP0 = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: 0 })
  const step1 = new BN_DP0(num).toString(10)
  return new BN_DP0(step1).toFormat()
}

/**
 * @param {number} radio 精确的小数位
 * @param {string} style 类型，如“currency”
 * @param {boolean} useGrouping 是否逗号分隔
 */
export const numberFormat = (
  number,
  style = 'currency',
  radio = 4,
  useGrouping = true
) => {
  if (style === 'currency') {
    const fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      useGrouping
    })
    return fmt.format(number)
  } else {
    const fmt = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: radio,
      maximumFractionDigits: radio,
      useGrouping
    })
    return fmt.format(number)
  }
}

/**
  * 截断小数位而不是四舍五入
  * @param {boolean} needPos 是否需要补 “+” 号
  * @param {number} radio 保留的小数位数，默认 2
  */
export function subRadio (num, radio = 2, needPos) {
  if (np.isNum(num)) {
    const arr = num.toString().split('.')
    if (arr[1]) {
      num = `${arr[0]}.${arr[1].substring(0, radio)}`
    }
    const n = np.round(Number(num), radio)
    let f = n.toFixed(radio)
    f = numberFormat(f, '', radio)
    return n > 0 && needPos ? '+' + f : f
  } else {
    return num
  }
}

const filters = {
  formatPubKey,
  timestampDate,
  plusAndMinus,
  formatNum,
  subRadio
}

const install = function (Vue) {
  Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
  })
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Object.assign(filters, { install })
