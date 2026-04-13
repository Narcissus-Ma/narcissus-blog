# Blog Header Backendization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留老博客 header 交互风格的前提下，将新站的搜索能力改为后端驱动，并为随机文章切换到后端接口提供稳定实现路径。

**Architecture:** 前端继续负责 header 的视觉与交互层，包括 hover、搜索弹窗、按钮状态与过渡动画；后端负责提供搜索和随机文章数据接口。搜索优先改为专用接口，随机文章采用独立接口，避免把 UI 逻辑耦合进现有文章列表接口。

**Tech Stack:** React 19、React Router、TanStack Query、Ant Design、NestJS、Prisma、Vitest、TypeScript

---

## File Structure

**现有文件**
- `apps/client/src/components/organisms/header-nav/header-nav.tsx`
  当前站点顶部导航，现状是输入框直跳 `/search`，需要改造成更接近老站 header 的按钮化交互。
- `apps/client/src/components/organisms/header-nav/header-nav.module.css`
  当前 header 样式文件，需要承接 hover、按钮组、搜索弹窗触发态与响应式布局。
- `apps/client/src/features/articles/services/articles-service.ts`
  当前文章服务层，已具备公共列表和详情能力，适合作为搜索与随机文章接口的统一入口。
- `apps/client/src/pages/search-page/search-page.tsx`
  当前搜索页，已经通过后端关键词筛选工作，适合作为弹窗“查看更多结果”的落点页。
- `apps/client/src/layouts/blog-layout/blog-layout.tsx`
  博客主布局，适合挂载全局 header、全局搜索弹窗和后续互动弹窗容器。
- `apps/server/src/articles/articles.controller.ts`
  文章模块控制器，需要扩展公开搜索与随机文章接口。
- `apps/server/src/articles/articles.service.ts`
  文章模块服务层，需要扩展随机文章和更明确的搜索查询逻辑。
- `apps/server/src/articles/articles.service.test.ts`
  现有服务测试，适合补随机文章、搜索排序、过滤条件测试。
- `apps/server/src/articles/dto/article-query.dto.ts`
  当前公共文章查询 DTO，必要时可扩展搜索接口参数。
- `packages/shared/src/types/article.ts`
  公共文章类型定义；如果新增轻量搜索结果类型或随机文章结果类型，应放这里统一管理。

**建议新增文件**
- `apps/client/src/components/organisms/header-search-modal/header-search-modal.tsx`
  单一职责：只负责搜索弹窗 UI 与输入/关闭行为，不负责顶部按钮排布。
- `apps/client/src/components/organisms/header-search-modal/header-search-modal.module.css`
  搜索弹窗样式。
- `apps/client/src/components/organisms/header-nav/use-header-actions.ts`
  单一职责：集中管理搜索弹窗开关、随机跳转、主题切换等 header 行为。
- `apps/client/src/components/organisms/header-nav/header-nav.test.tsx`
  验证 header 关键交互。
- `apps/client/src/components/organisms/header-search-modal/header-search-modal.test.tsx`
  验证弹窗打开、关闭、搜索跳转与结果展示。

**可选第二阶段新增文件**
- `apps/client/src/components/organisms/header-console-panel/header-console-panel.tsx`
  如果要还原老站“中控台”，单独拆组件，不要把复杂交互继续塞进 `header-nav.tsx`。
- `apps/client/src/components/organisms/header-console-panel/header-console-panel.module.css`
  中控台样式。
- `apps/client/src/components/organisms/header-popup-notice/header-popup-notice.tsx`
  如果要做首页互动弹窗或协议提醒，建议独立成组件。

## Scope Split

**本次必须完成**
- header 搜索从“输入框跳页”升级为“按钮触发弹窗 + 后端搜索接口”
- header 新增随机文章按钮，支持后端接口
- header 按钮 hover 与布局向老站靠拢
- 搜索页继续保留，作为完整结果页承接

