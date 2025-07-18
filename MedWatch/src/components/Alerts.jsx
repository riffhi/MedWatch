import React, { useState } from 'react';
import { AlertTriangle, Bell, Clock, MapPin, TrendingUp, X } from 'lucide-react';

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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'shortage': return <AlertTriangle className="w-5 h-5" />;
      case 'price': return <TrendingUp className="w-5 h-5" />;
      case 'quality': return <Bell className="w-5 h-5" />;
      case 'supply-chain': return <MapPin className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h2>
          <p className="text-gray-600">Monitor critical medicine shortage alerts</p>
        </div>
        <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
          <Bell className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700 font-medium">
            {alerts.filter(a => a.status === 'active').length} Active Alerts
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-orange-600">
                {alerts.filter(a => a.status === 'active').length}
              </p>
            </div>
            <Bell className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Investigating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => a.status === 'investigating').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.status === 'resolved').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Severity:</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
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
            className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${
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
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{alert.medicine}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                        <span>Assigned to: {alert.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {alert.status === 'active' && (
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'investigating')}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                  >
                    Investigate
                  </button>
                )}
                {alert.status === 'investigating' && (
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'resolved')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Resolve
                  </button>
                )}
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No alerts found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Alerts;
