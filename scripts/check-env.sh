#!/usr/bin/env zsh

# Milky Way 环境检查脚本

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
JAVA_VERSION=17
NODE_VERSION=16

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

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_fail() {
    echo -e "${RED}[✗]${NC} $1"
}

# 检查系统信息
check_system_info() {
    log_step "检查系统信息..."
    
    echo "操作系统：$(uname -s)"
    echo "系统架构：$(uname -m)"
    echo "内核版本：$(uname -r)"
    echo "当前用户：$(whoami)"
    echo "当前目录：$(pwd)"
    echo ""
}

# 检查Git环境
check_git() {
    log_step "检查Git环境..."
    
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        log_success "Git已安装 (版本: $GIT_VERSION)"
        
        if [ -d "${PROJECT_DIR}/.git" ]; then
            log_success "Git仓库检测正常"
            
            # 检查远程仓库
            cd "$PROJECT_DIR"
            if git remote -v &> /dev/null; then
                log_success "Git远程仓库配置正常"
                git remote -v
            else
                log_warn "Git远程仓库未配置"
            fi
        else
            log_error "项目根目录不是Git仓库"
        fi
    else
        log_fail "Git未安装"
    fi
    echo ""
}

# 检查Java环境
check_java() {
    log_step "检查Java环境..."
    
    if command -v java &> /dev/null; then
        JAVA_VER=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
        log_success "Java已安装 (版本: $JAVA_VER)"
        
        if [ "$JAVA_VER" -ge "$JAVA_VERSION" ]; then
            log_success "Java版本满足要求 (需要: $JAVA_VERSION, 当前: $JAVA_VER)"
        else
            log_error "Java版本过低 (需要: $JAVA_VERSION, 当前: $JAVA_VER)"
        fi
        
        # 检查JAVA_HOME
        if [ -n "$JAVA_HOME" ]; then
            log_success "JAVA_HOME已设置: $JAVA_HOME"
        else
            log_warn "JAVA_HOME未设置"
        fi
    else
        log_fail "Java未安装"
    fi
    echo ""
}

# 检查Node.js环境
check_node() {
    log_step "检查Node.js环境..."
    
    if command -v node &> /dev/null; then
        NODE_VER=$(node --version | sed 's/v//')
        log_success "Node.js已安装 (版本: $NODE_VER)"
        
        NODE_MAJOR=$(echo $NODE_VER | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -ge "$NODE_VERSION" ]; then
            log_success "Node.js版本满足要求 (需要: $NODE_VERSION, 当前: $NODE_MAJOR)"
        else
            log_error "Node.js版本过低 (需要: $NODE_VERSION, 当前: $NODE_MAJOR)"
        fi
    else
        log_fail "Node.js未安装"
    fi
    
    # 检查npm
    if command -v npm &> /dev/null; then
        NPM_VER=$(npm --version)
        log_success "npm已安装 (版本: $NPM_VER)"
    else
        log_fail "npm未安装"
    fi
    echo ""
}

# 检查项目文件
check_project_files() {
    log_step "检查项目文件..."
    
    # 检查根目录文件
    if [ -f "${PROJECT_DIR}/prod.env" ]; then
        log_success "生产环境配置文件存在"
    else
        log_error "生产环境配置文件不存在: prod.env"
    fi
    
    # 检查后端文件
    if [ -f "${BACKEND_DIR}/build.gradle" ]; then
        log_success "后端Gradle配置文件存在"
    else
        log_error "后端Gradle配置文件不存在"
    fi
    
    if [ -f "${PROJECT_DIR}/gradlew" ]; then
        log_success "Gradle Wrapper存在"
    else
        log_error "Gradle Wrapper不存在"
    fi
    
    # 检查前端文件
    if [ -f "${FRONTEND_DIR}/package.json" ]; then
        log_success "前端package.json存在"
    else
        log_error "前端package.json不存在"
    fi
    
    if [ -f "${FRONTEND_DIR}/vite.config.ts" ]; then
        log_success "Vite配置文件存在"
    else
        log_error "Vite配置文件不存在"
    fi
    
    # 检查环境配置
    if [ -f "${FRONTEND_DIR}/.env.production" ]; then
        log_success "前端生产环境配置存在"
    else
        log_warn "前端生产环境配置不存在，部署时会自动创建"
    fi
    echo ""
}

