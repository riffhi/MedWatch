import React from 'react';
import { AlertTriangle, TrendingUp, MapPin, Clock, Activity } from 'lucide-react';

const Dashboard = ({ userRole }) => {
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
        return <div>Admin Dashboard</div>;
    }
  };

  return (
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
  );
};

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

export default Dashboard;

