# Narcissus Blog

基于 React + NestJS + Prisma + SQLite 的前后端分离博客系统。

## 目录

- `apps/client`：前台 + 后台管理前端
- `apps/server`：后端 API
- `packages/shared`：前后端共享类型
- `docker/`：后端容器化部署
- `nginx/`：Nginx 反代配置

## 快速开始

1. 安装依赖

```bash
pnpm install
```

2. 初始化数据库

```bash
pnpm --filter @narcissus/server prisma:generate
pnpm --filter @narcissus/server prisma:migrate
```

3. 配置环境变量

```bash
cp apps/server/.env.example apps/server/.env
```

4. 启动开发环境

```bash
pnpm dev
```

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3000/api`
- Swagger：`http://localhost:3000/swagger`

## 默认管理员

首次启动会自动初始化管理员账号（可通过环境变量覆盖）：

- 用户名：`admin`
- 密码：`123456`
