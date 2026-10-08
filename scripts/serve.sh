#!/bin/bash
# 知行朋友圈 · 生产启动脚本
# 作用：先确保 PostgreSQL 活着，再拉起 NestJS 服务。
# 背景：沙箱休眠/恢复后独立进程会被冻结，必须由平台守护的应用进程把 PG 一起拉起。

cd "$(dirname "$0")/.." || exit 1
set -a
. ./.env
set +a

# 1. 数据库守护
if ! pg_isready -h 127.0.0.1 -p 5432 -q; then
  echo "[boot] PostgreSQL 未响应，尝试启动..."
  service postgresql start
  for i in $(seq 1 30); do
    pg_isready -h 127.0.0.1 -p 5432 -q && break
    sleep 1
  done
fi
pg_isready -h 127.0.0.1 -p 5432 || {
  echo "[boot] PostgreSQL 启动失败"
  exit 1
}
echo "[boot] PostgreSQL ready"

# 2. 拉起应用
exec node dist/server/main.js
