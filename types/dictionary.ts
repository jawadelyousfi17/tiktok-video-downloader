/**
 * Shape every locale JSON in lib/i18n/dictionaries must satisfy.
 * Adding a new key here is a compile-time signal that every locale file
 * needs the same key, so translations cannot silently drift.
 */
export interface Dictionary {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  nav: {
    skipToContent: string;
    brand: string;
    tagline: string;
    languageMenu: string;
    currentLanguage: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    form: {
      label: string;
      placeholder: string;
      paste: string;
      pasted: string;
      clear: string;
      submit: string;
      submitting: string;
      errorEmpty: string;
      errorInvalid: string;
      errorClipboard: string;
      successHint: string;
      errorFetch: string;
      errorRateLimit: string;
      errorServer: string;
    };
    trust: {
      noWatermark: string;
      hd: string;
      free: string;
      private: string;
    };
  };
  result: {
    durationLabel: string;
    seconds: string;
    byAuthor: string;
    photoCount: string;
    downloadHd: string;
    downloadStandard: string;
    downloadAudio: string;
    downloadPhoto: string;
    downloadAll: string;
    preparingZip: string;
    saving: string;
    newSearch: string;
  };
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Array<{ title: string; body: string }>;
  };
  how: {
    eyebrow: string;
    title: string;
    steps: Array<{ title: string; body: string }>;
  };
  footer: {
    tagline: string;
    rights: string;
    disclaimer: string;
  };
  /**
   * Per-variant landing copy. Each entry powers a sibling page under
   * /[lang]/<slug> with its own SEO targeting (e.g. "tiktok mp3
   * downloader" vs the generic video downloader on the home page).
   * Adding a key here triggers the type checker for every locale JSON.
   */
  variants: {
    mp3: VariantCopy;
    photos: VariantCopy;
    carousel: VariantCopy;
  };
  /** Internal link labels for the footer "More TikTok tools" row. */
  tools: {
    sectionLabel: string;
    home: string;
    mp3: string;
    photos: string;
    carousel: string;
  };
  /**
   * Per-page FAQ blocks. Each variant page picks its own entry; the home
   * page uses faq.home. Adding a key here forces every locale JSON to
   * supply the same FAQ shape, so Google's FAQPage rich result will
   * render in every language consistently.
   */
  faq: {
    home: FaqSection;
    mp3: FaqSection;
    photos: FaqSection;
    carousel: FaqSection;
  };
}

export interface FaqSection {
  sectionTitle: string;
  items: Array<{ question: string; answer: string }>;
}

export interface VariantCopy {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  h1: string;
  subtitle: string;
}
