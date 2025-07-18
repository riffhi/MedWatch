import React, { useState } from 'react';
import { Menu, X, Activity, Bell, MapPin, Users, Settings, LogOut } from 'lucide-react';

const Layout = ({ children, currentView, onViewChange, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = {
    pharmacy: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'inventory', label: 'Inventory Management', icon: Menu },
      { id: 'reports', label: 'Reports', icon: Bell },
      { id: 'profile', label: 'Profile', icon: Users },
      { id: 'crud', label: 'CRUD Test', icon: Settings },
    ],
    patient: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'report', label: 'Report Shortage', icon: Bell },
      { id: 'map', label: 'Shortage Map', icon: MapPin },
      { id: 'profile', label: 'Profile', icon: Users },
      { id: 'crud', label: 'CRUD Test', icon: Settings },
    ],
    authority: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
      { id: 'map', label: 'Geographic Analysis', icon: MapPin },
      { id: 'analytics', label: 'Analytics', icon: Settings },
      { id: 'crud', label: 'CRUD Test', icon: Settings },
    ],
    // admin: [
    //   { id: 'dashboard', label: 'Dashboard', icon: Activity },
    //   { id: 'medicines', label: 'Medicine Database', icon: Menu },
    //   { id: 'users', label: 'User Management', icon: Users },
    //   { id: 'settings', label: 'System Settings', icon: Settings },
    // ],
  };

  const currentItems = navigationItems[userRole] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MedWatch</h1>
                <p className="text-xs text-gray-600">Medicine Shortage Monitor</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Bell size={20} />
            </button>
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full pt-4">
            <div className="px-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{userRole}</p>
                    <p className="text-xs text-gray-600">Active User</p>
                  </div>
                </div>
              </div>
            </div>
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
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
