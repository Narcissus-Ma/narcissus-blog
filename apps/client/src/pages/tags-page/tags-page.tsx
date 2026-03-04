import { useQuery } from '@tanstack/react-query';

import styles from './tags-page.module.css';

import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function TagsPage() {
  const { data = [] } = useQuery({
    queryKey: ['tags-page'],
    queryFn: taxonomyService.getPublicTags,
  });

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>标签</h1>
      <div className={styles.wrap}>
        {data.map((item) => (
          <span key={item.id} className={styles.tag}>
            #{item.name} ({item.articleCount})
          </span>
        ))}
      </div>
    </section>
  );
}
