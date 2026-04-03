
export default function LanguageSwitcher() {
  const { lang, toggleLang } = useLanguage();
  return (
    <button
      onClick={toggleLang}
      title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-600"
    >
      <i className="fa-solid fa-globe text-green-600"></i>
      <span>{lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
    </button>
  );
}
