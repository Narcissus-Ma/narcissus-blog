export interface NavItem {
  name: string;
  path: string;
}

export interface HomeRecommendation {
  title: string;
  articleId: string;
}

export interface PopupNoticeSetting {
  enabled: boolean;
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
  homeOnly: boolean;
}

export interface SiteSetting {
  siteName: string;
  siteDescription: string;
  navItems: NavItem[];
  recommendations: HomeRecommendation[];
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage: string;
  popupNotice: PopupNoticeSetting;
}
