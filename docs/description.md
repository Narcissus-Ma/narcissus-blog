## 博客搭建

### 1. 整体架构概览

```mermaid
graph TD
    User[用户] -->|HTTPS | CF[Cloudflare Pages (前端)]
    User -->|HTTPS | VPS[VPS (后端 API)]
    CF -->|API 请求 | VPS
    VPS -->|读写 | DB[(SQLite 数据库)]
    VPS -->|上传/读取 | OSS[对象存储 (R2/OSS)]
    VPS -->|反向代理 | Nginx[Nginx + SSL]
```

### 2. 前端技术栈 (Cloudflare Pages)

_部署在 Cloudflare 边缘网络，零服务器成本，全球加速。_

| 模块              | 技术选型                        | 理由                                                           |
| :---------------- | :------------------------------ | :------------------------------------------------------------- |
| **核心框架**      | **React 18+**                   | 你熟悉的技术栈，生态丰富。                                     |
| **开发语言**      | **TypeScript**                  | 类型安全，与后端 NestJS 共享类型定义。                         |
| **构建工具**      | **Vite**                        | 极速启动和构建，优于 Webpack。                                 |
| **UI 组件库**     | **Ant Design 5**                | 企业级 UI，组件丰富，适合后台管理。                            |
| **样式方案**      | **Less + CSS Modules**          | 你熟悉的 Less，配合 CSS Modules 避免全局污染。                 |
| **状态管理**      | **Zustand**                     | 比 Redux 更轻量，API 简单，适合中小型项目。                    |
| **数据请求**      | **Axios + React Query**         | React Query 处理服务端状态（缓存、重试、加载），减少手写逻辑。 |
| **路由管理**      | **React Router DOM v6**         | 注意：Cloudflare Pages 需配置 `_redirects` 支持 History 模式。 |
| **Markdown 渲染** | **react-markdown + remark-gfm** | 轻量级，支持 GitHub 风格 Markdown，支持代码高亮。              |
| **代码编辑器**    | **Monaco Editor**               | VS Code 同款内核，适合写文章，体验好。                         |
| **部署平台**      | **Cloudflare Pages**            | 绑定 GitHub 仓库，自动 CI/CD，免费 HTTPS 和 CDN。              |

### 3. 后端技术栈 (VPS + Docker)

_部署在 VPS 上，专注于业务逻辑和数据管理。_

| 模块            | 技术选型                    | 理由                                                                             |
| :-------------- | :-------------------------- | :------------------------------------------------------------------------------- |
| **核心框架**    | **NestJS**                  | 架构规范，模块化，适合 TypeScript，易于维护。                                    |
| **HTTP 适配器** | **Fastify**                 | **关键优化点**。默认是 Express，切换为 Fastify 性能提升约 2-3 倍，内存占用更低。 |
| **开发语言**    | **TypeScript**              | 前后端语言统一，可共享 DTO 和 Interface。                                        |
| **ORM 工具**    | **Prisma**                  | 对 TS 支持最好，类型提示智能，迁移管理方便。                                     |
| **数据库**      | **SQLite**                  | **关键优化点**。无独立进程，零内存占用，文件型数据库，适合个人博客，备份方便。   |
| **认证授权**    | **Passport + JWT**          | NestJS 官方标准方案，无状态认证，适合前后端分离。                                |
| **参数验证**    | **class-validator**         | 配合 DTO 使用，自动验证请求参数，减少 boilerplate 代码。                         |
| **API 文档**    | **Swagger (OpenAPI)**       | 自动生成接口文档，方便前端联调。                                                 |
| **文件存储**    | **对象存储 (S3 协议)**      | 推荐 **Cloudflare R2** (免流量费) 或 阿里云 OSS。**不要存 VPS 本地**。           |
| **进程管理**    | **PM2 (inside Docker)**     | 管理 Node 进程，支持集群模式，崩溃自动重启。                                     |
| **容器化**      | **Docker + Docker Compose** | 环境隔离，一键部署，方便迁移。                                                   |

### 4. 基础设施与 DevOps

