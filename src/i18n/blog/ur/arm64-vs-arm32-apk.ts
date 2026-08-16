import type { LocalizedPost } from '../index';

/**
 * Urdu translation of "ARM64 vs ARM32 APK".
 *
 * Heading ids match the English original exactly, because the table of contents
 * links to them. Internal hrefs use the /ur/ prefix, where every route in this
 * article exists — the two help pages and the download guide.
 *
 * Architecture identifiers, chipset names and the settings path a reader has to
 * follow on the phone stay in English: arm64-v8a, armeabi-v7a, Snapdragon,
 * Dimensity, "Settings → About Phone", "Processor", "CPU", CPU-Z's "ARM64" /
 * "ARMv7" fields, and the "App not installed" and "Parse error" strings. The
 * whole point of the article is helping someone match what is on their screen.
 */
const post: LocalizedPost = {
  title: 'ARM64 بمقابلہ ARM32 APK — NetMirror کا کون سا ورژن ڈاؤن لوڈ کریں؟',
  excerpt:
    'یقین نہیں کہ NetMirror کا ARM64 ورژن لیں یا ARM32؟ یہ گائیڈ پروسیسر کی ساخت کو سادہ زبان میں سمجھاتی ہے اور درست APK چننے میں مدد دیتی ہے۔',
  category: 'ایپ گائیڈ',
  readTime: '9 منٹ کا مطالعہ',
  tags: ['ARM64', 'ARM32', 'APK', 'Android', 'گائیڈ'],
  quickAnswer:
    'اگر آپ کا فون 2018 کے بعد بنا ہے تو ARM64 ڈاؤن لوڈ کریں۔ اگر پرانا ہے یا یقین نہیں، تو Universal لیں — یہ ہر چیز پر کام کرتی ہے۔',
  content: `<p>جب آپ NetMirror کے ڈاؤن لوڈ صفحے پر جاتے ہیں، تو آپ کو تین APK اختیارات نظر آتے ہیں: Universal، ARM64 (arm64-v8a)، اور ARM32 (armeabi-v7a)۔ اگر یہ اصطلاحات پہیلی لگتی ہیں، تو آپ اکیلے نہیں۔ یہ گائیڈ اپنے آلے کے لیے درست APK چننے سے متعلق ہر بات کھول کر بتاتی ہے۔</p>

<h2 id="what-is-architecture">پروسیسر کی ساخت کیا ہوتی ہے؟</h2>

<p>ہر Android آلے میں ایک پروسیسر (CPU) ہوتا ہے جو ان ہدایات پر عمل کرتا ہے جن سے آپ کی ایپس بنی ہوتی ہیں۔ Android کی دنیا میں دو غالب ساختیں ARM64 اور ARM32 ہیں، جو یہ بتاتی ہیں کہ پروسیسر اندرونی طور پر ڈیٹا کیسے سنبھالتا ہے۔</p>

<h3 id="arm32-explained">ARM32 (armeabi-v7a)</h3>
<p>پرانی 32-bit ساخت، جس نے تقریباً 2010 سے 2018 تک Android سمارٹ فونز کو چلایا۔ ایک 32-bit پروسیسر زیادہ سے زیادہ 4 GB RAM تک رسائی رکھ سکتا ہے اور ڈیٹا کو 32-bit ٹکڑوں میں پروسیس کرتا ہے۔ عام چپ سیٹ میں Qualcomm Snapdragon 200/400 سیریز، پرانی MediaTek Helio P-سیریز، اور Samsung Exynos 7-سیریز شامل ہیں۔</p>

<h3 id="arm64-explained">ARM64 (arm64-v8a)</h3>
<p>جدید 64-bit ساخت، جو تقریباً 2017 سے 2018 کے بعد سے معیار بن چکی ہے۔ ایک 64-bit پروسیسر کہیں زیادہ RAM تک رسائی رکھ سکتا ہے، ڈیٹا کو بڑے ٹکڑوں میں پروسیس کرتا ہے، اور بہتر کارکردگی و سیکیورٹی کے لیے جدید ہدایاتی سیٹ کی حمایت کرتا ہے۔ گزشتہ چھ برسوں میں جاری ہونے والا ہر فلیگ شپ اور مڈ رینج فون ARM64 استعمال کرتا ہے — بشمول Qualcomm Snapdragon 600/700/800 سیریز، MediaTek Dimensity، Samsung Exynos 2000 سیریز، اور Google Tensor۔</p>

<h2 id="how-to-check">اپنے آلے کی ساخت کیسے جانچیں</h2>

<p><strong>طریقہ 1: Settings سے جانچیں۔</strong> <strong>Settings &rarr; About Phone</strong> پر جائیں اور "Processor" یا "CPU" تلاش کریں۔ Snapdragon 600+ سیریز، کوئی بھی Dimensity چپ، کوئی بھی Tensor چپ، یا Exynos 2100+ کا مطلب ARM64 ہے۔</p>

<p><strong>طریقہ 2: CPU-Z استعمال کریں۔</strong> Google Play سے "CPU-Z" انسٹال کریں۔ اسے کھولیں اور "CPU" ٹیب دیکھیں۔ "Architecture" کے نیچے "ARM64" یا "ARMv7" لکھا ہوگا۔</p>

<p><strong>طریقہ 3: اپنا Android ورژن دیکھیں۔</strong> اگر آپ کا آلہ Android 12 یا اس کے بعد کے ساتھ آیا تھا، تو وہ تقریباً یقینی طور پر ARM64 ہے۔ Google نے Android 12+ چلانے والے تمام نئے آلات کے لیے 64-bit کی حمایت لازمی کر دی تھی۔</p>

<p><strong>طریقہ 4: اپنی RAM دیکھیں۔</strong> 4 GB یا اس سے زیادہ RAM والے آلات بھاری اکثریت میں ARM64 ہوتے ہیں۔ 2 GB یا اس سے کم والے آلات کے ARM32 ہونے کا امکان زیادہ ہے۔</p>

<h2 id="universal-apk">Universal APK کب استعمال کریں</h2>

<p>Universal APK میں ARM64 اور ARM32، دونوں ساختوں کے لیے native libraries شامل ہوتی ہیں۔ تقریباً 80 MB پر یہ کسی بھی مخصوص ساخت والی بلڈ سے بڑی ہے، مگر یہ ہر اندازے کی گنجائش ختم کر دیتی ہے۔ Universal تب چنیں جب:</p>
<ul>
  <li>آپ کو یقین نہ ہو کہ آپ کا آلہ کون سی ساخت استعمال کرتا ہے</li>
  <li>آپ APK ان دوستوں کے ساتھ بانٹنا چاہتے ہوں جن کے آلات مختلف ہیں</li>
  <li>آپ نے مخصوص ساخت والی بلڈ آزمائی اور انسٹالیشن میں خرابی آئی</li>
  <li>آپ کا آلہ x86 جیسی کوئی غیر عام ساخت استعمال کرتا ہو</li>
</ul>
<p>ڈاؤن لوڈ: <a href="https://pub-2cb9a63c347a4768a0ff4ae265238229.r2.dev/NetMirror-v2.0.10-universal.apk">Universal APK</a></p>

<h2 id="common-issues">غلط ورژن ڈاؤن لوڈ کرنے پر عام مسائل</h2>

<p><strong>ARM32 آلے پر ARM64 انسٹال کرنا:</strong> انسٹالیشن فوراً "App not installed" خرابی کے ساتھ ناکام ہو جائے گی۔ کوئی ڈیٹا ضائع نہیں ہوتا — Android کا package manager غیر موافق binary کو مسترد کر دیتا ہے۔ اس کے بجائے ARM32 یا Universal بلڈ ڈاؤن لوڈ کریں۔ ہماری <a href="/ur/help/app-not-installed/">"app not installed" کے حل کی گائیڈ</a> دیکھیں۔</p>

<p><strong>ARM64 آلے پر ARM32 انسٹال کرنا:</strong> یہ دراصل کام کر جاتا ہے، کیونکہ ARM64 پروسیسر ARM32 کوڈ کے ساتھ پچھلی مطابقت رکھتے ہیں۔ البتہ ایپ 32-bit مطابقت والے موڈ میں چلتی ہے جو قدرے کم مؤثر ہے۔ بہترین کارکردگی کے لیے ARM64 بلڈ استعمال کریں۔</p>

<p><strong>ڈاؤن لوڈ کے بعد "Parse error":</strong> یہ عام طور پر ساخت کے عدم مطابقت کے بجائے خراب ڈاؤن لوڈ کی نشاندہی کرتا ہے۔ فائل حذف کریں اور مستحکم کنکشن پر دوبارہ ڈاؤن لوڈ کریں۔ ہماری <a href="/ur/help/parsing-package-error/">parse error کے حل کی گائیڈ</a> دیکھیں۔</p>

<h2 id="recommendation">ہماری تجویز</h2>

<p>2026 میں زیادہ تر صارفین کے لیے <strong>ARM64 بلڈ</strong> ہی درست انتخاب ہے۔ گزشتہ چھ برسوں میں فروخت ہونے والے Android آلات کی بھاری اکثریت 64-bit ہے۔ اگر آپ کے پاس پرانا آلہ ہے یا یقین نہیں، تو Universal APK لے لیں۔</p>

<p>مکمل انسٹالیشن کے طریقے کے لیے ہماری <a href="/ur/blog/netmirror-apk-download-guide/">NetMirror APK ڈاؤن لوڈ گائیڈ</a> دیکھیں۔ اگر کوئی مسئلہ پیش آئے تو ہم سے <a href="mailto:net27.cc@gmail.com">net27.cc@gmail.com</a> پر رابطہ کریں۔</p>`,
  toc: [
    { id: 'what-is-architecture', title: 'پروسیسر کی ساخت کیا ہوتی ہے؟', level: 2 },
    { id: 'how-to-check', title: 'اپنے آلے کی ساخت کیسے جانچیں', level: 2 },
    { id: 'universal-apk', title: 'Universal APK کب استعمال کریں', level: 2 },
    { id: 'common-issues', title: 'غلط ورژن کے ساتھ عام مسائل', level: 2 },
    { id: 'recommendation', title: 'ہماری تجویز', level: 2 },
    { id: 'faqs', title: 'عام سوالات', level: 2 },
  ],
  tables: [
    {
      caption: 'ARM64 بمقابلہ ARM32 کا موازنہ',
      headers: ['خصوصیت', 'ARM64 (arm64-v8a)', 'ARM32 (armeabi-v7a)'],
      rows: [
        ['بٹ چوڑائی', '64-bit', '32-bit'],
        ['زیادہ سے زیادہ قابلِ رسائی RAM', '16 EB (نظری)', '4 GB'],
        ['کارکردگی', 'زیادہ گنجائش، بہتر کارکردگی', 'بنیادی کاموں کے لیے کافی'],
        ['سیکیورٹی خصوصیات', 'جدید ہارڈویئر سطح کے تحفظات', 'محدود'],
        ['عام آلات', '2018 کے بعد کے فون', '2017 اور اس سے پہلے کے فون'],
        ['NetMirror APK سائز', 'تقریباً 45 MB', 'تقریباً 35 MB'],
        ['کن کے لیے تجویز کردہ', 'زیادہ تر صارفین', 'پرانے سستے آلات'],
      ],
    },
  ],
  faqs: [
    {
      question: 'اگر میں غلط APK انسٹال کر لوں تو کیا ہوگا؟',
      answer:
        'اگر آپ 32-bit آلے پر ARM64 انسٹال کریں گے، تو "App not installed" دکھائی دے گا — کوئی نقصان نہیں ہوتا۔ اگر آپ 64-bit آلے پر ARM32 انسٹال کریں گے، تو یہ چل جائے گی مگر مطابقت والے موڈ میں، قدرے کم کارکردگی کے ساتھ۔',
    },
    {
      question: 'کیسے جانوں کہ میرا فون 32-bit ہے یا 64-bit؟',
      answer:
        'آسان ترین طریقہ: Google Play سے CPU-Z انسٹال کریں اور Architecture والا خانہ دیکھیں۔ متبادل کے طور پر، اگر آپ کا فون Android 12 یا اس کے بعد کے ساتھ آیا تھا، تو وہ 64-bit ہے۔',
    },
    {
      question: 'کیا ہمیشہ Universal APK ہی استعمال کرنی چاہیے؟',
      answer:
        'Universal تمام آلات پر کام کرتی ہے مگر بڑی ہے (تقریباً 80 MB بمقابلہ ARM64 کے تقریباً 45 MB)۔ اگر آپ کو اپنی ساخت معلوم ہے، تو مخصوص بلڈ چھوٹا ڈاؤن لوڈ دیتی ہے۔',
    },
    {
      question: 'کیا ARM64 APK، ARM32 سے تیز چلتی ہے؟',
      answer:
        'NetMirror جیسی ہلکی ایپس کے لیے فرق معمولی ہے۔ ARM64 بلڈ مطابقت کے ترجمے کے بغیر براہِ راست چلتی ہیں، اس لیے تکنیکی طور پر زیادہ مؤثر ہیں۔',
    },
  ],
};

export default post;
