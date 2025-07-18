import React, { useState } from 'react';
import { Menu, X, Activity, Bell, MapPin, Users, Settings, LogOut } from 'lucide-react';

const Layout = ({ children, currentView, onViewChange, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Defines the navigation items for each role
  const navigationItems = {
    pharmacy: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'inventory', label: 'Inventory Management', icon: Menu },
      { id: 'reports', label: 'Reports', icon: Bell },
      { id: 'profile', label: 'Profile', icon: Users },
    ],
    patient: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'report', label: 'Report Shortage', icon: Bell },
      { id: 'map', label: 'Shortage Map', icon: MapPin },
      { id: 'profile', label: 'Profile', icon: Users },
    ],
    authority: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
      { id: 'map', label: 'Geographic Analysis', icon: MapPin },
      { id: 'analytics', label: 'Analytics', icon: Settings },
    ],
  };

  const currentItems = navigationItems[userRole] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">{/* Header content */}</header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg`}>
          <div className="flex flex-col h-full pt-4">
            <ul className="flex-1 px-4 space-y-2">
              {currentItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onViewChange(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        currentView === item.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;