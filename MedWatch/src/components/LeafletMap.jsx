

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, 
  MapPin, 
  Plus, 
  ChevronDown,
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

// --- Mock Data ---
const medicineShortages = [
  { id: 1, name: 'Insulin', district: 'Mumbai', lat: 19.0760, lng: 72.8777, severity: 'critical', reports: 45, price_increase: 25 },
  { id: 2, name: 'Thyroid Medication', district: 'Chennai', lat: 13.0827, lng: 80.2707, severity: 'high', reports: 32, price_increase: 15 },
  { id: 3, name: 'Insulin', district: 'Delhi', lat: 28.6139, lng: 77.2090, severity: 'critical', reports: 58, price_increase: 30 },
  { id: 4, name: 'Blood Pressure Meds', district: 'Kolkata', lat: 22.5726, lng: 88.3639, severity: 'medium', reports: 22, price_increase: 8 },
  { id: 5, name: 'Insulin', district: 'Bengaluru', lat: 12.9716, lng: 77.5946, severity: 'high', reports: 38, price_increase: 20 },
  { id: 6, name: 'Thyroid Medication', district: 'Hyderabad', lat: 17.3850, lng: 78.4867, severity: 'medium', reports: 28, price_increase: 12 },
  { id: 7, name: 'Diabetes Medication', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714, severity: 'high', reports: 35, price_increase: 18 },
  { id: 8, name: 'Insulin', district: 'Pune', lat: 18.5204, lng: 73.8567, severity: 'critical', reports: 42, price_increase: 28 },
];

const pharmacyLocations = [
  { id: 1, name: 'Apollo Pharmacy', lat: 19.0790, lng: 72.8797, status: 'low_stock', insulin_stock: 2 },
  { id: 2, name: 'MedPlus', lat: 13.0857, lng: 80.2737, status: 'out_of_stock', insulin_stock: 0 },
  { id: 3, name: 'Fortis Pharmacy', lat: 28.6169, lng: 77.2120, status: 'adequate', insulin_stock: 15 },
  { id: 4, name: 'Guardian Pharmacy', lat: 22.5756, lng: 88.3669, status: 'low_stock', insulin_stock: 3 },
];

// Custom Dropdown Component
const CustomDropdown = ({ options, selectedValue, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || placeholder;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2 bg-white/5 border border-white/20 rounded-md text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
                <span className={selectedValue ? 'text-white' : 'text-gray-400'}>{selectedLabel}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-white/20 rounded-md shadow-lg py-1 animate-fade-in-up max-h-60 overflow-auto">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => {
                                onSelect(option.value);
                                setIsOpen(false);
                            }}
                            className="px-3 py-2 text-sm text-gray-200 hover:bg-purple-600/50 cursor-pointer"
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