**第二阶段可选**
- 中控台面板
- 首页通知/互动弹窗
- 右键菜单联动搜索
- 评论弹幕、音乐控制、快捷键面板

## Task 1: 固定交互边界与类型契约

**Files:**
- Modify: `packages/shared/src/types/article.ts`
- Modify: `apps/client/src/features/articles/services/articles-service.ts`
- Test: `apps/client/src/components/organisms/header-nav/header-nav.test.tsx`

- [ ] **Step 1: 写出前端服务层需要的类型草案**

```ts
export interface PublicSearchQuery {
  keyword: string;
  page?: number;
  pageSize?: number;
}

export interface RandomArticleResult {
  slug: string;
  title: string;
}
```

- [ ] **Step 2: 明确前端调用约束**

约束：
- 搜索弹窗默认请求前 5 到 8 条结果
- 完整结果页继续使用分页
- 随机文章接口只返回跳转所需最小字段

- [ ] **Step 3: 在 `articles-service.ts` 中预留服务接口签名**

```ts
async searchPublic(query: PublicSearchQuery): Promise<PaginationResult<ArticleSummary>>
async getRandomPublicArticle(): Promise<RandomArticleResult>
```

- [ ] **Step 4: 为 header 行为先写测试描述**

```ts
it('点击搜索按钮后应打开搜索弹窗');
it('点击随机文章按钮后应请求随机文章接口并跳转');
```

- [ ] **Step 5: 提交**

```bash
git add packages/shared/src/types/article.ts apps/client/src/features/articles/services/articles-service.ts apps/client/src/components/organisms/header-nav/header-nav.test.tsx
git commit -m "chore: define header search and random article contracts"
```

## Task 2: 补后端随机文章接口

**Files:**
- Modify: `apps/server/src/articles/articles.controller.ts`
- Modify: `apps/server/src/articles/articles.service.ts`
- Test: `apps/server/src/articles/articles.service.test.ts`

- [ ] **Step 1: 先写失败测试**

```ts
it('getRandomPublicArticle 应只从已发布文章中随机返回');
it('getRandomPublicArticle 应返回 slug 与 title');
it('当没有已发布文章时应抛出 NotFoundException');
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @narcissus/server test -- articles.service.test.ts`
Expected: FAIL，提示 `getRandomPublicArticle` 未定义或断言不通过

- [ ] **Step 3: 在服务层实现最小能力**

实现方向：
- 只查询 `status: 'published'`
- 使用 Prisma `count` + `skip/take` 或数据库随机排序实现
- 返回 `{ slug, title }`

示例伪码：

```ts
async getRandomPublicArticle() {
  const total = await this.prismaService.article.count({
    where: { status: 'published' },
  });

  if (!total) {
    throw new NotFoundException('暂无可随机访问的文章');
  }

  const offset = Math.floor(Math.random() * total);
  const article = await this.prismaService.article.findFirst({
    where: { status: 'published' },
    skip: offset,
    select: { slug: true, title: true },
    orderBy: { publishedAt: 'desc' },
  });

  return article;
}
```

- [ ] **Step 4: 在控制器暴露公开接口**

建议接口：

```ts
@Public()
@Get('public/random')
async getRandomPublicArticle() {
  return this.articlesService.getRandomPublicArticle();
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm --filter @narcissus/server test -- articles.service.test.ts`
Expected: PASS，新增随机文章用例通过

- [ ] **Step 6: 提交**

```bash
git add apps/server/src/articles/articles.controller.ts apps/server/src/articles/articles.service.ts apps/server/src/articles/articles.service.test.ts
git commit -m "feat: add public random article endpoint"
```

## Task 3: 将搜索从“列表筛选”提升为“专用公开搜索接口”

**Files:**
- Modify: `apps/server/src/articles/articles.controller.ts`
- Modify: `apps/server/src/articles/articles.service.ts`
- Modify: `apps/server/src/articles/dto/article-query.dto.ts`
- Test: `apps/server/src/articles/articles.service.test.ts`

