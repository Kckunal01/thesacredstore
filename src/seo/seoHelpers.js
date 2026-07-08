// SEO helper functions
import { SITE_URL } from "../config";

export function getPageSEO({ title, description, slug }) {
  const canonical = `${SITE_URL}${slug || ''}`;
  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
    ogImage: `${SITE_URL}/og-image.png`, // placeholder
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: `${SITE_URL}/og-image.png`,
  };
}

export function getProductSEO(product) {
  const description = product.details?.slice(0, 160) || `${product.name} – high quality crystal.`;
  const canonical = `${SITE_URL}/product/${product.slug}`;
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images?.[0] || `${SITE_URL}/placeholder.png`,
    description,
    sku: product.id?.toString() || "",
    brand: { "@type": "Brand", name: "The Sacred Store" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price ?? 0,
      url: canonical,
      availability: "https://schema.org/InStock",
    },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: product.category, item: `${SITE_URL}/category/${product.category}` },
      { "@type": "ListItem", position: 3, name: product.name, item: canonical },
    ],
  };
  return { ...getPageSEO({ title: product.name, description, slug: `/product/${product.slug}` }), jsonLd, breadcrumb };
}

export function getBundleSEO(bundle) {
  const description = bundle.description?.slice(0, 160) || `${bundle.name} bundle of curated crystals.`;
  const canonical = `${SITE_URL}/bundles/${bundle.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bundle.name,
    image: bundle.coverImage,
    description,
    offers: { "@type": "Offer", priceCurrency: "INR", price: bundle.price, url: canonical, availability: "https://schema.org/InStock" },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Bundles", item: `${SITE_URL}/bundles` },
      { "@type": "ListItem", position: 3, name: bundle.name, item: canonical },
    ],
  };
  return { ...getPageSEO({ title: bundle.name, description, slug: `/bundles/${bundle.slug}` }), jsonLd, breadcrumb };
}

export function getBlogSEO(post) {
  const description = post.excerpt?.slice(0, 160) || post.title;
  const canonical = `${SITE_URL}/blogs/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.coverImage,
    author: { "@type": "Person", name: post.author || "The Sacred Store" },
    datePublished: post.published_at,
    description,
    url: canonical,
  };
  return { ...getPageSEO({ title: post.title, description, slug: `/blogs/${post.slug}` }), jsonLd };
}
