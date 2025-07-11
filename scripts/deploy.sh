#!/usr/bin/env zsh

# Milky Way 一键部署脚本
# 作者：AI Assistant
# 功能：拉取GitHub代码并部署前后端服务

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置参数
PROJECT_DIR="$(cd "$(dirname "${(%):-%x}")/.." && pwd)"
BACKEND_DIR="${PROJECT_DIR}/milky-way-core"
FRONTEND_DIR="${PROJECT_DIR}/milky-way-page"
BACKEND_PORT=8080
FRONTEND_PORT=5173
JAVA_VERSION=17

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查系统依赖
check_dependencies() {
    log_step "检查系统依赖..."
    
    # 检查Git
    if ! command -v git &> /dev/null; then
        log_error "Git未安装，请先安装Git"
        exit 1
    fi
    
    # 检查Java
    if ! command -v java &> /dev/null; then
        log_error "Java未安装，请先安装Java ${JAVA_VERSION}"
        exit 1
    fi
    
    # 检查Java版本
    JAVA_VER=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
    if [ "$JAVA_VER" -lt "$JAVA_VERSION" ]; then
        log_error "Java版本过低，当前版本：$JAVA_VER，需要版本：$JAVA_VERSION"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装，请先安装npm"
        exit 1
    fi
    
    log_info "系统依赖检查完成"
}

# 拉取代码
pull_code() {
    log_step "拉取GitHub代码..."
    
    # 检查是否是Git仓库
    if [ ! -d ".git" ]; then
        log_error "当前目录不是Git仓库"
        exit 1
    fi
    
    # 保存当前更改
    if ! git diff --quiet --exit-code; then
        log_warn "检测到未提交的更改，正在暂存..."
        git add -A
        git stash push -m "自动部署前的暂存 - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # 拉取最新代码
    log_info "拉取最新代码..."
    git pull origin main
    
    log_info "代码拉取完成"
}

# 设置环境变量
setup_environment() {
    log_step "设置环境变量..."
    
    # 检查环境配置文件
    log_info "加载生产环境配置..."
    if [ -f "${PROJECT_DIR}/prod.env" ]; then
        source "${PROJECT_DIR}/prod.env"
    else
        log_error "找不到 prod.env 文件：${PROJECT_DIR}/prod.env"
        exit 1
    fi
    
    # 设置Spring Profile
    export SPRING_PROFILES_ACTIVE=prod
    
    # 检查前端环境文件
    if [ ! -f "${FRONTEND_DIR}/.env.production" ]; then
        log_warn "前端生产环境配置文件不存在，创建默认配置..."
        cat > "${FRONTEND_DIR}/.env.production" << EOF
# 生产环境配置
VITE_NODE_ENV=production
VITE_APP_NAME=MilkyWay
VITE_APP_VERSION=1.0.0

# API 和 WebSocket 配置
VITE_API_BASE_URL=https://api.pilili.xy
VITE_WS_URL=wss://api.pilili.xy/ws

# HTTPS 配置（nginx 处理 SSL 终止，前端不需要证书）
VITE_HTTPS_ENABLED=false
VITE_SERVER_HOST=0.0.0.0
VITE_SERVER_PORT=5173
EOF
    fi
    
    log_info "环境变量设置完成"
}

# 构建后端
build_backend() {
    log_step "构建后端服务..."
    
    cd "$BACKEND_DIR"
    
    # 清理之前的构建
    log_info "清理构建缓存..."
    ./gradlew clean
    
    # 构建项目
    log_info "编译后端项目..."
    ./gradlew build -x test
    
    log_info "后端构建完成"
    cd "$PROJECT_DIR"
}

# 构建前端
build_frontend() {
    log_step "构建前端服务..."
    
    cd "$FRONTEND_DIR"
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm install
    
    # 构建项目
    log_info "构建前端项目..."
    npm run build:prod
    
    log_info "前端构建完成"
    cd "$PROJECT_DIR"
}

# 停止现有服务
stop_services() {
    log_step "停止现有服务..."
    
    # 停止后端服务
    if pgrep -f "milky-way" > /dev/null; then
        log_info "停止后端服务..."
        pkill -f "milky-way" || true
        sleep 3
    fi
    
    # 停止前端服务
    if pgrep -f "vite.*preview" > /dev/null; then
        log_info "停止前端服务..."
        pkill -f "vite.*preview" || true
        sleep 3
    fi
    
    log_info "服务停止完成"
}