# 检查网络连接
check_network() {
    log_step "检查网络连接..."
    
    # 检查互联网连接
    if ping -c 1 google.com &> /dev/null; then
        log_success "互联网连接正常"
    else
        log_warn "互联网连接可能异常"
    fi
    
    # 检查端口占用
    if lsof -i :8080 &> /dev/null; then
        log_warn "端口8080已被占用"
    else
        log_success "端口8080可用"
    fi
    
    if lsof -i :5173 &> /dev/null; then
        log_warn "端口5173已被占用"
    else
        log_success "端口5173可用"
    fi
    echo ""
}

# 检查必要工具
check_tools() {
    log_step "检查必要工具..."
    
    # 检查curl
    if command -v curl &> /dev/null; then
        log_success "curl已安装"
    else
        log_error "curl未安装"
    fi
    
    # 检查lsof
    if command -v lsof &> /dev/null; then
        log_success "lsof已安装"
    else
        log_error "lsof未安装"
    fi
    
    # 检查ps
    if command -v ps &> /dev/null; then
        log_success "ps已安装"
    else
        log_error "ps未安装"
    fi
    
    # 检查multitail (可选)
    if command -v multitail &> /dev/null; then
        log_success "multitail已安装 (可选)"
    else
        log_warn "multitail未安装 (可选，建议安装以获得更好的日志查看体验)"
    fi
    echo ""
}

# 检查权限
check_permissions() {
    log_step "检查文件权限..."
    
    # 检查脚本执行权限
    if [ -x "${PROJECT_DIR}/scripts/deploy.sh" ]; then
        log_success "部署脚本有执行权限"
    else
        log_warn "部署脚本无执行权限，正在设置..."
        chmod +x "${PROJECT_DIR}/scripts/deploy.sh"
    fi
    
    # 检查scripts目录权限
    if [ -d "${PROJECT_DIR}/scripts" ]; then
        log_success "scripts目录存在"
        
        # 设置脚本执行权限
        find "${PROJECT_DIR}/scripts" -name "*.sh" -type f -exec chmod +x {} \;
        log_success "scripts目录下的脚本已设置执行权限"
    else
        log_error "scripts目录不存在"
    fi
    echo ""
}

# 生成环境报告
generate_report() {
    log_step "生成环境检查报告..."
    
    REPORT_FILE="${PROJECT_DIR}/environment-check-report.txt"
    
    cat > "$REPORT_FILE" << EOF
===============================================
Milky Way 环境检查报告
生成时间: $(date '+%Y-%m-%d %H:%M:%S')
===============================================

系统信息:
- 操作系统: $(uname -s)
- 系统架构: $(uname -m)
- 内核版本: $(uname -r)
- 当前用户: $(whoami)

软件版本:
- Git: $(git --version 2>/dev/null || echo "未安装")
- Java: $(java -version 2>&1 | head -1 2>/dev/null || echo "未安装")
- Node.js: $(node --version 2>/dev/null || echo "未安装")
- npm: $(npm --version 2>/dev/null || echo "未安装")

项目文件:
- 生产环境配置: $([ -f "$PROJECT_DIR/prod.env" ] && echo "存在" || echo "不存在")
- 后端Gradle配置: $([ -f "$BACKEND_DIR/build.gradle" ] && echo "存在" || echo "不存在")
- 前端package.json: $([ -f "$FRONTEND_DIR/package.json" ] && echo "存在" || echo "不存在")

网络状态:
- 端口8080: $(lsof -i :8080 &>/dev/null && echo "被占用" || echo "可用")
- 端口5173: $(lsof -i :5173 &>/dev/null && echo "被占用" || echo "可用")

===============================================
EOF
    
    log_success "环境检查报告已生成: $REPORT_FILE"
}

# 主执行流程
main() {
    log_info "开始执行 Milky Way 环境检查..."
    echo ""
    
    # 执行各项检查
    check_system_info
    check_git
    check_java
    check_node
    check_project_files
    check_network
    check_tools
    check_permissions
    
    # 生成报告
    generate_report
    
    log_info "环境检查完成！"
}

# 执行主函数
main "$@" 