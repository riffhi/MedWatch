import React, { useState, useEffect } from 'react';
import { Client, Account, ID } from 'appwrite';
import { Activity, Map, BarChart3, Settings, Menu, Bell, Users, Eye, EyeOff, LogOut, ChevronDown, TrendingUp, AlertTriangle, MapPin, Clock, Search, Plus, Edit, Trash2, Package, X } from 'lucide-react';

// --- Appwrite Configuration ---
const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client = new Client();
if (appwriteEndpoint && appwriteProjectId) {
  client.setEndpoint(appwriteEndpoint).setProject(appwriteProjectId);
}
const account = new Account(client);


// --- START: Placeholder Components ---
const MedicineShortageMap = () => <div className="text-white bg-gray-800/50 p-6 rounded-xl border border-gray-700">Medicine Shortage Map Component</div>;
const Alerts = () => <div className="text-white bg-gray-800/50 p-6 rounded-xl border border-gray-700">Alerts Component</div>;
const ReportShortage = () => <div className="text-white bg-gray-800/50 p-6 rounded-xl border border-gray-700">Report Shortage Component</div>;
// --- END: Placeholder Components ---


// --- Medicine Form Modal ---
const MedicineForm = ({ medicine, onClose, onSave }) => {
    const [formData, setFormData] = useState(
        medicine || {
            name: '',
            category: '',
            currentStock: 0,
            minStock: 10,
            price: 0,
        }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-full max-w-md m-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{medicine ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Medicine Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Paracetamol 500mg" required />
                    <InputField label="Category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Analgesic" required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Current Stock" name="currentStock" type="number" value={formData.currentStock} onChange={handleChange} required />
                        <InputField label="Min Stock Level" name="minStock" type="number" value={formData.minStock} onChange={handleChange} required />
                    </div>
                    <InputField label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleChange} required />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">Save Medicine</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500" />
    </div>
);


// --- Inventory Management Component ---
const InventoryManagement = () => {
  const [medicines, setMedicines] = useState([
    { id: '1', name: 'Insulin (100 IU)', category: 'Diabetes', currentStock: 15, minStock: 20, price: 450, lastUpdated: '2024-07-19', status: 'low-stock' },
    { id: '2', name: 'Levothyroxine 50mcg', category: 'Thyroid', currentStock: 0, minStock: 10, price: 120, lastUpdated: '2024-07-18', status: 'out-of-stock' },
    { id: '3', name: 'Metformin 500mg', category: 'Diabetes', currentStock: 250, minStock: 50, price: 80, lastUpdated: '2024-07-19', status: 'in-stock' },
    { id: '4', name: 'Amlodipine 5mg', category: 'Hypertension', currentStock: 30, minStock: 25, price: 95, lastUpdated: '2024-07-17', status: 'in-stock' },
    { id: '5', name: 'Atorvastatin 20mg', category: 'Cholesterol', currentStock: 8, minStock: 15, price: 200, lastUpdated: '2024-07-19', status: 'low-stock' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (stock, minStock) => {
      if (stock <= 0) return { text: 'out-of-stock', color: 'bg-red-500/20 text-red-300', icon: <Trash2 className="w-4 h-4 text-red-400" /> };
      if (stock <= minStock) return { text: 'low-stock', color: 'bg-orange-500/20 text-orange-300', icon: <AlertTriangle className="w-4 h-4 text-orange-400" /> };
      return { text: 'in-stock', color: 'bg-green-500/20 text-green-300', icon: <Package className="w-4 h-4 text-green-400" /> };
  };

  const handleUpdateStock = (id, newStock) => {
    setMedicines(medicines.map(med =>
      med.id === id ? { ...med, currentStock: newStock, lastUpdated: new Date().toISOString().split('T')[0] } : med
    ));
  };

  const handleSaveMedicine = (formData) => {
      if (editingMedicine) {
          // Update existing medicine
          setMedicines(medicines.map(med => med.id === editingMedicine.id ? { ...med, ...formData, id: med.id, lastUpdated: new Date().toISOString().split('T')[0] } : med));
      } else {
          // Add new medicine
          const newMedicine = { ...formData, id: new Date().getTime().toString(), lastUpdated: new Date().toISOString().split('T')[0] };
          setMedicines([newMedicine, ...medicines]);
      }
      closeForm();
  };

  const handleDeleteMedicine = (id) => {
      if(window.confirm('Are you sure you want to delete this medicine record?')){
        setMedicines(medicines.filter(med => med.id !== id));
      }
  };

  const openFormToEdit = (medicine) => {
      setEditingMedicine(medicine);
      setIsFormVisible(true);
  };
  
  const openFormToAdd = () => {
      setEditingMedicine(null);
      setIsFormVisible(true);
  };

  const closeForm = () => {
      setIsFormVisible(false);
      setEditingMedicine(null);
  };


  return (
    <div className="space-y-6">
      {isFormVisible && <MedicineForm medicine={editingMedicine} onClose={closeForm} onSave={handleSaveMedicine} />}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          <p className="text-gray-400">Manage your medicine stock and pricing</p>
        </div>
        <button
          onClick={openFormToAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Medicines', value: medicines.length, color: 'text-purple-400', icon: <Package className="w-8 h-8 text-purple-400" /> },
          { label: 'In Stock', value: medicines.filter(m => m.currentStock > m.minStock).length, color: 'text-green-400', icon: <Package className="w-8 h-8 text-green-400" /> },
          { label: 'Low Stock', value: medicines.filter(m => m.currentStock > 0 && m.currentStock <= m.minStock).length, color: 'text-orange-400', icon: <AlertTriangle className="w-8 h-8 text-orange-400" /> },
          { label: 'Out of Stock', value: medicines.filter(m => m.currentStock <= 0).length, color: 'text-red-400', icon: <Trash2 className="w-8 h-8 text-red-400" /> },
        ].map((card, index) => (
          <div key={index} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search medicines by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
        />
      </div>

      {/* Medicines Table */}
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                {['Medicine', 'Category', 'Stock', 'Price', 'Status', 'Updated', 'Actions'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredMedicines.map((medicine) => {
                  const statusInfo = getStatusInfo(medicine.currentStock, medicine.minStock);
                  return (
                    <tr key={medicine.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {statusInfo.icon}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">{medicine.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{medicine.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={medicine.currentStock}
                            onChange={(e) => handleUpdateStock(medicine.id, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded text-sm text-white"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">/ {medicine.minStock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">₹{medicine.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusInfo.color}`}>
                          {statusInfo.text.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{medicine.lastUpdated}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <button onClick={() => openFormToEdit(medicine)} className="text-purple-400 hover:text-purple-300 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteMedicine(medicine.id)} className="text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// --- Re-purposed Dashboard Content ---
const DashboardContent = ({ userRole }) => {
    switch (userRole) {
      case 'pharmacy':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Medicines" value="247" change="+12 this week" icon={Activity} color="purple" />
              <StatCard title="Low Stock Items" value="18" change="+5 today" icon={AlertTriangle} color="orange" />
              <StatCard title="Out of Stock" value="7" change="-3 from yesterday" icon={TrendingUp} color="red" />
              <StatCard title="Pending Orders" value="12" change="Processing" icon={Clock} color="blue" />
            </div>
            <RecentActivity />
          </div>
        );
      case 'patient':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Active Shortages" value="234" change="In your area" icon={AlertTriangle} color="red" />
              <StatCard title="Reports Submitted" value="15" change="This month" icon={TrendingUp} color="blue" />
              <StatCard title="Nearby Pharmacies" value="47" change="With stock" icon={MapPin} color="green" />
            </div>
            <ShortageAlerts />
          </div>
        );
      case 'authority':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Critical Alerts" value="23" change="Requires attention" icon={AlertTriangle} color="red" />
              <StatCard title="Districts Affected" value="156" change="Nationwide" icon={MapPin} color="orange" />
              <StatCard title="Price Anomalies" value="89" change="Detected today" icon={TrendingUp} color="purple" />
              <StatCard title="Response Time" value="2.4h" change="Average" icon={Clock} color="green" />
            </div>
            <CriticalAlerts />
          </div>
        );
      default:
        return <ShortageAlerts />;
    }
};


// --- Main Layout Component (The Dashboard Interface) ---
function MainLayout({ user, userRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const navigationConfig = {
    patient: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'map', label: 'Live Map', icon: Map },
      { id: 'report', label: 'Report Shortage', icon: AlertTriangle },
    ],
    pharmacy: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'inventory', label: 'Inventory', icon: Menu },
      { id: 'alerts', label: 'Alerts', icon: Bell },
      { id: 'report', label: 'Report Shortage', icon: AlertTriangle },
    ],
    authority: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'map', label: 'Live Map', icon: Map },
      { id: 'alerts', label: 'Alerts', icon: Bell },
      { id: 'users', label: 'Users', icon: Users},
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  };

  const navigationItems = navigationConfig[userRole];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardContent userRole={userRole} />;
      case 'map': return <MedicineShortageMap />;
      case 'alerts': return <Alerts />;
      case 'inventory': return <InventoryManagement />;
      case 'report': return <ReportShortage />;
      case 'settings': return <div className="text-white">Settings Page</div>;
      case 'users': return <div className="text-white">Users Page</div>;
      default: return <DashboardContent userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 min-h-screen bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
          <div className="flex items-center space-x-2 p-6 h-20 border-b border-white/10">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">MedWatch</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-black/10 backdrop-blur-xl border-b border-white/10 h-20 flex items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-bold">Hi, {user.name}</h1>
              <p className="text-gray-400 text-sm capitalize">{userRole} Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 p-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                <img src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=6d28d9&color=fff`} alt="avatar" className="w-8 h-8 rounded-md" />
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}


// --- User Login/Registration Component ---
const UserLogin = ({ onLoginSuccess }) => {
  const [userType, setUserType] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isRegistering && formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }
    if (!appwriteProjectId) {
      setError("Cannot connect to service. Configuration is missing.");
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await account.create(ID.unique(), formData.email, formData.password, formData.name);
      }
      await account.createEmailPasswordSession(formData.email, formData.password);
      const user = await account.get();
      onLoginSuccess(user, userType);
    } catch (err) {
      console.error('Authentication failed:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const userTypeOptions = [
    { value: 'patient', label: 'Patient / Public', description: 'Report shortages and find medicine' },
    { value: 'pharmacy', label: 'Pharmacy', description: 'Manage inventory and stock levels' },
    { value: 'authority', label: 'Health Authority', description: 'Monitor regional shortage data' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white">Welcome to MedWatch</h2>
            <p className="mt-2 text-sm text-gray-400">Real-time medicine shortage monitoring</p>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-semibold text-center text-white">{isRegistering ? 'Create an Account' : 'Sign In'}</h3>

              {!isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">I am a...</label>
                  <div className="space-y-2">
                    {userTypeOptions.map((option) => (
                      <label key={option.value} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 border border-white/10 has-[:checked]:bg-purple-500/10 has-[:checked]:border-purple-500/30 transition-all">
                        <input type="radio" name="userType" value={option.value} checked={userType === option.value} onChange={(e) => setUserType(e.target.value)} className="mt-1 bg-transparent border-gray-500 text-purple-500 focus:ring-purple-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{option.label}</div>
                          <div className="text-xs text-gray-400">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {isRegistering && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                  <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500" placeholder="Enter your full name"/>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500" placeholder="you@example.com"/>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                <div className="relative mt-1">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegistering ? 'new-password' : 'current-password'} required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 pr-10" placeholder="••••••••"/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (<p className="text-sm text-red-300 bg-red-500/10 p-3 rounded-md border border-red-500/20">{error}</p>)}
              
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-pink-500 transition-all transform hover:scale-105">
                {isLoading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="font-medium text-purple-400 hover:text-purple-300">
                  {isRegistering ? 'Sign In' : 'Sign up here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Top-Level App Component (Handles Auth State) ---
export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    if (!appwriteProjectId || !appwriteEndpoint) {
      const errorMsg = "Appwrite configuration is missing. Please check your .env file for VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID.";
      console.error(errorMsg);
      setConfigError(errorMsg);
      setIsLoading(false);
      return;
    }
    const checkSession = async () => {
      try {
        const user = await account.get();
        setLoggedInUser(user);
        setUserRole(localStorage.getItem('userRole') || 'patient');
      } catch (error) {
        setLoggedInUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (user, role) => {
    setLoggedInUser(user);
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setLoggedInUser(null);
      setUserRole(null);
      localStorage.removeItem('userRole');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
          <p className="mt-4 text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-red-900/50 rounded-lg shadow-xl p-8 text-center border border-red-500/30">
          <h2 className="text-2xl font-bold text-red-300">Configuration Error</h2>
          <p className="mt-4 text-red-400">{configError}</p>
        </div>
      </div>
    );
  }

  if (loggedInUser && userRole) {
    return <MainLayout user={loggedInUser} userRole={userRole} onLogout={handleLogout} />;
  }

  return <UserLogin onLoginSuccess={handleLoginSuccess} />;
}

// --- Dashboard Helper Components ---

const StatCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-300',
    green: 'bg-green-500/20 text-green-300',
    orange: 'bg-orange-500/20 text-orange-300',
    red: 'bg-red-500/20 text-red-300',
    purple: 'bg-purple-500/20 text-purple-300',
  };

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{change}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const RecentActivity = () => (
  <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
    <div className="space-y-4">
      {[
        { medicine: 'Insulin (100 IU)', status: 'Low Stock', time: '2 mins ago', color: 'orange' },
        { medicine: 'Levothyroxine 50mcg', status: 'Out of Stock', time: '15 mins ago', color: 'red' },
        { medicine: 'Metformin 500mg', status: 'Restocked', time: '1 hour ago', color: 'green' },
        { medicine: 'Amlodipine 5mg', status: 'Low Stock', time: '3 hours ago', color: 'orange' },
      ].map((item, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <p className="font-medium text-gray-200">{item.medicine}</p>
            <p className="text-sm text-gray-500">{item.time}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.color === 'green' ? 'bg-green-500/20 text-green-300' :
            item.color === 'orange' ? 'bg-orange-500/20 text-orange-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ShortageAlerts = () => (
  <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
    <h3 className="text-lg font-semibold text-white mb-4">Shortage Alerts in Your Area</h3>
    <div className="space-y-4">
      {[
        { medicine: 'Insulin (Regular)', location: 'Central Delhi', severity: 'Critical', distance: '2.3 km' },
        { medicine: 'Thyroid Medications', location: 'South Delhi', severity: 'High', distance: '4.1 km' },
        { medicine: 'Blood Pressure Meds', location: 'East Delhi', severity: 'Medium', distance: '6.8 km' },
      ].map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
          <div>
            <p className="font-medium text-gray-200">{item.medicine}</p>
            <p className="text-sm text-gray-500">{item.location} • {item.distance}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.severity === 'Critical' ? 'bg-red-500/20 text-red-300' :
            item.severity === 'High' ? 'bg-orange-500/20 text-orange-300' :
            'bg-yellow-500/20 text-yellow-300'
          }`}>
            {item.severity}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const CriticalAlerts = () => (
  <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
    <h3 className="text-lg font-semibold text-white mb-4">Critical Alerts</h3>
    <div className="space-y-4">
      {[
        { type: 'Shortage', medicine: 'Insulin', districts: 'Delhi, Mumbai, Bangalore', priority: 'Critical' },
        { type: 'Price Surge', medicine: 'Levothyroxine', districts: 'Chennai, Kolkata', priority: 'High' },
        { type: 'Black Market', medicine: 'Metformin', districts: 'Hyderabad, Pune', priority: 'High' },
      ].map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div>
            <p className="font-medium text-red-300">{item.type}: {item.medicine}</p>
            <p className="text-sm text-red-400/80">{item.districts}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.priority === 'Critical' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'
            }`}>
              {item.priority}
            </span>
            <button className="px-3 py-1 bg-red-600/80 text-white text-xs rounded-md hover:bg-red-600">
              Take Action
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
