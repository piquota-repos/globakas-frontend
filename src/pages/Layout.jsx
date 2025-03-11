import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Menu from './SideMenu';
import "../styles/dashboard.css";

const Layout = ({ children }) => { 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); 

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setLanguage(lang);
    setIsDropdownOpen(false);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="dashboard-container"> 
      <Menu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="main-content"> 
        <header className="top-nav">
          {/* User Menu */}
          <div className="user-menu">
            {/* Language Selector */}
            <div className="language-container" ref={dropdownRef}>
              <div 
                className="language-selector" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{language === "en" ? "English" : "Español"}</span>
                <ChevronDown className={`dropdown-icon ${isDropdownOpen ? 'rotate' : ''}`} size={16} />
              </div>
              
              {isDropdownOpen && (
                <ul className="language-dropdown">
                  <li onClick={() => handleLanguageChange("en")}>English</li>
                  <li onClick={() => handleLanguageChange("es")}>Español</li>
                </ul>
              )}
            </div>
            
            <span className="username">Lucy</span>
            <div className="user-avatar">
              <img src="https://th.bing.com/th/id/OIP.wSKTK8q1luAFKCI5v0jWLwHaE8?w=184&h=123&c=7&r=0&o=5&pid=1.7" alt="User Avatar" className="profile-image" />
            </div>
          </div>
        </header>

        <main className="content-area">
          {children}  
        </main>
      </div>
    </div>
  );
};

export default Layout;
