import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Search, X, Package, PackageCheck, PackageX } from 'lucide-react';
import { databases } from '../lib/appwrite'; // adjust path if needed

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const MEDICINE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MEDICINE_COLLECTION_ID; // set this in your .env

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    async function fetchMedicines() {
      try {
        const res = await databases.listDocuments(DB_ID, MEDICINE_COLLECTION_ID);
        setInventory(res.documents);
      } catch (err) {
        console.error('Failed to fetch medicines:', err);
      }
    }
    fetchMedicines();
  }, []);

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-400', icon: <PackageX className="w-4 h-4" /> };
    if (stock <= 10) return { text: 'Low Stock', color: 'text-orange-400', icon: <Package className="w-4 h-4" /> };
    return { text: 'In Stock', color: 'text-green-400', icon: <PackageCheck className="w-4 h-4" /> };
  };

  const handleCreate = async (newItem) => {
    try {
      const res = await databases.createDocument(DB_ID, MEDICINE_COLLECTION_ID, undefined, {
        name: newItem.name,
        stock: newItem.stock,
        lastUpdated: new Date().toISOString(),
      });
      setInventory([res, ...inventory]);
    } catch (err) {
      console.error('Failed to add medicine:', err);
    }
  };

  const handleUpdate = async (updatedItem) => {
    try {
      const res = await databases.updateDocument(DB_ID, MEDICINE_COLLECTION_ID, updatedItem.$id, {
        name: updatedItem.name,
        stock: updatedItem.stock,
        lastUpdated: new Date().toISOString(),
      });
      setInventory(inventory.map(item => item.$id === updatedItem.$id ? res : item));
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update medicine:', err);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await databases.deleteDocument(DB_ID, MEDICINE_COLLECTION_ID, itemId);
      setInventory(inventory.filter(item => item.$id !== itemId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete medicine:', err);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          <p className="text-gray-400">Track, update, and manage your medicine stock.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
          />
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-sm font-semibold text-gray-300">Medicine</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Stock</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Last Updated</th>
                <th className="p-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.$id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{item.name}</td>
                  <td className="p-4 text-white font-bold text-lg">{item.stock}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-2 text-sm font-medium ${getStockStatus(item.stock).color}`}>
                      {getStockStatus(item.stock).icon}
                      {getStockStatus(item.stock).text}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(item.lastUpdated).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingItem(item)} className="p-2 text-gray-400 hover:text-purple-400 transition-colors"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => setShowDeleteConfirm(item)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateEditModal onClose={() => setShowCreateModal(false)} onSave={handleCreate} />}
      {editingItem && <CreateEditModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleUpdate} />}
      {showDeleteConfirm && <DeleteConfirmModal item={showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} onDelete={handleDelete} />}
    </div>
  );
};

// Modal for Creating and Editing Items
const CreateEditModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item ? item.name : '',
    stock: item ? item.stock : 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...item, ...formData, stock: parseInt(formData.stock, 10) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl max-w-md w-full m-4">
        <h3 className="text-lg font-bold text-white mb-4">{item ? 'Update Medicine' : 'Add New Medicine'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Medicine Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity *</label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-white/10 text-white py-2 px-4 rounded-md hover:bg-white/20 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all">Save</button>
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
      <div className="bg-slate-900/70 backdrop-blur-xl border border-red-500/30 p-6 rounded-2xl shadow-xl max-w-md w-full m-4">
        <h3 className="text-lg font-bold text-white mb-2">Confirm Deletion</h3>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete <span className="font-bold text-red-400">{item.name}</span> from the inventory? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-white/10 text-white py-2 px-4 rounded-md hover:bg-white/20 transition-colors">Cancel</button>
          <button onClick={() => onDelete(item.id)} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
