# 博客系统代码实施计划（Engineering Plan）

## 1. 目标与原则

- 目标：基于 `docs/description.md` 与新 PRD/UI 规范，完成可上线博客系统。
- 原则：
  1. 保持旧站 UI 体验一致。
  2. 前后端类型共享，减少联调成本。
  3. 在 2G VPS 约束下优先稳定性与可维护性。

## 2. 技术落地架构

### 2.1 Monorepo 结构

```text
narcissus-blog/
├── apps/
│   ├── client/                 # React + Vite + TS
│   └── server/                 # NestJS + Fastify + Prisma
├── packages/
│   ├── shared/                 # DTO / interface / constants
│   ├── ui-tokens/              # 颜色、间距、动效 token
│   └── eslint-config/          # 统一规范
├── docker/
│   ├── Dockerfile.server
│   └── docker-compose.yml
├── nginx/
│   └── default.conf
├── docs/
│   ├── description.md
│   ├── blog-prd.md
│   ├── blog-ui-design-spec.md
│   └── blog-implementation-plan.md
├── pnpm-workspace.yaml
└── package.json
```

### 2.2 前端核心约束

1. React 函数组件 + Hooks。
2. TypeScript 使用 `interface` 描述数据结构，避免滥用 `any`。
3. 样式优先 CSS Modules（必要时 Less Modules）。
4. CSS 构建链启用 `PostCSS + Autoprefixer`，自动补齐浏览器前缀。
5. 响应式布局优先 `flex`，禁止使用 `float` 做主布局。
6. API 请求统一 Axios 实例 + 拦截器。
7. 状态管理按功能拆分（`auth-store`、`post-store`、`site-store`）。

### 2.3 后端核心约束

1. NestJS + Fastify 适配器。
2. Prisma + SQLite（默认）。
3. DTO + `class-validator` 参数校验。
4. JWT 鉴权 + Refresh Token。
5. 统一异常过滤器与日志中间件。

## 3. 分阶段实施计划

## 阶段 0：工程初始化（第 1 周）

### 工作项

1. 初始化 pnpm workspace。
2. 搭建 apps/client 与 apps/server。
3. 配置 ESLint + Prettier + Husky + lint-staged。
4. 建立 `packages/shared` 类型共享机制。

### 交付物

1. 可运行的 client/server 基础工程。
2. 统一代码规范在 CI 可校验。

### 验收

1. `pnpm lint`、`pnpm typecheck`、`pnpm test` 可执行。

## 阶段 1：后端核心 API（第 1-2 周）

### 工作项

1. Prisma Schema 与迁移：

- `User`
- `Article`
- `Category`
- `Tag`
- `MediaAsset`
- `SiteSetting`

2. 认证模块：登录、刷新、登出。
3. 文章模块：CRUD、分页、状态流转（draft/published）。
4. 分类/标签模块：CRUD。
5. 对象存储模块：上传、删除、URL 生成。

### 交付物

1. Swagger/OpenAPI 文档。
2. Postman/Apifox 调试集合。

### 验收

1. 核心接口单测通过。
2. 鉴权、参数校验、错误码符合规范。

## 阶段 2：前台展示（第 2-4 周）

### 工作项

1. 路由搭建：首页、详情、分类、标签、归档、搜索。
2. 布局系统：

- 固定导航（60px）
- 首页 Hero + 分类条
- 双栏内容区（文章 + 侧栏）

3. 文章渲染：`react-markdown + remark-gfm` + 代码高亮。
4. 主题系统：明暗切换 + 系统偏好跟随。
5. SEO：动态 title/description/OG，生成 sitemap。

### 交付物

1. 与旧站视觉高度一致的前台页面。
2. Lighthouse 基线报告。

### 验收

1. 关键页面可用。
2. 移动端无明显样式错乱。

## 阶段 3：后台管理（第 4-5 周）

### 工作项

