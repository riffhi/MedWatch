import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, 
  MapPin, 
  Plus, 
  Filter,
  Search,
  Bell,
  TrendingUp,
  Activity
} from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock data for medicine shortages
const medicineShortages = [
  { id: 1, name: 'Insulin', district: 'Mumbai', lat: 19.0760, lng: 72.8777, severity: 'critical', reports: 45, price_increase: 25 },
  { id: 2, name: 'Thyroid medication', district: 'Chennai', lat: 13.0827, lng: 80.2707, severity: 'high', reports: 32, price_increase: 15 },
  { id: 3, name: 'Insulin', district: 'Delhi', lat: 28.6139, lng: 77.2090, severity: 'critical', reports: 58, price_increase: 30 },
  { id: 4, name: 'Blood pressure medication', district: 'Kolkata', lat: 22.5726, lng: 88.3639, severity: 'medium', reports: 22, price_increase: 8 },
  { id: 5, name: 'Insulin', district: 'Bangalore', lat: 12.9716, lng: 77.5946, severity: 'high', reports: 38, price_increase: 20 },
  { id: 6, name: 'Thyroid medication', district: 'Hyderabad', lat: 17.3850, lng: 78.4867, severity: 'medium', reports: 28, price_increase: 12 },
  { id: 7, name: 'Diabetes medication', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714, severity: 'high', reports: 35, price_increase: 18 },
  { id: 8, name: 'Insulin', district: 'Pune', lat: 18.5204, lng: 73.8567, severity: 'critical', reports: 42, price_increase: 28 },
];

const pharmacyLocations = [
  { id: 1, name: 'Apollo Pharmacy', lat: 19.0760, lng: 72.8777, status: 'low_stock', insulin_stock: 2 },
  { id: 2, name: 'MedPlus', lat: 13.0827, lng: 80.2707, status: 'out_of_stock', insulin_stock: 0 },
  { id: 3, name: 'Fortis Pharmacy', lat: 28.6139, lng: 77.2090, status: 'adequate', insulin_stock: 15 },
  { id: 4, name: 'Guardian Pharmacy', lat: 22.5726, lng: 88.3639, status: 'low_stock', insulin_stock: 3 },
];

const LeafletMap = () => {
  const [selectedMedicine, setSelectedMedicine] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPharmacies, setShowPharmacies] = useState(true);
  const [filteredShortages, setFilteredShortages] = useState(medicineShortages);

  // Filter shortages based on selected criteria
  useEffect(() => {
    let filtered = medicineShortages;
    
    if (selectedMedicine !== 'all') {
      filtered = filtered.filter(shortage => shortage.name === selectedMedicine);
    }
    
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(shortage => shortage.severity === selectedSeverity);
    }
    
    setFilteredShortages(filtered);
  }, [selectedMedicine, selectedSeverity]);

  const createCustomIcon = (severity, isPharmacy = false) => {
    const colors = {
      critical: '#DC2626',
      high: '#EA580C',
      medium: '#D97706',
      low: '#65A30D',
      out_of_stock: '#DC2626',
      low_stock: '#EA580C',
      adequate: '#16A34A'
    };

    const color = colors[severity] || '#6B7280';
    const size = isPharmacy ? 25 : 30;
    const symbol = isPharmacy ? '⚕' : '⚠';

    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isPharmacy ? '12px' : '14px'};
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${symbol}</div>`,
      className: 'custom-div-icon',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const uniqueMedicines = [...new Set(medicineShortages.map(item => item.name))];

  return (
    <div className="relative h-screen bg-gray-100">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg z-[1000] p-4 max-w-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-800">Medicine Shortage Monitor</h2>
        </div>
        
        <div className="space-y-3">
          {/* Medicine filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Medicine
            </label>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Medicines</option>
              {uniqueMedicines.map(medicine => (
                <option key={medicine} value={medicine}>{medicine}</option>
              ))}
            </select>
          </div>

          {/* Severity filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Toggle pharmacies */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPharmacies"
              checked={showPharmacies}
              onChange={(e) => setShowPharmacies(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="showPharmacies" className="text-sm text-gray-700">
              Show Pharmacies
            </label>
          </div>

          {/* Report button */}
          <button
            onClick={() => setShowReportForm(true)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Report Shortage
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg z-[1000] p-4 max-w-xs">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Live Statistics</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Reports</span>
            <span className="font-semibold text-red-600">
              {filteredShortages.reduce((sum, item) => sum + item.reports, 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Critical Shortages</span>
            <span className="font-semibold text-red-600">
              {filteredShortages.filter(item => item.severity === 'critical').length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Affected Districts</span>
            <span className="font-semibold text-red-600">
              {new Set(filteredShortages.map(item => item.district)).size}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Price Increase</span>
            <span className="font-semibold text-red-600">
              {Math.round(filteredShortages.reduce((sum, item) => sum + item.price_increase, 0) / filteredShortages.length)}%
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg z-[1000] p-4">
        <h4 className="text-sm font-bold text-gray-800 mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">⚠</div>
            <span className="text-xs text-gray-600">Critical Shortage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs">⚠</div>
            <span className="text-xs text-gray-600">High Shortage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs">⚠</div>
            <span className="text-xs text-gray-600">Medium Shortage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">⚕</div>
            <span className="text-xs text-gray-600">Pharmacy (Adequate)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">⚕</div>
            <span className="text-xs text-gray-600">Pharmacy (Out of Stock)</span>
          </div>
        </div>
      </div>

      {/* Main Map */}
      <MapContainer
        center={[21.1458, 79.0882]}
        zoom={5}
        style={{ height: '100vh', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Shortage markers */}
        {filteredShortages.map((shortage) => (
          <Marker
            key={shortage.id}
            position={[shortage.lat, shortage.lng]}
            icon={createCustomIcon(shortage.severity)}
          >
            <Popup>
              <div className="p-2 min-w-48">
                <h3 className="font-bold text-gray-800">{shortage.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{shortage.district}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Severity:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(shortage.severity)}`}>
                    {shortage.severity}
                  </span>
                </div>
                <p className="text-sm">Reports: {shortage.reports}</p>
                <p className="text-sm">Price Increase: +{shortage.price_increase}%</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pharmacy markers */}
        {showPharmacies && pharmacyLocations.map((pharmacy) => (
          <Marker
            key={`pharmacy-${pharmacy.id}`}
            position={[pharmacy.lat, pharmacy.lng]}
            icon={createCustomIcon(pharmacy.status, true)}
          >
            <Popup>
              <div className="p-2 min-w-48">
                <h3 className="font-bold text-gray-800">{pharmacy.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Pharmacy</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    pharmacy.status === 'adequate' ? 'bg-green-100 text-green-800' :
                    pharmacy.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {pharmacy.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm">Insulin Stock: {pharmacy.insulin_stock} units</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Report Medicine Shortage</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Insulin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="City, District"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option>Critical (Completely unavailable)</option>
                  <option>High (Very limited availability)</option>
                  <option>Medium (Some availability)</option>
                  <option>Low (Slightly low stock)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Increase (%)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., 25"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;