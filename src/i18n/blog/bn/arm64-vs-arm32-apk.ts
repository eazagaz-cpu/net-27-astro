import type { LocalizedPost } from '../index';

/**
 * Bengali translation of "ARM64 vs ARM32 APK".
 *
 * Heading ids match the English original exactly, because the table of contents
 * links to them. Internal hrefs use the /bn/ prefix, where every route in this
 * article exists — the two help pages and the download guide.
 *
 * Architecture identifiers, chipset names and the settings path a reader has to
 * follow on the phone stay in English: arm64-v8a, armeabi-v7a, Snapdragon,
 * Dimensity, "Settings → About Phone", "Processor", "CPU", CPU-Z's "ARM64" /
 * "ARMv7" fields, and the "App not installed" and "Parse error" strings. The
 * whole point of the article is helping someone match what is on their screen.
 */
const post: LocalizedPost = {
  title: 'ARM64 বনাম ARM32 APK — NetMirror-এর কোন সংস্করণ নামাবেন?',
  excerpt:
    'NetMirror-এর ARM64 না ARM32 সংস্করণ নামাবেন বুঝতে পারছেন না? এই গাইড প্রসেসরের গঠন সহজ ভাষায় বুঝিয়ে দেয় ও সঠিক APK বাছতে সাহায্য করে।',
  category: 'অ্যাপ গাইড',
  readTime: '৯ মিনিট পড়া',
  tags: ['ARM64', 'ARM32', 'APK', 'Android', 'গাইড'],
  quickAnswer:
    'আপনার ফোন 2018-এর পরে তৈরি হলে ARM64 নামান। পুরনো হলে বা নিশ্চিত না হলে Universal নামান — এটি সব যন্ত্রেই চলে।',
  content: `<p>NetMirror-এর ডাউনলোড পাতায় গেলে আপনি তিনটি APK বিকল্প দেখবেন: Universal, ARM64 (arm64-v8a) ও ARM32 (armeabi-v7a)। এই শব্দগুলো ধাঁধার মতো লাগলে আপনি একা নন। এই গাইড আপনার যন্ত্রের জন্য সঠিক APK বাছা নিয়ে যা কিছু জানা দরকার সব খুলে বলে।</p>

<h2 id="what-is-architecture">প্রসেসরের গঠন বলতে কী বোঝায়?</h2>

<p>প্রতিটি Android যন্ত্রে একটি প্রসেসর (CPU) থাকে, যা আপনার অ্যাপগুলো যে নির্দেশ থেকে তৈরি সেগুলো চালায়। Android জগতে প্রধান দুটি গঠন হলো ARM64 ও ARM32, যা বোঝায় প্রসেসর ভেতরে ডেটা কীভাবে সামলায়।</p>

<h3 id="arm32-explained">ARM32 (armeabi-v7a)</h3>
<p>পুরনো 32-bit গঠন, যা প্রায় 2010 থেকে 2018 পর্যন্ত Android স্মার্টফোন চালিয়েছে। একটি 32-bit প্রসেসর সর্বোচ্চ 4 GB RAM পর্যন্ত পৌঁছতে পারে ও ডেটা 32-bit টুকরোয় প্রক্রিয়া করে। সাধারণ চিপসেটের মধ্যে আছে Qualcomm Snapdragon 200/400 সিরিজ, পুরনো MediaTek Helio P-সিরিজ ও Samsung Exynos 7-সিরিজ।</p>

<h3 id="arm64-explained">ARM64 (arm64-v8a)</h3>
<p>আধুনিক 64-bit গঠন, যা প্রায় 2017 থেকে 2018-এর পর থেকে মানদণ্ড। একটি 64-bit প্রসেসর অনেক বেশি RAM-এ পৌঁছতে পারে, ডেটা বড় টুকরোয় প্রক্রিয়া করে, আর ভালো কর্মক্ষমতা ও নিরাপত্তার জন্য আধুনিক নির্দেশ-সেট সমর্থন করে। গত ছয় বছরে বেরোনো প্রতিটি ফ্ল্যাগশিপ ও মিড-রেঞ্জ ফোন ARM64 ব্যবহার করে — Qualcomm Snapdragon 600/700/800 সিরিজ, MediaTek Dimensity, Samsung Exynos 2000 সিরিজ ও Google Tensor সহ।</p>

<h2 id="how-to-check">আপনার যন্ত্রের গঠন কীভাবে দেখবেন</h2>

<p><strong>উপায় 1: Settings থেকে দেখুন।</strong> <strong>Settings &rarr; About Phone</strong>-এ যান এবং "Processor" বা "CPU" খুঁজুন। Snapdragon 600+ সিরিজ, যেকোনো Dimensity চিপ, যেকোনো Tensor চিপ, বা Exynos 2100+ মানে ARM64।</p>

<p><strong>উপায় 2: CPU-Z ব্যবহার করুন।</strong> Google Play থেকে "CPU-Z" নামান। খুলে "CPU" ট্যাব দেখুন। "Architecture"-এর নিচে "ARM64" বা "ARMv7" লেখা থাকবে।</p>

<p><strong>উপায় 3: আপনার Android সংস্করণ দেখুন।</strong> আপনার যন্ত্র Android 12 বা তার পরের সংস্করণ নিয়ে এলে সেটি প্রায় নিশ্চিতভাবেই ARM64। Google, Android 12+ চালানো সব নতুন যন্ত্রের জন্য 64-bit সমর্থন বাধ্যতামূলক করেছিল।</p>

<p><strong>উপায় 4: আপনার RAM দেখুন।</strong> 4 GB বা তার বেশি RAM-এর যন্ত্র বিপুল সংখ্যাগরিষ্ঠভাবে ARM64। 2 GB বা তার কম RAM-এর যন্ত্র ARM32 হওয়ার সম্ভাবনা বেশি।</p>

<h2 id="universal-apk">Universal APK কখন ব্যবহার করবেন</h2>

<p>Universal APK-তে ARM64 ও ARM32, দুই গঠনের জন্যই native libraries থাকে। প্রায় 80 MB হওয়ায় এটি যেকোনো নির্দিষ্ট গঠনের বিল্ডের চেয়ে বড়, কিন্তু এতে আন্দাজের জায়গা থাকে না। Universal বাছুন যখন:</p>
<ul>
  <li>আপনার যন্ত্র কোন গঠন ব্যবহার করে তা নিশ্চিত নন</li>
  <li>আপনি APK-টি এমন বন্ধুদের সঙ্গে ভাগ করতে চান যাঁদের যন্ত্র আলাদা</li>
  <li>আপনি নির্দিষ্ট গঠনের বিল্ড চেষ্টা করে ইনস্টলেশনে ত্রুটি পেয়েছেন</li>
  <li>আপনার যন্ত্র x86-এর মতো কোনো অপ্রচলিত গঠন ব্যবহার করে</li>
</ul>
<p>ডাউনলোড: <a href="https://pub-2cb9a63c347a4768a0ff4ae265238229.r2.dev/NetMirror-v2.0.10-universal.apk">Universal APK</a></p>

<h2 id="common-issues">ভুল সংস্করণ নামালে সাধারণ সমস্যা</h2>

<p><strong>ARM32 যন্ত্রে ARM64 ইনস্টল করা:</strong> ইনস্টলেশন সঙ্গে সঙ্গে "App not installed" ত্রুটি নিয়ে ব্যর্থ হবে। কোনো ডেটা হারায় না — Android-এর package manager অসঙ্গত binary প্রত্যাখ্যান করে। তার বদলে ARM32 বা Universal বিল্ড নামান। আমাদের <a href="/bn/help/app-not-installed/">"app not installed" সমাধানের গাইড</a> দেখুন।</p>

<p><strong>ARM64 যন্ত্রে ARM32 ইনস্টল করা:</strong> এটি আসলে কাজ করে, কারণ ARM64 প্রসেসর ARM32 কোডের সঙ্গে পিছন-সঙ্গতি রাখে। তবে অ্যাপটি 32-bit সঙ্গতি মোডে চলে, যা কিছুটা কম কার্যকর। সেরা কর্মক্ষমতার জন্য ARM64 বিল্ড ব্যবহার করুন।</p>

<p><strong>নামানোর পর "Parse error":</strong> এটি সাধারণত গঠনের অমিলের বদলে ক্ষতিগ্রস্ত ডাউনলোড বোঝায়। ফাইলটি মুছে স্থিতিশীল সংযোগে আবার নামান। আমাদের <a href="/bn/help/parsing-package-error/">parse error সমাধানের গাইড</a> দেখুন।</p>

<h2 id="recommendation">আমাদের সুপারিশ</h2>

<p>2026 সালে বেশির ভাগ ব্যবহারকারীর জন্য <strong>ARM64 বিল্ড</strong>-ই সঠিক বাছাই। গত ছয় বছরে বিক্রি হওয়া Android যন্ত্রের বিপুল সংখ্যাগরিষ্ঠই 64-bit। আপনার যন্ত্র পুরনো হলে বা নিশ্চিত না হলে Universal APK নিন।</p>

<p>সম্পূর্ণ ইনস্টলেশন পদ্ধতির জন্য আমাদের <a href="/bn/blog/netmirror-apk-download-guide/">NetMirror APK ডাউনলোড গাইড</a> দেখুন। কোনো সমস্যা হলে আমাদের সঙ্গে <a href="mailto:net27.cc@gmail.com">net27.cc@gmail.com</a>-এ যোগাযোগ করুন।</p>`,
  toc: [
    { id: 'what-is-architecture', title: 'প্রসেসরের গঠন বলতে কী বোঝায়?', level: 2 },
    { id: 'how-to-check', title: 'আপনার যন্ত্রের গঠন কীভাবে দেখবেন', level: 2 },
    { id: 'universal-apk', title: 'Universal APK কখন ব্যবহার করবেন', level: 2 },
    { id: 'common-issues', title: 'ভুল সংস্করণে সাধারণ সমস্যা', level: 2 },
    { id: 'recommendation', title: 'আমাদের সুপারিশ', level: 2 },
    { id: 'faqs', title: 'সচরাচর জিজ্ঞাসা', level: 2 },
  ],
  tables: [
    {
      caption: 'ARM64 বনাম ARM32 তুলনা',
      headers: ['বৈশিষ্ট্য', 'ARM64 (arm64-v8a)', 'ARM32 (armeabi-v7a)'],
      rows: [
        ['বিট প্রস্থ', '64-bit', '32-bit'],
        ['সর্বোচ্চ ব্যবহারযোগ্য RAM', '16 EB (তাত্ত্বিক)', '4 GB'],
        ['কর্মক্ষমতা', 'বেশি সক্ষমতা, ভালো দক্ষতা', 'মৌলিক কাজের জন্য যথেষ্ট'],
        ['নিরাপত্তার বৈশিষ্ট্য', 'আধুনিক হার্ডওয়্যার স্তরের সুরক্ষা', 'সীমিত'],
        ['সাধারণ যন্ত্র', '2018 থেকে পরের ফোন', '2017 ও তার আগের ফোন'],
        ['NetMirror APK আকার', 'প্রায় 45 MB', 'প্রায় 35 MB'],
        ['কাদের জন্য সুপারিশ', 'বেশির ভাগ ব্যবহারকারী', 'পুরনো সাশ্রয়ী যন্ত্র'],
      ],
    },
  ],
  faqs: [
    {
      question: 'ভুল APK ইনস্টল করলে কী হবে?',
      answer:
        '32-bit যন্ত্রে ARM64 ইনস্টল করলে "App not installed" দেখাবে — কোনো ক্ষতি হয় না। 64-bit যন্ত্রে ARM32 ইনস্টল করলে সেটি চলবে, তবে সঙ্গতি মোডে, কিছুটা কম কর্মক্ষমতায়।',
    },
    {
      question: 'আমার ফোন 32-bit না 64-bit কীভাবে জানব?',
      answer:
        'সবচেয়ে সহজ উপায়: Google Play থেকে CPU-Z নামিয়ে Architecture ঘরটি দেখুন। বিকল্পভাবে, আপনার ফোন Android 12 বা তার পরের সংস্করণ নিয়ে এসে থাকলে সেটি 64-bit।',
    },
    {
      question: 'সবসময় কি Universal APK-ই ব্যবহার করা উচিত?',
      answer:
        'Universal সব যন্ত্রে চলে কিন্তু আকারে বড় (প্রায় 80 MB, ARM64-এর প্রায় 45 MB-র তুলনায়)। নিজের গঠন জানা থাকলে নির্দিষ্ট বিল্ড ছোট ডাউনলোড দেয়।',
    },
    {
      question: 'ARM64 APK কি ARM32-এর চেয়ে দ্রুত চলে?',
      answer:
        'NetMirror-এর মতো হালকা অ্যাপে পার্থক্য সামান্য। ARM64 বিল্ড সঙ্গতির অনুবাদ ছাড়াই সরাসরি চলে, তাই কারিগরিভাবে বেশি কার্যকর।',
    },
  ],
};

export default post;
