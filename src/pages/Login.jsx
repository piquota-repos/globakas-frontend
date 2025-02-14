import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '../components/InputField';
import Button from '../components/Button';
import '../styles/loginPage.css';
import googleIcon from '../assets/images/google-icon.png';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const [languageTab, setLanguageTab] = useState('english');
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
    i18n.changeLanguage('en');
    setLanguageTab('english');
  }, [i18n]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{t('login.welcomeBack')}</h1>
          <p>{t('login.chooseSignInMethod')}</p>
        </div>

        <div className="language-selector tabs">
          <Button 
            variant={languageTab === 'english' ? 'primary' : 'secondary'}
            onClick={() => {
              handleLanguageChange('en');
              setLanguageTab('english');
            }}
            className={`tab ${languageTab === 'english' ? 'active' : ''}`}
          >
            English
          </Button>
          <Button
            variant={languageTab === 'spanish' ? 'primary' : 'secondary'}
            onClick={() => {
              handleLanguageChange('es');
              setLanguageTab('spanish');
            }}
            className={`tab ${languageTab === 'spanish' ? 'active' : ''}`}
          >
            Español
          </Button>
        </div>

        <br />

        <div className="tabs">
          <Button
            variant={activeTab === 'login' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('login')}
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
          >
            {t('login.signIn')}
          </Button>
          <Button
            variant={activeTab === 'register' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('register')}
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
          >
            {t('login.register')}
          </Button>
        </div>

        <div className="tab-content">
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="login-form">
              <InputField
                label={t('login.email')}
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
              />
              <InputField
                label={t('login.password')}
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
              />
              <Button type="submit" variant="primary" fullWidth>
                {t('login.signIn')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="register-form">
              <InputField
                label={t('login.email')}
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
              />
              <InputField
                label={t('login.password')}
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
              />
              <InputField
                label={t('login.confirmPassword')}
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
              />
              <Button type="submit" variant="primary" fullWidth>
                {t('login.createAccount')}
              </Button>
            </form>
          )}

          <div className="divider">
            <span>{t('login.orContinueWith')}</span>
          </div>

          <div className="social-buttons">
            <Button
              variant="outline"
              fullWidth
              icon={<img src={googleIcon} alt="Google" />}
            >
              Google
            </Button>
          </div>

          <p className="terms">
            {t('login.terms')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;