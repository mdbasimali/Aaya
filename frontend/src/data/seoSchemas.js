const BASE_URL = 'https://reeyanshayacare.in';

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BASE_URL}/#business`,
  name: 'Reeyansh Aya Care',
  alternateName: ['Reeyansh AYA Care', 'Reeyansh Home Care Rampurhat'],
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/logo.png`,
  telephone: '+919046585943',
  email: 'reeyanshayacare@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rampurhat Bharsala, near BLRO Office',
    addressLocality: 'Rampurhat',
    addressRegion: 'West Bengal',
    addressCountry: 'IN',
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Rampurhat',
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Birbhum',
      },
    },
    {
      '@type': 'AdministrativeArea',
      name: 'West Bengal',
    },
    {
      '@type': 'Country',
      name: 'India',
    },
  ],
  description:
    'Reeyansh Aya Care provides compassionate and trusted in-home caregiver and aya care services in Rampurhat, Birbhum, and across West Bengal. Specializing in old woman care, old man care, pregnancy woman care, newborn baby care, and child care (2 to 7 years).',
  priceRange: '₹₹',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Caregiver & Aya Care Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Old Woman Care',
          description: 'Compassionate, dignified in-home personal care, mobility, and medication reminders for senior women.',
          url: `${BASE_URL}/services/old-woman-care`,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Old Man Care',
          description: 'Respectful, attentive daily physical care, mobility assistance, and companionship for elderly men.',
          url: `${BASE_URL}/services/old-man-care`,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Pregnancy Woman Care',
          description: 'Holistic prenatal and postnatal in-home support for expectant and recovering mothers.',
          url: `${BASE_URL}/services/pregnancy-woman-care`,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Newborn Baby Care',
          description: 'Gentle, hygienic 24/7 infant feeding, traditional massage, bathing, and nighttime care.',
          url: `${BASE_URL}/services/newborn-baby-care`,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Child Care (2 to 7 Years)',
          description: 'Safe, nurturing daytime supervision, learning activities, nutritious meal support, and play routines.',
          url: `${BASE_URL}/services/child-care`,
        },
      },
    ],
  },
  sameAs: ['https://wa.me/919046585943'],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'Reeyansh Aya Care',
  description: 'Aya Care & Home Caregiver Services in Rampurhat, West Bengal',
  publisher: {
    '@id': `${BASE_URL}/#business`,
  },
  inLanguage: 'en-IN',
};

export const createBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
  })),
});

export const createServiceSchema = (service) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.title,
  serviceType: service.category,
  description: service.overview,
  provider: {
    '@id': `${BASE_URL}/#business`,
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Rampurhat',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'West Bengal',
    },
    {
      '@type': 'Country',
      name: 'India',
    },
  ],
  offers: {
    '@type': 'Offer',
    url: `${BASE_URL}/services/${service.id}`,
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
  },
});
