#!/bin/bash
# 前端构建后处理：修正平台注入的 {{appName}} / {{appDescription}} 占位符。
# 平台构建会把 <title> 换成 {{appName}}、description 换成 {{appDescription}}，
# 服务端模板引擎在无平台应用信息时会渲染成「妙搭应用」/ 空串。
# 这里改回品牌文案，避免首屏标题错显与 SEO 描述丢失。
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
HTML="$DIR/dist/client/client/index.html"

# 与 APP 端对齐的 slogan：连接 · 记录 · 同步（APP 端 v2.7.13 定稿）
DESC="知行同步助手 — 连接 · 记录 · 同步。客户分层 × 标签分组 × 跟进提醒，个人人脉关系管理工具。"

if [ -f "$HTML" ]; then
  sed -i 's|<title>{{appName}}</title>|<title>知行同步助手</title>|' "$HTML"
  # 用 | 作分隔符，避免描述里的 · 与 × 干扰
  sed -i "s|<meta name=\"description\" content=\"{{appDescription}}\">|<meta name=\"description\" content=\"$DESC\">|" "$HTML"
  echo "[postbuild] title 已修正为「知行同步助手」，description 已回填 APP 端 slogan"
else
  echo "[postbuild] 警告：未找到 $HTML，跳过标题修正" >&2
fi
