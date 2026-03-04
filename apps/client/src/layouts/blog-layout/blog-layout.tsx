import { Outlet } from 'react-router-dom';

import styles from './blog-layout.module.css';

import { HeaderNav } from '@/components/organisms/header-nav/header-nav';
import { useInitTheme } from '@/hooks/use-init-theme';
import { useSiteBootstrap } from '@/hooks/use-site-bootstrap';

export function BlogLayout() {
  useInitTheme();
  useSiteBootstrap();

  return (
    <div className={styles.page}>
      <HeaderNav />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
