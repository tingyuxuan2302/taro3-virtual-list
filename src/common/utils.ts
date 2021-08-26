import Taro from '@tarojs/taro'
/**
 * 是否是 H5 环境
 * @type {boolean}
 */
export const isH5 = Taro.ENV_TYPE.WEB === Taro.getEnv()

/**
* 截流函数
*
* @param {Function} fn 回调函数
* @param {number} delay 延迟毫秒数
* @param {number} mustRunDelay 延迟多少毫秒，强制执行一下
* @returns {Function} 截流函数
*/
// eslint-disable-next-line no-unused-vars
export const throttle = (fn: (params: any) => void, delay: number, mustRunDelay: number) => {
  let timer: NodeJS.Timeout
  let startTime: number
  return (...args) => {
    const curTime = Date.now()
    clearTimeout(timer)
    if (!startTime) {
      startTime = curTime
    }
    if (curTime - startTime >= mustRunDelay) {
      fn.apply(this, args)
      startTime = curTime
    } else {
      timer = setTimeout(() => {
        fn.apply(this, args)
      }, delay)
    }
  }
}
