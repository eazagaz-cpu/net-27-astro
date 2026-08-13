/**
 * Shape of the long-form prose pages (about, contact and the five legal
 * documents) in every routed locale.
 *
 * This content lives here rather than in src/i18n/locales/*.json for two
 * reasons. The JSON files carry short interface strings and the i18n validator
 * demands key parity across all nineteen locales; dropping ~5,700 words of
 * legal prose into them would demand nineteen legal translations before the
 * validator would go green again. And legal text is structured — ordered
 * clauses, numbered lists, contact blocks — which a flat string map cannot
 * express without losing the ordering that makes a DMCA notice valid.
 *
 * Locales without an entry here fall back to English, exactly as the interface
 * strings do.
 */

/** A row inside a bordered contact/source card. */
export interface CardRow {
  /** Plain line, e.g. the company name under "DMCA Agent". */
  text?: string;
  /** Label for a `label: value` line, or the heading of a label/sub pair. */
  label?: string;
  /** Value paired with `label` on the same line. */
  value?: string;
  /** Makes `value` (or `text`) a link. */
  href?: string;
  /** Secondary line under `label`, used by the editorial source list. */
  sub?: string;
  /** Renders `text` in the primary colour, for a card's own title row. */
  strong?: boolean;
}

/** A single bullet whose lead-in term is emphasised. */
export interface TermItem {
  term: string;
  text: string;
}

/** One inline link inside a paragraph, substituted for the `{link}` token. */
export interface InlineLink {
  anchor: string;
  href: string;
}

export type Block =
  | { t: 'p'; text: string; link?: InlineLink }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'dl'; items: TermItem[] }
  | { t: 'card'; rows: CardRow[] };

export interface DocSection {
  heading: string;
  blocks: Block[];
}

/** A prose page rendered by LegalPage.astro. */
export interface LegalDoc {
  /** Breadcrumb label and <h1>; kept separate because they differ on some pages. */
  breadcrumb: string;
  h1: string;
  /** Standfirst under the <h1>, used by the editorial policy. */
  standfirst?: string;
  seoTitle: string;
  seoDescription: string;
  /** The "Last updated: …" line. Dates are never localised away — see notes. */
  updated?: string;
  sections: DocSection[];
}

/** The about page: bespoke layout, so its fields are named rather than generic. */
export interface AboutDoc {
  breadcrumb: string;
  seoTitle: string;
  seoDescription: string;
  /**
   * <h1> with a `{name}` token where the brand goes, so "NetMirror" keeps its
   * gradient treatment untranslated and each language puts it in its own
   * natural position ("About NetMirror" vs "NetMirror के बारे में").
   */
  h1: string;
  lead: string[];
  body: string[];
  featuresHeading: string;
  features: { title: string; description: string }[];
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
  footnote: string;
}

/** The contact page: form labels plus two sidebar cards. */
export interface ContactDoc {
  breadcrumb: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  lead: string;
  form: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectOptions: { general: string; feedback: string; bug: string; content: string; dmca: string; other: string };
    message: string;
    messagePlaceholder: string;
    submit: string;
  };
  infoHeading: string;
  emailLabel: string;
  responseLabel: string;
  responseValue: string;
  faqHeading: string;
  faqs: { question: string; answer: string }[];
}

export type LegalDocKey = 'privacy' | 'terms' | 'disclaimer' | 'dmca' | 'editorial';

export interface StaticDocs {
  about: AboutDoc;
  contact: ContactDoc;
  privacy: LegalDoc;
  terms: LegalDoc;
  disclaimer: LegalDoc;
  dmca: LegalDoc;
  editorial: LegalDoc;
}
