import React, { useState } from 'react';
import { User } from 'lucide-react';
import Menu from './SideMenu'; 
import "../styles/dashboard.css";

const Layout = ({ children }) => { 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="dashboard-container"> 
      <Menu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
 
      <div className="main-content"> 
        <header className="top-nav">
          <div className="user-menu">
            <span className="username">Kavitha</span>
            <div className="user-avatar">
              <User size={20} />
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
