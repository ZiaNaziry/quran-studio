export type Language = 'en' | 'ar' | 'fa';

export const languageNames: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  fa: 'فارسی',
};

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  'nav.feedback': { en: 'Feedback', ar: 'ملاحظات', fa: 'بازخورد' },

  // Home
  'studio.downloadTip.title': { en: 'How to Save on iPhone', ar: 'كيفية الحفظ على الآيفون', fa: 'نحوه ذخیره در آیفون' },
  'studio.downloadTip.step1': { en: 'Open this page in Safari', ar: 'افتح هذه الصفحة في Safari', fa: 'این صفحه را در Safari باز کنید' },
  'studio.downloadTip.step2': { en: 'Tap the download button below', ar: 'اضغط على زر التحميل أدناه', fa: 'دکمه دانلود زیر را بزنید' },
  'studio.downloadTip.step3': { en: 'Pull down the page to refresh', ar: 'اسحب الصفحة للأسفل للتحديث', fa: 'صفحه را به پایین بکشید تا بروزرسانی شود' },
  'studio.downloadTip.step4': { en: 'Tap the download icon and save to your gallery', ar: 'اضغط على أيقونة التحميل واحفظ في معرض الصور', fa: 'روی آیکون دانلود بزنید و در گالری ذخیره کنید' },

  'home.badge': { en: 'Beautiful Quran Videos for Social Media', ar: 'فيديوهات قرآنية جميلة لوسائل التواصل', fa: 'ویدیوهای زیبای قرآنی برای شبکه‌های اجتماعی' },
  'home.title1': { en: 'Quran SM', ar: 'Quran SM', fa: 'Quran SM' },
  'home.title2': { en: 'Download', ar: 'Download', fa: 'Download' },
  'home.subtitle': { en: 'Create stunning Quran recitation videos with beautiful backgrounds. Download and share on any social media platform.', ar: 'أنشئ فيديوهات تلاوة قرآنية مذهلة مع خلفيات جميلة. حمّل وشارك على أي منصة.', fa: 'ویدیوهای زیبای تلاوت قرآن با پس‌زمینه‌های دلنشین بسازید. دانلود کنید و در هر شبکه اجتماعی به اشتراک بگذارید.' },
  'home.cta': { en: 'Start Creating', ar: 'ابدأ الإنشاء', fa: 'شروع ساخت' },
  'home.feat1.title': { en: '10 Reciters', ar: '10 قراء', fa: '10 قاری' },
  'home.feat1.desc': { en: 'World-renowned Quran reciters including Alafasy, Sudais, and more', ar: 'قراء مشهورون عالمياً بما في ذلك العفاسي والسديس وغيرهم', fa: 'قاریان مشهور جهانی از جمله العفاسی، السدیس و دیگران' },
  'home.feat2.title': { en: 'Stunning Backgrounds', ar: 'خلفيات مذهلة', fa: 'پس‌زمینه‌های زیبا' },
  'home.feat2.desc': { en: 'Gradients, HD photos, or import your own image', ar: 'تدرجات، صور عالية الدقة، أو استيراد صورتك الخاصة', fa: 'گرادینت‌ها، عکس‌های باکیفیت، یا تصویر خودتان را وارد کنید' },
  'home.feat3.title': { en: 'Social Media Ready', ar: 'جاهز للنشر', fa: 'آماده انتشار' },
  'home.feat3.desc': { en: 'Download as video or image in portrait or landscape format', ar: 'حمّل كفيديو أو صورة بتنسيق عمودي أو أفقي', fa: 'به صورت ویدیو یا عکس در فرمت عمودی یا افقی دانلود کنید' },
  'home.feat4.title': { en: 'All 114 Surahs', ar: 'جميع 114 سورة', fa: 'تمام 114 سوره' },
  'home.feat4.desc': { en: 'Access the complete Holy Quran with translations', ar: 'الوصول إلى القرآن الكريم كاملاً مع الترجمة', fa: 'دسترسی به قرآن کریم کامل همراه با ترجمه' },
  'home.dua': { en: 'I built this for the sake of Allah. I only ask for your duas (prayers). May Allah accept it from all of us.', ar: 'بنيت هذا لوجه الله تعالى. أسألكم فقط الدعاء. تقبل الله منا ومنكم.', fa: 'این را برای رضای خداوند ساختم. فقط دعایتان را می‌خواهم. خداوند از همه ما قبول کند.' },
  'home.builtBy': { en: 'Built by', ar: 'بناه', fa: 'ساخته شده توسط' },
  'home.footer': { en: 'Built by Ahmad Zia Naziry', ar: 'بناه أحمد ضياء نظيري', fa: 'ساخته شده توسط احمد ضیاء نظیری' },

  // Surah Browser
  'browse.title': { en: 'Choose a Surah', ar: 'اختر سورة', fa: 'یک سوره انتخاب کنید' },
  'browse.subtitle': { en: 'Select a surah to create your recitation video', ar: 'اختر سورة لإنشاء فيديو التلاوة', fa: 'یک سوره برای ساخت ویدیوی تلاوت انتخاب کنید' },
  'browse.search': { en: 'Search by name, number, or meaning...', ar: 'ابحث بالاسم أو الرقم أو المعنى...', fa: 'جستجو بر اساس نام، شماره یا معنا...' },
  'browse.verses': { en: 'verses', ar: 'آيات', fa: 'آیات' },
  'browse.noResults': { en: 'No surahs found', ar: 'لم يتم العثور على سور', fa: 'سوره‌ای یافت نشد' },

  // Verse Selector
  'verses.selectAll': { en: 'Select All', ar: 'تحديد الكل', fa: 'انتخاب همه' },
  'verses.deselectAll': { en: 'Deselect All', ar: 'إلغاء التحديد', fa: 'لغو انتخاب' },
  'verses.selected': { en: 'selected', ar: 'محدد', fa: 'انتخاب شده' },
  'verses.of': { en: 'of', ar: 'من', fa: 'از' },
  'verses.openStudio': { en: 'Open Studio with', ar: 'فتح الاستوديو مع', fa: 'باز کردن استودیو با' },
  'verses.verse': { en: 'verse', ar: 'آية', fa: 'آیه' },
  'verses.verseP': { en: 'verses', ar: 'آيات', fa: 'آیات' },

  // Studio
  'studio.format': { en: 'Format', ar: 'التنسيق', fa: 'فرمت' },
  'studio.arabicSize': { en: 'Arabic Size', ar: 'حجم النص العربي', fa: 'اندازه متن عربی' },
  'studio.translation': { en: 'Translation', ar: 'الترجمة', fa: 'ترجمه' },
  'studio.darkOverlay': { en: 'Dark Overlay', ar: 'طبقة داكنة', fa: 'پوشش تیره' },
  'studio.reciter': { en: 'Reciter', ar: 'القارئ', fa: 'قاری' },
  'studio.background': { en: 'Background', ar: 'الخلفية', fa: 'پس‌زمینه' },
  'studio.gradients': { en: 'Gradients', ar: 'تدرجات', fa: 'گرادینت' },
  'studio.photos': { en: 'Photos', ar: 'صور', fa: 'عکس‌ها' },
  'studio.import': { en: 'Import', ar: 'استيراد', fa: 'وارد کردن' },
  'studio.searchBg': { en: 'Search backgrounds...', ar: 'ابحث عن خلفيات...', fa: 'جستجوی پس‌زمینه...' },
  'studio.noPhotos': { en: 'No photos found', ar: 'لم يتم العثور على صور', fa: 'عکسی یافت نشد' },
  'studio.uploadImage': { en: 'Upload Image or Video', ar: 'ارفع صورة أو فيديو', fa: 'تصویر یا ویدیو آپلود کنید' },
  'studio.fileTypes': { en: 'JPG, PNG, WebP, MP4, MOV', ar: 'JPG, PNG, WebP, MP4, MOV', fa: 'JPG, PNG, WebP, MP4, MOV' },
  'studio.downloadImage': { en: 'Download Image', ar: 'تحميل صورة', fa: 'دانلود تصویر' },
  'studio.downloadVideo': { en: 'Download Video', ar: 'تحميل فيديو', fa: 'دانلود ویدیو' },
  'studio.creatingImage': { en: 'Creating Image...', ar: 'جاري إنشاء الصورة...', fa: 'در حال ساخت تصویر...' },
  'studio.recordingVideo': { en: 'Recording Video...', ar: 'جاري تسجيل الفيديو...', fa: 'در حال ضبط ویدیو...' },
  'studio.generating': { en: 'Generating...', ar: 'جاري الإنشاء...', fa: 'در حال ساخت...' },
  'studio.recordingNote': { en: 'Playing each verse and recording. Please wait...', ar: 'تشغيل كل آية وتسجيلها. يرجى الانتظار...', fa: 'در حال پخش و ضبط هر آیه. لطفا صبر کنید...' },
  'studio.image': { en: 'Image', ar: 'صورة', fa: 'تصویر' },
  'studio.video': { en: 'Video', ar: 'فيديو', fa: 'ویدیو' },
  'studio.verse': { en: 'Verse', ar: 'آية', fa: 'آیه' },

  // Feedback
  'feedback.title': { en: 'Feedback', ar: 'ملاحظات', fa: 'بازخورد' },
  'feedback.subtitle': { en: 'We would love to hear from you', ar: 'نحب أن نسمع منك', fa: 'خوشحال می‌شویم نظراتتان را بشنویم' },
  'feedback.name': { en: 'Name', ar: 'الاسم', fa: 'نام' },
  'feedback.namePlaceholder': { en: 'Your name', ar: 'اسمك', fa: 'نام شما' },
  'feedback.email': { en: 'Email', ar: 'البريد الإلكتروني', fa: 'ایمیل' },
  'feedback.emailPlaceholder': { en: 'your@email.com', ar: 'your@email.com', fa: 'your@email.com' },
  'feedback.message': { en: 'Message', ar: 'الرسالة', fa: 'پیام' },
  'feedback.messagePlaceholder': { en: 'Your feedback, suggestions, or questions...', ar: 'ملاحظاتك أو اقتراحاتك أو أسئلتك...', fa: 'بازخورد، پیشنهاد یا سوالات شما...' },
  'feedback.send': { en: 'Send Feedback', ar: 'إرسال', fa: 'ارسال بازخورد' },
  'feedback.thankYou': { en: 'Thank You!', ar: 'شكراً لك!', fa: 'متشکریم!' },
  'feedback.sent': { en: 'Your feedback has been sent successfully.', ar: 'تم إرسال ملاحظاتك بنجاح.', fa: 'بازخورد شما با موفقیت ارسال شد.' },
  'feedback.backHome': { en: 'Back to Home', ar: 'العودة للرئيسية', fa: 'بازگشت به خانه' },
};

export function t(key: string, lang: Language): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry['en'] || key;
}

export function isRtl(lang: Language): boolean {
  return lang === 'ar' || lang === 'fa';
}
