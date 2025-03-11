import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/landingPage.css';
import InputField from '../components/InputField';
import Button from '../components/Button';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value); // Change the language dynamically using i18next
  };

  return (
    <div className="landing-page">
      <nav className={`nav-container ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="nav-logo">
            <span className="logo-text">Globakas</span>
          </div>

          {/* <button 
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button> */}

          <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            {['features', 'pricing', 'about'].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(section);
                }}
                className={`nav-link ${activeSection === section ? 'active' : ''}`}
              >
                {t(`landingPage.nav.${section}`)} {/* Translated content */}
              </a>
            ))}

            <Button onClick={handleLoginClick} className="login-button">
              {t('landingPage.nav.login')} {/* Translated login button */}
            </Button>

            {/* Language Selector */}
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              className="language-select"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>
        </div>
      </nav>

      <section id="home" className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{t('landingPage.hero.title')}</h1> {/* Translated title */}
          <p className="hero-subtitle">{t('landingPage.hero.subtitle')}</p> {/* Translated subtitle */}
          <div className="hero-cta">
            <div className="input-wrapper">
              <InputField
                type="email"
                placeholder={t('landingPage.hero.emailPlaceholder')} // Translated placeholder
                className="email-input"
              />

              <Button className="demo-button">
                {t('landingPage.hero.demoButton')} {/* Translated button */}
                <ArrowRight className="button-icon" />
              </Button>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="gradient-sphere sphere-1"></div>
          <div className="gradient-sphere sphere-2"></div>
          <div className="gradient-sphere sphere-3"></div>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2 className="section-title">{t('landingPage.features.title')}</h2> {/* Translated title */}
        <div className="features-grid">
          {t('landingPage.features.items', { returnObjects: true }).map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <h2 className="section-title">{t('landingPage.pricing.title')}</h2> {/* Translated title */}
        <div className="pricing-grid">
          {t('landingPage.pricing.plans', { returnObjects: true }).map((plan, index) => (
            <div
              key={index}
              className={`pricing-card ${index === 1 ? 'popular' : ''}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {index === 1 && <div className="popular-badge">Popular</div>}
              <h3>{plan.tier}</h3>
              <div className="price">{plan.price}</div>
              <ul>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <button className="pricing-button">
                {t('landingPage.pricing.button')} {/* Translated button */}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-content">
          <h2 className="section-title">{t('landingPage.about.title')}</h2> {/* Translated title */}
          <div className="about-grid">
            <div className="about-card mission">
              <h3>{t('landingPage.about.mission.title')}</h3> {/* Translated mission title */}
              <p>{t('landingPage.about.mission.text')}</p> {/* Translated mission text */}
            </div>
            <div className="about-card values">
              <h3>{t('landingPage.about.values.title')}</h3> {/* Translated values title */}
              <ul>
                {t('landingPage.about.values.items', { returnObjects: true }).map((value, index) => (
                  <li key={index}>{value}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-section">
        <div className="cta-content">
          <Sparkles className="cta-icon" />
          <h2>{t('landingPage.cta.title')}</h2> {/* Translated CTA title */}
          <p>{t('landingPage.cta.subtitle')}</p> {/* Translated CTA subtitle */}
          <button className="schedule-button">
            {t('landingPage.cta.button')} {/* Translated CTA button */}
            <ArrowRight className="button-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
