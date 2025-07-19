import React from 'react';
import { AlertTriangle, TrendingUp, MapPin, Clock, Activity } from 'lucide-react';

const Dashboard = ({ userRole }) => {
  // The content is now determined by the userRole prop passed from App.jsx
  const getDashboardContent = () => {
    switch (userRole) {
      case 'pharmacy':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Medicines" value="247" change="+12 this week" icon={Activity} color="blue" />
              <StatCard title="Low Stock Items" value="18" change="+5 today" icon={AlertTriangle} color="orange" />
              <StatCard title="Out of Stock" value="7" change="-3 from yesterday" icon={TrendingUp} color="red" />
              <StatCard title="Pending Orders" value="12" change="Processing" icon={Clock} color="purple" />
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <RecentActivity />
              </div>
            </div>
          </div>
        );
      case 'patient':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard title="Active Shortages" value="234" change="In your area" icon={AlertTriangle} color="red" />
              <StatCard title="Reports Submitted" value="15" change="This month" icon={TrendingUp} color="blue" />
              <StatCard title="Nearby Pharmacies" value="47" change="With stock" icon={MapPin} color="purple" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ShortageAlerts />
              <NearbyPharmacies />
            </div>
          </div>
        );
      case 'authority':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Critical Alerts" value="23" change="Requires attention" icon={AlertTriangle} color="red" />
              <StatCard title="Districts Affected" value="156" change="Nationwide" icon={MapPin} color="orange" />
              <StatCard title="Price Anomalies" value="89" change="Detected today" icon={TrendingUp} color="purple" />
              <StatCard title="Response Time" value="2.4h" change="Average" icon={Clock} color="blue" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CriticalAlerts />
              <ResponseMetrics />
            </div>
          </div>
        );
      default:
        return <div>Admin Dashboard</div>;
    }
  };

  return (
    <div className="animate-fade-in-up">
      {getDashboardContent()}
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    red: 'from-red-500 to-pink-500',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
      <div>
        <p className="text-gray-300 text-sm font-medium">{title}</p>
        <p className="text-gray-400 text-xs mt-1">{change}</p>
      </div>
    </div>
  );
};

const RecentActivity = () => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
    <div className="space-y-4">
      {[
        { medicine: 'Insulin (100 IU)', status: 'Low Stock', time: '2 mins ago', severity: 'high' },
        { medicine: 'Levothyroxine 50mcg', status: 'Out of Stock', time: '15 mins ago', severity: 'critical' },
        { medicine: 'Metformin 500mg', status: 'Restocked', time: '1 hour ago', severity: 'normal' },
        { medicine: 'Amlodipine 5mg', status: 'Low Stock', time: '3 hours ago', severity: 'medium' },
      ].map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              item.severity === 'critical' ? 'bg-red-500' :
              item.severity === 'high' ? 'bg-orange-500' :
              item.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <div>
              <p className="text-white font-medium">{item.medicine}</p>
              <p className="text-gray-400 text-sm">{item.time}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            item.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
            item.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
            'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);


const ShortageAlerts = () => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-6">Shortage Alerts</h3>
    <div className="space-y-4">
      {[
        { medicine: 'Insulin (Regular)', location: 'Central Delhi', severity: 'Critical', distance: '2.3 km' },
        { medicine: 'Thyroid Medications', location: 'South Mumbai', severity: 'High', distance: '4.1 km' },
        { medicine: 'Blood Pressure Meds', location: 'Navi Mumbai', severity: 'Medium', distance: '6.8 km' },
      ].map((item, index) => (
        <div key={index} className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{item.medicine}</p>
              <p className="text-gray-400 text-sm">{item.location} • {item.distance}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.severity === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              item.severity === 'High' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
              'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            }`}>
              {item.severity}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NearbyPharmacies = () => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-6">Nearby Pharmacies</h3>
    <div className="space-y-4">
      {[
        { name: 'Apollo Pharmacy', distance: '0.5 km', stock: 'High', rating: 4.8 },
        { name: 'MedPlus', distance: '1.2 km', stock: 'Medium', rating: 4.5 },
        { name: 'Guardian Pharmacy', distance: '2.1 km', stock: 'Low', rating: 4.2 },
      ].map((item, index) => (
        <div key={index} className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{item.name}</p>
              <p className="text-gray-400 text-sm">{item.distance} • ⭐ {item.rating}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.stock === 'High' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              item.stock === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
              'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {item.stock} Stock
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CriticalAlerts = () => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-6">Critical Alerts</h3>
    <div className="space-y-4">
      {[
        { type: 'Shortage', medicine: 'Insulin', districts: 'Mumbai, Pune, Nagpur', priority: 'Critical' },
        { type: 'Price Surge', medicine: 'Levothyroxine', districts: 'Chennai, Kolkata', priority: 'High' },
        { type: 'Black Market', medicine: 'Metformin', districts: 'Hyderabad, Delhi', priority: 'High' },
      ].map((item, index) => (
        <div key={index} className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 font-medium">{item.type}: {item.medicine}</p>
              <p className="text-red-400 text-sm">{item.districts}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.priority === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 
                'bg-orange-500/20 text-orange-300 border border-orange-500/30'
              }`}>
                {item.priority}
              </span>
              <button className="px-3 py-1 bg-red-500/20 backdrop-blur-sm text-red-300 text-xs rounded-md hover:bg-red-500/30 transition-all border border-red-500/30">
                Action
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ResponseMetrics = () => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-6">Response Metrics</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-3xl font-bold text-purple-400">95%</p>
        <p className="text-gray-400 text-sm">Resolution Rate</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-400">2.4h</p>
        <p className="text-gray-400 text-sm">Avg Response</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-green-400">847</p>
        <p className="text-gray-400 text-sm">Cases Resolved</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-orange-400">23</p>
        <p className="text-gray-400 text-sm">Pending</p>
      </div>
    </div>
  </div>
);

export default Dashboard;