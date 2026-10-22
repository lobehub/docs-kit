/**
 * Joins a page title and the site title for `<title>` and `og:title`. When the
 * page is titled after the site (typically the home page), the site title is
 * shown once instead of `Site - Site`.
 */
export const formatPageTitle = (pageTitle: string, siteTitle: string): string =>
  pageTitle.trim() === siteTitle.trim() ? siteTitle : `${pageTitle} - ${siteTitle}`;
