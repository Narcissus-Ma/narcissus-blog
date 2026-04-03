import { Outlet } from 'react-router-dom';

import styles from './blog-layout.module.css';

import { ClickEffect } from '@/components/atoms/click-effect/click-effect';
import { Loading } from '@/components/atoms/loading/loading';
import { UniverseEffect } from '@/components/atoms/universe-effect/universe-effect';
import { HeaderNav } from '@/components/organisms/header-nav/header-nav';
import { useInitTheme } from '@/hooks/use-init-theme';
import { useSiteBootstrap } from '@/hooks/use-site-bootstrap';
import { useThemeStore } from '@/stores/theme-store';

export function BlogLayout() {
  useInitTheme();
  useSiteBootstrap();
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className={styles.page}>
      <Loading />
      <UniverseEffect isDarkMode={theme === 'dark'} />
      <ClickEffect type="fireworks" />
      <HeaderNav />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
