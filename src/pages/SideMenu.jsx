import React from 'react';
import { LayoutDashboard, FolderSearch, Settings, GitCompare, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import "../styles/dashboard.css";
import { useTranslation } from 'react-i18next';

const SideMenu = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: t('Dashboard'), path: '/dashboard' },
    { icon: <GitCompare size={20} />, label: t('Reconcilation_Control'), path: '/reconcilation' },
    { icon: <FolderSearch size={20} />, label: t('Switch_File_Control'), path: '/recordfinder' }, 
    { icon: <Settings size={20} />, label: t('TagPay_Control'), path: '/tagpaycontrol' },
    {
      icon: <LogOut size={20} />, label: t('Logout'), path: '/login', onClick: () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
      }
    }
  ];

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>GLOBOKAS</h2>
        <button
          className="toggle-sidebar"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={item.onClick}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default SideMenu;
