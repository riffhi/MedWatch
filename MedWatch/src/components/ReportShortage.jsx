import React, { useState } from 'react';
import { MapPin, Camera, AlertTriangle, CheckCircle } from 'lucide-react';
import { databases } from '../lib/appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const MEDICINE_ISSUE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MEDICINE_ISSUE_COLLECTION_ID;

const ReportShortage = () => {
  const [formData, setFormData] = useState({
    medicine: '',
    pharmacy: '',
    location: '',
    issue: '',
    price: '',
    description: '',
    contact_information: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reportData = {
        medicineName: formData.medicine,
        pharmacyName: formData.pharmacy,
        location: formData.location,
        issueType: formData.issue,
        price: parseFloat(formData.price) || 0,
        description: formData.description || '',
        contact_information: formData.contact_information || '',
      };

      await databases.createDocument(DB_ID, MEDICINE_ISSUE_COLLECTION_ID, 'unique()', reportData);
      
      setSubmitted(true);
      // Reset form after a few seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          medicine: '', pharmacy: '', location: '', issue: '', 
          price: '', description: '', contact_information: ''
        });
      }, 4000);
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in">
        <div className="bg-slate-900/70 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 text-center max-w-lg w-full">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Report Submitted Successfully!</h3>
          <p className="text-gray-300">
            Thank you for your contribution. Our team will verify the report and take appropriate action.
          </p>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Report ID: #MED-{Date.now().toString().slice(-6)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Report a Medicine Issue</h2>
          <p className="text-gray-400">Help us track availability and pricing problems.</p>
        </div>
        <div className="flex items-center space-x-2 bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/20">
          <AlertTriangle className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300 font-medium">Report Anonymously</span>
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Medicine Name *</label>
              <input
                type="text"
                name="medicine"
                value={formData.medicine}
                onChange={handleChange}
                required
                placeholder="e.g., Insulin, Levothyroxine"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pharmacy Name *</label>
              <input
                type="text"
                name="pharmacy"
                value={formData.pharmacy}
                onChange={handleChange}
                required
                placeholder="Name of the pharmacy"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="District, City, State"
                className="w-full px-3 py-2 pl-10 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
              />
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Issue Type *</label>
              <select
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select issue type</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="overpriced">Overpriced</option>
                <option value="fake-medicine">Suspected Fake Medicine</option>
                <option value="expired">Expired Medicine</option>
                <option value="quality-issue">Quality Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price (if applicable)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="₹ 0.00"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Please provide more details about the issue..."
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contact Information (Optional)</label>
            <input
              type="text"
              name="contact"
              value={formData.contact_information}
              onChange={handleChange}
              placeholder="Phone or email (for follow-up)"
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">This information will be kept confidential.</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-pink-500 transition-all transform hover:scale-105"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <h3 className="text-sm font-medium text-purple-300 mb-2">Important Information</h3>
        <ul className="text-sm text-purple-400 space-y-1 list-disc list-inside">
          <li>All reports are verified before being added to the system.</li>
          <li>Your identity remains anonymous unless you provide contact details.</li>
          <li>False reports may result in account suspension.</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportShortage;
