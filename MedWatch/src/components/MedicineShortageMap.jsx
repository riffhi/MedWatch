import React, { useState, useEffect } from 'react';
import LeafletMap from './LeafletMap';
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

const MedicineShortageMap = () => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // If Google Maps API key is not available or billing is not enabled, use Leaflet
  if (!googleMapsApiKey) {
    return (
      <LeafletMap />
    );
  }

  // For now, always use Leaflet since Google Maps billing is not enabled
  return <LeafletMap />;
};

export default MedicineShortageMap;