import { SITE } from '@/shared/lib/site';

/**
 * SEO metadata component utilizing React 19 native head element hoisting.
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.path - Route path (e.g. "/" or "/catalog")
 * @param {string} [props.image] - OpenGraph image URL
 * @param {'website'|'article'} [props.type] - OG type
 * @param {boolean} [props.noindex] - If true, adds robots noindex,nofollow
 */
export function Seo({
  title,
  description = SITE.description,
  path = '/',
  image = SITE.defaultImage,
  type = 'website',
  noindex = false,
}) {
  const url = `${SITE.url}${path}`;
  const fullTitle = title === SITE.name ? title : `${title} | ${SITE.name}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
