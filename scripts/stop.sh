#!/usr/bin/env zsh

# Milky Way 服务停止脚本

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

# 停止后端服务
stop_backend() {
    log_step "停止后端服务..."
    
    if [ -f "${BACKEND_DIR}/logs/backend.pid" ]; then
        BACKEND_PID=$(cat "${BACKEND_DIR}/logs/backend.pid")
        
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            log_info "正在停止后端服务 (PID: $BACKEND_PID)..."
            
            # 优雅关闭
            kill $BACKEND_PID
            
            # 等待进程结束
            for i in {1..30}; do
                if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
                    log_info "后端服务已停止"
                    break
                fi
                
                if [ $i -eq 30 ]; then
                    log_warn "后端服务未能优雅停止，强制结束..."
                    kill -9 $BACKEND_PID
                    sleep 2
                    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
                        log_info "后端服务已强制停止"
                    else
                        log_error "无法停止后端服务"
                    fi
                fi
                
                sleep 1
            done
        else
            log_warn "后端服务进程不存在"
        fi
        
        # 删除PID文件
        rm -f "${BACKEND_DIR}/logs/backend.pid"
    else
        log_warn "后端服务PID文件不存在"
    fi
}

# 停止前端服务
stop_frontend() {
    log_step "停止前端服务..."
    
    if [ -f "${FRONTEND_DIR}/logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat "${FRONTEND_DIR}/logs/frontend.pid")
        
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            log_info "正在停止前端服务 (PID: $FRONTEND_PID)..."
            
            # 优雅关闭
            kill $FRONTEND_PID
            
            # 等待进程结束
            for i in {1..15}; do
                if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
                    log_info "前端服务已停止"
                    break
                fi
                
                if [ $i -eq 15 ]; then
                    log_warn "前端服务未能优雅停止，强制结束..."
                    kill -9 $FRONTEND_PID
                    sleep 2
                    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
                        log_info "前端服务已强制停止"
                    else
                        log_error "无法停止前端服务"
                    fi
                fi
                
                sleep 1
            done
        else
            log_warn "前端服务进程不存在"
        fi
        
        # 删除PID文件
        rm -f "${FRONTEND_DIR}/logs/frontend.pid"
    else
        log_warn "前端服务PID文件不存在"
    fi
}

# 清理相关进程
cleanup_processes() {
    log_step "清理相关进程..."
    
    # 清理后端进程
    if pgrep -f "milky-way" > /dev/null; then
        log_info "清理后端相关进程..."
        pkill -f "milky-way" || true
    fi
    
    # 清理前端进程
    if pgrep -f "vite.*preview" > /dev/null; then
        log_info "清理前端相关进程..."
        pkill -f "vite.*preview" || true
    fi
    
    sleep 2
    log_info "进程清理完成"
}

# 主执行流程
main() {
    log_info "开始停止 Milky Way 服务..."
    
    # 停止服务
    stop_backend
    stop_frontend
    
    # 清理进程
    cleanup_processes
    
    log_info "所有服务已停止"
}

# 执行主函数
main "$@" 