- [ ] **Step 1: 先写失败测试**

```ts
it('searchPublic 应按标题优先、摘要其次、正文最后返回相关文章');
it('searchPublic 应忽略未发布文章');
it('searchPublic 在空关键词时应返回空列表而不是全站文章');
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @narcissus/server test -- articles.service.test.ts`
Expected: FAIL，提示 `searchPublic` 未定义或排序不符

- [ ] **Step 3: 实现专用搜索方法**

实现要求：
- 专用方法名 `searchPublic`
- 必填 `keyword`
- 仅检索已发布文章
- 默认 `pageSize` 较小，服务 header 弹窗
- 排序优先级建议：
  `title contains` > `excerpt contains` > `content contains` > `publishedAt desc`

可接受的第一版实现：
- 先用 Prisma 三段 OR 过滤
- 在服务层做简单打分排序

- [ ] **Step 4: 暴露专用搜索接口**

建议接口：

```ts
@Public()
@Get('public/search')
async searchPublic(@Query() query: ArticleQueryDto) {
  return this.articlesService.searchPublic(query);
}
```

- [ ] **Step 5: 保留现有 `/articles/public` 列表接口**

说明：
- 首页、分类页、标签页继续复用 `listPublic`
- header 弹窗和未来智能搜索入口统一走 `/articles/public/search`

- [ ] **Step 6: 运行测试确认通过**

Run: `pnpm --filter @narcissus/server test -- articles.service.test.ts`
Expected: PASS，专用搜索用例通过，旧列表测试不回归

- [ ] **Step 7: 提交**

```bash
git add apps/server/src/articles/articles.controller.ts apps/server/src/articles/articles.service.ts apps/server/src/articles/dto/article-query.dto.ts apps/server/src/articles/articles.service.test.ts
git commit -m "feat: add public article search endpoint"
```

## Task 4: 接入前端文章服务层

**Files:**
- Modify: `apps/client/src/features/articles/services/articles-service.ts`
- Modify: `packages/shared/src/types/article.ts`

- [ ] **Step 1: 先补服务层调用签名**

```ts
async searchPublic(query: PublicSearchQuery) {
  const response = await apiClient.get('/articles/public/search', { params: query });
  return unwrapResponse<PaginationResult<ArticleSummary>>(response);
}

async getRandomPublicArticle() {
  const response = await apiClient.get('/articles/public/random');
  return unwrapResponse<RandomArticleResult>(response);
}
```

- [ ] **Step 2: 检查是否复用现有拦截器**

要求：
- 不新增裸 `fetch`
- 继续使用 `apiClient`
- 保持错误处理统一走响应拦截器

- [ ] **Step 3: 运行类型检查**

Run: `pnpm typecheck`
Expected: PASS，无新增类型错误

- [ ] **Step 4: 提交**

```bash
git add apps/client/src/features/articles/services/articles-service.ts packages/shared/src/types/article.ts
git commit -m "feat: wire client article search and random APIs"
```

## Task 5: 重构 Header 为“老站交互风格 + 新站接口数据源”

**Files:**
- Modify: `apps/client/src/components/organisms/header-nav/header-nav.tsx`
- Modify: `apps/client/src/components/organisms/header-nav/header-nav.module.css`
- Create: `apps/client/src/components/organisms/header-search-modal/header-search-modal.tsx`
- Create: `apps/client/src/components/organisms/header-search-modal/header-search-modal.module.css`
- Create: `apps/client/src/components/organisms/header-nav/use-header-actions.ts`
- Modify: `apps/client/src/layouts/blog-layout/blog-layout.tsx`
- Test: `apps/client/src/components/organisms/header-nav/header-nav.test.tsx`
- Test: `apps/client/src/components/organisms/header-search-modal/header-search-modal.test.tsx`

