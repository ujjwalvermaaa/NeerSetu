import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StatsCard from '../components/StatsCard';
import { MapIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const MapView = () => {
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVillageData();
  }, []);

  const fetchVillageData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock village data
      const mockVillages = [
        {
          id: '1',
          name: 'Village A',
          lat: 26.1445,
          lng: 91.7362,
          riskIndex: 420,
          population: 1250,
          healthReports: 45,
          waterReports: 23,
          lastUpdate: '2025-01-11T10:30:00Z',
          status: 'critical'
        },
        {
          id: '2',
          name: 'Village B',
          lat: 26.1545,
          lng: 91.7462,
          riskIndex: 380,
          population: 980,
          healthReports: 32,
          waterReports: 18,
          lastUpdate: '2025-01-11T09:15:00Z',
          status: 'high'
        },
        {
          id: '3',
          name: 'Village C',
          lat: 26.1345,
          lng: 91.7262,
          riskIndex: 350,
          population: 1100,
          healthReports: 28,
          waterReports: 15,
          lastUpdate: '2025-01-11T08:45:00Z',
          status: 'high'
        },
        {
          id: '4',
          name: 'Village D',
          lat: 26.1645,
          lng: 91.7562,
          riskIndex: 180,
          population: 850,
          healthReports: 15,
          waterReports: 8,
          lastUpdate: '2025-01-10T16:20:00Z',
          status: 'moderate'
        },
        {
          id: '5',
          name: 'Village E',
          lat: 26.1245,
          lng: 91.7162,
          riskIndex: 120,
          population: 750,
          healthReports: 8,
          waterReports: 5,
          lastUpdate: '2025-01-10T14:10:00Z',
          status: 'low'
        }
      ];

      setVillages(mockVillages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching village data:', error);
      setLoading(false);
    }
  };

  const getRiskColor = (riskIndex) => {
    if (riskIndex >= 400) return 'red';
    if (riskIndex >= 300) return 'orange';
    if (riskIndex >= 200) return 'yellow';
    if (riskIndex >= 100) return 'blue';
    return 'green';
  };

  const getRiskLevel = (riskIndex) => {
    if (riskIndex >= 400) return 'Critical';
    if (riskIndex >= 300) return 'Very High';
    if (riskIndex >= 200) return 'High';
    if (riskIndex >= 100) return 'Moderate';
    return 'Low';
  };

  const getMarkerIcon = (status) => {
    const color = getRiskColor(selectedVillage?.riskIndex || 0);
    return new Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  const getCircleColor = (riskIndex) => {
    if (riskIndex >= 400) return '#ef4444';
    if (riskIndex >= 300) return '#f97316';
    if (riskIndex >= 200) return '#eab308';
    if (riskIndex >= 100) return '#3b82f6';
    return '#22c55e';
  };

  const getCircleRadius = (riskIndex) => {
    return Math.max(500, riskIndex * 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Map View</h1>
        <p className="text-gray-600">Real-time risk monitoring across all villages</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Villages"
          value={villages.length}
          icon={MapIcon}
          color="blue"
        />
        <StatsCard
          title="High Risk"
          value={villages.filter(v => v.riskIndex >= 300).length}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatsCard
          title="Safe Villages"
          value={villages.filter(v => v.riskIndex < 100).length}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatsCard
          title="Avg Risk Index"
          value={Math.round(villages.reduce((sum, v) => sum + v.riskIndex, 0) / villages.length)}
          icon={MapIcon}
          color="indigo"
        />
      </div>

      {/* Map and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Map</h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer
                center={[26.1445, 91.7362]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {villages.map((village) => (
                  <div key={village.id}>
                    <Marker
                      position={[village.lat, village.lng]}
                      icon={getMarkerIcon(village.status)}
                      eventHandlers={{
                        click: () => setSelectedVillage(village)
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-semibold text-gray-900">{village.name}</h4>
                          <p className="text-sm text-gray-600">Risk Index: {village.riskIndex}</p>
                          <p className="text-sm text-gray-600">Population: {village.population}</p>
                          <p className="text-sm text-gray-600">Status: {getRiskLevel(village.riskIndex)}</p>
                        </div>
                      </Popup>
                    </Marker>
                    
                    <Circle
                      center={[village.lat, village.lng]}
                      radius={getCircleRadius(village.riskIndex)}
                      pathOptions={{
                        color: getCircleColor(village.riskIndex),
                        fillColor: getCircleColor(village.riskIndex),
                        fillOpacity: 0.2,
                        weight: 2
                      }}
                    />
                  </div>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Village Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Village Details</h3>
            {selectedVillage ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedVillage.name}</h4>
                  <p className="text-sm text-gray-600">Population: {selectedVillage.population}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Risk Index:</span>
                    <span className={`text-sm font-medium ${
                      selectedVillage.riskIndex >= 300 ? 'text-red-600' : 
                      selectedVillage.riskIndex >= 200 ? 'text-yellow-600' : 
                      selectedVillage.riskIndex >= 100 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {selectedVillage.riskIndex}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${
                      selectedVillage.riskIndex >= 300 ? 'text-red-600' : 
                      selectedVillage.riskIndex >= 200 ? 'text-yellow-600' : 
                      selectedVillage.riskIndex >= 100 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getRiskLevel(selectedVillage.riskIndex)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Health Reports:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedVillage.healthReports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Water Reports:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedVillage.waterReports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Update:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(selectedVillage.lastUpdate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Click on a village marker to view details</p>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Critical (400+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">Very High (300-399)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">High (200-299)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Moderate (100-199)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Low (0-99)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
