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

/* ------------------------------------------------------------------ *
 * Help guides and the app download page.
 *
 * These pages are dense troubleshooting documents rather than flowing
 * prose, so they get their own block vocabulary. Inline emphasis and links
 * use a tiny markup — `**bold**` and `[label](href)` — which the renderer
 * turns into real elements. That keeps translated strings free of HTML and
 * means no translation can inject markup.
 * ------------------------------------------------------------------ */

/** A titled card with a body paragraph, optionally with its own fix list. */
export interface HelpCard {
  title: string;
  text: string;
  /** Heading above the fix list ("How to fix:", "Solution:"). */
  solutionHeading?: string;
  items?: string[];
  /** Numbered rather than bulleted fix list. */
  ordered?: boolean;
}

export type HelpBlock =
  /** Stack of cards. `roomy` matches the larger p-6 variant. */
  | { t: 'cards'; roomy?: boolean; cards: HelpCard[] }
  /** Numbered steps in accent circles. */
  | { t: 'steps'; intro?: string; steps: { title: string; text: string }[] }
  /** Plain paragraphs. */
  | { t: 'prose'; paragraphs: string[] }
  /** Two-column grid of short bullet lists. */
  | { t: 'tipGrid'; tips: { title: string; items: string[] }[] }
  /** Single card of tick-marked lines. */
  | { t: 'checklist'; items: string[] }
  /** Two-column grid of linked cards. */
  | { t: 'linkCards'; cards: { title: string; text: string; href: string }[] }
  /** Plain list of links. */
  | { t: 'linkList'; links: { label: string; href: string }[] }
  /** APK download cards: name, spec line, blurb and a button. */
  | { t: 'downloads'; items: { title: string; meta: string; text: string; button: string; variant: ApkVariant }[] }
  /** Bullet list whose lead-in label is coloured rather than bold. */
  | { t: 'labelList'; title: string; items: { label: string; text: string }[] };

/** Which APK a download card points at; URLs live in lib/constants. */
export type ApkVariant = 'universal' | 'arm64' | 'arm32';

export interface HelpSection {
  heading: string;
  blocks: HelpBlock[];
}

/** A help guide or the download page. */
export interface HelpDoc {
  breadcrumb: string;
  /** Middle breadcrumb crumb ("Help"), omitted on the download page. */
  breadcrumbParent?: string;
  seoTitle: string;
  seoDescription: string;
  /** <h1> prefix before the gradient-highlighted subject. */
  h1Prefix?: string;
  /** The gradient-highlighted part of the <h1>. */
  h1Highlight: string;
  /** Opening card under the <h1>. */
  intro: string;
  sections: HelpSection[];
  faqs: { question: string; answer: string }[];
  /** Small print at the foot of the page, after the "Disclaimer:" lead-in. */
  disclaimerLabel: string;
  disclaimer: string;
}

export type HelpDocKey = 'appNotInstalled' | 'parsingPackageError' | 'videoNotPlaying' | 'appDownload';

export type HelpDocs = Record<HelpDocKey, HelpDoc>;
