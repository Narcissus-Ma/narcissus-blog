# 博客内容区域对齐代码实现方案

## 1. 项目现状分析

### 当前项目（narcissus-blog）
- **技术栈**：React + TypeScript + Vite
- **内容结构**：
  - HeroBanner（特色文章展示）
  - CategoryBar（分类栏）
  - 左侧文章列表（PostCard 组件）
  - 右侧 SidebarPanel（侧边栏）
  - 分页控件
- **优势**：现代化技术栈，组件化架构，响应式设计
- **不足**：文章卡片信息不够丰富，缺少摘要、评论数、日期等信息

### 旧博客项目（hexo-theme-anzhiyu）
- **技术栈**：Hexo + Pug + Stylus
- **内容结构**：
  - 分类组展示
  - 文章列表（包含丰富信息）
  - 每3篇文章插入广告位
  - 分页控件
- **优势**：丰富的文章卡片信息，良好的用户体验
- **不足**：技术栈相对老旧

## 2. 代码实现方案

### 2.1 增强 PostCard 组件

**文件**：`/apps/client/src/components/molecules/post-card/post-card.tsx`

**修改后代码**：

```tsx
import type { ArticleSummary } from '@narcissus/shared';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import styles from './post-card.module.css';

interface PostCardProps {
  item: ArticleSummary;
  coverPosition?: 'left' | 'right' | 'none';
  isSticky?: boolean;
  isNew?: boolean;
  isUnread?: boolean;
  commentCount?: number;
}

export function PostCard({ 
  item, 
  coverPosition = 'none', 
  isSticky = false, 
  isNew = false, 
  isUnread = false, 
  commentCount = 0 
}: PostCardProps) {
  return (
    <article className={`${styles.card} ${coverPosition !== 'none' ? styles.coverAlternate : ''} ${coverPosition === 'left' ? styles.coverLeft : coverPosition === 'right' ? styles.coverRight : ''}`}>
      {coverPosition !== 'none' && item.coverUrl && (
        <Link className={styles.coverLink} to={`/post/${item.slug}`}>
          <img
            className={styles.cover}
            src={item.coverUrl || 'https://via.placeholder.com/800x500?text=Narcissus+Blog'}
            alt={item.title}
          />
        </Link>
      )}
      <div className={styles.content}>
        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            {isSticky && (
              <span className={styles.stickyTag}>
                <i className="anzhiyufont anzhiyu-icon-thumbtack"></i>
                置顶
              </span>
            )}
            {isNew && (
              <span className={styles.newTag}>
                新
              </span>
            )}
            {isUnread && (
              <Link className={styles.unreadTag} to={`/post/${item.slug}`}>
                未读
              </Link>
            )}
          </div>
          {item.categorySlug ? (
            <Link className={styles.categoryLink} to={`/categories/${item.categorySlug}`}>
              {item.categoryName || '未分类'}
            </Link>
          ) : (
            <span className={styles.categoryLink}>{item.categoryName || '未分类'}</span>
          )}
        </div>
        <Link className={styles.title} to={`/post/${item.slug}`}>
          {item.title}
        </Link>
        <p className={styles.excerpt}>{item.excerpt || '暂无摘要内容。'}</p>
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.date}>
              {dayjs(item.publishedAt || item.createdAt).format('YYYY-MM-DD')}
            </span>
            {commentCount > 0 && (
              <Link className={styles.commentLink} to={`/post/${item.slug}#comments`}>
                <i className="anzhiyufont anzhiyu-icon-comments"></i>
                {commentCount}
              </Link>
            )}
          </div>
          <div className={styles.tagWrap}>
            {(item.tagItems.length > 0 ? item.tagItems.slice(0, 2) : []).map((tag) => (
              <Link key={tag.id} className={styles.tagLink} to={`/tags/${tag.slug}`}>
                #{tag.name}
              </Link>
            ))}
            {item.tagItems.length === 0 ? <span className={styles.noTag}>无标签</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
```

**样式文件**：`/apps/client/src/components/molecules/post-card/post-card.module.css`

**新增样式**：

```css
/* 封面交替布局 */
.coverAlternate {
  display: flex;
  align-items: center;
  gap: 20px;
}

.coverLeft .coverLink {
  order: 1;
  flex: 0 0 30%;
}

.coverLeft .content {
  order: 2;
  flex: 1;
}

.coverRight .coverLink {
  order: 2;
  flex: 0 0 30%;
}

.coverRight .content {
  order: 1;
  flex: 1;
}

/* 标记样式 */
.metaLeft {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.stickyTag {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #ff6b6b;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.newTag {
  background-color: #4ecdc4;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.unreadTag {
  background-color: #45b7d1;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  text-decoration: none;
}

/* 底部信息 */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.footerLeft {
  display: flex;
  gap: 16px;
  align-items: center;
}

.commentLink {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  text-decoration: none;
}

.commentLink:hover {
  color: #4ecdc4;
}

.categoryLink {
  color: #666;
  text-decoration: none;
  font-size: 14px;
}

.categoryLink:hover {
  color: #4ecdc4;
}

.tagLink {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  margin-left: 8px;
}

.tagLink:hover {
  color: #4ecdc4;
}

.noTag {
  color: #999;
  font-size: 14px;
}

/* 悬停效果 */
.card {
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .coverAlternate {
    flex-direction: column;
    text-align: center;
  }
  
  .coverLeft .coverLink,
  .coverRight .coverLink {
    order: 1;
    flex: 0 0 auto;
    width: 100%;
  }
  
  .coverLeft .content,
  .coverRight .content {
    order: 2;
    flex: 1;
  }
}
```

### 2.2 实现封面位置交替布局

**文件**：`/apps/client/src/pages/home-page/home-page.tsx`

**修改后代码**：

```tsx
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import styles from './home-page.module.css';

import { CategoryBar } from '@/components/molecules/category-bar/category-bar';
import { PaginationBar } from '@/components/molecules/pagination-bar/pagination-bar';
import { PostCard } from '@/components/molecules/post-card/post-card';
import { HeroBanner } from '@/components/organisms/hero-banner/hero-banner';
import { SidebarPanel } from '@/components/organisms/sidebar-panel/sidebar-panel';
import { articlesService } from '@/features/articles/services/articles-service';
import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function HomePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: articleResult, isLoading } = useQuery({
    queryKey: ['public-articles', page, pageSize],
    queryFn: () => articlesService.getPublicList({ page, pageSize }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['public-categories'],
    queryFn: taxonomyService.getPublicCategories,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['public-tags'],
    queryFn: taxonomyService.getPublicTags,
  });

  const categoryBarItems = useMemo(
    () =>
      categories.slice(0, 8).map((item) => ({ name: item.name, path: `/categories/${item.slug}` })),
    [categories],
  );

  const featuredArticle = articleResult?.list[0];

  // 检查文章是否未读
  const checkIsUnread = (articleId: string): boolean => {
    const readArticles = localStorage.getItem('readArticles');
    if (!readArticles) return true;
    const readArticleIds = JSON.parse(readArticles);
    return !readArticleIds.includes(articleId);
  };

  // 检查文章是否为新文章（7天内发布）
  const checkIsNew = (publishedAt: string | Date): boolean => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(publishedAt) > sevenDaysAgo;
  };

  return (
    <div className={styles.container}>
      <HeroBanner featuredTitle={featuredArticle?.title} featuredSlug={featuredArticle?.slug} />
      <CategoryBar items={categoryBarItems} />

      <div className={styles.layout}>
        <section className={styles.posts}>
          {isLoading ? <div className={styles.state}>正在加载文章...</div> : null}
          {!isLoading && articleResult?.list.length === 0 ? (
            <div className={styles.state}>暂无文章，请先在后台发布内容。</div>
          ) : null}
          <div className={styles.grid}>
            {articleResult?.list.map((item, index) => {
              // 计算封面位置（交替布局）
              const coverPosition = item.coverUrl ? (index % 2 === 0 ? 'left' : 'right') : 'none';
              
              return (
                <React.Fragment key={item.id}>
                  {/* 每3篇文章后插入广告 */}
                  {index > 0 && index % 3 === 0 && (
                    <div className={styles.adSlot}>
                      {/* 广告内容 */}
                      <div className={styles.adContent}>
                        <p>广告位</p>
                      </div>
                    </div>
                  )}
                  <PostCard 
                    item={item} 
                    coverPosition={coverPosition}
                    isSticky={item.isSticky || false}
                    isNew={checkIsNew(item.publishedAt || item.createdAt)}
                    isUnread={checkIsUnread(item.id)}
                    commentCount={item.commentCount || 0}
                  />
                </React.Fragment>
              );
            })}
          </div>
          <div className={styles.pagination}>
            <PaginationBar
              page={page}
              pageSize={pageSize}
              total={articleResult?.total ?? 0}
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          </div>
        </section>
        <SidebarPanel categories={categories} tags={tags} />
      </div>
    </div>
  );
}
```

**样式文件**：`/apps/client/src/pages/home-page/home-page.module.css`

**新增样式**：

```css
/* 广告位样式 */
.adSlot {
  grid-column: 1 / -1;
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #dee2e6;
}

