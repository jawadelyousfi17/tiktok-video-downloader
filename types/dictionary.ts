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
  /**
   * Long-form body copy for each landing page. A downloader is a thin
   * page by nature — one heading and an input box give Google almost
   * nothing to rank. These blocks are the substance: prose that answers
   * what the tool does, a spec table, per-device walkthroughs, and the
   * situations people actually use it for.
   *
   * Every block is written per page rather than shared, because the same
   * paragraphs repeated across /, /mp3, /photos and /carousel would read
   * as duplicate content and none of the four would rank well.
   */
  content: {
    home: PageContent;
    mp3: PageContent;
    photos: PageContent;
    carousel: PageContent;
  };
}

export interface PageContent {
  intro: IntroCopy;
  specs: SpecTable;
  guides: PlatformGuides;
  useCases: UseCases;
}

/** Opening prose block — the main body text Google indexes for the page. */
export interface IntroCopy {
  title: string;
  /** Rendered as separate <p> elements, in order. */
  paragraphs: string[];
}

/**
 * "What you get" table. Tables win featured snippets for comparison
 * queries and give scanners something to read without wading through prose.
 */
export interface SpecTable {
  title: string;
  subtitle: string;
  columns: SpecRow;
  rows: SpecRow[];
}

export interface SpecRow {
  feature: string;
  value: string;
  note: string;
}

/**
 * Per-device walkthroughs. Targets long-tail queries like "download
 * tiktok video without watermark on iphone", which convert far better
 * than the generic head term.
 */
export interface PlatformGuides {
  title: string;
  subtitle: string;
  platforms: PlatformGuide[];
}

export interface PlatformGuide {
  /** Device family label, e.g. "iPhone & iPad". */
  name: string;
  steps: string[];
}

export interface UseCases {
  title: string;
  subtitle: string;
  items: Array<{ title: string; body: string }>;
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
