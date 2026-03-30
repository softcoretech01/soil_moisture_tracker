import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Database, BarChart3, Droplets, CalendarDays, ChevronDown, ChevronRight, Users, Map } from 'lucide-react';

const Sidebar = () => {
  const [mastersOpen, setMastersOpen] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <Droplets size={28} />
        Soil Tracker
      </div>
      <nav>
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Home size={20} />
          Home
        </NavLink>
        <NavLink 
          to="/daily-updates" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <CalendarDays size={20} />
          Daily Updates
        </NavLink>
        
        {/* Masters Dropdown */}
        <div 
          className="nav-link" 
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
          onClick={() => setMastersOpen(!mastersOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <Database size={20} />
             Masters
          </div>
          {mastersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        
        {mastersOpen && (
          <div style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <NavLink 
              to="/field-master" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Map size={18} />
              Field Master
            </NavLink>
            <NavLink 
              to="/user-master" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              User Master
            </NavLink>
          </div>
        )}

        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={20} />
          Analytics
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