| 模块            | 技术选型                    | 理由                                                   |
| :-------------- | :-------------------------- | :----------------------------------------------------- |
| **操作系统**    | **Ubuntu 22.04 LTS**        | 社区支持好，文档丰富，稳定。                           |
| **Web 服务器**  | **Nginx**                   | 部署在 VPS 上，作为反向代理，处理 SSL 证书和请求转发。 |
| **SSL 证书**    | **Certbot (Let's Encrypt)** | 免费自动续期，Nginx 配置 HTTPS。                       |
| **域名 DNS**    | **Cloudflare**              | 解析快，自带 CDN，隐藏 VPS 真实 IP。                   |
| **包管理**      | **pnpm**                    | 节省磁盘空间，安装速度快，支持 Monorepo。              |
| **代码仓库**    | **GitHub**                  | 配合 Cloudflare Pages 和 GitHub Actions 实现自动化。   |
| **监控 (可选)** | **Uptime Kuma**             | Docker 部署，监控博客在线状态，轻量美观。              |

### 5. 项目结构建议 (Monorepo)

为了最大化利用 TypeScript 的优势，建议采用 **pnpm workspace** 单体仓库管理前后端。

```text
my-blog/
├── apps/
│   ├── client/          # React 前端 (部署到 Cloudflare Pages)
│   └── server/          # NestJS 后端 (部署到 VPS Docker)
├── packages/
│   └── shared/          # 共享代码 (DTO, Interface, Constants)
├── docker/
│   ├── Dockerfile       # 后端镜像构建
│   └── docker-compose.yml
├── nginx/
│   └── default.conf     # Nginx 配置模板
├── pnpm-workspace.yaml
└── package.json
```

**共享代码 (`packages/shared`) 的价值：**
后端定义的 `CreateArticleDto` 和前端使用的表单类型完全一致。如果后端修改了字段，前端编译直接报错，杜绝了联调时的类型错误。

### 6. 针对 2G 内存 VPS 的特别优化配置

为了确保 NestJS 在 2G 内存 VPS 上稳定运行，请注意以下配置：

#### A. Docker 资源限制 (`docker-compose.yml`)

```yaml
services:
  nest-app:
    build: .
    restart: always
    ports:
      - '3000:3000'
    deploy:
      resources:
        limits:
          memory: 512M # 限制 NestJS 最大占用 512MB
        reservations:
          memory: 256M
    volumes:
      - ./data:/app/data # 挂载 SQLite 数据文件
      - ./uploads:/app/uploads # 挂载临时上传目录 (建议直接传 OSS)
```

#### B. NestJS 启动优化 (`main.ts`)

使用 Fastify 适配器，并关闭 Swagger 的生产环境生成（节省内存）。

```typescript
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  // 使用 Fastify 替代 Express
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // 生产环境关闭 Swagger
  if (process.env.NODE_ENV !== 'production') {
    // 配置 Swagger
  }

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
```

#### C. 数据库选型说明 (SQLite vs PostgreSQL)

- **方案 A (推荐): SQLite**
  - **优点：** 无需启动数据库容器，节省 **300MB-500MB** 内存。IO 性能对于博客读多写少的场景完全足够。
  - **配置：** Prisma 直接连接 `file:./dev.db`。
  - **备份：** 直接拷贝 `.db` 文件即可。
- **方案 B：PostgreSQL**
  - **优点：** 标准客户端 - 服务器数据库，并发写入能力更强。
  - **缺点：** 需要额外运行一个 Docker 容器，空闲占用约 **200MB+** 内存。
  - **建议：** 除非你预计每天有数万写入，否则 **SQLite 是 2G 内存 VPS 的最优解**。

#### D. Cloudflare Pages 配置

由于前端是 SPA (单页应用)，刷新页面可能 404。需在项目根目录创建 `_redirects` 文件：

```text
/*    /index.html   200
```

或者在 Cloudflare Pages 后台设置 "Rewrites"。

### 7. 开发路线图

1.  **初始化：** 设置 pnpm workspace，配置 ESLint/Prettier。
2.  **后端核心：** 搭建 NestJS + Prisma (SQLite)，实现用户登录 (JWT) 和文章 CRUD 接口。
3.  **对象存储：** 接入 Cloudflare R2 或 阿里云 OSS，实现图片上传接口。
4.  **前端后台：** 使用 AntD 搭建管理界面，对接后端 API，集成 Markdown 编辑器。
5.  **前端展示：** 搭建博客首页、文章详情页，对接后端 API 渲染内容。
6.  **部署测试：**
    - 前端推送到 GitHub，连接 Cloudflare Pages 自动部署。
    - 后端构建 Docker 镜像，VPS 拉取运行。
    - 配置 Nginx 反向代理后端接口，配置 HTTPS。
7.  **SEO 优化 (可选)：** 如果担心 React SPA 的 SEO 问题，可以使用 `react-snap` 进行静态预渲染，或者接受 Cloudflare 的 SEO 抓取能力（现在对 JS 渲染支持已很好）。
