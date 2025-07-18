import React, { useState } from 'react';
import { MapPin, Camera, AlertTriangle, CheckCircle } from 'lucide-react';

const ReportShortage = () => {
  const [formData, setFormData] = useState({
    medicine: '',
    pharmacy: '',
    location: '',
    issue: '',
    price: '',
    description: '',
    contact: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Report submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">Report Submitted Successfully!</h3>
          <p className="text-green-700">Thank you for reporting this shortage. Our team will investigate and take appropriate action.</p>
          <div className="mt-4">
            <p className="text-sm text-green-600">Report ID: #MED-{Date.now().toString().slice(-6)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Medicine Shortage</h2>
          <p className="text-gray-600">Help us track medicine availability and pricing issues</p>
        </div>
        <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-orange-700 font-medium">Report Anonymously</span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name *
              </label>
              <input
                type="text"
                name="medicine"
                value={formData.medicine}
                onChange={handleChange}
                required
                placeholder="e.g., Insulin, Levothyroxine"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pharmacy Name *
              </label>
              <input
                type="text"
                name="pharmacy"
                value={formData.pharmacy}
                onChange={handleChange}
                required
                placeholder="Name of the pharmacy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="District, City, State"
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type *
              </label>
              <select
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (if applicable)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="₹ 0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Please provide more details about the issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information (Optional)
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone number or email (for follow-up)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This information will be kept confidential and used only for verification purposes.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Camera className="w-4 h-4" />
                <span>Add Photo</span>
              </button>
              <span className="text-xs text-gray-500">Optional: Add photo evidence</span>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Important Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All reports are verified before being added to the system</li>
          <li>• Your identity remains anonymous unless you choose to provide contact details</li>
          <li>• False reports may result in account suspension</li>
          <li>• Emergency shortages are prioritized and addressed immediately</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportShortage;
