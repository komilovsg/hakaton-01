import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  EnvironmentOutlined,
  CalculatorOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  CloudOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import lending1 from '../../assets/lending-1.png';
import lending2 from '../../assets/lending-2.png';
import WaterEffect from '../water-effect/WaterEffect';
import './Landing.scss';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <EnvironmentOutlined />,
      title: t('landing.features.map.title', 'Интерактивная карта'),
      description: t('landing.features.map.description', 'Визуализация всех каналов на карте Таджикистана с отображением статуса потерь воды'),
    },
    {
      icon: <CalculatorOutlined />,
      title: t('landing.features.calculator.title', 'Калькулятор потерь'),
      description: t('landing.features.calculator.description', 'Точный расчет потерь воды с учетом множества факторов'),
    },
    {
      icon: <BarChartOutlined />,
      title: t('landing.features.charts.title', 'Графики и аналитика'),
      description: t('landing.features.charts.description', 'Детальная визуализация данных и трендов по каналам'),
    },
    {
      icon: <DatabaseOutlined />,
      title: t('landing.features.database.title', 'База данных каналов'),
      description: t('landing.features.database.description', 'Централизованное хранение и управление информацией о каналах'),
    },
    {
      icon: <CloudOutlined />,
      title: t('landing.features.weather.title', 'Прогноз погоды'),
      description: t('landing.features.weather.description', 'Учет погодных условий для более точных расчетов'),
    },
    {
      icon: <RobotOutlined />,
      title: t('landing.features.ai.title', 'ИИ-анализ'),
      description: t('landing.features.ai.description', 'Интеллектуальный анализ данных с рекомендациями'),
    },
  ];

  const benefits = [
    t('landing.benefits.accuracy', 'Точность расчетов до 95%'),
    t('landing.benefits.efficiency', 'Экономия времени и ресурсов'),
    t('landing.benefits.insights', 'Глубокие аналитические инсайты'),
    t('landing.benefits.decisions', 'Обоснованные решения для управления'),
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="landing">
      {/* Hero Section with Animated Waves */}
      <section className="hero-section">
        <div className="waves-container">
          <svg className="wave wave-top" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,0 L0,0 Z" fill="currentColor" />
          </svg>
          <svg className="wave wave-bottom" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,20 600,100 900,60 C1050,40 1150,80 1200,60 L1200,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>
        <WaterEffect className="hero-water-effect" color="#bae6fd" />
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hero-title"
            >
              {t('header.title', 'Smart Water Control')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hero-subtitle"
            >
              {t('header.subtitle', 'Интеллектуальный контроль водных ресурсов в реальном времени')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="hero-tagline"
            >
              {t('header.tagline', 'Умный мониторинг, точный анализ, эффективное управление')}
            </motion.p>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="cta-button"
            >
              {t('landing.cta.start', 'Начать работу')}
              <ArrowRightOutlined />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2>{t('landing.features.title', 'Возможности системы')}</h2>
            <p>{t('landing.features.subtitle', 'Комплексное решение для управления водными ресурсами')}</p>
          </motion.div>

          {/* Image showcase before features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="features-image-showcase"
          >
            <motion.img
              src={lending2}
              alt="Water control system"
              className="showcase-image"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="features-grid"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="feature-card"
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits-section">
        <div className="benefits-waves">
          <svg className="benefits-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="benefits-content"
          >
            <div className="benefits-text">
              <h2>{t('landing.benefits.title', 'Преимущества')}</h2>
              <p>{t('landing.benefits.description', 'Почему выбирают Smart Water Control')}</p>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CheckCircleOutlined />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="benefits-visual"
            >
              <motion.img
                src={lending1}
                alt="Water management system"
                className="benefits-image"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <WaterEffect className="benefits-water-effect" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats-section">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="stats-grid"
          >
            {[
              { number: '95%', label: t('landing.stats.accuracy', 'Точность расчетов') },
              { number: '24/7', label: t('landing.stats.monitoring', 'Мониторинг') },
              { number: '100+', label: t('landing.stats.channels', 'Каналов в базе') },
              { number: 'AI', label: t('landing.stats.analysis', 'ИИ-анализ') },
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants} className="stat-card">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1, type: 'spring' }}
                  className="stat-number"
                >
                  {stat.number}
                </motion.div>
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="about-content"
          >
            <div className="about-header">
              <h2>{t('landing.about.title', 'О проекте')}</h2>
              <p className="about-subtitle">{t('landing.about.subtitle', 'Инновационное решение для управления водными ресурсами')}</p>
            </div>

            <div className="about-grid">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="about-card"
              >
                <div className="about-icon">💧</div>
                <h3>{t('landing.about.problem.title', 'Проблема')}</h3>
                <p>{t('landing.about.problem.text', 'При транспортировке воды по каналам теряется 40-50% объема из-за фильтрации и испарения. Ассоциации водопользователей не знают точно, где происходят наибольшие потери.')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="about-card"
              >
                <div className="about-icon">🎯</div>
                <h3>{t('landing.about.solution.title', 'Решение')}</h3>
                <p>{t('landing.about.solution.text', 'Smart Water Control предоставляет комплексную систему мониторинга, анализа и управления водными ресурсами с использованием современных технологий и ИИ-аналитики.')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="about-card"
              >
                <div className="about-icon">🚀</div>
                <h3>{t('landing.about.impact.title', 'Результат')}</h3>
                <p>{t('landing.about.impact.text', 'Снижение потерь воды, оптимизация распределения ресурсов, повышение эффективности управления ирригационными системами.')}</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="about-mission"
            >
              <h3>{t('landing.about.mission.title', 'Наша миссия')}</h3>
              <p>{t('landing.about.mission.text', 'Обеспечить эффективное и устойчивое управление водными ресурсами в Таджикистане через внедрение передовых технологий мониторинга, анализа и прогнозирования. Мы стремимся помочь Ассоциациям водопользователей принимать обоснованные решения на основе точных данных и аналитики.')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="cta-content"
          >
            <h2>{t('landing.cta.title', 'Готовы начать?')}</h2>
            <p>{t('landing.cta.description', 'Присоединяйтесь к системе управления водными ресурсами нового поколения')}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="cta-button-large"
            >
              {t('landing.cta.start', 'Начать работу')}
              <ArrowRightOutlined />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-waves">
          <svg className="footer-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="footer-content"
          >
            <div className="footer-main">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="footer-logo-section"
              >
                <div className="footer-logo">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                    }}
                    transition={{ 
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="logo-circle"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" fill="currentColor" opacity="0.8" />
                      <path d="M3 15c2 0 4-1 5-2s3-2 5-2 4 1 5 2" stroke="currentColor" />
                      <path d="M3 19c2 0 4-1 5-2s3-2 5-2 4 1 5 2" stroke="currentColor" />
                      <circle cx="12" cy="10" r="2" fill="currentColor" opacity="0.6" />
                    </svg>
                  </motion.div>
                </div>
                <h3>{t('header.title', 'Smart Water Control')}</h3>
                <p className="footer-tagline">{t('footer.tagline', 'Умное управление водными ресурсами')}</p>
              </motion.div>

              <div className="footer-info">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="footer-section"
                >
                  <h4>{t('footer.mission.title', 'Наша миссия')}</h4>
                  <p>{t('footer.mission.text', 'Обеспечить эффективное управление водными ресурсами через инновационные технологии и точную аналитику')}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="footer-section"
                >
                  <h4>{t('footer.contact.title', 'Контакты')}</h4>
                  <div className="footer-links">
                    <a href="mailto:info@watercontrol.tj">{t('footer.contact.email', 'info@watercontrol.tj')}</a>
                    <a href="tel:+992123456789">{t('footer.contact.phone', '+992 12 345 67 89')}</a>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="footer-bottom"
            >
              <div className="footer-water-drops">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="footer-drop"
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                    style={{
                      left: `${15 + i * 15}%`,
                    }}
                  />
                ))}
              </div>
              <p className="footer-copyright">
                {t('footer.copyright', '© 2025 Smart Water Control')} • {t('footer.rights', 'Все права защищены')}
              </p>
              <p className="footer-made-with">
                {t('footer.madeWith', 'Сделано с')} <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="heart"
                >❤️</motion.span> {t('footer.for', 'для')} {t('footer.tajikistan', 'Таджикистана')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
