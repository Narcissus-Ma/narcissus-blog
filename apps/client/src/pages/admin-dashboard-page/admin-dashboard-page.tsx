import { Link } from 'react-router-dom';

import styles from './admin-dashboard-page.module.css';

export function AdminDashboardPage() {
  return (
    <section className={styles.page}>
      <h1>后台工作台</h1>
      <p>可在这里快速进入文章管理、分类标签管理和站点配置。</p>
      <div className={styles.links}>
        <Link to="/admin/articles">文章管理</Link>
        <Link to="/admin">站点配置（待扩展）</Link>
      </div>
    </section>
  );
}
