import React, { useState, useEffect } from 'react';
import { Client, Account, ID } from 'appwrite';
import { Activity, Eye, EyeOff, AlertTriangle, TrendingUp, MapPin, Clock } from 'lucide-react';

// --- Appwrite Configuration ---
// IMPORTANT: Create a .env.local file in your project's root directory.
// Add your Appwrite credentials to this file like so:
// VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
// VITE_APPWRITE_PROJECT_ID="YOUR_PROJECT_ID"

const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client = new Client();

if (appwriteEndpoint && appwriteProjectId) {
    client
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId);
}

const account = new Account(client);

// --- Main App Component ---
// Manages the overall state, showing login or dashboard based on auth status.
export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userType, setUserType] = useState('patient'); // Manages the selected user role
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState('');

  // Check for existing session on component mount
  useEffect(() => {
    if (!appwriteProjectId || !appwriteEndpoint) {
        const errorMsg = "Appwrite configuration is missing. Please create a .env.local file in your project root and add VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID.";
        console.error(errorMsg);
        setConfigError(errorMsg);
        setIsLoading(false);
        return;
    }

    const checkSession = async () => {
      try {
        const user = await account.get();
        setLoggedInUser(user);
      } catch (error) {
        console.log('No active session.');
        setLoggedInUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);


  const handleLogin = (user) => {
    setLoggedInUser(user);
  };

  const handleLogout = async () => {
    try {
        await account.deleteSession('current');
        setLoggedInUser(null);
    } catch (error) {
        console.error('Failed to logout:', error);
    }
  };
  
  if (isLoading) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                  <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                  <p className="mt-4 text-gray-600">Initializing...</p>
              </div>
          </div>
      )
  }

  if (configError) {
      return (
          <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
              <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center">
                  <h2 className="text-2xl font-bold text-red-700">Configuration Error</h2>
                  <p className="mt-4 text-gray-600">{configError}</p>
              </div>
          </div>
      );
  }

  if (loggedInUser) {
    // Pass the selected userType to the Dashboard component
    return <Dashboard user={loggedInUser} onLogout={handleLogout} userRole={userType} />;
  }

  // Pass the userType state and its setter to the UserLogin component
  return <UserLogin onLogin={handleLogin} userType={userType} setUserType={setUserType} />;
}


// --- User Login/Registration Component ---
const UserLogin = ({ onLogin, userType, setUserType }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering && formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
    }
    
    if (!appwriteProjectId) {
        setError("Cannot connect to service. Configuration is missing.");
        return;
    }

    try {
      if (isRegistering) {
        await account.create(ID.unique(), formData.email, formData.password, formData.name);
        await account.createEmailPasswordSession(formData.email, formData.password);
        const user = await account.get();
        onLogin(user);
      } else {
        await account.createEmailPasswordSession(formData.email, formData.password);
        const user = await account.get();
        onLogin(user);
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const userTypeOptions = [
    { value: 'patient', label: 'Patient/Public', description: 'Report shortages and check availability' },
    { value: 'pharmacy', label: 'Pharmacy', description: 'Manage inventory and stock levels' },
    { value: 'authority', label: 'Health Authority', description: 'Monitor and respond to alerts' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to MedWatch</h2>
          <p className="mt-2 text-sm text-gray-600">
            Real-time medicine shortage monitoring platform
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold text-center text-gray-800">
              {isRegistering ? 'Create an Account' : 'Sign In'}
            </h3>
            
            {!isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  User Type
                </label>
                <div className="space-y-2">
                  {userTypeOptions.map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-transparent has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200 transition-all">
                      <input
                        type="radio"
                        name="userType"
                        value={option.value}
                        checked={userType === option.value}
                        onChange={(e) => setUserType(e.target.value)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your full name"/>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your email"/>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegistering ? 'new-password' : 'current-password'} required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10" placeholder="Enter your password"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {error && (<p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>)}

            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
            {/* Google OAuth Button */}
            {!isRegistering && (
              <button
                type="button"
                onClick={() => account.createOAuth2Session('google', 'http://localhost:5173', 'http://localhost:5173')}
                className="w-full flex justify-center py-3 px-4 mt-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign in with Google
              </button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="font-medium text-blue-600 hover:text-blue-800">
                {isRegistering ? 'Sign In' : 'Sign up here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Role-Based Dashboard Component ---
const Dashboard = ({ user, onLogout, userRole }) => {

  const getDashboardContent = () => {
    switch (userRole) {
      case 'pharmacy':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Medicines" value="247" change="+12 this week" icon={Activity} color="blue" />
              <StatCard title="Low Stock Items" value="18" change="+5 today" icon={AlertTriangle} color="orange" />
              <StatCard title="Out of Stock" value="7" change="-3 from yesterday" icon={TrendingUp} color="red" />
              <StatCard title="Pending Orders" value="12" change="Processing" icon={Clock} color="green" />
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
        // A fallback for any unexpected role
        return <ShortageAlerts />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name}!</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Signed in as: <span className="font-mono bg-gray-100 p-1 rounded text-xs">{user.email}</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Role: <span className="font-semibold capitalize px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{userRole}</span></p>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    Logout
                </button>
            </div>

            {/* Main Dashboard Content */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                        <p className="text-gray-600">Real-time medicine shortage monitoring</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700 font-medium">Live Monitoring</span>
                    </div>
                </div>
                {getDashboardContent()}
            </div>
        </div>
    </div>
  );
};

// --- Dashboard Helper Components ---

const StatCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
    <div className="space-y-4">
      {[
        { medicine: 'Insulin (100 IU)', status: 'Low Stock', time: '2 mins ago', color: 'orange' },
        { medicine: 'Levothyroxine 50mcg', status: 'Out of Stock', time: '15 mins ago', color: 'red' },
        { medicine: 'Metformin 500mg', status: 'Restocked', time: '1 hour ago', color: 'green' },
        { medicine: 'Amlodipine 5mg', status: 'Low Stock', time: '3 hours ago', color: 'orange' },
      ].map((item, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{item.medicine}</p>
            <p className="text-sm text-gray-600">{item.time}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.color === 'green' ? 'bg-green-100 text-green-800' :
            item.color === 'orange' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ShortageAlerts = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shortage Alerts in Your Area</h3>
    <div className="space-y-4">
      {[
        { medicine: 'Insulin (Regular)', location: 'Central Delhi', severity: 'Critical', distance: '2.3 km' },
        { medicine: 'Thyroid Medications', location: 'South Delhi', severity: 'High', distance: '4.1 km' },
        { medicine: 'Blood Pressure Meds', location: 'East Delhi', severity: 'Medium', distance: '6.8 km' },
      ].map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{item.medicine}</p>
            <p className="text-sm text-gray-600">{item.location} • {item.distance}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.severity === 'Critical' ? 'bg-red-100 text-red-800' :
            item.severity === 'High' ? 'bg-orange-100 text-orange-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {item.severity}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const CriticalAlerts = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Alerts</h3>
    <div className="space-y-4">
      {[
        { type: 'Shortage', medicine: 'Insulin', districts: 'Delhi, Mumbai, Bangalore', priority: 'Critical' },
        { type: 'Price Surge', medicine: 'Levothyroxine', districts: 'Chennai, Kolkata', priority: 'High' },
        { type: 'Black Market', medicine: 'Metformin', districts: 'Hyderabad, Pune', priority: 'High' },
      ].map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <p className="font-medium text-red-900">{item.type}: {item.medicine}</p>
            <p className="text-sm text-red-700">{item.districts}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {item.priority}
            </span>
            <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700">
              Take Action
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
