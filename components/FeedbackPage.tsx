'use client';

import { useState } from 'react';
import { Language, t, isRtl } from '../lib/i18n';

interface Props {
  onBack: () => void;
  lang: Language;
}

export default function FeedbackPage({ onBack, lang }: Props) {
  const [sent, setSent] = useState(false);
  const dir = isRtl(lang) ? 'rtl' : 'ltr';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in" dir={dir}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('feedback.title', lang)}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('feedback.subtitle', lang)}</p>
        </div>
      </div>

      {sent ? (
        <div className="text-center py-16 animate-scale-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--accent-light)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('feedback.thankYou', lang)}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{t('feedback.sent', lang)}</p>
          <button onClick={onBack} className="mt-6 px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105" style={{ background: 'var(--accent)' }}>
            {t('feedback.backHome', lang)}
          </button>
        </div>
      ) : (
        <form
          action="https://formsubmit.co/zianaziry89@gmail.com"
          method="POST"
          onSubmit={() => setTimeout(() => setSent(true), 100)}
          className="space-y-4"
        >
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_subject" value="Quran SM Download - Feedback" />
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('feedback.name', lang)}</label>
            <input name="name" required className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} placeholder={t('feedback.namePlaceholder', lang)} dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('feedback.email', lang)}</label>
            <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} placeholder={t('feedback.emailPlaceholder', lang)} dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('feedback.message', lang)}</label>
            <textarea name="message" required rows={5} className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 resize-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} placeholder={t('feedback.messagePlaceholder', lang)} />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-95" style={{ background: 'var(--accent)' }}>
            {t('feedback.send', lang)}
          </button>
        </form>
      )}

      <div className="mt-12 p-6 rounded-2xl border text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Built by <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ahmad Zia Naziry</span>
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>zianaziry89@gmail.com</p>
      </div>
    </div>
  );
}