const MedicineShortageMap = () => {
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
      critical: '#ef4444', 
      high: '#f97316',     
      medium: '#f59e0b',   
      low: '#84cc16',      
      out_of_stock: '#ef4444',
      low_stock: '#f97316',
      adequate: '#22c55e', 
    };

    const color = colors[severity] || '#6b7280';
    const size = isPharmacy ? 28 : 35;
    const symbol = isPharmacy ? '⚕️' : '⚠️';

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.7); display: flex; align-items: center; justify-content: center; font-size: ${isPharmacy ? '14px' : '18px'}; box-shadow: 0 4px 10px rgba(0,0,0,0.5); text-shadow: 0 0 2px black;">${symbol}</div>`,
      className: 'custom-div-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-300 border border-red-500/30',
      high: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      low: 'bg-green-500/20 text-green-300 border border-green-500/30',
    };
    return colors[severity] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
  };

  const uniqueMedicines = [{ value: 'all', label: 'All Medicines' }, ...[...new Set(medicineShortages.map(item => item.name))].map(name => ({ value: name, label: name }))];
  const severityOptions = [
      { value: 'all', label: 'All Severities' },
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
  ];
  const modalSeverityOptions = [
      { value: 'critical', label: 'Critical (Completely unavailable)' },
      { value: 'high', label: 'High (Very limited availability)' },
      { value: 'medium', label: 'Medium (Some availability)' },
      { value: 'low', label: 'Low (Slightly low stock)' },
  ];


  const totalReports = filteredShortages.reduce((sum, item) => sum + item.reports, 0);
  const avgPriceIncrease = totalReports > 0 ? Math.round(filteredShortages.reduce((sum, item) => sum + item.price_increase * item.reports, 0) / totalReports) : 0;


  return (
    <div className="relative h-[calc(100vh-7rem)] animate-fade-in-up">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl z-[1000] p-4 max-w-sm w-full shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-6 h-6 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Live Shortage Map</h2>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Filter by Medicine</label>
            <CustomDropdown
                options={uniqueMedicines}
                selectedValue={selectedMedicine}
                onSelect={setSelectedMedicine}
                placeholder="All Medicines"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Filter by Severity</label>
            <CustomDropdown
                options={severityOptions}
                selectedValue={selectedSeverity}
                onSelect={setSelectedSeverity}
                placeholder="All Severities"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="showPharmacies"
              checked={showPharmacies}
              onChange={(e) => setShowPharmacies(e.target.checked)}
              className="h-4 w-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="showPharmacies" className="text-sm text-gray-300">Show Pharmacies</label>
          </div>

          <button
            onClick={() => setShowReportForm(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Report Shortage
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl z-[1000] p-4 max-w-xs w-full shadow-lg">
        <h3 className="text-lg font-bold text-white mb-3">Live Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 flex items-center gap-2"><Bell className="w-4 h-4"/>Total Reports</span>
            <span className="font-semibold text-purple-300">{totalReports}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>Critical Shortages</span>
            <span className="font-semibold text-purple-300">{filteredShortages.filter(item => item.severity === 'critical').length}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4"/>Affected Districts</span>
            <span className="font-semibold text-purple-300">{new Set(filteredShortages.map(item => item.district)).size}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 flex items-center gap-2"><TrendingUp className="w-4 h-4"/>Avg. Price Rise</span>
            <span className="font-semibold text-purple-300">{avgPriceIncrease}%</span>
          </div>
        </div>
      </div>

      {/* Main Map */}
      <MapContainer
        center={[21.1458, 79.0882]} // Centered on India
        zoom={5}
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        
        {filteredShortages.map((shortage) => (
          <Marker key={shortage.id} position={[shortage.lat, shortage.lng]} icon={createCustomIcon(shortage.severity)}>
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px] text-gray-800">
                <h3 className="font-bold text-md mb-1">{shortage.name}</h3>
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-1"><MapPin size={12}/>{shortage.district}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(shortage.severity).replace('border', '')}`}>{shortage.severity}</span>
                </div>
                <p className="text-xs text-gray-500">Reports: {shortage.reports}</p>
                <p className="text-xs text-gray-500">Price Increase: +{shortage.price_increase}%</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {showPharmacies && pharmacyLocations.map((pharmacy) => (
          <Marker key={`pharmacy-${pharmacy.id}`} position={[pharmacy.lat, pharmacy.lng]} icon={createCustomIcon(pharmacy.status, true)}>
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px] text-gray-800">
                <h3 className="font-bold text-md mb-1">{pharmacy.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Pharmacy</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    pharmacy.status === 'adequate' ? 'bg-green-100 text-green-800' :
                    pharmacy.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {pharmacy.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Insulin Stock: {pharmacy.insulin_stock} units</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] animate-fade-in">
          <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl max-w-md w-full m-4">
            <h3 className="text-lg font-bold text-white mb-4">Report Medicine Shortage</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowReportForm(false); }}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Medicine Name</label>
                <input type="text" className="w-full p-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="e.g., Insulin"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input type="text" className="w-full p-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Navi Mumbai, Maharashtra"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Severity</label>
                <CustomDropdown
                    options={modalSeverityOptions}
                    selectedValue={null}
                    onSelect={(value) => console.log(value)} // Placeholder action
                    placeholder="Select Severity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price Increase (%)</label>
                <input type="number" className="w-full p-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="e.g., 25"/>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowReportForm(false)} className="flex-1 bg-white/10 text-white py-2 px-4 rounded-md hover:bg-white/20 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineShortageMap;