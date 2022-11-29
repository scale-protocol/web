<template>
  <div :class="['mui-input-wrap', 'mui-fl-vert', size === 'medium' ? 'mui-input-medium' : '']" @click="$emit('click')">
    <input
      class="mui-input"
      ref='input'
      :type="inputType"
      :placeholder="placeholder"
      title=""
      :value="value"
      :step="step"
      :max="max"
      :min="min"
      :disabled="disabled"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
      @keyup.enter="handleKeyDown"
    >
    <p class="mui-fl-hori mui-input-icon mui-shr-0" :class="size !== 'medium' ? 'mui-fl-col' : ''">
      <i :class="[size === 'medium' ? 'mui-input-act_plus mui-fl-1' : 'mico-arrow-top', { 'is-disabled': value >= max || disabled }, 'taplight2']" @click="handleStep('up', true, true)"></i>
      <span v-if="size === 'medium'" class="mui-input-act_gap"></span>
      <i :class="[size === 'medium' ? 'mui-input-act_minus mui-fl-1' : 'mico-arrow-down', { 'is-disabled': value <= min || disabled }, 'taplight2']" @click="handleStep('down', true, true)"></i>
    </p>
  </div>
</template>

<script>
const isSafari = navigator.userAgent.match(/version\/([\d.]+).*safari/gi)
const isFirefox = /firefox/gi.test(navigator.userAgent)
// const isOldEdge = /edge\//gi.test(navigator.userAgent)

