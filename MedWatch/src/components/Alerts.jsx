

import React, { useState } from 'react';
import { AlertTriangle, Bell, Clock, MapPin, X, CheckCircle, Zap } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      type: 'shortage',
      severity: 'critical',
      medicine: 'Insulin (Regular)',
      location: 'Delhi, Mumbai, Bangalore',
      description: 'Critical shortage reported across major cities. Multiple pharmacies out of stock.',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'active',
      assignedTo: 'Dr. Sharma'
    },
    {
      id: '2',
      type: 'price',
      severity: 'high',
      medicine: 'Levothyroxine 50mcg',
      location: 'Chennai, Hyderabad',
      description: 'Price surge detected - 300% increase from normal pricing.',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'investigating',
      assignedTo: 'Team Alpha'
    },
    {
      id: '3',
      type: 'quality',
      severity: 'high',
      medicine: 'Metformin 500mg',
      location: 'Kolkata',
      description: 'Quality concerns reported - suspected counterfeit medicines.',
      timestamp: '2024-01-15T08:45:00Z',
      status: 'investigating'
    },
    {
      id: '4',
      type: 'supply-chain',
      severity: 'medium',
      medicine: 'Amlodipine 5mg',
      location: 'Punjab, Haryana',
      description: 'Supply chain disruption affecting northern states.',
      timestamp: '2024-01-15T07:20:00Z',
      status: 'active'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400';
      case 'high': return 'bg-orange-500/10 text-orange-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400';
      case 'low': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-pink-500/10 text-pink-400';
      case 'investigating': return 'bg-yellow-500/10 text-yellow-400';
      case 'resolved': return 'bg-green-500/10 text-green-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'shortage': return <AlertTriangle className="w-5 h-5" />;
      case 'price': return <Zap className="w-5 h-5" />;
      case 'quality': return <Bell className="w-5 h-5" />;
      case 'supply-chain': return <MapPin className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };
  
  const removeAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filterStatus === 'all' || alert.status === filterStatus;
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    return statusMatch && severityMatch;
  });

  const updateAlertStatus = (id, newStatus) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, status: newStatus } : alert
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Alerts & Notifications</h2>
          <p className="text-gray-400">Monitor critical medicine shortage alerts</p>
        </div>
        <div className="flex items-center space-x-2 bg-pink-500/10 px-3 py-2 rounded-lg border border-pink-500/20">
          <Bell className="w-4 h-4 text-pink-400" />
          <span className="text-sm text-pink-300 font-medium">
            {alerts.filter(a => a.status === 'active').length} Active Alerts
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-400">
                {alerts.filter(a => a.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-pink-400">
                {alerts.filter(a => a.status === 'active').length}
              </p>
            </div>
            <Zap className="w-8 h-8 text-pink-500" />
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Investigating</p>
              <p className="text-2xl font-bold text-yellow-400">
                {alerts.filter(a => a.status === 'investigating').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-400">
                {alerts.filter(a => a.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-300">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-md px-3 py-1 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-300">Severity:</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-md px-3 py-1 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-white/10 border-l-4 ${
              alert.severity === 'critical' ? 'border-l-red-500' :
              alert.severity === 'high' ? 'border-l-orange-500' :
              alert.severity === 'medium' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                  {getTypeIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{alert.medicine}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-3">{alert.description}</p>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{alert.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    {alert.assignedTo && (
                      <div className="flex items-center space-x-1">
                        <span>Assigned to: <span className="font-medium text-gray-300">{alert.assignedTo}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                {alert.status === 'active' && (
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'investigating')}
                    className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-md hover:bg-yellow-500/30 transition-colors"
                  >
                    Investigate
                  </button>
                )}
                {alert.status === 'investigating' && (
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'resolved')}
                    className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-md hover:bg-green-500/30 transition-colors"
                  >
                    Resolve
                  </button>
                )}
                <button onClick={() => removeAlert(alert.id)} className="p-1 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No alerts found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Alerts;