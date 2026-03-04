import { Link } from 'react-router-dom';

import styles from './category-bar.module.css';

export interface CategoryBarItem {
  name: string;
  path: string;
}

interface CategoryBarProps {
  items: CategoryBarItem[];
}

export function CategoryBar({ items }: CategoryBarProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        <Link className={styles.item} to="/">
          首页
        </Link>
        {items.map((item) => (
          <Link key={item.path} className={styles.item} to={item.path}>
            {item.name}
          </Link>
        ))}
      </div>
      <Link className={styles.more} to="/categories">
        更多
      </Link>
    </div>
  );
}