export default {
  name: 'InputNumber',
  props: {
    value: {
      type: [Number, String]
    },
    placeholder: {
      default: ''
    },
    step: {
      type: Number
    },
    max: {
      type: Number,
      default: Infinity
    },
    min: {
      type: Number,
      default: -Infinity
    },
    digits: {
      type: Number,
      default: 2
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String
    },
    // 失焦后是否重新计算数值是否符合最大最小区间，不符合的话赋予新的计算后的数值
    blurCheck: {
      default: true
    },
    // 当输入值过大时是否需要限制继续输入
    overflowRestrict: {
      default: false
    },
    // 是否限制最大位数
    limitLength: {
      type: Boolean,
      default: true
    },
    // 最大位数（包括小数点）
    maxLength: {
      type: Number,
      default: 15
    }
    // 是否需要显示 tip 信息
    // showTip: {
    //   type: Boolean,
    //   default: false
    // },
    // showTipObj: {
    //   type: Object,
    //   default: null
    // },
    // valid: {
    //   type: Boolean
    // }
  },
  data () {
    return {
      inputType: 'text', // 产品觉得科学计数法看着别扭，这里只有 text 取值，没有 number 了
      disabledUp: false, // step上键是否置灰
      disabledDown: false // step下键是否置灰
    }
  },
  methods: {
    handleInput (e) {
      // if (e) return
      const nd = e.target
      let val = nd.value

      const data = e.data || val // 老版 edge 没有 e.data，用 val 代替
      const pos = this.getCursortPosition(nd)
      const re = /^\d+\.?\d*$/g
      // console.log('start', val, this.value, data)
      // console.log('select', nd.selectionEnd, nd.selectionStart)
      // console.log('pos', pos)
      if (re.test(val) && data !== '') {
        if (val.indexOf('.') !== -1 && val.split('.')[1].length > this.digits) {
          val = this.numSplit(nd.value, this.digits)
          // console.log('numSplit', val)
        } else if (isFirefox && val !== '' && this.inputType === 'number') {
          if (data === '.') {
            val += '.'
          } else if (!val.includes('.') && this.value.indexOf('.') === this.value.length - 2) {
            val += '.' // 在火狐下，type 为 number 时，删除最后一位小数时会把小数点也一并删掉，这里给删掉的小数点补上
          }
          // console.log('add point', val)
        }
      } else {
        // 是否是清空内容，老版 edge 没有 e.inputType 属性，用光标位置 nd.selectionEnd === 0 代替
        const isClear = (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteByCut' || nd.selectionEnd === 0) && val === ''
        // 不是清空的话则还原为上一次内容
        if (!isClear && data !== null) {
          // 中文输入法下输入句号的话转为 “.”
          // 但是 chrome 等浏览器无法给数字后面强制补点，得将输入框类型改为 text 才行，后续在按下键盘的上下键的时候再将输入类型改为 number
          if (data.includes('。') && re.test(this.value + '.')) {
            // this.inputType = 'text' 产品觉得科学计数法看着别扭，默认就是 text，没必要手动设置了
            val = this.value + '.'
            // console.log('format。')
          } else {
            val = this.value
          }
        }
        // console.log('bak', val)
      }
      /*
      * 当val大于max时候无法删除输入框数字，自处增加 overflowRestrict 属性用于需要限制输入的场景
      * bug链接：https://cd.koolio.exchange/index.php?m=bug&f=view&bugID=1100
      */
      if (this.overflowRestrict && Number(val) > this.max) {
        val = this.value
      }
      if (this.limitLength && val.toString().length > this.maxLength) {
        val = this.value
      }
      // console.log(e)
      nd.value = val
      // safari 里面对 target.value 进行赋值后光标会跑到最末尾，需手动将光标挪到新输入的数字的后面
      if (isSafari) {
        // this.inputType = 'text' // web 规范不允许操作 number 类型的输入框的光标，故这里临时将类型改为 text
        // this.$nextTick(() => {
        //   nd.setSelectionRange(pos, pos)
        //   this.inputType = 'number'
        // })
        // 产品觉得科学计数法看着别扭，上面的逻辑也没必要了
        nd.setSelectionRange(pos, pos)
      }
      this.$emit('input', val)
    },
    handleFocus () {
      this.$emit('focus')
    },
    handleBlur (e) {
      let nd = e.target
      const v = Number(nd.value)
      if (this.blurCheck) {
        if (nd.value !== '' && v < this.min) {
          nd.value = this.min
        } else if (nd.value !== '' && v > this.max) {
          nd.value = this.max
        }
      }
      // 不足两位小数补零
      nd.value = this.zeroPadding(nd.value)
      if (this.limitLength) {
        nd.value = nd.value.toString().substr(0, 15)
      }
      this.$emit('input', nd.value)
      this.$emit('blur', nd.value)
    },
    handleChange () {
      // const nd = e.target
      // let val = Number(nd.value)

      // this.disabledUp = val > this.max
      // this.disabledDown = val <= this.min
    },
    /**
     * @param {Boolean} bol 是否需要触发 step 事件
     * @param {Boolean} fromBtn 是否是来自右侧按钮触发的 step 事件
     */
    handleStep (str, bol, fromBtn) {
      this.$refs.input.focus()
      // if (!fromBtn && !isOldEdge) this.inputType = 'number' 产品觉得科学计数法看着别扭，这里不再将输入框改为 number 类型
      let val = Number(this.value)
      const oldVal = this.value
      if ((str === 'up' ? val >= this.max : val <= this.min) || this.disabled) return

      if (fromBtn) {
        val = str === 'up' ? this.$np.plus(val, this.step) : this.$np.minus(val, this.step)
      }

      // 不足两位小数补零
      val = this.zeroPadding(val)
      this.$emit('input', val)
      // }
      bol && this.$emit('step', val, oldVal)
    },
    /**
     * 超过两位小数则截取掉
     */
    numSplit (num, pad) {
      if (!this.$np.isNum(num) || !String(num).includes('.')) return num
      num = String(num)
      return num.split('.')[0] + '.' + num.split('.')[1].substring(0, pad)
    },
    /**
     * 强制保留 pad 位小数，不足补零
     * 产品觉得科学计数法看着别扭，故而没有采用先转换成 Number 类型并调用 toFixed 方法的方式
     */
    zeroPadding (num) {
      if (!this.$np.isNum(num) || !this.digits) return num
      num = num.toString()
      const arr = num.split('.')
      let pad = 0
      if (num.includes('.') && !arr[0]) {
        num = '0' + num
      }
      if (!arr[1]) {
        !num.includes('.') && (num += '.')
        pad = this.digits
      } else if (arr[1].length < this.digits) {
        pad = this.digits - arr[1].length
      }
      for (;pad > 0; pad--) {
        num += '0'
      }
      return num
    },
    // 获取光标位置
    getCursortPosition (ctrl) {
      let caretPos = 0
      // IE Support
      if (document.selection) {
        ctrl.focus()
        const sel = document.selection.createRange()
        sel.moveStart('character', -ctrl.value.length)
        caretPos = sel.text.length
      } else if (ctrl.selectionStart || ctrl.selectionStart === '0') { // Firefox support
        caretPos = ctrl.selectionStart
      }
      return caretPos
    },
    handleKeyDown (e) {
      this.$emit('enter', e.target.value)
    },
    focus () {
      this.$refs.input.focus()
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/components/_inputnumber.scss"></style>

