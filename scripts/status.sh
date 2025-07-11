#!/bin/bash

# Milky Way 服务状态检查脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置参数
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
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

# 检查后端服务状态
check_backend_status() {
    log_step "检查后端服务状态..."
    
    # 检查进程
    if [ -f "${BACKEND_DIR}/logs/backend.pid" ]; then
        BACKEND_PID=$(cat "${BACKEND_DIR}/logs/backend.pid")
        
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            log_info "后端服务运行中 (PID: $BACKEND_PID)"
            
            # 检查端口
            if lsof -i :${BACKEND_PORT} > /dev/null 2>&1; then
                log_info "后端服务端口 ${BACKEND_PORT} 正在监听"
            else
                log_warn "后端服务端口 ${BACKEND_PORT} 未监听"
            fi
            
            # 检查健康状态
            if curl -f -s "http://localhost:${BACKEND_PORT}/actuator/health" > /dev/null 2>&1; then
                log_info "后端服务健康检查通过"
            else
                log_warn "后端服务健康检查失败"
            fi
        else
            log_error "后端服务进程不存在"
        fi
    else
        log_error "后端服务PID文件不存在"
    fi
}

# 检查前端服务状态
check_frontend_status() {
    log_step "检查前端服务状态..."
    
    # 检查进程
    if [ -f "${FRONTEND_DIR}/logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat "${FRONTEND_DIR}/logs/frontend.pid")
        
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            log_info "前端服务运行中 (PID: $FRONTEND_PID)"
            
            # 检查端口
            if lsof -i :${FRONTEND_PORT} > /dev/null 2>&1; then
                log_info "前端服务端口 ${FRONTEND_PORT} 正在监听"
            else
                log_warn "前端服务端口 ${FRONTEND_PORT} 未监听"
            fi
            
            # 检查服务响应
            if curl -f -s "http://localhost:${FRONTEND_PORT}" > /dev/null 2>&1; then
                log_info "前端服务响应正常"
            else
                log_warn "前端服务响应异常"
            fi
        else
            log_error "前端服务进程不存在"
        fi
    else
        log_error "前端服务PID文件不存在"
    fi
}

# 显示服务概览
show_service_overview() {
    echo ""
    echo "==============================================="
    echo "          Milky Way 服务概览"
    echo "==============================================="
    
    # 系统信息
    echo "系统信息："
    echo "  - 当前时间：$(date '+%Y-%m-%d %H:%M:%S')"
    echo "  - 系统负载：$(uptime | awk -F'load average:' '{print $2}' | sed 's/^[ \t]*//')"
    echo "  - 内存使用：$(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
    echo "  - 磁盘使用：$(df -h / | awk 'NR==2{print $5}')"
    echo ""
    
    # 服务状态
    echo "服务状态："
    
    # 后端服务
    if [ -f "${BACKEND_DIR}/logs/backend.pid" ]; then
        BACKEND_PID=$(cat "${BACKEND_DIR}/logs/backend.pid")
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo "  - 后端服务：🟢 运行中"
        else
            echo "  - 后端服务：🔴 已停止"
        fi
    else
        echo "  - 后端服务：🔴 未启动"
    fi
    
    # 前端服务
    if [ -f "${FRONTEND_DIR}/logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat "${FRONTEND_DIR}/logs/frontend.pid")
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo "  - 前端服务：🟢 运行中"
        else
            echo "  - 前端服务：🔴 已停止"
        fi
    else
        echo "  - 前端服务：🔴 未启动"
    fi
    
    echo ""
    echo "服务地址："
    echo "  - 后端服务：http://localhost:${BACKEND_PORT}"
    echo "  - 前端服务：http://localhost:${FRONTEND_PORT}"
    echo "  - API文档：http://localhost:${BACKEND_PORT}/swagger-ui.html"
    echo "==============================================="
}

# 主执行流程
main() {
    log_info "检查 Milky Way 服务状态..."
    
    # 检查服务状态
    check_backend_status
    check_frontend_status
    
    # 显示服务概览
    show_service_overview
}

# 执行主函数
main "$@" 