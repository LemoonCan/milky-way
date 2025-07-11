#!/usr/bin/env zsh

# Milky Way 服务重启脚本

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

# 主执行流程
main() {
    log_info "开始重启 Milky Way 服务..."
    
    # 停止服务
    log_step "停止现有服务..."
    "${PROJECT_DIR}/scripts/stop.sh"
    
    # 等待服务完全停止
    log_info "等待服务完全停止..."
    sleep 3
    
    # 设置环境变量
    if [ -f "${PROJECT_DIR}/prod.env" ]; then
        log_info "加载环境变量..."
        export $(cat "${PROJECT_DIR}/prod.env" | grep -v '^#' | xargs)
        export SPRING_PROFILES_ACTIVE=prod
    fi
    
    # 启动后端服务
    log_step "启动后端服务..."
    cd "$BACKEND_DIR"
    mkdir -p logs
    
    nohup java -jar build/libs/milky-way-core-*.jar \
        --spring.profiles.active=prod \
        --server.port=${BACKEND_PORT} \
        > logs/backend.log 2>&1 &
    
    BACKEND_PID=$!
    echo $BACKEND_PID > logs/backend.pid
    log_info "后端服务启动中 (PID: $BACKEND_PID)"
    
    # 启动前端服务
    log_step "启动前端服务..."
    cd "$FRONTEND_DIR"
    mkdir -p logs
    
    nohup npm run preview:prod > logs/frontend.log 2>&1 &
    
    FRONTEND_PID=$!
    echo $FRONTEND_PID > logs/frontend.pid
    log_info "前端服务启动中 (PID: $FRONTEND_PID)"
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    log_step "检查服务状态..."
    "${PROJECT_DIR}/scripts/status.sh"
    
    log_info "服务重启完成！"
}

# 执行主函数
main "$@" 