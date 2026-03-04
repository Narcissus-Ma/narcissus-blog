import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';

import styles from './post-detail-page.module.css';

import { articlesService } from '@/features/articles/services/articles-service';

export function PostDetailPage() {
  const { slug = '' } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['post-detail', slug],
    queryFn: () => articlesService.getPublicDetail(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return <div className={styles.state}>文章加载中...</div>;
  }

  if (isError || !data) {
    return <div className={styles.state}>文章不存在或已下线。</div>;
  }

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.meta}>分类：{data.categoryName || '未分类'}</p>
      </header>
      <section className={styles.markdown}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
      </section>
    </article>
  );
}
