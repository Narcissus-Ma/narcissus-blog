import { useQuery } from '@tanstack/react-query';

import styles from './categories-page.module.css';

import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function CategoriesPage() {
  const { data = [] } = useQuery({
    queryKey: ['categories-page'],
    queryFn: taxonomyService.getPublicCategories,
  });

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>分类</h1>
      <div className={styles.grid}>
        {data.map((item) => (
          <div key={item.id} className={styles.card}>
            <h3>{item.name}</h3>
            <p>{item.description || '暂无分类描述'}</p>
            <span>{item.articleCount} 篇文章</span>
          </div>
        ))}
      </div>
    </section>
  );
}