.adContent {
  text-align: center;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .adSlot {
    margin: 20px 0;
    padding: 15px;
  }
}
```

### 2.3 增强 API 服务

**文件**：`/apps/client/src/features/articles/services/articles-service.ts`

**修改后代码**：

```typescript
import type { ArticleCreateDto, ArticleListQuery, ArticleUpdateDto, PublicArticleListResult } from '@narcissus/shared';

import { apiClient } from '@/services/api-client';

const ARTICLES_BASE = '/api/articles';

export const articlesService = {
  // 获取公开文章列表
  async getPublicList(query: ArticleListQuery): Promise<PublicArticleListResult> {
    const response = await apiClient.get<PublicArticleListResult>(`${ARTICLES_BASE}/public`, { params: query });
    
    // 处理未读标记
    const readArticles = localStorage.getItem('readArticles');
    const readArticleIds = readArticles ? JSON.parse(readArticles) : [];
    
    // 为每篇文章添加未读标记和评论数
    const processedList = response.data.list.map(article => ({
      ...article,
      isUnread: !readArticleIds.includes(article.id),
      commentCount: article.commentCount || 0, // 假设 API 返回评论数
    }));
    
    return {
      ...response.data,
      list: processedList
    };
  },
  
  // 标记文章为已读
  markAsRead(articleId: string): void {
    const readArticles = localStorage.getItem('readArticles');
    const readArticleIds = readArticles ? JSON.parse(readArticles) : [];
    
    if (!readArticleIds.includes(articleId)) {
      readArticleIds.push(articleId);
      localStorage.setItem('readArticles', JSON.stringify(readArticleIds));
    }
  },
  
  // 其他现有方法...
  async getAdminList(query: ArticleListQuery) {
    const response = await apiClient.get(`${ARTICLES_BASE}/admin`, { params: query });
    return response.data;
  },
  
  async getById(id: string) {
    const response = await apiClient.get(`${ARTICLES_BASE}/${id}`);
    // 标记为已读
    this.markAsRead(id);
    return response.data;
  },
  
  async create(dto: ArticleCreateDto) {
    const response = await apiClient.post(ARTICLES_BASE, dto);
    return response.data;
  },
  
  async update(id: string, dto: ArticleUpdateDto) {
    const response = await apiClient.put(`${ARTICLES_BASE}/${id}`, dto);
    return response.data;
  },
  
  async delete(id: string) {
    const response = await apiClient.delete(`${ARTICLES_BASE}/${id}`);
    return response.data;
  }
};
```

### 2.4 优化 SidebarPanel 组件

**文件**：`/apps/client/src/components/organisms/sidebar-panel/sidebar-panel.tsx`

**修改后代码**：

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './sidebar-panel.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
}

interface SidebarPanelProps {
  categories: Category[];
  tags: Tag[];
}

export function SidebarPanel({ categories, tags }: SidebarPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // 按文章数量排序分类
  const sortedCategories = [...categories].sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));
  
  // 按文章数量排序标签
  const sortedTags = [...tags].sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0)).slice(0, 20);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <aside className={styles.sidebar}>
      {/* 分类面板 */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>分类</h3>
        <div className={styles.categoryList}>
          {sortedCategories.map((category) => (
            <div key={category.id} className={styles.categoryItem}>
              <Link 
                to={`/categories/${category.slug}`} 
                className={styles.categoryLink}
              >
                <span>{category.name}</span>
                {category.articleCount !== undefined && (
                  <span className={styles.articleCount}>({category.articleCount})</span>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 标签面板 */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>标签</h3>
        <div className={styles.tagCloud}>
          {sortedTags.map((tag) => (
            <Link 
              key={tag.id} 
              to={`/tags/${tag.slug}`} 
              className={styles.tagLink}
            >
              {tag.name}
              {tag.articleCount !== undefined && (
                <span className={styles.tagCount}>({tag.articleCount})</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* 热门文章面板 */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>热门文章</h3>
        <div className={styles.hotArticleList}>
          {/* 这里可以添加热门文章列表，需要从 API 获取 */}
          <div className={styles.hotArticleItem}>
            <Link to="#" className={styles.hotArticleLink}>
              <span className={styles.hotArticleRank}>1</span>
              <span className={styles.hotArticleTitle}>热门文章标题示例</span>
            </Link>
          </div>
          <div className={styles.hotArticleItem}>
            <Link to="#" className={styles.hotArticleLink}>
              <span className={styles.hotArticleRank}>2</span>
              <span className={styles.hotArticleTitle}>另一篇热门文章</span>
            </Link>
          </div>
          <div className={styles.hotArticleItem}>
            <Link to="#" className={styles.hotArticleLink}>
              <span className={styles.hotArticleRank}>3</span>
              <span className={styles.hotArticleTitle}>热门文章第三名</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 最新评论面板 */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>最新评论</h3>
        <div className={styles.commentList}>
          {/* 这里可以添加最新评论列表，需要从 API 获取 */}
          <div className={styles.commentItem}>
            <div className={styles.commentAvatar}>
              <img src="https://via.placeholder.com/40" alt="评论者头像" />
            </div>
            <div className={styles.commentContent}>
              <span className={styles.commentAuthor}>访客</span>
              <p className={styles.commentText}>这是一条评论示例</p>
              <Link to="#" className={styles.commentLink}>查看全文</Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

**样式文件**：`/apps/client/src/components/organisms/sidebar-panel/sidebar-panel.module.css`

**新增样式**：

```css
/* 分类和标签计数 */
.articleCount,
.tagCount {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}

