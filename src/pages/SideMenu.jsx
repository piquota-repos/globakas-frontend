import React from 'react';
import { LayoutDashboard, FolderSearch, History, Settings, GitCompare, HelpCircle, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom'; 
import "../styles/dashboard.css";

const SideMenu = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation(); 
  
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <GitCompare size={20} />, label: 'Reconcilation Control', path: '/reconcilation' },
    { icon: <FolderSearch size={20} />, label: 'Record Finder', path: '/recordfinder' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
    { icon: <History size={20} />, label: 'History', path: '/history' },
    { icon: <HelpCircle size={20} />, label: 'Help', path: '/help' },
    { icon: <LogOut size={20} />, label: 'Logout', path: '/logout' }
  ];

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>Globakas</h2>
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
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} // Check if the current path matches
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
