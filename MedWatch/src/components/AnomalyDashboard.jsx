import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Brain, Settings, Activity, Clock, CheckCircle, XCircle, BarChart3, Zap } from 'lucide-react';

const AnomalyDashboard = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [stats, setStats] = useState({
    totalAnomalies: 0,
    criticalAlerts: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    mlAccuracy: 0,
    ruleAccuracy: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  // Simulated real-time data (replace with actual API calls)
  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        // Simulate API call to your anomaly detection backend
        const mockAnomalies = [
          {
            id: '1',
            type: 'price',
            severity: 'critical',
            message: 'CRITICAL: Price manipulation suspected for Insulin (Regular)',
            confidence: 0.95,
            detectionType: 'rule-based',
            timestamp: new Date().toISOString(),
            dataPoint: {
              medicineName: 'Insulin (Regular)',
              location: 'Delhi',
              currentPrice: 450,
              averageMarketPrice: 400
            },
            details: {
              suspiciousPrice: 450,
              pharmaciesWithSamePrice: 5,
              averageMarketPrice: 400
            },
            status: 'active'
          },
          {
            id: '2',
            type: 'shortage',
            severity: 'high',
            message: 'RAPID DECLINE: Metformin stock is depleting quickly',
            confidence: 0.87,
            detectionType: 'ml-based',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            dataPoint: {
              medicineName: 'Metformin 500mg',
              location: 'Mumbai',
              currentStock: 25,
              criticalThreshold: 50
            },
            details: {
              currentDeclineRate: 15,
              normalConsumptionRate: 8,
              projectedStockoutDate: '2024-01-20'
            },
            status: 'investigating'
          },
          {
            id: '3',
            type: 'supply-chain',
            severity: 'medium',
            message: 'SUPPLY DISRUPTION: Delivery of Amlodipine delayed',
            confidence: 0.72,
            detectionType: 'rule-based',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            dataPoint: {
              medicineName: 'Amlodipine 5mg',
              location: 'Chennai',
              supplier: 'PharmaCorp Ltd'
            },
            details: {
              daysSinceLastDelivery: 12,
              averageDeliveryInterval: 7,
              supplier: 'PharmaCorp Ltd'
            },
            status: 'resolved'
          }
        ];

        setAnomalies(mockAnomalies);
        setStats({
          totalAnomalies: mockAnomalies.length,
          criticalAlerts: mockAnomalies.filter(a => a.severity === 'critical').length,
          activeAlerts: mockAnomalies.filter(a => a.status === 'active').length,
          resolvedAlerts: mockAnomalies.filter(a => a.status === 'resolved').length,
          mlAccuracy: 87.5,
          ruleAccuracy: 92.3
        });
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-100';
      case 'high': return 'text-orange-500 bg-orange-100';
      case 'medium': return 'text-yellow-500 bg-yellow-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-500 bg-red-100';
      case 'investigating': return 'text-yellow-500 bg-yellow-100';
      case 'resolved': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getDetectionTypeIcon = (type) => {
    return type === 'ml-based' ? <Brain className="w-4 h-4" /> : <Settings className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Anomaly Detection Dashboard</h1>
          <p className="text-gray-400">Real-time monitoring of medicine shortages and price anomalies</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live Monitoring</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Anomalies" 
          value={stats.totalAnomalies} 
          icon={AlertTriangle} 
          color="red" 
          change="+3 today"
        />
        <StatCard 
          title="Critical Alerts" 
          value={stats.criticalAlerts} 
          icon={TrendingUp} 
          color="orange" 
          change="Requires attention"
        />
        <StatCard 
          title="ML Accuracy" 
          value={`${stats.mlAccuracy}%`} 
          icon={Brain} 
          color="purple" 
          change="+2.1% this week"
        />
        <StatCard 
          title="Rule Accuracy" 
          value={`${stats.ruleAccuracy}%`} 
          icon={Settings} 
          color="blue" 
          change="+1.8% this week"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomalies List */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Anomalies</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Detection Methods:</span>
                <div className="flex items-center space-x-1">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">ML</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Rules</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                <p className="mt-2 text-gray-400">Loading anomalies...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {anomalies.map((anomaly) => (
                  <AnomalyCard 
                    key={anomaly.id} 
                    anomaly={anomaly} 
                    onSelect={() => setSelectedAnomaly(anomaly)}
                    getSeverityColor={getSeverityColor}
                    getStatusColor={getStatusColor}
                    getDetectionTypeIcon={getDetectionTypeIcon}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <StatusItem 
                title="Rule Engine" 
                status="active" 
                icon={Settings}
                details="All 11 rules active"
              />
              <StatusItem 
                title="ML Models" 
                status="active" 
                icon={Brain}
                details="4 models loaded"
              />
              <StatusItem 
                title="Data Processing" 
                status="active" 
                icon={Activity}
                details="Real-time monitoring"
              />
              <StatusItem 
                title="Alert System" 
                status="active" 
                icon={Zap}
                details="Multi-channel enabled"
              />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
            <div className="space-y-4">
              <MetricItem 
                title="Detection Rate" 
                value="94.2%" 
                change="+2.1%" 
                positive={true}
              />
              <MetricItem 
                title="False Positives" 
                value="5.8%" 
                change="-1.2%" 
                positive={true}
              />
              <MetricItem 
                title="Response Time" 
                value="1.2s" 
                change="-0.3s" 
                positive={true}
              />
              <MetricItem 
                title="Data Points" 
                value="2,847" 
                change="+156" 
                positive={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Anomaly Details */}
      {selectedAnomaly && (
        <AnomalyDetails 
          anomaly={selectedAnomaly} 
          onClose={() => setSelectedAnomaly(null)}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    red: 'from-red-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500">{change}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const AnomalyCard = ({ anomaly, onSelect, getSeverityColor, getStatusColor, getDetectionTypeIcon }) => {
  return (
    <div 
      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-purple-500 transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getDetectionTypeIcon(anomaly.detectionType)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
              {anomaly.severity.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(anomaly.status)}`}>
              {anomaly.status}
            </span>
          </div>
          <h3 className="text-white font-semibold mb-1">{anomaly.dataPoint.medicineName}</h3>
          <p className="text-gray-400 text-sm mb-2">{anomaly.message}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{anomaly.dataPoint.location}</span>
            <span>Confidence: {(anomaly.confidence * 100).toFixed(1)}%</span>
            <span>{new Date(anomaly.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusItem = ({ title, status, icon: Icon, details }) => {
  const statusColor = status === 'active' ? 'text-green-400' : 'text-red-400';
  
  return (
    <div className="flex items-center space-x-3">
      <Icon className={`w-5 h-5 ${statusColor}`} />
      <div className="flex-1">
        <p className="text-white font-medium">{title}</p>
        <p className="text-xs text-gray-400">{details}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
    </div>
  );
};

const MetricItem = ({ title, value, change, positive }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-sm">{title}</span>
      <div className="flex items-center space-x-2">
        <span className="text-white font-semibold">{value}</span>
        <span className={`text-xs ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </span>
      </div>
    </div>
  );
};

const AnomalyDetails = ({ anomaly, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Anomaly Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-semibold mb-2">Medicine Information</h3>
            <div className="bg-slate-700/50 rounded p-3">
              <p><span className="text-gray-400">Name:</span> {anomaly.dataPoint.medicineName}</p>
              <p><span className="text-gray-400">Location:</span> {anomaly.dataPoint.location}</p>
              <p><span className="text-gray-400">Detection Type:</span> {anomaly.detectionType}</p>
              <p><span className="text-gray-400">Confidence:</span> {(anomaly.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">Anomaly Details</h3>
            <div className="bg-slate-700/50 rounded p-3">
              <p><span className="text-gray-400">Type:</span> {anomaly.type}</p>
              <p><span className="text-gray-400">Severity:</span> {anomaly.severity}</p>
              <p><span className="text-gray-400">Status:</span> {anomaly.status}</p>
              <p><span className="text-gray-400">Message:</span> {anomaly.message}</p>
            </div>
          </div>

          {anomaly.details && (
            <div>
              <h3 className="text-white font-semibold mb-2">Technical Details</h3>
              <div className="bg-slate-700/50 rounded p-3">
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(anomaly.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDashboard; 