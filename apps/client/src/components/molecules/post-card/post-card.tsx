import type { ArticleSummary } from '@narcissus/shared';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import styles from './post-card.module.css';

interface PostCardProps {
  item: ArticleSummary;
}

export function PostCard({ item }: PostCardProps) {
  return (
    <article className={styles.card}>
      <Link className={styles.coverLink} to={`/post/${item.slug}`}>
        <img
          className={styles.cover}
          src={item.coverUrl || 'https://via.placeholder.com/800x500?text=Narcissus+Blog'}
          alt={item.title}
        />
      </Link>
      <div className={styles.content}>
        <div className={styles.meta}>{item.categoryName || '未分类'}</div>
        <Link className={styles.title} to={`/post/${item.slug}`}>
          {item.title}
        </Link>
        <p className={styles.excerpt}>{item.excerpt || '暂无摘要内容。'}</p>
        <div className={styles.footer}>
          <span>{dayjs(item.publishedAt || item.createdAt).format('YYYY-MM-DD')}</span>
          <span>{item.tags.slice(0, 2).join(' / ') || '无标签'}</span>
        </div>
      </div>
    </article>
  );
}
