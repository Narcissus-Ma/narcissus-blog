import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { BlogLayout } from '@/layouts/blog-layout/blog-layout';
import { AdminArticlesPage } from '@/pages/admin-articles-page/admin-articles-page';
import { AdminDashboardPage } from '@/pages/admin-dashboard-page/admin-dashboard-page';
import { AdminLoginPage } from '@/pages/admin-login-page/admin-login-page';
import { ArchivesPage } from '@/pages/archives-page/archives-page';
import { CategoriesPage } from '@/pages/categories-page/categories-page';
import { HomePage } from '@/pages/home-page/home-page';
import { NotFoundPage } from '@/pages/not-found-page/not-found-page';
import { PostDetailPage } from '@/pages/post-detail-page/post-detail-page';
import { SearchPage } from '@/pages/search-page/search-page';
import { TagsPage } from '@/pages/tags-page/tags-page';
import { useAuthStore } from '@/stores/auth-store';

function RequireAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route element={<BlogLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:slug" element={<PostDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/archives" element={<ArchivesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/articles" element={<AdminArticlesPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
