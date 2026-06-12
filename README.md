# TK Content Growth OS

TikTok 饰品内容增长工作台，本地网页 MVP。

## 功能范围

- Vite + React + TypeScript 中文后台界面
- Express 本地 API
- Prisma + SQLite 本地数据库
- 地区、账号、产品、视频、对标、爆款模板、LibTV、内容日历 CRUD
- 视频数据基础复盘判断
- 内容生成器模拟输出、一键复制、保存到视频库、保存为模板
- 后续预留 CSV 导入、图表分析和桌面打包
- DeepSeek API 内容生成接口

## 启动

当前机器的 Node 没有加入 PATH 时，可以直接使用 `D:\node\npm.cmd` 替代 `npm`。

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

打开：

```text
http://localhost:5173/dashboard
```

本地 API：

```text
http://localhost:8787/api/health
```

## GitHub 上传工具

如果电脑没有安装 Git 或 GitHub CLI，可以双击运行：

```text
install-github-tools.cmd
```

脚本会先检查 `git` 和 `gh` 是否已存在；缺少时优先使用 `winget` 安装，没有 `winget` 时会从 GitHub 官方 release 下载 Git for Windows 和 GitHub CLI 安装包。

## DeepSeek API

在 `.env` 中填写：

```text
DEEPSEEK_API_KEY="你的 DeepSeek Key"
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-v4-flash"
```

然后重启本地服务。内容生成器会优先调用 DeepSeek；没有配置 Key 时仍可使用本地模拟输出。

## 数据库

SQLite 数据库文件会生成在：

```text
prisma/dev.db
```

如需重新初始化：

```bash
npm run db:push
npm run db:seed
```

## 页面

- `/dashboard` 总览
- `/regions` 地区管理
- `/accounts` 账号管理
- `/products` 产品库
- `/videos` 视频内容库
- `/analytics` 数据复盘
- `/competitors` 对标账号分析
- `/generator` 内容生成器
- `/templates` 爆款模板库
- `/libtv` LibTV 工作流
- `/calendar` 内容日历
- `/settings` 设置

## MVP 注意事项

第一版不做 TikTok 自动爬虫、不登录 TikTok、不连接线上服务器。所有数据都通过本地网页录入并保存到 SQLite；内容生成器支持本地规则模拟，也可以配置 DeepSeek API 生成。
