import type { CategoryItem, TagItem } from '@narcissus/shared';

import styles from './sidebar-panel.module.css';

interface SidebarPanelProps {
  categories: CategoryItem[];
  tags: TagItem[];
}

export function SidebarPanel({ categories, tags }: SidebarPanelProps) {
  return (
    <aside className={styles.aside}>
      <section className={styles.card}>
        <h3 className={styles.title}>关于我</h3>
        <p className={styles.text}>Narcissus，记录前端、服务端与 AI 学习实践。</p>
      </section>
      <section className={styles.card}>
        <h3 className={styles.title}>分类</h3>
        <div className={styles.list}>
          {categories.map((item) => (
            <span key={item.id} className={styles.pill}>
              {item.name} ({item.articleCount})
            </span>
          ))}
        </div>
      </section>
      <section className={styles.card}>
        <h3 className={styles.title}>标签</h3>
        <div className={styles.list}>
          {tags.map((item) => (
            <span key={item.id} className={styles.pill}>
              #{item.name}
            </span>
          ))}
        </div>
      </section>
    </aside>
  );
}