# 启动后端服务
start_backend() {
    log_step "启动后端服务..."
    
    cd "$BACKEND_DIR"
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动后端服务
    log_info "启动后端服务（端口：${BACKEND_PORT}）..."
    nohup java -jar build/libs/milky-way-core-*.jar \
        --spring.profiles.active=prod \
        --server.port=${BACKEND_PORT} \
        > logs/backend.log 2>&1 &
    
    BACKEND_PID=$!
    echo $BACKEND_PID > logs/backend.pid
    
    # 等待服务启动
    log_info "等待后端服务启动..."
    sleep 10
    
    # 检查服务状态
    if ps -p $BACKEND_PID > /dev/null; then
        log_info "后端服务启动成功 (PID: $BACKEND_PID)"
    else
        log_error "后端服务启动失败，请检查日志：${BACKEND_DIR}/logs/backend.log"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
}

# 启动前端服务
start_frontend() {
    log_step "启动前端服务..."
    
    cd "$FRONTEND_DIR"
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动前端服务
    log_info "启动前端服务（端口：${FRONTEND_PORT}）..."
    nohup npm run preview:prod > logs/frontend.log 2>&1 &
    
    FRONTEND_PID=$!
    echo $FRONTEND_PID > logs/frontend.pid
    
    # 等待服务启动
    log_info "等待前端服务启动..."
    sleep 5
    
    # 检查服务状态
    if ps -p $FRONTEND_PID > /dev/null; then
        log_info "前端服务启动成功 (PID: $FRONTEND_PID)"
    else
        log_error "前端服务启动失败，请检查日志：${FRONTEND_DIR}/logs/frontend.log"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
}

# 健康检查
health_check() {
    log_step "执行健康检查..."
    
    # 检查后端健康状态
    log_info "检查后端服务..."
    for i in {1..30}; do
        if curl -f -s "https://api.pilili.xyz/actuator/health" > /dev/null 2>&1; then
            log_info "后端服务健康检查通过"
            break
        fi
        
        if [ $i -eq 30 ]; then
            log_error "后端服务健康检查失败"
            exit 1
        fi
        
        sleep 2
    done
    
    # 检查前端服务
    log_info "检查前端服务..."
    for i in {1..15}; do
        if curl -f -s "http://www.pilili.xyz" > /dev/null 2>&1; then
            log_info "前端服务健康检查通过"
            break
        fi
        
        if [ $i -eq 15 ]; then
            log_error "前端服务健康检查失败"
            exit 1
        fi
        
        sleep 2
    done
    
    log_info "健康检查完成"
}

# 显示部署信息
show_deployment_info() {
    log_step "部署完成！"
    
    echo ""
    echo "==============================================="
    echo "          Milky Way 部署信息"
    echo "==============================================="
    echo "后端服务："
    echo "  - 地址：https://api.pilili.xyz"
    echo "  - API文档：https://api.pilili.xyz/swagger-ui.html"
    echo "  - 日志文件：${BACKEND_DIR}/logs/backend.log"
    echo "  - PID文件：${BACKEND_DIR}/logs/backend.pid"
    echo ""
    echo "前端服务："
    echo "  - 地址：https://www.pilili.xyz"
    echo "  - 日志文件：${FRONTEND_DIR}/logs/frontend.log"
    echo "  - PID文件：${FRONTEND_DIR}/logs/frontend.pid"
    echo ""
    echo "管理命令："
    echo "  - 查看服务状态：./scripts/status.sh"
    echo "  - 停止服务：./scripts/stop.sh"
    echo "  - 查看日志：./scripts/logs.sh"
    echo "  - 重启服务：./scripts/restart.sh"
    echo "==============================================="
}

# 主执行流程
main() {
    log_info "开始执行 Milky Way 一键部署脚本..."
    
    # 检查依赖
    check_dependencies
    
    # 拉取代码
    pull_code
    
    # 设置环境
    setup_environment
    
    # 停止现有服务
    stop_services
    
    # 构建服务
    build_backend
    build_frontend
    
    # 启动服务
    start_backend
    start_frontend
    
    # 健康检查
    health_check
    
    # 显示部署信息
    show_deployment_info
    
    log_info "部署完成！"
}

# 捕获退出信号
trap 'log_error "部署过程中断"' INT TERM

# 执行主函数
main "$@" 