import { useLanguage } from '../Language/LanguageContext';
import LanguageFlag from './LanguageFlag';

export default function WorkspaceLanguageSwitcher() {
  const { isKhmer, toggleLanguage } = useLanguage();
  return (
    <button
      type="button"
      className="workspace-language-button inline-flex shrink-0 items-center gap-2 h-10 px-3.5 rounded-full border border-brand-primary bg-white dark:bg-gray-800 text-brand-secondary text-sm font-semibold transition-all duration-200 hover:bg-brand-primary-light dark:hover:bg-gray-700 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
      aria-label={isKhmer ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'}
      onClick={toggleLanguage}
    >
      <LanguageFlag isKhmer={isKhmer} />
      <span>{isKhmer ? 'EN' : 'ខ្មែរ'}</span>
    </button>
  );
}
