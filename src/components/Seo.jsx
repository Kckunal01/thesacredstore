import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Seo({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
  twitterTitle,
  twitterDescription,
  twitterImage,
  jsonLd,
}) {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* OpenGraph */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
      {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
      <meta name="twitter:card" content="summary_large_image" />

      {/* JSON‑LD */}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
