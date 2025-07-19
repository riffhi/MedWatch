import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Search, X, Package, PackageCheck, PackageX, Calendar, AlertTriangle } from 'lucide-react';
import { databases } from '../lib/appwrite'; // adjust path if needed

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const MEDICINE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MEDICINE_COLLECTION_ID;

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await databases.listDocuments(DB_ID, MEDICINE_COLLECTION_ID);
      setInventory(res.documents);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
      setError('Failed to load medicine inventory. Please check your database configuration.');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { 
      text: 'Out of Stock', 
      color: 'text-red-400', 
      bgColor: 'bg-red-500/10', 
      icon: <PackageX className="w-4 h-4" /> 
    };
    if (stock <= 10) return { 
      text: 'Low Stock', 
      color: 'text-orange-400', 
      bgColor: 'bg-orange-500/10', 
      icon: <AlertTriangle className="w-4 h-4" /> 
    };
    return { 
      text: 'In Stock', 
      color: 'text-green-400', 
      bgColor: 'bg-green-500/10', 
      icon: <PackageCheck className="w-4 h-4" /> 
    };
  };

  const handleCreate = async (newItem) => {
    try {
      const medicineData = {
        name: newItem.name,
        stock: parseInt(newItem.stock, 10),
        category: newItem.category || 'General',
        expiryDate: newItem.expiryDate || null,
        batchNumber: newItem.batchNumber || null,
        manufacturer: newItem.manufacturer || null,
        price: parseFloat(newItem.price) || 0,
        description: newItem.description || null,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const res = await databases.createDocument(DB_ID, MEDICINE_COLLECTION_ID, 'unique()', medicineData);
      setInventory([res, ...inventory]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to add medicine:', err);
      setError('Failed to add medicine. Please try again.');
    }
  };

  const handleUpdate = async (updatedItem) => {
    try {
      const medicineData = {
        medicineName: updatedItem.name,
        currentStock: parseInt(updatedItem.stock, 10),
        disease: updatedItem.category || 'General',
        company: updatedItem.company || '',
        currentPrice: parseFloat(updatedItem.price) || 0,
      };

      const res = await databases.updateDocument(DB_ID, MEDICINE_COLLECTION_ID, updatedItem.$id, medicineData);
      setInventory(inventory.map(item => item.$id === updatedItem.$id ? res : item));
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update medicine:', err);
      setError('Failed to update medicine. Please try again.');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await databases.deleteDocument(DB_ID, MEDICINE_COLLECTION_ID, itemId);
      setInventory(inventory.filter(item => item.$id !== itemId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete medicine:', err);
      setError('Failed to delete medicine. Please try again.');
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.disease?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-white">Loading inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Medicine Inventory</h2>
          <p className="text-gray-400">Track, update, and manage your medicine stock and records.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-300 hover:text-red-100 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-white">{inventory.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <PackageX className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-sm text-gray-400">Out of Stock</p>
              <p className="text-2xl font-bold text-white">{inventory.filter(item => item.currentStock === 0).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-sm text-gray-400">Low Stock</p>
              <p className="text-2xl font-bold text-white">{inventory.filter(item => item.currentStock > 0 && item.currentStock <= 10).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Expiring Soon</p>
              <p className="text-2xl font-bold text-white">{inventory.filter(item => isExpiringSoon(item.expiryDate)).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicines by name, category, or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
          />
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-sm font-semibold text-gray-300">Medicine Details</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Stock</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Expiry</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Price</th>
                <th className="p-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    {inventory.length === 0 ? 'No medicines in inventory' : 'No medicines match your search'}
                  </td>
                </tr>
              ) : (
                [
  {
    $id: '1',
    name: 'Paracetamol',
    stock: 30,
    category: 'Fever',
    manufacturer: 'MediLife',
    batchNumber: 'B123',
    expiryDate: '2025-12-31',
    price: 20,
  },
  {
    $id: '2',
    name: 'Ibuprofen',
    stock: 5,
    category: 'Pain Relief',
    manufacturer: 'PharmaPlus',
    batchNumber: 'I456',
    expiryDate: '2024-08-10',
    price: 35.5,
  },
  {
    $id: '3',
    name: 'Cetirizine',
    stock: 0,
    category: 'Allergy',
    manufacturer: 'AllergyCare',
    batchNumber: 'C789',
    expiryDate: '2023-09-01',
    price: 15,
  }
].map(item => {
                  const status = getStockStatus(item.stock);
                  return (
                    <tr key={item.$id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-white text-lg">{item.name}</div>
                          <div className="text-sm text-gray-400">
                            {item.category && <span className="inline-block bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs mr-2">{item.category}</span>}
                            {item.manufacturer && <span>by {item.manufacturer}</span>}
                          </div>
                          {item.batchNumber && <div className="text-xs text-gray-500 mt-1">Batch: {item.batchNumber}</div>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-bold text-xl">{item.stock}</span>
                        <span className="text-gray-400 text-sm ml-1">units</span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-2 text-sm font-medium ${status.color} ${status.bgColor} px-3 py-1 rounded-full w-fit`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {item.expiryDate ? (
                            <span className={`${isExpired(item.expiryDate) ? 'text-red-400' : isExpiringSoon(item.expiryDate) ? 'text-yellow-400' : 'text-gray-300'}`}>
                              {formatDate(item.expiryDate)}
                              {isExpired(item.expiryDate) && <span className="block text-xs text-red-400">Expired</span>}
                              {isExpiringSoon(item.expiryDate) && !isExpired(item.expiryDate) && <span className="block text-xs text-yellow-400">Expiring Soon</span>}
                            </span>
                          ) : (
                            <span className="text-gray-500">No expiry</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">
                          {item.price ? `₹${item.price.toFixed(2)}` : 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingItem(item)} 
                            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                            title="Edit medicine"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(item)} 
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete medicine"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateEditModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreate} 
        />
      )}
      {editingItem && (
        <CreateEditModal 
          item={editingItem} 
          onClose={() => setEditingItem(null)} 
          onSave={handleUpdate} 
        />
      )}
      {showDeleteConfirm && (
        <DeleteConfirmModal 
          item={showDeleteConfirm} 
          onClose={() => setShowDeleteConfirm(null)} 
          onDelete={handleDelete} 
        />
      )}
    </div>
  );
};

// Enhanced Modal for Creating and Editing Items
const CreateEditModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.medicineName || '',
    stock: item?.currentStock || 0,
    category: item?.disease || '',
    company: item?.company || '',
    price: item?.currentPrice || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...item, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in overflow-y-auto p-4">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {item ? 'Update Medicine' : 'Add New Medicine'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Medicine Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter medicine name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Disease/Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Fever, Pain Relief"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company/Manufacturer
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Manufacturer name"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-white/10 text-white py-3 px-4 rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              {item ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for Deletion Confirmation
const DeleteConfirmModal = ({ item, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-red-500/30 p-6 rounded-2xl shadow-xl max-w-md w-full m-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-full">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
        </div>
        
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-bold text-red-400">{item.medicineName}</span> from the inventory? 
          This action cannot be undone and will permanently remove all associated data.
        </p>
        
        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 bg-white/10 text-white py-3 px-4 rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onDelete(item.$id)} 
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all"
          >
            Delete Medicine
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;