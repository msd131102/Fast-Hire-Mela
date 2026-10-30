import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SEO_CONFIG from '../../config/seoConfig';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
  structuredData = [],
  additionalMeta = [],
  isHomepage = false
}) => {
  const siteConfig = SEO_CONFIG.site;
  // For homepage, use exact title without suffix. For other pages, add " – FastHireMela" suffix
  const fullTitle = isHomepage ? (title || siteConfig.defaultTitle) : 
                   (title ? `${title} – ${siteConfig.defaultTitle}` : siteConfig.defaultTitle);
  const siteDescription = description || siteConfig.defaultDescription;
  const siteKeywords = keywords || siteConfig.keywords;
  const siteImage = ogImage || siteConfig.defaultImage;
  const siteUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  // Default structured data for job site
  const defaultStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/jobs?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}${siteConfig.defaultImage}`,
      description: siteDescription,
      sameAs: [
        // Add social media URLs when available
      ]
    }
  ];

  const allStructuredData = [...defaultStructuredData, ...structuredData];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content="Fast Hire Mela" />
      
      {/* Robots Meta Tag */}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:site_name" content="Fast Hire Mela" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
      <meta name="twitter:site" content="@fasthiremela" />
      
      {/* Additional Meta Tags */}
      {additionalMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
      
      {/* Google Search Console Verification */}
      <meta name="google-site-verification" content="your-google-verification-code-here" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="application-name" content="Fast Hire Mela" />
      <meta name="apple-mobile-web-app-title" content="Fast Hire Mela" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Helmet>
  );
};

export default SEO;
