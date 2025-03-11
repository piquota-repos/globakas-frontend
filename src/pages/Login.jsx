import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/loginPage.css';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { IoLanguageOutline } from 'react-icons/io5';

const Login = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const [language, setLanguage] = useState('en');
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', loginData);
    navigate('/dashboard');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log('Register:', registerData);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>{t('login.welcomeBack')}</h1>
            <p>{t('login.chooseSignInMethod')}</p>
          </div>
          <div className="login-language-selector">
          <button 
            className="language-button"
            onClick={() => handleLanguageChange(language === 'en' ? 'es' : 'en')}
          >
            <IoLanguageOutline />
            <span>{language === 'en' ? 'EN' : 'ES'}</span>
          </button>
        </div>
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              {t('login.login')}
            </button>
            <button
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              {t('login.signUp')}
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="form-group">
                  <div className="input-icon">
                    <HiOutlineMail />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder={t('login.email')}
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="input-icon">
                    <RiLockPasswordLine />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder={t('login.password')}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                <div className="forgot-password">
                  <a href="#forgot">{t('login.forgotPassword')}</a>
                </div>

                <button type="submit" className="submit-button">
                  {t('login.login')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="form-group">
                  <div className="input-icon">
                    <HiOutlineMail />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder={t('login.email')}
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="input-icon">
                    <RiLockPasswordLine />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder={t('login.password')}
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="input-icon">
                    <RiLockPasswordLine />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder={t('login.confirmPassword')}
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <button type="submit" className="submit-button">
                  {t('login.createAccount')}
                </button>
              </form>
            )}

            {/* <div className="divider">
              <span>{t('login.orContinueWith')}</span>
            </div>

            <button className="social-button">
              <FcGoogle className="social-icon" />
              <span>Google</span>
            </button>

            <p className="terms">
              {t('login.terms')}
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;