import React, { useState, useEffect } from 'react';
import { Client, Account, ID } from 'appwrite';
import { Activity, Map, BarChart3, Settings, Menu, Bell, Users, Eye, EyeOff, LogOut, ChevronDown, TrendingUp, AlertTriangle, Briefcase, BarChart2 } from 'lucide-react';

// Import all your components
import MedicineShortageMap from './components/MedicineShortageMap';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import ReportShortage from './components/ReportShortage';
import InventoryManagement from './components/InventoryManagement';

// --- Appwrite Configuration ---
const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client = new Client();
if (appwriteEndpoint && appwriteProjectId) {
  client.setEndpoint(appwriteEndpoint).setProject(appwriteProjectId);
}
const account = new Account(client);

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
      case 'dashboard': return <Dashboard userRole={userRole} />;
      case 'map': return <MedicineShortageMap />;
      case 'alerts': return <Alerts />;
      case 'inventory': return <InventoryManagement />;
      case 'report': return <ReportShortage />;
      case 'settings': return <div className="text-white">Settings Page</div>;
      case 'users': return <div className="text-white">Users Page</div>;
      default: return <Dashboard userRole={userRole} />;
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
            <span className="text-xl font-bold">MedTrack</span>
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
                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=6d28d9&color=fff`} alt="avatar" className="w-8 h-8 rounded-md" />
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

// --- Input Field Component ---
const InputField = (props) => (
  <input 
    {...props}
    className="mt-1 w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 text-white"
  />
);

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

  const handleGoogleLogin = async () => {
    try {
      account.createOAuth2Session(
        'google',
        window.location.origin, // Success URL
        window.location.origin  // Failure URL
      );
    } catch (err) {
      console.error('Google OAuth error:', err);
      setError('Failed to initialize Google login');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const userTypeOptions = [
    { value: 'patient', label: 'Patient / Public', description: 'Report shortages and find medicine', icon: Users },
    { value: 'pharmacy', label: 'Pharmacy', description: 'Manage inventory and stock levels', icon: Briefcase },
    { value: 'authority', label: 'Health Authority', description: 'Monitor regional shortage data', icon: BarChart2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 animate-fade-in-up">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white">Welcome to MedTrack</h2>
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
                        <input 
                          type="radio" 
                          name="userType" 
                          value={option.value} 
                          checked={userType === option.value} 
                          onChange={(e) => setUserType(e.target.value)} 
                          className="mt-1 bg-transparent border-gray-500 text-purple-500 focus:ring-purple-500" 
                        />
                        <option.icon className="w-5 h-5 text-purple-400 mt-0.5" />
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
                  <InputField 
                    id="name" 
                    name="name" 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                <InputField 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                <div className="relative mt-1">
                  <InputField 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    autoComplete={isRegistering ? 'new-password' : 'current-password'} 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white" 
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-300 bg-red-500/10 p-3 rounded-md border border-red-500/20">{error}</p>
              )}
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-pink-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-400">OR</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>

              <button 
                type="button" 
                onClick={handleGoogleLogin} 
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-white/20 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
                  className="font-medium text-purple-400 hover:text-purple-300"
                >
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
        console.log('No active session.');
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

