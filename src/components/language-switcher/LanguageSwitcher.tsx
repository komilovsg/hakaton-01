import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.scss';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${i18n.language === 'ru' ? 'active' : ''}`}
        onClick={() => changeLanguage('ru')}
      >
        🇷🇺 Русский
      </button>
      <button
        className={`lang-btn ${i18n.language === 'tj' ? 'active' : ''}`}
        onClick={() => changeLanguage('tj')}
      >
        🇹🇯 Тоҷикӣ
      </button>
    </div>
  );
}

