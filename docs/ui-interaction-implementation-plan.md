# 前台 UI 交互迁移实施计划（当前项目可执行版）

> 输入文档：`docs/ui-interaction-detailed.md`、`docs/legacy-blog-ui-gap-analysis.md`
> 目标：在不复用旧项目、不兼容旧路由的前提下，让当前项目的前台交互能力与旧博客保持一致

## 1. 实施原则

1. 当前项目是独立项目，目标是“功能与交互对齐”，不是“旧地址兼容”。
2. 路由以当前项目为准，统一使用：

- `/`
- `/archives`
- `/categories`
- `/categories/:slug`
- `/tags`
- `/tags/:slug`
- `/post/:slug`
- `/search`

3. 优先补齐内容探索主链路：导航 -> 列表/筛选 -> 详情 -> 回流。
4. 文档中所有任务项都要能直接映射到当前仓库文件，避免写成抽象待办。

## 2. 范围与非目标

### 2.1 本次实施范围

- 前台路由与页面交互：`apps/client/src`
- 前台文章查询与详情接口：`apps/server/src/articles`
- 前后端共享类型：`packages/shared/src/types`
- 最小可执行测试方案：当前仓库内的 `test` 脚本与配套测试文件

### 2.2 本次不做

- 不做旧站 `/my-blog/...` 路由兼容与重定向
- 不做旧站 `YYYY/MM/DD/:slug` 永久链接兼容
- 不复制旧站已有缺陷或异常行为
- 不在本轮引入音乐播放器、右键菜单、简繁切换等非主链路交互

## 3. 当前差距（按实施优先级）

1. 分类/标签筛选链路未闭环

- 当前只有 `/categories`、`/tags` 总览页。
- 分类总览、标签总览、首页侧栏入口均不可完成“点击后看到筛选结果”的闭环。

2. 首页现有分类条没有真正落地

- 首页分类条目前跳转到 `/categories?slug=xxx`，但分类页没有读取参数并切换到筛选结果页。

3. 前后端文章筛选能力不足

- 前端 `ArticleQuery` 只有 `page/pageSize/keyword/status`。
- 后端 `ArticleQueryDto` 与 `listPublic` 也没有 `categorySlug/tagSlug` 条件。

4. 详情页上下文与回流不足

- 当前详情页只有标题、分类文本和正文。
- 缺少分类/标签可点击回流、目录、上一篇/下一篇、分享区等核心交互。

5. 归档页仍是平铺列表

- 与旧博客“按年月浏览”的交互不一致。
- 缺少年月分组、月份入口和继续阅读链路强化。

6. 自动化测试尚未接入

- 当前前后端 `test` 脚本仍是占位文本，不能支撑“关键交互有回归”的完成定义。

## 4. 分阶段实施计划

## P0 分类/标签主链路补齐

目标：先让用户可以从任意分类/标签入口进入真实筛选结果页，并稳定跳转到文章详情。

### P0-1 路由与页面落地

1. 新增前台路由

- `/categories/:slug`
- `/tags/:slug`

2. 新增页面文件

- `apps/client/src/pages/category-detail-page/category-detail-page.tsx`
- `apps/client/src/pages/category-detail-page/category-detail-page.module.css`
- `apps/client/src/pages/tag-detail-page/tag-detail-page.tsx`
- `apps/client/src/pages/tag-detail-page/tag-detail-page.module.css`

3. 修改文件

- `apps/client/src/router/app-router.tsx`

4. 页面行为要求

- 分类详情页展示：当前分类标题、描述、文章列表、空态、返回全部分类入口
- 标签详情页展示：当前标签标题、标签切换区、文章列表、空态、返回全部标签入口
- 保留 `/categories?slug=xxx` 作为首页现有入口的过渡兼容，但统一在前端规范到 `/categories/:slug`

### P0-2 前后端筛选能力打通

1. 前端扩展

- 修改 `apps/client/src/features/articles/services/articles-service.ts`
- `ArticleQuery` 增加：
  - `categorySlug?: string`
  - `tagSlug?: string`

2. 后端扩展

- 修改 `apps/server/src/articles/dto/article-query.dto.ts`
- 修改 `apps/server/src/articles/articles.service.ts`

3. 查询规则

- `categorySlug` 与 `tagSlug` 支持单独过滤
- 同时传入时按 `AND` 处理
- 仍保留 `keyword/page/pageSize` 能力

4. 实施注意

- 文章摘要返回结构需要与共享类型一致，不能继续存在“共享类型有字段、接口返回没有字段”的隐性偏差
- 如需让卡片元信息可点击，需同步补充文章摘要中的分类和标签路由信息

### P0-3 所有分类/标签入口接线

1. 修改文件

- `apps/client/src/pages/categories-page/categories-page.tsx`
- `apps/client/src/pages/tags-page/tags-page.tsx`
- `apps/client/src/components/organisms/sidebar-panel/sidebar-panel.tsx`
- `apps/client/src/components/molecules/category-bar/category-bar.tsx`
- `apps/client/src/components/molecules/post-card/post-card.tsx`

2. 接线要求

- 分类总览卡片点击进入 `/categories/:slug`
- 标签总览项点击进入 `/tags/:slug`
- 首页侧栏分类/标签点击进入对应详情页
- 首页分类条点击后进入对应分类详情页，不再停留在总览页
- 文章卡片中的分类、标签元信息可点击并进入对应筛选页

