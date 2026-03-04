import { BulbOutlined, SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import styles from './header-nav.module.css';

import { useSiteStore } from '@/stores/site-store';
import { useThemeStore } from '@/stores/theme-store';

export function HeaderNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { siteName, navItems } = useSiteStore();
  const { toggleTheme } = useThemeStore();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.logo} to="/">
          {siteName}
        </Link>
        <nav className={styles.menu}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
              to={item.path}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Input
            className={styles.search}
            allowClear
            prefix={<SearchOutlined />}
            placeholder="请输入搜索关键词"
            onPressEnter={(event) => {
              const value = event.currentTarget.value.trim();
              if (value) {
                navigate(`/search?keyword=${encodeURIComponent(value)}`);
              }
            }}
          />
          <button className={styles.iconButton} type="button" onClick={toggleTheme}>
            <BulbOutlined />
          </button>
        </div>
      </div>
    </header>
  );
}
