PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_SiteSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteName" TEXT NOT NULL DEFAULT 'Narcissus的个人博客',
    "siteDescription" TEXT NOT NULL DEFAULT '分享一些程序员开发，生活学习记录',
    "navItems" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "popupNotice" JSONB NOT NULL,
    "defaultSeoTitle" TEXT NOT NULL DEFAULT 'Narcissus的个人博客',
    "defaultSeoDescription" TEXT NOT NULL DEFAULT '分享一些程序员开发，生活学习记录',
    "defaultOgImage" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_SiteSetting" (
    "id",
    "siteName",
    "siteDescription",
    "navItems",
    "recommendations",
    "popupNotice",
    "defaultSeoTitle",
    "defaultSeoDescription",
    "defaultOgImage",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "siteName",
    "siteDescription",
    "navItems",
    "recommendations",
    '{"enabled":false,"title":"通知","message":"你好呀","ctaText":"查看更多","ctaLink":"/about","homeOnly":true}',
    "defaultSeoTitle",
    "defaultSeoDescription",
    "defaultOgImage",
    "createdAt",
    "updatedAt"
FROM "SiteSetting";

DROP TABLE "SiteSetting";
ALTER TABLE "new_SiteSetting" RENAME TO "SiteSetting";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
