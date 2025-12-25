import { useTranslation } from 'react-i18next';
import WaterLossCalculator from '../water-loss-calculator/WaterLossCalculator';
import OfficialData from '../official-data/OfficialData';
import './Landing.scss';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="container">
          <h1 className="landing-title">
            {t('header.title')}
          </h1>
          <p className="landing-subtitle">
            {t('header.subtitle')}
          </p>
          <p className="landing-tagline">
            {t('header.tagline')}
          </p>
        </div>
      </div>

      <main className="landing-main">
        <div className="container">
          <section className="calculator-section">
            <WaterLossCalculator />
          </section>

          <section className="official-data-section">
            <OfficialData />
          </section>

          <section className="expected-result-section">
            <h2>{t('expectedResult.title')}</h2>
            <div className="result-grid">
              <div className="result-card">
                <h3>{t('expectedResult.items.prototype.title')}</h3>
                <p>{t('expectedResult.items.prototype.description')}</p>
              </div>
              <div className="result-card">
                <h3>{t('expectedResult.items.calculation.title')}</h3>
                <p>{t('expectedResult.items.calculation.description')}</p>
              </div>
              <div className="result-card">
                <h3>{t('expectedResult.items.map.title')}</h3>
                <p>{t('expectedResult.items.map.description')}</p>
              </div>
              <div className="result-card">
                <h3>{t('expectedResult.items.recommendations.title')}</h3>
                <p>{t('expectedResult.items.recommendations.description')}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
