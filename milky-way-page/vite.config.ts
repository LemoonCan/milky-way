import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  const env = loadEnv(mode, process.cwd(), '')
  
  // 检查证书文件是否存在
  const checkCertFile = (filePath: string) => {
    const fullPath = path.resolve(__dirname, filePath)
    return fs.existsSync(fullPath) ? fullPath : null
  }
  
  // 获取HTTPS配置
  const getHttpsConfig = () => {
    const httpsEnabled = env.VITE_HTTPS_ENABLED === 'true'
    if (!httpsEnabled) return undefined
    
    const keyPath = checkCertFile(env.VITE_HTTPS_KEY_PATH)
    const certPath = checkCertFile(env.VITE_HTTPS_CERT_PATH)
    
    if (!keyPath || !certPath) {
      console.warn(`HTTPS证书文件不存在: ${env.VITE_HTTPS_KEY_PATH}, ${env.VITE_HTTPS_CERT_PATH}`)
      return undefined
    }
    
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }

  // 获取允许的主机列表
  const getAllowedHosts = () => {
    const allowedHosts = env.VITE_ALLOWED_HOSTS
    if (!allowedHosts) {
      // 默认添加常用的主机
      return ['localhost', '127.0.0.1']
    }
    
    // 从环境变量中解析主机列表（用逗号分隔）
    const hosts = allowedHosts.split(',').map(host => host.trim()).filter(host => host)
    
    // 确保包含默认主机
    if (!hosts.includes('www.pilili.xyz')) {
      hosts.push('www.pilili.xyz')
    }
    
    return hosts
  }
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      https: getHttpsConfig(),
      host: env.VITE_SERVER_HOST || '0.0.0.0',
      port: parseInt(env.VITE_SERVER_PORT) || 5173,
      open: mode === 'development',
    },
    preview: {
      https: getHttpsConfig(),
      host: env.VITE_SERVER_HOST || '0.0.0.0',
      port: parseInt(env.VITE_SERVER_PORT) || 4173,
      allowedHosts: getAllowedHosts(),
    },
    // 构建配置
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
    },
  }
})
