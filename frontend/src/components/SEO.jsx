import { useEffect } from 'react';

const BASE_URL = 'https://reeyanshayacare.in';
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

function setMetaTag(attribute, key, content) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLd(schemaId, schemaData) {
  let script = document.getElementById(schemaId);
  if (!schemaData) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = schemaId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaData);
}

export default function SEO({
  title,
  description,
  canonical = '',
  keywords = '',
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  schema = null,
}) {
  const fullCanonicalUrl = `${BASE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`.replace(/\/+$/, '') || BASE_URL;

  useEffect(() => {
    // 1. Document Title
    if (title) {
      document.title = title;
    }

    // 2. Standard Meta Tags
    if (description) {
      setMetaTag('name', 'description', description);
    }
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('name', 'geo.region', 'IN-WB');
    setMetaTag('name', 'geo.placename', 'Rampurhat, Birbhum, West Bengal');

    // 3. Canonical Link
    setCanonical(fullCanonicalUrl);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:site_name', 'Reeyansh Aya Care');
    setMetaTag('property', 'og:locale', 'en_IN');
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', fullCanonicalUrl);
    if (title) setMetaTag('property', 'og:title', title);
    if (description) setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImage);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    if (title) setMetaTag('name', 'twitter:title', title);
    if (description) setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Page-Level JSON-LD Schema
    if (schema) {
      setJsonLd('page-structured-data', schema);
    }

    return () => {
      // Clean up page-specific schema on route transition
      setJsonLd('page-structured-data', null);
    };
  }, [title, description, canonical, keywords, ogImage, ogType, fullCanonicalUrl, schema]);

  return null;
}
