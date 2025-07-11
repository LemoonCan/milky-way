#!/usr/bin/env zsh

# Milky Way 日志查看脚本

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

# 显示使用说明
show_usage() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -b, --backend     查看后端日志"
    echo "  -f, --frontend    查看前端日志"
    echo "  -a, --all         查看所有日志"
    echo "  -t, --tail        实时跟踪日志"
    echo "  -n, --lines NUM   显示最后N行日志 (默认: 100)"
    echo "  -h, --help        显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 -b             查看后端日志"
    echo "  $0 -f -t          实时跟踪前端日志"
    echo "  $0 -a -n 50       查看所有日志的最后50行"
}

# 查看后端日志
show_backend_logs() {
    local tail_mode=$1
    local lines=$2
    
    if [ -f "${BACKEND_DIR}/logs/backend.log" ]; then
        log_step "查看后端日志..."
        echo "=================================================="
        echo "后端日志 (${BACKEND_DIR}/logs/backend.log)"
        echo "=================================================="
        
        if [ "$tail_mode" = "true" ]; then
            tail -f "${BACKEND_DIR}/logs/backend.log"
        else
            tail -n "$lines" "${BACKEND_DIR}/logs/backend.log"
        fi
    else
        log_error "后端日志文件不存在：${BACKEND_DIR}/logs/backend.log"
    fi
}

# 查看前端日志
show_frontend_logs() {
    local tail_mode=$1
    local lines=$2
    
    if [ -f "${FRONTEND_DIR}/logs/frontend.log" ]; then
        log_step "查看前端日志..."
        echo "=================================================="
        echo "前端日志 (${FRONTEND_DIR}/logs/frontend.log)"
        echo "=================================================="
        
        if [ "$tail_mode" = "true" ]; then
            tail -f "${FRONTEND_DIR}/logs/frontend.log"
        else
            tail -n "$lines" "${FRONTEND_DIR}/logs/frontend.log"
        fi
    else
        log_error "前端日志文件不存在：${FRONTEND_DIR}/logs/frontend.log"
    fi
}

# 查看所有日志
show_all_logs() {
    local tail_mode=$1
    local lines=$2
    
    if [ "$tail_mode" = "true" ]; then
        log_step "实时跟踪所有日志..."
        
        # 使用multitail或者分屏显示
        if command -v multitail &> /dev/null; then
            if [ -f "${BACKEND_DIR}/logs/backend.log" ] && [ -f "${FRONTEND_DIR}/logs/frontend.log" ]; then
                multitail -s 2 "${BACKEND_DIR}/logs/backend.log" "${FRONTEND_DIR}/logs/frontend.log"
            elif [ -f "${BACKEND_DIR}/logs/backend.log" ]; then
                tail -f "${BACKEND_DIR}/logs/backend.log"
            elif [ -f "${FRONTEND_DIR}/logs/frontend.log" ]; then
                tail -f "${FRONTEND_DIR}/logs/frontend.log"
            else
                log_error "没有找到日志文件"
            fi
        else
            log_warn "建议安装 multitail 以获得更好的多日志查看体验"
            log_info "fallback到后端日志..."
            show_backend_logs "$tail_mode" "$lines"
        fi
    else
        show_backend_logs "$tail_mode" "$lines"
        echo ""
        show_frontend_logs "$tail_mode" "$lines"
    fi
}

# 主执行流程
main() {
    local backend_only=false
    local frontend_only=false
    local all_logs=false
    local tail_mode=false
    local lines=100
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--backend)
                backend_only=true
                shift
                ;;
            -f|--frontend)
                frontend_only=true
                shift
                ;;
            -a|--all)
                all_logs=true
                shift
                ;;
            -t|--tail)
                tail_mode=true
                shift
                ;;
            -n|--lines)
                lines="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # 如果没有指定任何选项，显示所有日志
    if [ "$backend_only" = false ] && [ "$frontend_only" = false ] && [ "$all_logs" = false ]; then
        all_logs=true
    fi
    
    # 执行对应的日志查看功能
    if [ "$backend_only" = true ]; then
        show_backend_logs "$tail_mode" "$lines"
    elif [ "$frontend_only" = true ]; then
        show_frontend_logs "$tail_mode" "$lines"
    elif [ "$all_logs" = true ]; then
        show_all_logs "$tail_mode" "$lines"
    fi
}

# 执行主函数
main "$@" 