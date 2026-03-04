import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import styles from './archives-page.module.css';

import { articlesService } from '@/features/articles/services/articles-service';

export function ArchivesPage() {
  const { data } = useQuery({
    queryKey: ['archives-page'],
    queryFn: () => articlesService.getPublicList({ page: 1, pageSize: 100 }),
  });

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>归档</h1>
      <ul className={styles.list}>
        {data?.list.map((item) => (
          <li key={item.id} className={styles.item}>
            <span>{dayjs(item.publishedAt || item.createdAt).format('YYYY-MM-DD')}</span>
            <Link to={`/post/${item.slug}`}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
