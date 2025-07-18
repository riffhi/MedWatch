import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, AlertTriangle, Package } from 'lucide-react';

const InventoryManagement = () => {
  const [medicines, setMedicines] = useState([
    { id: '1', name: 'Insulin (100 IU)', category: 'Diabetes', currentStock: 15, minStock: 20, price: 450, lastUpdated: '2024-01-15', status: 'low-stock' },
    { id: '2', name: 'Levothyroxine 50mcg', category: 'Thyroid', currentStock: 0, minStock: 10, price: 120, lastUpdated: '2024-01-14', status: 'out-of-stock' },
    { id: '3', name: 'Metformin 500mg', category: 'Diabetes', currentStock: 250, minStock: 50, price: 80, lastUpdated: '2024-01-15', status: 'in-stock' },
    { id: '4', name: 'Amlodipine 5mg', category: 'Hypertension', currentStock: 30, minStock: 25, price: 95, lastUpdated: '2024-01-13', status: 'in-stock' },
    { id: '5', name: 'Atorvastatin 20mg', category: 'Cholesterol', currentStock: 8, minStock: 15, price: 200, lastUpdated: '2024-01-15', status: 'low-stock' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in-stock': return <Package className="w-4 h-4 text-green-600" />;
      case 'low-stock': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'out-of-stock': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleUpdateStock = (id, newStock) => {
    setMedicines(medicines.map(medicine => {
      if (medicine.id === id) {
        const status = newStock === 0 ? 'out-of-stock' : newStock <= medicine.minStock ? 'low-stock' : 'in-stock';
        return { ...medicine, currentStock: newStock, status, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return medicine;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Manage your medicine stock and pricing</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Medicines', value: medicines.length, color: 'text-blue-600', icon: <Package className="w-8 h-8 text-blue-600" /> },
          { label: 'In Stock', value: medicines.filter(m => m.status === 'in-stock').length, color: 'text-green-600', icon: <Package className="w-8 h-8 text-green-600" /> },
          { label: 'Low Stock', value: medicines.filter(m => m.status === 'low-stock').length, color: 'text-yellow-600', icon: <AlertTriangle className="w-8 h-8 text-yellow-600" /> },
          { label: 'Out of Stock', value: medicines.filter(m => m.status === 'out-of-stock').length, color: 'text-red-600', icon: <Trash2 className="w-8 h-8 text-red-600" /> },
        ].map((card, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Medicine', 'Category', 'Stock', 'Price', 'Status', 'Updated', 'Actions'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(medicine.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{medicine.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={medicine.currentStock}
                        onChange={(e) => handleUpdateStock(medicine.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="0"
                      />
                      <span className="text-xs text-gray-500">/ {medicine.minStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">₹{medicine.price}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(medicine.status)}`}>
                      {medicine.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{medicine.lastUpdated}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setEditingMedicine(medicine)} className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-sm font-medium text-yellow-800">Low Stock Alerts</h3>
        </div>
        <div className="space-y-2">
          {medicines.filter(m => m.status === 'low-stock' || m.status === 'out-of-stock').map((medicine) => (
            <div key={medicine.id} className="flex items-center justify-between text-sm">
              <span className="text-yellow-800">{medicine.name}</span>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(medicine.status)}`}>
                {medicine.currentStock} units remaining
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
