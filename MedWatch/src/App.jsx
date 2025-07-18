import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ShortageMap from './components/MedicineShortageMap';
import ReportShortage from './components/ReportShortage';
import InventoryManagement from './components/InventoryManagement';
import Alerts from './components/Alerts';
import UserLogin from './components/UserLogin';
import MedicineShortageMap from './components/MedicineShortageMap';



function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState(null); // Removed TypeScript type

  if (!userRole) {
    return <UserLogin onLogin={setUserRole} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userRole={userRole} />;
      case 'map':
        return <MedicineShortageMap />;
      case 'report':
        return <ReportShortage />;
      case 'inventory':
        return <InventoryManagement />;
      case 'alerts':
        return <Alerts />;
      case 'analytics':
        return <Dashboard userRole={userRole} />;
      case 'medicines':
        return <InventoryManagement />;
      case 'users':
        return <Dashboard userRole={userRole} />;
      case 'settings':
        return <Dashboard userRole={userRole} />;
      case 'profile':
        return <Dashboard userRole={userRole} />;
      case 'reports':
        return <Dashboard userRole={userRole} />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      userRole={userRole}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