- [ ] **Step 1: 先写失败测试**

```tsx
it('header 应展示搜索按钮、随机按钮、主题切换按钮');
it('点击搜索按钮后应打开弹窗并聚焦输入框');
it('输入关键词后应显示后端返回的前几条结果');
it('点击查看更多结果后应跳转到 /search');
it('点击随机文章按钮后应跳转到 /post/:slug');
it('按 Escape 应关闭搜索弹窗');
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @narcissus/client test -- header-nav`
Expected: FAIL，提示目标按钮或弹窗不存在

- [ ] **Step 3: 抽离 header 行为钩子**

`use-header-actions.ts` 负责：
- 搜索弹窗开关
- 随机文章请求与跳转
- 搜索关键词状态
- 跳转完整搜索页
- 防重入 loading 状态

示例接口：

```ts
interface UseHeaderActionsResult {
  isSearchOpen: boolean;
  isRandomLoading: boolean;
  keyword: string;
  openSearch: () => void;
  closeSearch: () => void;
  setKeyword: (value: string) => void;
  goRandomPost: () => Promise<void>;
  goSearchPage: (value: string) => void;
}
```

- [ ] **Step 4: 新建搜索弹窗组件**

`header-search-modal.tsx` 只负责：
- 输入框
- 结果列表
- 空态 / loading 态
- 关闭按钮 / 遮罩
- `Escape` 关闭

第一版不要加入：
- 高亮命中词
- 键盘上下选择
- 搜索历史

- [ ] **Step 5: 重构 `header-nav.tsx` 为按钮式交互**

目标结构：
- 左侧：站点名 + 导航
- 右侧：随机文章按钮、搜索按钮、主题按钮
- 移除始终可见的输入框
- 将弹窗组件挂在 header 或 layout 中

- [ ] **Step 6: 在样式上向老站靠拢**

`header-nav.module.css` 要覆盖的重点：
- 顶部 sticky + 模糊背景保留
- 按钮统一圆角胶囊/圆形风格
- hover 颜色与背景态统一
- 移动端收起菜单，仅保留核心按钮
- 使用 flex，不使用 float

- [ ] **Step 7: 搜索结果先走后端即时查询**

建议：
- 输入 300ms 防抖
- 少于 2 个字符不请求
- 默认取前 5 条
- 点击结果直接跳转文章详情

- [ ] **Step 8: 运行前端测试**

Run: `pnpm --filter @narcissus/client test -- header-nav`
Expected: PASS，header 与弹窗用例通过

- [ ] **Step 9: 运行类型检查和 lint**

Run: `pnpm typecheck`
Expected: PASS

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 10: 提交**

```bash
git add apps/client/src/components/organisms/header-nav/header-nav.tsx apps/client/src/components/organisms/header-nav/header-nav.module.css apps/client/src/components/organisms/header-search-modal/header-search-modal.tsx apps/client/src/components/organisms/header-search-modal/header-search-modal.module.css apps/client/src/components/organisms/header-nav/use-header-actions.ts apps/client/src/layouts/blog-layout/blog-layout.tsx apps/client/src/components/organisms/header-nav/header-nav.test.tsx apps/client/src/components/organisms/header-search-modal/header-search-modal.test.tsx
git commit -m "feat: rebuild blog header with modal search and random post"
```

## Task 6: 对齐完整搜索页体验，避免弹窗与结果页割裂

**Files:**
- Modify: `apps/client/src/pages/search-page/search-page.tsx`
- Modify: `apps/client/src/features/articles/services/articles-service.ts`

- [ ] **Step 1: 复用专用搜索接口**

将搜索页从：

```ts
articlesService.getPublicList({ page: 1, pageSize: 20, keyword })
```

改为：

```ts
articlesService.searchPublic({ page: 1, pageSize: 20, keyword })
```

- [ ] **Step 2: 补状态文案**

