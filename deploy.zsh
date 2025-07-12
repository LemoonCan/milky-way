#!/usr/bin/env zsh

# Milky Way 一键部署脚本（项目统一放在 /opt/projects/milky-way，部署时自动上传 prod.env）

set -e

# === 颜色 ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# === 本地路径 ===
PROJECT_DIR=$(pwd)
BACKEND_DIR=milky-way-core
FRONTEND_DIR=milky-way-page
BACKEND_PORT=8080
FRONTEND_PORT=3000
JAVA_VERSION=17

# === 服务器配置 ===
SERVER_NAME=lemoon-aliyun
REMOTE_PROJECT_DIR=/root/projects/milky-way
REMOTE_BACKEND_DIR=${REMOTE_PROJECT_DIR}/backend
REMOTE_FRONTEND_DIR=${REMOTE_PROJECT_DIR}/frontend

ENV_FILE=prod.env

# === 日志函数 ===
log_info()  { echo -e "${GREEN}[INFO]${NC} $1" }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1" }
log_error() { echo -e "${RED}[ERROR]${NC} $1" }
log_step()  { echo -e "${BLUE}[STEP]${NC} $1" }

check_dependencies() {
    log_step "检查依赖..."
    for cmd in git java node npm curl scp ssh; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd 未安装"
            exit 1
        fi
    done
    JAVA_VER=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
    if [ "$JAVA_VER" -lt "$JAVA_VERSION" ]; then
        log_error "Java版本过低：当前 $JAVA_VER，要求 $JAVA_VERSION+"
        exit 1
    fi
    log_info "依赖检查通过"
}

setup_environment() {
    log_step "设置环境变量..."
    export SPRING_PROFILES_ACTIVE=prod
    ls -l ${FRONTEND_DIR}/.env.production
    [[ -f "${FRONTEND_DIR}/.env.production" ]] || { log_error "缺少前端 .env.production 文件"; exit 1; }
    ls -l ${ENV_FILE}
    [[ -f "${ENV_FILE}" ]] || { log_error "缺少 prod.env 配置文件"; exit 1; }
    log_info "环境变量检查通过"
}

build_backend() {
    log_step "构建后端..."
    ./gradlew clean
    ./gradlew build -x test
    log_info "后端构建完成"
}

build_frontend() {
    log_step "构建前端..."
    cd $FRONTEND_DIR
    npm install
    npm run build:prod
    log_info "前端构建完成"
    cd $PROJECT_DIR
}

upload_artifacts() {
    log_step "上传构建产物和配置文件到服务器..."

    ssh $SERVER_NAME << EOF
        set -e
        mkdir -p $REMOTE_BACKEND_DIR
        mkdir -p $REMOTE_FRONTEND_DIR
EOF

    log_info "上传后端 JAR 包..."
    pwd
    ls -l "$BACKEND_DIR/build/libs/milky-way-core-"*.jar
    scp "$BACKEND_DIR/build/libs/milky-way-core-"*.jar \
        $SERVER_NAME:$REMOTE_BACKEND_DIR/ || { log_error "后端上传失败"; exit 1; }

    log_info "上传 prod.env 配置文件..."
    scp "$ENV_FILE" $SERVER_NAME:$REMOTE_BACKEND_DIR/$ENV_FILE || { log_error "prod.env 上传失败"; exit 1; }

    log_info "上传前端构建文件..."
    pwd
    ls -l milky-way-page/dist/*
    scp -r "$FRONTEND_DIR/dist" \
        $SERVER_NAME:$REMOTE_FRONTEND_DIR || { log_error "前端上传失败"; exit 1; }

    log_info "上传完成"
}

deploy_remote() {
    log_step "远程部署服务..."

    ssh $SERVER_NAME << EOF
        set -e
        echo "🛑 停止旧服务..."
        pkill -f milky-way || true
        pkill -f "npx serve" || true
        sleep 2

        echo "🚀 启动后端..."
        mkdir -p $REMOTE_BACKEND_DIR/logs
        pwd
        cd $REMOTE_BACKEND_DIR
        source $ENV_FILE
        nohup java -jar $REMOTE_BACKEND_DIR/milky-way-core-*.jar \
            --spring.profiles.active=prod \
            --server.port=$BACKEND_PORT \
            > $REMOTE_BACKEND_DIR/logs/backend.log 2>&1 &
        echo \$! > $REMOTE_BACKEND_DIR/logs/backend.pid

        echo "🚀 启动前端..."
        mkdir -p $REMOTE_FRONTEND_DIR/logs
        cd $REMOTE_FRONTEND_DIR
        nohup npx serve -s dist -p $FRONTEND_PORT > logs/frontend.log 2>&1 &
        echo \$! > logs/frontend.pid

        echo "✅ 部署完成"
EOF
}

show_deployment_info() {
    log_step "部署信息："
    echo ""
    echo "=================================================="
    echo "🚀 Milky Way 已部署至云端：$REMOTE_PROJECT_DIR"
    echo "🌐 后端：https://api.pilili.xyz"
    echo "🌐 Swagger：https://api.pilili.xyz/swagger-ui.html"
    echo "🧾 后端日志：$REMOTE_BACKEND_DIR/logs/backend.log"
    echo ""
    echo "🌐 前端：https://www.pilili.xyz"
    echo "🧾 前端日志：$REMOTE_FRONTEND_DIR/logs/frontend.log"
    echo ""
    echo "🔧 管理命令："
    echo "  - 查看状态：ssh $SERVER_USER@$SERVER_IP 'ps -ef | grep milky'"
    echo "  - 停止服务：ssh $SERVER_USER@$SERVER_IP 'pkill -f milky-way'"
    echo "  - 查看日志：ssh $SERVER_USER@$SERVER_IP 'tail -f /path/to/log'"
    echo "=================================================="
}


main(){
  if [[ $# -eq 0 ]]; then
      build_deploy
    else
      only_deploy
  fi
}

build_deploy() {
    log_info "🚀 开始 Milky Way 一键部署..."
    check_dependencies
    setup_environment
    build_backend
    build_frontend
    upload_artifacts
    deploy_remote
    show_deployment_info
    log_info "✅ 部署流程已完成"
}

only_deploy(){
    deploy_remote
    show_deployment_info
    log_info "✅ 部署流程已完成"
}

trap 'log_error "部署中断"' INT TERM

main "$@"
