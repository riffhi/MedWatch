import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ShortageMap from './components/MedicineShortageMap';
import ReportShortage from './components/ReportShortage';
import InventoryManagement from './components/InventoryManagement';
import Alerts from './components/Alerts';
import UserLogin from './components/UserLogin';
import CRUD_test from './components/CRUD_test';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState(null);

  if (!userRole) {
    return <UserLogin onLogin={setUserRole} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userRole={userRole} />;
      case 'map':
        return <ShortageMap />;
      case 'report':
        return <ReportShortage />;
      case 'inventory':
        return <InventoryManagement />;
      case 'alerts':
        return <Alerts />;
      case 'crud':
        return <CRUD_test />;
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