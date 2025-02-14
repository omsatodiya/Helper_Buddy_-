import Script from 'next/script';

const OrganizationSchema = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Helper Buddy',
    url: 'https://dudhkela.netlify.app',
    logo: 'https://dudhkela.netlify.app/images/logo.jpg',
    sameAs: [
      // Add your social media URLs here
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXXXXXXXX',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi']
    }
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default OrganizationSchema; 