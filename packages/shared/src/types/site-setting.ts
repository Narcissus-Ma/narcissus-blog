export interface NavItem {
  name: string;
  path: string;
}

export interface HomeRecommendation {
  title: string;
  articleId: string;
}

export interface SiteSetting {
  siteName: string;
  siteDescription: string;
  navItems: NavItem[];
  recommendations: HomeRecommendation[];
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage: string;
}
