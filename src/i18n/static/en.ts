import type { StaticDocs } from './types';

/**
 * English source of the prose pages, transcribed verbatim from the original
 * routes so the English output is byte-identical to what shipped before.
 *
 * Do not "tidy" this copy. Several strings contain inconsistencies inherited
 * from the original pages (the bare `net27.cc` spelling, the `Net27` product
 * name in the contact FAQ, the January 2025 effective date). They are carried
 * across on purpose; changing them here would change the legal text and the
 * English pages at the same time. They are reported to the site owner instead.
 */
const en: StaticDocs = {
  about: {
    breadcrumb: 'About',
    seoTitle: 'About NetMirror — Movie Discovery Platform',
    seoDescription:
      'NetMirror helps you discover where to watch movies, TV shows and anime legally across Netflix, Prime Video and 30+ streaming platforms.',
    h1: 'About {name}',
    lead: [
      'NetMirror (net-27.cc) is a free movie and TV show discovery platform that helps you find where to watch movies, TV shows, and anime legally across Netflix, Prime Video, Disney+, JioHotstar, Crunchyroll, and 30+ streaming platforms worldwide. NetMirror does not host or stream any content — it is a search and discovery tool only.',
      'We believe finding great content to watch should be effortless. NetMirror is your companion for discovering movies, TV shows, and anime across every major streaming platform.',
    ],
    body: [
      "NetMirror was built out of a simple frustration: with dozens of streaming platforms available today, finding where to watch a specific title shouldn't require checking each service individually. We created a unified discovery platform that aggregates availability information so you can spend less time searching and more time watching.",
      "Our platform covers movies, TV shows, and anime from all major streaming services including Netflix, Prime Video, Disney+, Hulu, Apple TV+, Crunchyroll, HBO Max, and Paramount+. Whether you're looking for the latest blockbuster, a classic drama, or the newest anime series, NetMirror helps you find it instantly.",
      'We are committed to supporting legal streaming. NetMirror does not host, stream, or distribute any copyrighted content. We provide discovery and availability information only, directing users to official streaming platforms where titles can be watched legally.',
    ],
    featuresHeading: 'What We Offer',
    features: [
      {
        title: 'Smart Discovery',
        description:
          'Find exactly what you want to watch with our intelligent search and filtering system. Browse by genre, language, platform, and more.',
      },
      {
        title: 'Legal Streaming',
        description:
          'We only show legitimate streaming options. Know exactly where each title is available before you subscribe to a new platform.',
      },
      {
        title: 'Comprehensive Database',
        description:
          'Movies, TV shows, and anime all in one place. Our database covers titles from every major streaming platform worldwide.',
      },
    ],
    ctaHeading: 'Have Questions?',
    ctaBody:
      "We'd love to hear from you. Whether you have feedback, suggestions, or just want to say hello, feel free to reach out.",
    ctaButton: 'Contact Us',
    footnote:
      'NetMirror does not host, store, or stream any copyrighted content. All information is for discovery purposes only. All trademarks and content belong to their respective owners.',
  },

  contact: {
    breadcrumb: 'Contact',
    seoTitle: 'Contact Us — NetMirror Support',
    seoDescription:
      'Get in touch with the NetMirror team. Send feedback, report issues or ask questions about our movie and show discovery platform.',
    h1: 'Get in Touch',
    lead: "Have a question, suggestion, or want to report an issue? Fill out the form below and we'll get back to you as soon as possible.",
    form: {
      name: 'Full Name',
      namePlaceholder: 'Your name',
      email: 'Email Address',
      emailPlaceholder: 'you@example.com',
      subject: 'Subject',
      subjectOptions: {
        general: 'General Inquiry',
        feedback: 'Feedback',
        bug: 'Bug Report',
        content: 'Content Request',
        dmca: 'DMCA / Copyright',
        other: 'Other',
      },
      message: 'Message',
      messagePlaceholder: "Tell us what's on your mind...",
      submit: 'Send Message',
    },
    infoHeading: 'Contact Information',
    emailLabel: 'Email',
    responseLabel: 'Response Time',
    responseValue: 'We typically respond within 24-48 hours',
    faqHeading: 'Frequently Asked',
    faqs: [
      {
        question: 'Is Net27 free to use?',
        answer:
          'Yes, Net27 is completely free. We help you discover where to watch movies and shows legally.',
      },
      {
        question: 'Do you stream movies?',
        answer:
          'No. We are a discovery platform only. We provide information about where titles are available on official streaming services.',
      },
      {
        question: 'How do I report incorrect info?',
        answer:
          'Use the contact form with "Bug Report" as the subject, and include the title name and what information needs updating.',
      },
    ],
  },

  privacy: {
    breadcrumb: 'Privacy Policy',
    h1: 'Privacy Policy',
    seoTitle: 'Privacy Policy',
    seoDescription:
      'NetMirror privacy policy. Learn how we collect, use, and protect your personal information.',
    updated: 'Last updated: January 1, 2025',
    sections: [
      {
        heading: 'Introduction',
        blocks: [
          {
            t: 'p',
            text: 'NetMirror ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website net27.cc. Please read this policy carefully.',
          },
        ],
      },
      {
        heading: 'Information We Collect',
        blocks: [
          { t: 'p', text: 'We may collect information about you in various ways:' },
          {
            t: 'dl',
            items: [
              {
                term: 'Usage Data:',
                text: 'Browser type, operating system, pages visited, time spent, referring URLs, and other diagnostic data collected automatically when you access our website.',
              },
              {
                term: 'Contact Information:',
                text: 'If you contact us, we may collect your name, email address, and message content.',
              },
              {
                term: 'Local Storage:',
                text: 'We use browser local storage for features like watchlists. This data stays on your device and is not transmitted to our servers.',
              },
            ],
          },
        ],
      },
      {
        heading: 'How We Use Your Information',
        blocks: [
          {
            t: 'ul',
            items: [
              'To operate and maintain our website',
              'To improve user experience and website performance',
              'To analyze usage trends and optimize content',
              'To respond to your inquiries and support requests',
              'To comply with legal obligations',
            ],
          },
        ],
      },
      {
        heading: 'Cookies and Tracking',
        blocks: [
          {
            t: 'p',
            text: 'We may use cookies and similar tracking technologies to enhance your browsing experience. Cookies are small data files stored on your device. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.',
          },
          {
            t: 'p',
            text: 'We may use analytics services such as Google Analytics to collect and analyze usage data. These services may use cookies and other tracking technologies to collect information about your use of our website.',
          },
        ],
      },
      {
        heading: 'Third-Party Services',
        blocks: [
          {
            t: 'p',
            text: 'Our website may contain links to third-party streaming platforms and services. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party service you visit through our platform.',
          },
        ],
      },
      {
        heading: 'Data Security',
        blocks: [
          {
            t: 'p',
            text: 'We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
          },
        ],
      },
      {
        heading: "Children's Privacy",
        blocks: [
          {
            t: 'p',
            text: 'Our website is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.',
          },
        ],
      },
      {
        heading: 'Changes to This Policy',
        blocks: [
          {
            t: 'p',
            text: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the website after changes are posted constitutes your acceptance of the updated policy.',
          },
        ],
      },
      {
        heading: 'Contact Us',
        blocks: [
          { t: 'p', text: 'If you have questions about this Privacy Policy, please contact us at:' },
          {
            t: 'card',
            rows: [
              { label: 'Email', value: 'net27.cc@gmail.com' },
              { label: 'Website', value: 'net27.cc/contact', href: '/contact/' },
            ],
          },
        ],
      },
    ],
  },

  terms: {
    breadcrumb: 'Terms of Service',
    h1: 'Terms of Service',
    seoTitle: 'Terms of Service',
    seoDescription:
      'NetMirror terms of service. Read the terms and conditions governing your use of the NetMirror movie and show discovery platform.',
    updated: 'Last updated: January 1, 2025',
    sections: [
      {
        heading: 'Acceptance of Terms',
        blocks: [
          {
            t: 'p',
            text: 'By accessing and using NetMirror (net27.cc), you accept and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access the website.',
          },
        ],
      },
      {
        heading: 'Service Description',
        blocks: [
          {
            t: 'p',
            text: 'NetMirror is a content discovery and information platform. We provide information about movies, TV shows, and anime, including where they are available for legal streaming. We do not host, upload, store, or stream any media content.',
          },
          {
            t: 'p',
            text: 'All streaming availability information is provided for informational purposes only and may not always be current. We encourage users to verify availability directly on the respective streaming platform.',
          },
        ],
      },
      {
        heading: 'User Responsibilities',
        blocks: [
          {
            t: 'ul',
            items: [
              'You agree to use the website only for lawful purposes.',
              'You will not attempt to access, tamper with, or use non-public areas of the website.',
              'You will not attempt to interfere with or disrupt the website or servers.',
              'You will not scrape, crawl, or use automated means to access the website without our permission.',
              'You will not use the website to violate any applicable local, national, or international law.',
            ],
          },
        ],
      },
      {
        heading: 'Intellectual Property',
        blocks: [
          {
            t: 'p',
            text: 'The NetMirror website, including its original content, features, and functionality, is owned by NetMirror and protected by international copyright, trademark, and other intellectual property laws.',
          },
          {
            t: 'p',
            text: 'All third-party trademarks, service marks, logos, and content displayed on our platform are the property of their respective owners. Their appearance on our platform does not imply endorsement or affiliation.',
          },
        ],
      },
      {
        heading: 'Third-Party Links',
        blocks: [
          {
            t: 'p',
            text: 'Our website may contain links to third-party websites or services that are not owned or controlled by NetMirror. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.',
          },
        ],
      },
      {
        heading: 'Disclaimer of Warranties',
        blocks: [
          {
            t: 'p',
            text: 'The website is provided on an "AS IS" and "AS AVAILABLE" basis. NetMirror makes no warranties, expressed or implied, regarding the website\'s operation, availability, accuracy, or completeness of information.',
          },
        ],
      },
      {
        heading: 'Limitation of Liability',
        blocks: [
          {
            t: 'p',
            text: 'In no event shall NetMirror, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of or inability to use the website.',
          },
        ],
      },
      {
        heading: 'Changes to Terms',
        blocks: [
          {
            t: 'p',
            text: 'We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide notice prior to any new terms taking effect. Continued use of the website after changes constitutes acceptance of the new terms.',
          },
        ],
      },
      {
        heading: 'Contact Us',
        blocks: [
          { t: 'p', text: 'If you have questions about these Terms, please contact us at:' },
          {
            t: 'card',
            rows: [
              { label: 'Email', value: 'net27.cc@gmail.com' },
              { label: 'Website', value: 'net27.cc/contact', href: '/contact/' },
            ],
          },
        ],
      },
    ],
  },

  disclaimer: {
    breadcrumb: 'Disclaimer',
    h1: 'Disclaimer',
    seoTitle: 'Disclaimer',
    seoDescription:
      'NetMirror disclaimer. Important information about content, downloads, external links, and limitations of liability.',
    updated: 'Last updated: January 1, 2025',
    sections: [
      {
        heading: 'General Disclaimer',
        blocks: [
          {
            t: 'p',
            text: 'The information provided on NetMirror (net-27.cc) is for general informational and entertainment discovery purposes only. NetMirror is a content discovery platform that helps users find where to watch movies, TV shows, and anime on official streaming services. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of any information on this website.',
          },
        ],
      },
      {
        heading: 'Content Hosting',
        blocks: [
          {
            t: 'p',
            text: 'NetMirror does not host, upload, store, cache, or stream any movies, TV shows, anime, or other copyrighted media content on its servers. All streaming links and availability data refer to third-party, officially licensed platforms. We act solely as an informational directory and discovery tool.',
          },
        ],
      },
      {
        heading: 'App Download Disclaimer',
        blocks: [
          {
            t: 'p',
            text: 'The NetMirror application is available for download from our official sources only. Download APK files only from links provided directly on net-27.cc or our official Telegram channel. We are not responsible for any modified, repackaged, or redistributed versions of our application obtained from third-party sources. Always verify download links before installing.',
          },
          {
            t: 'p',
            text: 'The application is provided "as is" without warranty of any kind. We do not guarantee uninterrupted or error-free operation of the app. Use of the application is at your own risk.',
          },
        ],
      },
      {
        heading: 'External Links',
        blocks: [
          {
            t: 'p',
            text: 'NetMirror may contain links to external websites, streaming platforms, and third-party services. These links are provided for convenience and informational purposes. We have no control over the content, privacy policies, or practices of these external sites and accept no responsibility for them. The inclusion of any link does not imply endorsement, recommendation, or affiliation.',
          },
        ],
      },
      {
        heading: 'Content Availability',
        blocks: [
          {
            t: 'p',
            text: 'Streaming availability information displayed on NetMirror may not always be current or accurate. Content availability varies by region, platform, and time. We recommend verifying availability directly on the respective streaming platform before subscribing or making purchasing decisions. NetMirror is not responsible for any changes in content availability on third-party platforms.',
          },
        ],
      },
      {
        heading: 'No Warranty',
        blocks: [
          {
            t: 'p',
            text: 'This website and all information, content, and services provided through it are offered on an "as is" and "as available" basis without any warranties, express or implied. NetMirror disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
          },
        ],
      },
      {
        heading: 'Limitation of Liability',
        blocks: [
          {
            t: 'p',
            text: 'In no event shall NetMirror, its operators, employees, or affiliates be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of, or inability to use, this website or any information provided on it.',
          },
        ],
      },
      {
        heading: 'Contact',
        blocks: [
          { t: 'p', text: 'If you have questions about this disclaimer, please contact us:' },
          {
            t: 'card',
            rows: [
              { label: 'Email', value: 'net27.cc@gmail.com', href: 'mailto:net27.cc@gmail.com' },
              { label: 'Website', value: 'net-27.cc/contact', href: '/contact/' },
            ],
          },
        ],
      },
    ],
  },

  dmca: {
    breadcrumb: 'DMCA Policy',
    h1: 'DMCA / Copyright Policy',
    seoTitle: 'DMCA / Copyright Policy',
    seoDescription:
      'NetMirror DMCA and copyright policy. Learn how to file a copyright complaint or counter-notification.',
    updated: 'Last updated: January 1, 2025',
    sections: [
      {
        heading: 'Overview',
        blocks: [
          {
            t: 'p',
            text: 'NetMirror ("we," "us," or "our") respects the intellectual property rights of others and expects our users to do the same. We operate as a discovery and information platform only — we do not host, upload, store, or stream any copyrighted audio, video, or media content on our servers.',
          },
          {
            t: 'p',
            text: 'All information displayed on NetMirror, including movie titles, descriptions, ratings, and availability data, is provided for informational and discovery purposes. We direct users to official, legitimate streaming platforms where content can be accessed legally.',
          },
        ],
      },
      {
        heading: 'DMCA Notice',
        blocks: [
          {
            t: 'p',
            text: 'If you believe that content accessible via our platform infringes your copyright, you may submit a DMCA notification by providing the following information to our designated copyright agent:',
          },
          {
            t: 'ol',
            items: [
              'A physical or electronic signature of the copyright owner or authorized agent.',
              'Identification of the copyrighted work claimed to have been infringed.',
              'Identification of the material that is claimed to be infringing, with sufficient detail to locate it.',
              'Your contact information (address, telephone number, email address).',
              'A statement that you have a good faith belief that the disputed use is not authorized.',
              'A statement, under penalty of perjury, that the information in the notification is accurate and that you are the copyright owner or authorized to act on their behalf.',
            ],
          },
        ],
      },
      {
        heading: 'Counter-Notification',
        blocks: [
          {
            t: 'p',
            text: 'If you believe that material was removed or disabled as a result of mistake or misidentification, you may file a counter-notification containing:',
          },
          {
            t: 'ol',
            items: [
              'Your physical or electronic signature.',
              'Identification of the material that has been removed and the location where it appeared before removal.',
              'A statement under penalty of perjury that you have a good faith belief the material was removed by mistake or misidentification.',
              'Your name, address, telephone number, and a statement consenting to jurisdiction.',
            ],
          },
        ],
      },
      {
        heading: 'Contact for DMCA Issues',
        blocks: [
          { t: 'p', text: 'All DMCA notices and counter-notifications should be sent to:' },
          {
            t: 'card',
            rows: [
              { text: 'DMCA Agent', strong: true },
              { text: 'NetMirror' },
              { label: 'Email', value: 'net27.cc@gmail.com' },
            ],
          },
        ],
      },
      {
        heading: 'Repeat Infringers',
        blocks: [
          {
            t: 'p',
            text: 'In accordance with the DMCA and other applicable laws, we have adopted a policy of terminating, in appropriate circumstances, users or account holders who are deemed to be repeat infringers.',
          },
        ],
      },
      {
        heading: 'Disclaimer',
        blocks: [
          {
            t: 'p',
            text: 'NetMirror is a content discovery platform. We do not host, upload, store, cache, or distribute any media files, streams, or copyrighted content. All streaming links and availability information point to third-party, officially licensed platforms. All trademarks, logos, and content belong to their respective owners.',
          },
        ],
      },
    ],
  },

  editorial: {
    breadcrumb: 'Editorial Policy',
    h1: 'Editorial Policy',
    standfirst: 'How we research, verify, and present content on NetMirror',
    seoTitle: 'Editorial Policy — Content Standards',
    seoDescription:
      "NetMirror's editorial standards, content methodology, source attribution and commitment to accuracy in movie and show discovery.",
    sections: [
      {
        heading: 'Our Mission',
        blocks: [
          {
            t: 'p',
            text: 'NetMirror exists to help viewers make informed decisions about what to watch and where to find it. We believe everyone deserves access to accurate, comprehensive, and up-to-date entertainment discovery tools — free from bias, misinformation, or hidden agendas.',
          },
          {
            t: 'p',
            text: 'Our editorial mission is simple: provide the most reliable, well-organized, and helpful movie and show discovery experience available. Every page we publish is designed to answer real user questions with factual, well-sourced information.',
          },
        ],
      },
      {
        heading: 'Content Methodology',
        blocks: [
          { t: 'p', text: 'Our content creation process follows a rigorous methodology:' },
          {
            t: 'dl',
            items: [
              {
                term: 'Research:',
                text: 'Title information is gathered from official sources including studio press releases, official databases, and verified public records.',
              },
              {
                term: 'Verification:',
                text: 'All data points — release dates, cast details, streaming availability — are cross-referenced across multiple reliable sources before publication.',
              },
              {
                term: 'Originality:',
                text: 'All descriptions, reviews, and editorial content on NetMirror are original. We do not copy or paraphrase content from other discovery platforms or review sites.',
              },
              {
                term: 'Updates:',
                text: 'Content is reviewed regularly to ensure streaming availability and title information remain accurate as platforms update their catalogs.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Source Attribution',
        blocks: [
          {
            t: 'p',
            text: 'We believe in transparency about where our information comes from. NetMirror uses the following types of sources:',
          },
          {
            t: 'card',
            rows: [
              {
                label: 'Official Databases',
                sub: 'Publicly available movie and TV databases for core title metadata such as cast, crew, genres, and release information.',
              },
              {
                label: 'Studio & Platform Sources',
                sub: 'Official press releases, platform catalogs, and studio announcements for streaming availability and new release information.',
              },
              {
                label: 'Industry Publications',
                sub: 'Recognized entertainment industry publications for ratings, awards, and industry context used in editorial content.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Editorial Standards',
        blocks: [
          { t: 'p', text: 'Every piece of content on NetMirror adheres to these standards:' },
          {
            t: 'dl',
            items: [
              {
                term: 'Accuracy:',
                text: 'Facts are verified before publication. If we cannot confirm a data point, we either omit it or clearly indicate that information is unconfirmed.',
              },
              {
                term: 'Objectivity:',
                text: 'Our platform presents information without editorial bias toward any particular streaming service, studio, or title.',
              },
              {
                term: 'Completeness:',
                text: 'We strive to include all relevant information a user might need to make a viewing decision, including genre, cast, runtime, ratings, and availability.',
              },
              {
                term: 'Legality:',
                text: 'We only direct users to official, legitimate streaming options. We never link to, promote, or facilitate access to pirated content.',
              },
              {
                term: 'Accessibility:',
                text: 'Content is structured for readability and accessibility, with proper heading hierarchy, alt text, and semantic HTML throughout the site.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Accuracy & Corrections',
        blocks: [
          {
            t: 'p',
            text: 'We take accuracy seriously. Despite our best efforts, errors can occasionally occur — particularly with streaming availability, which changes frequently as platform catalogs are updated.',
          },
          {
            t: 'p',
            text: 'If you notice inaccurate information on NetMirror, we encourage you to {link} with the specific details. We investigate all reports and publish corrections promptly when errors are confirmed.',
            link: { anchor: 'contact us', href: '/contact/' },
          },
          {
            t: 'p',
            text: 'All pages include a "Last updated" indicator to help users assess the currency of the information presented.',
          },
        ],
      },
      {
        heading: 'Independence & Conflicts of Interest',
        blocks: [
          {
            t: 'p',
            text: 'NetMirror operates independently. Our editorial decisions — including which titles to feature, how to present information, and what content to create — are made solely by our editorial team based on user value and informational merit.',
          },
          {
            t: 'p',
            text: 'If we ever engage in affiliate partnerships or sponsored content in the future, such relationships will be clearly disclosed in accordance with applicable advertising and disclosure regulations.',
          },
        ],
      },
      {
        heading: 'Contact Our Editorial Team',
        blocks: [
          {
            t: 'p',
            text: 'Questions about our editorial practices, content methodology, or a specific piece of content? We welcome your feedback.',
          },
          {
            t: 'card',
            rows: [
              { label: 'Email', value: 'net27.cc@gmail.com' },
              { label: 'General inquiries', value: 'Contact form', href: '/contact/' },
              { label: 'Content corrections', value: 'Report an issue', href: '/contact/' },
            ],
          },
        ],
      },
    ],
  },
};

export default en;
