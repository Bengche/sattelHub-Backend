/**
 * SATTELHUB.DE — SINGLE SOURCE OF TRUTH
 * All site-wide contact info, branding, and constants live here.
 * Update here and it propagates everywhere across the application.
 */

const SITE_CONFIG = {
  name: "Sattelhub.de",
  tagline: "Hochwertige Reitsättel für anspruchsvolle Reiter",
  description:
    "Sattelhub.de bietet eine hochwertige Auswahl an Reitsätteln für Westernreiten, englisches Reiten, Dressur, Springen und Ausritte. 30 Tage kostenlos testen.",
  url: "https://sattelhub.de",
  logo: "/logo.svg",
  faviconUrl: "/favicon.ico",

  contact: {
    supportEmail: "support@sattelhub.de",
    salesEmail: "sales@sattelhub.de",
    phone: "+1 (914) 432-9936",
    whatsapp: "+1 (669) 247-2718",
    whatsappLink: "https://wa.me/16692472718",
  },

  address: {
    street: "8 Thackeray St",
    city: "London",
    state: "",
    zip: "W8 5ET",
    country: "UK",
    countryFull: "United Kingdom",
    full: "8 Thackeray St, London W8 5ET, United Kingdom",
  },

  email: {
    fromName: process.env.FROM_NAME || "Sattelhub.de",
    fromEmail: process.env.FROM_EMAIL || "support@sattelhub.de",
    // Admin order notifications go here. Override via ADMIN_EMAIL env var
    // so you can point to any inbox (e.g. a Gmail) without redeploying.
    adminEmail: process.env.ADMIN_EMAIL || "sales@sattelhub.de",
    salesEmail: "sales@sattelhub.de",
    replyTo: process.env.FROM_EMAIL || "support@sattelhub.de",
  },

  social: {
    facebook: "https://facebook.com/sattelhub",
    instagram: "https://instagram.com/sattelhub",
    twitter: "https://twitter.com/sattelhub",
    pinterest: "https://pinterest.com/sattelhub",
    youtube: "https://youtube.com/@sattelhub",
  },

  trial: {
    days: 30,
    description: "30 Tage kostenlos testen - risikofrei probereiten.",
  },

  currency: {
    code: "EUR",
    symbol: "€",
    locale: "de-DE",
  },

  seo: {
    defaultTitle: "Sattelhub.de - Hochwertige Reitsättel",
    titleTemplate: "%s | Sattelhub.de",
    defaultDescription:
      "Hochwertige Reitsättel bei Sattelhub.de kaufen: Western-, Englisch-, Dressur-, Spring- und Wandersättel. 30 Tage kostenlos testen und ab 2.000 EUR versandkostenfrei bestellen.",
    keywords: [
      "Reitsättel",
      "Reitsattel kaufen",
      "Westernreitsättel",
      "englische Reitsättel",
      "Dressursättel",
      "Springsättel",
      "Wandersättel",
      "Reitsättel kaufen",
      "hochwertige Reitsättel",
      "Sattelhub",
      "Pferdesättel",
      "maßgefertigte Reitsättel",
      "Ledersättel",
    ],
    ogImage: "/og-image.jpg",
    twitterCard: "summary_large_image",
    twitterSite: "@saddlesmarket",
  },

  shipping: {
    freeShippingThreshold: 2000,
    standardShippingCost: 49,
    expressShippingCost: 99,
    standardDays: "5-7",
    expressDays: "2-3",
    internationalDays: "10-21",
  },

  policies: {
    returnDays: 30,
    trialDays: 30,
  },

  cart: {
    abandonmentEmails: 3,
    abandonmentIntervals: [1, 3, 7], // days after abandonment
  },

  admin: {
    email: "support@sattelhub.de",
  },

  pwa: {
    name: "SattelHub",
    shortName: "SattelHub",
    themeColor: "#1C3557",
    backgroundColor: "#FAFAF7",
  },
};

module.exports = SITE_CONFIG;
