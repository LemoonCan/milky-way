import { authService } from '../services/auth'
import { getErrorMessage } from '../lib/error-handler'

// 测试用的模拟数据
const mockUserData = {
  openId: 'test-user-' + Date.now(),
  password: 'password123',
  nickname: '测试用户',
  avatar: ''
}

/**
 * 测试注册功能
 */
export async function testRegister() {
  console.log('🧪 测试注册功能...')
  
  try {
    const result = await authService.register({
      openId: mockUserData.openId,
      password: mockUserData.password,
      nickname: mockUserData.nickname,
      phone: '13800138000',
      avatar: mockUserData.avatar
    })
    
    console.log('✅ 注册测试通过:', result)
    return { success: true, data: result }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    console.error('❌ 注册测试失败:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * 测试登录功能
 */
export async function testLogin() {
  console.log('🧪 测试登录功能...')
  
  try {
    const result = await authService.loginByOpenId({
      openId: mockUserData.openId,
      password: mockUserData.password
    })
    
    console.log('✅ 登录测试通过:', result)
    return { success: true, data: result }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    console.error('❌ 登录测试失败:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * 测试登出功能
 */
export async function testLogout() {
  console.log('🧪 测试登出功能...')
  
  try {
    const result = await authService.logout()
    
    console.log('✅ 登出测试通过:', result)
    return { success: true, data: result }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    console.error('❌ 登出测试失败:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * 完整的API测试流程
 */
export async function runApiTests() {
  console.log('🚀 开始API测试...')
  
  const results = {
    register: await testRegister(),
    login: await testLogin(),
    logout: await testLogout()
  }
  
  console.log('📊 测试结果汇总:', results)
  
  const allPassed = Object.values(results).every(result => result.success)
  console.log(allPassed ? '🎉 所有测试通过!' : '⚠️ 部分测试失败')
  
  return results
}

// 在开发环境下，可以在控制台中运行测试
if (import.meta.env.DEV) {
  // 将测试函数挂载到全局对象，方便在控制台调用
  (globalThis as typeof globalThis & { apiTest?: object }).apiTest = {
    testRegister,
    testLogin,
    testLogout,
    runApiTests
  }
  
  console.log('🔧 开发模式: 可在控制台使用 apiTest.runApiTests() 运行测试')
} 