### P0 验收标准

1. 从首页分类条、侧栏分类、分类总览点击任一分类，都能进入正确的分类详情页并看到筛选结果。
2. 从侧栏标签、标签总览、文章卡片标签点击任一标签，都能进入正确的标签详情页并看到筛选结果。
3. 分类/标签详情页中的文章卡片可以继续进入文章详情页。
4. `/articles/public?categorySlug=xxx`、`/articles/public?tagSlug=xxx` 返回结果正确。

## P1 详情页交互补齐

目标：让文章详情页具备旧博客的“上下文展示 + 阅读回流”能力。

### P1-1 共享类型与详情接口补齐

1. 修改文件

- `packages/shared/src/types/article.ts`
- `apps/server/src/articles/articles.service.ts`

2. 详情返回结构至少补齐

- `categorySlug`
- `tagItems`
- `prevPost`
- `nextPost`

3. 建议数据结构

- `tagItems` 返回 `id/name/slug`
- `prevPost`、`nextPost` 返回最小展示字段：`title/slug`

### P1-2 详情页 UI 改造

1. 修改文件

- `apps/client/src/pages/post-detail-page/post-detail-page.tsx`
- `apps/client/src/pages/post-detail-page/post-detail-page.module.css`

2. 页面要求

- 标题区展示分类、标签，并支持点击跳转
- 生成正文目录（TOC），支持点击定位到正文标题
- 增加上一篇/下一篇跳转区
- 增加分享区，最小实现为“复制链接 + 原生分享能力优先，兜底复制”

3. 实现原则

- 不要求完全复刻旧站 UI 样式，但交互能力要等价
- 目录锚点与标题锚点规则必须统一，避免点击目录无法定位

### P1 验收标准

1. 详情页分类、标签可点击回流到筛选页。
2. 目录点击后可滚动到对应正文标题。
3. 上一篇/下一篇入口可正常打开相邻文章。
4. 分享区至少支持复制当前文章链接。

## P2 归档与全局交互一致性

目标：补齐旧博客的时间线浏览体验，并统一前台关键入口的行为和状态。

### P2-1 归档页升级

1. 修改文件

- `apps/client/src/pages/archives-page/archives-page.tsx`
- `apps/client/src/pages/archives-page/archives-page.module.css`

2. 页面要求

- 按年/月分组展示文章
- 每组提供月份标题与文章数量
- 文章标题点击进入详情页
- 标签或分类入口可视情况补上可点击跳转

### P2-2 全局入口一致性

1. 修改文件

- `apps/client/src/components/organisms/header-nav/header-nav.tsx`
- `apps/client/src/components/molecules/category-bar/category-bar.tsx`
- `apps/client/src/components/organisms/sidebar-panel/sidebar-panel.tsx`

2. 一致性要求

- Header 当前路由高亮准确
- 分类条、标签切换区、侧栏入口的当前态明确
- 搜索入口保持可用，结果页与筛选页交互不冲突

### P2 验收标准

1. 归档页可以按年月浏览，不再只是简单平铺列表。
2. 用户能清楚识别自己当前位于哪个分类、标签或导航上下文。
3. 各入口点击行为统一，不出现“看似可点但结果不变”的情况。

## P3 测试与交付收口

目标：把“可手工演示”提升到“可验证、可回归”。

### P3-1 测试基建接入

1. 前端

- 补充 Vitest 基础配置
- 让 `apps/client/package.json` 的 `test` 脚本可执行

2. 后端

- 补充 Jest 或 Nest 默认测试方案
- 让 `apps/server/package.json` 的 `test` 脚本可执行

### P3-2 最低自动化覆盖

1. 前端至少覆盖

- 首页分类条跳转到分类详情
- 标签总览跳转到标签详情
- 详情页分类/标签回流
- 详情页上一篇/下一篇

2. 后端至少覆盖

- `articles/public` 的 `categorySlug` 过滤
- `articles/public` 的 `tagSlug` 过滤
- 详情接口返回 `prevPost/nextPost`

3. 提交前检查

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm format:check`

### P3 验收标准

1. 测试脚本不再是占位输出。
2. 主链路具备最小自动化回归能力。
3. 文档、类型、接口、页面实现保持一致。

## 5. 推荐开发顺序

1. 第 1 天：完成 P0 路由、详情页壳子、文章筛选参数扩展。
2. 第 2 天：完成 P0 全部入口接线，打通分类/标签筛选闭环。
3. 第 3 天：完成 P1 详情页上下文、目录、上一篇/下一篇、分享区。
4. 第 4 天：完成 P2 归档页升级和全局当前态统一。
5. 第 5 天：完成 P3 测试基建、最小自动化回归和提测收口。

## 6. 完成定义（Definition of Done）

1. 前台用户可以通过导航、分类、标签、归档完成内容探索，并稳定进入文章详情。
2. 文章详情页具备分类/标签回流、目录、上一篇/下一篇、分享区。
3. 当前项目路由体系清晰统一，不引入旧项目兼容包袱。
4. 代码通过 `lint`、`typecheck`、`test`、`format:check`。
5. 文档中的任务项、共享类型、接口返回和页面行为相互一致。