要求：
- 空关键词提示
- 搜索中提示
- 无结果提示
- 结果总数提示

- [ ] **Step 3: 运行页面相关测试或至少执行类型检查**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add apps/client/src/pages/search-page/search-page.tsx apps/client/src/features/articles/services/articles-service.ts
git commit -m "refactor: align search page with public search endpoint"
```

## Task 7: 第二阶段可选能力，中控台与互动弹窗

**Files:**
- Create: `apps/client/src/components/organisms/header-console-panel/header-console-panel.tsx`
- Create: `apps/client/src/components/organisms/header-console-panel/header-console-panel.module.css`
- Create: `apps/client/src/components/organisms/header-popup-notice/header-popup-notice.tsx`
- Create: `apps/client/src/components/organisms/header-popup-notice/header-popup-notice.module.css`
- Modify: `apps/client/src/layouts/blog-layout/blog-layout.tsx`

- [ ] **Step 1: 明确数据边界**

中控台第一版建议只做前端面板，不接后端：
- 主题切换
- 快捷导航
- 站点统计摘要

互动弹窗第一版可以只接静态配置或站点设置：
- 首页欢迎
- 协议提醒
- 活动公告

- [ ] **Step 2: 不把第二阶段并进第一期验收**

验收顺序：
1. 搜索
2. 随机文章
3. Header hover 和布局
4. 再决定是否上中控台和弹窗

- [ ] **Step 3: 若要接后端，优先复用站点设置模块**

说明：
- 不建议为了一个公告弹窗单开新服务
- 可以在 `site-settings` 模块追加“首页弹窗配置”

- [ ] **Step 4: 单独提交**

```bash
git add apps/client/src/components/organisms/header-console-panel apps/client/src/components/organisms/header-popup-notice apps/client/src/layouts/blog-layout/blog-layout.tsx
git commit -m "feat: add optional header console and popup notice shell"
```

## Task 8: 总体验证

**Files:**
- Verify only

- [ ] **Step 1: 运行服务端测试**

Run: `pnpm --filter @narcissus/server test -- articles.service.test.ts`
Expected: PASS

- [ ] **Step 2: 运行前端测试**

Run: `pnpm --filter @narcissus/client test -- header-nav`
Expected: PASS

- [ ] **Step 3: 运行全局检查**

Run: `pnpm typecheck`
Expected: PASS

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 4: 手工验证**

验证清单：
- 搜索按钮点击后打开弹窗
- 输入关键词后 300ms 左右出现结果
- 点击文章结果跳转到正确详情页
- 点击“查看更多”跳转 `/search`
- 点击随机文章按钮后跳转一篇已发布文章
- 移动端 header 不溢出
- hover 背景和按钮过渡正常

- [ ] **Step 5: 最终提交**

```bash
git add .
git commit -m "feat: restore legacy-style header interactions with backend-powered search"
```

## Recommended Delivery Order

1. 先完成后端随机文章接口
2. 再完成专用搜索接口
3. 再重构前端 header
4. 最后视时间补中控台和互动弹窗

## Risks

- 现有 `HeaderNav` 是简化版，直接在原文件堆逻辑会再次变臃肿，必须拆出搜索弹窗和行为钩子。
- 现有搜索页复用的是列表接口，若不拆专用搜索接口，后续 header 弹窗和搜索页会共享不稳定的排序逻辑。
- 随机文章若直接在前端从当前列表随机，首页、分类页和缓存状态会导致结果不全，必须以后端公开文章集为准。
- 中控台、互动弹窗、右键菜单属于可选增强项，不应阻塞第一期交付。

## Acceptance Criteria

- Header 外观从“输入框型工具栏”升级为“按钮型交互 header”
- 搜索弹窗由后端接口驱动，且保留完整搜索页
- 随机文章由后端接口驱动，只命中已发布文章
- hover 和基础动效接近老站风格
- 第一阶段不引入与核心目标无关的复杂交互