/* 热门文章 */
.hotArticleList {
  margin-top: 12px;
}

.hotArticleItem {
  margin-bottom: 12px;
}

.hotArticleLink {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  text-decoration: none;
  color: #333;
  transition: color 0.2s ease;
}

.hotArticleLink:hover {
  color: #4ecdc4;
}

.hotArticleRank {
  flex: 0 0 20px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #999;
}

.hotArticleRank:nth-child(1) {
  color: #ff6b6b;
}

.hotArticleRank:nth-child(2) {
  color: #4ecdc4;
}

.hotArticleRank:nth-child(3) {
  color: #45b7d1;
}

.hotArticleTitle {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 最新评论 */
.commentList {
  margin-top: 12px;
}

.commentItem {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.commentAvatar {
  flex: 0 0 40px;
}

.commentAvatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.commentContent {
  flex: 1;
}

.commentAuthor {
  display: block;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
}

.commentText {
  font-size: 12px;
  line-height: 1.4;
  color: #666;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.commentLink {
  font-size: 12px;
  color: #4ecdc4;
  text-decoration: none;
}

.commentLink:hover {
  text-decoration: underline;
}
```

## 3. 技术实现细节

### 3.1 状态管理
- **未读文章标记**：使用 `localStorage` 存储已读文章 ID
- **广告配置**：可以在 `site-store.ts` 中添加广告配置

### 3.2 数据获取
- **文章列表**：扩展现有 API 接口，添加 `commentCount` 字段
- **热门文章**：需要新增 API 接口，按评论数或浏览量排序
- **最新评论**：需要新增 API 接口，获取最新评论

### 3.3 响应式设计
- **桌面端**：封面左右交替布局
- **移动端**：封面顶部布局，单列显示

### 3.4 性能优化
- **广告懒加载**：使用 `IntersectionObserver` 实现广告懒加载
- **图片优化**：使用适当尺寸的封面图片
- **本地存储管理**：定期清理已读文章记录，避免存储过大

## 4. 测试计划

### 4.1 功能测试
- [ ] 文章卡片信息显示完整（标题、摘要、日期、评论数、标签）
- [ ] 封面位置交替效果
- [ ] 广告插入功能
- [ ] 未读文章标记
- [ ] 新文章标记
- [ ] 置顶文章标记
- [ ] 侧边栏分类和标签显示
- [ ] 侧边栏热门文章和最新评论显示

### 4.2 性能测试
- [ ] 页面加载速度
- [ ] 滚动性能
- [ ] 大数据量下的渲染性能

### 4.3 兼容性测试
- [ ] 主流浏览器兼容性
- [ ] 不同设备尺寸的显示效果

## 5. 时间估算

| 任务 | 时间估算（小时） |
|------|----------------|
| 增强 PostCard 组件 | 4 |
| 实现封面位置交替布局 | 2 |
| 添加广告插入功能 | 3 |
| 增强 API 服务 | 3 |
| 优化 SidebarPanel 组件 | 4 |
| 测试和调试 | 4 |
| **总计** | **20** |

## 6. 结论

通过本方案的实施，当前博客项目将在保持现代化技术架构的同时，实现与旧博客项目的功能对齐，为用户提供更加丰富和友好的内容浏览体验。

实施过程中应注重代码质量和用户体验，确保每一步修改都经过充分测试，以达到最佳的实现效果。