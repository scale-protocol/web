/**
 * 获取用户信息
 */
export const getUserInfo = ({ userAccount }) => {
  return {
    method: 'get',
    url: `/user/info/${userAccount}`
  }
}

/**
 * 获取用户仓位列表
 */
export const positionsList = ({ prefix, userAccount }) => {
  return {
    method: 'get',
    url: `/user/positions/${prefix}/${userAccount}`
  }
}