1. 登录页 + 权限守卫。
2. 文章管理页（列表/编辑/预览）。
3. 分类标签管理页。
4. 媒体库（上传 + 选择）。
5. 站点配置页（导航、推荐位、SEO 默认值）。

### 交付物

1. Admin MVP 完整闭环。

### 验收

1. 可独立完成“写作 -> 上传封面 -> 发布 -> 前台可见”全流程。

## 阶段 4：部署与运维（第 6 周）

### 工作项

1. 前端接入 Cloudflare Pages。
2. 后端 Docker 镜像与 Compose 部署。
3. Nginx 反代 + HTTPS（Certbot）。
4. 日志与健康检查。
5. 备份脚本（SQLite + 站点配置）。

### 交付物

1. 生产环境可重复部署脚本。
2. 上线回滚 SOP。

### 验收

1. 一键部署成功。
2. 故障情况下 15 分钟内可回滚。

## 阶段 5：质量与优化（第 7 周）

### 工作项

1. 性能优化：图片策略、接口缓存、前端分包。
2. 稳定性优化：限流、超时、重试。
3. 安全优化：CORS、Helmet、输入过滤。
4. 可观测性：错误告警、可用性监控（Uptime Kuma 可选）。

### 验收

1. 达成 PRD 性能与可用性指标。

## 4. 任务分解（按模块）

### 4.1 前端模块

1. `modules/home`：首页数据聚合、推荐位、分类条。
2. `modules/post`：详情渲染、目录、上一篇下一篇。
3. `modules/search`：搜索状态、结果高亮。
4. `modules/theme`：主题 token + 持久化。
5. `modules/admin-*`：后台业务模块。

### 4.2 后端模块

1. `auth`：登录/刷新/守卫。
2. `article`：内容核心。
3. `taxonomy`：分类/标签。
4. `media`：对象存储上传。
5. `site-setting`：导航/推荐位/SEO。

## 5. API 治理规范

1. 按功能域组织：`/api/auth`、`/api/articles`、`/api/categories`...
2. 统一响应结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

3. Axios 拦截器统一处理：

- token 注入
- 401 刷新
- 统一错误提示

## 6. 数据与类型策略

1. 共享包导出 `interface`、DTO、枚举常量。
2. 前端表单类型与后端 DTO 同源。
3. Prisma Model 变更需同步 shared 类型版本。

## 7. 测试计划

### 7.1 后端

1. 单元测试：Service、Guard、Interceptor。
2. 集成测试：认证、文章 CRUD、上传接口。

### 7.2 前端

1. 组件测试：关键展示组件。
2. 页面冒烟：首页/详情/搜索/后台发布链路。

### 7.3 E2E（建议）

1. 登录后台 -> 发布文章 -> 前台可见。
2. 搜索命中 -> 进入详情 -> 主题切换。

## 8. CI/CD 方案

1. CI（GitHub Actions）

- 安装依赖
- lint + typecheck + test
- 构建 client/server

2. CD

- client：推送到主分支自动触发 Cloudflare Pages
- server：构建镜像并部署到 VPS

## 9. 资源与配置建议

1. `NODE_ENV=production` 关闭不必要开发能力（如线上 Swagger）。
2. Docker 内存限制：`512M`。
3. 图片存储统一对象存储，避免 VPS 磁盘膨胀。
4. 第三方静态资源优先国内 CDN（BootCDN、又拍云），并留本地兜底。

## 10. 风险清单

1. UI 偏差风险：

- 处理：先完成 Token 与首页样式基线，再扩展其余页面。

2. 接口联调反复：

- 处理：shared 类型与 Swagger 同步维护。

3. 生产资源瓶颈：

- 处理：限流、缓存、SQL 索引、日志裁剪。

## 11. 上线清单（DoD）

1. PRD MVP 功能全部完成。
2. UI 规范关键页一致性达标。
3. ESLint + Prettier + 测试 + 构建全部通过。
4. 生产部署、监控、备份、回滚验证通过。
