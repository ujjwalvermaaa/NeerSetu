import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Chart from '../components/Chart';
import StatsCard from '../components/StatsCard';
import {
  CpuChipIcon,
  PlayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Simulator = () => {
  const [, setIsRunning] = useState(false);
  const [simulationData, setSimulationData] = useState({
    villages: [],
    currentRiskIndex: 0,
    predictions: [],
    parameters: {
      rainfall: 50,
      temperature: 25,
      humidity: 60,
      pH: 7.0,
      turbidity: 2.0,
      bacteriaLevel: 50
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeSimulation();
  }, []);

  const initializeSimulation = () => {
    // Mock village data for simulation
    const mockVillages = [
      {
        id: '1',
        name: 'Village A',
        lat: 26.1445,
        lng: 91.7362,
        baseRiskIndex: 120,
        currentRiskIndex: 120,
        population: 1250
      },
      {
        id: '2',
        name: 'Village B',
        lat: 26.1545,
        lng: 91.7462,
        baseRiskIndex: 100,
        currentRiskIndex: 100,
        population: 980
      },
      {
        id: '3',
        name: 'Village C',
        lat: 26.1345,
        lng: 91.7262,
        baseRiskIndex: 80,
        currentRiskIndex: 80,
        population: 1100
      }
    ];

    setSimulationData(prev => ({
      ...prev,
      villages: mockVillages,
      currentRiskIndex: 100
    }));
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setLoading(true);

    try {
      // Simulate ML prediction based on parameters
      const newRiskIndex = calculateRiskIndex(simulationData.parameters);
      
      // Update villages with new risk indices
      const updatedVillages = simulationData.villages.map(village => ({
        ...village,
        currentRiskIndex: Math.min(500, village.baseRiskIndex + (newRiskIndex - 100) * 2)
      }));

      // Add prediction to history
      const newPrediction = {
        timestamp: new Date(),
        riskIndex: newRiskIndex,
        parameters: { ...simulationData.parameters }
      };

      setSimulationData(prev => ({
        ...prev,
        villages: updatedVillages,
        currentRiskIndex: newRiskIndex,
        predictions: [...prev.predictions.slice(-9), newPrediction] // Keep last 10 predictions
      }));

      setLoading(false);
    } catch (error) {
      console.error('Simulation error:', error);
      setLoading(false);
    }
  };

  const calculateRiskIndex = (params) => {
    let riskIndex = 0;
    
    // pH factor (optimal: 6.5-8.5)
    if (params.pH < 6.5 || params.pH > 8.5) {
      riskIndex += 50;
    }
    
    // Turbidity factor (optimal: < 1 NTU)
    riskIndex += Math.min(params.turbidity * 10, 100);
    
    // Bacteria factor (optimal: < 100 CFU/ml)
    riskIndex += Math.min(params.bacteriaLevel / 2, 100);
    
    // Rainfall factor
    riskIndex += Math.min(params.rainfall / 5, 50);
    
    // Temperature factor (optimal: 20-30°C)
    if (params.temperature < 20 || params.temperature > 30) {
      riskIndex += 30;
    }
    
    // Humidity factor (optimal: 40-70%)
    if (params.humidity < 40 || params.humidity > 70) {
      riskIndex += 20;
    }
    
    return Math.min(Math.max(riskIndex, 0), 500);
  };

  const handleParameterChange = (param, value) => {
    setSimulationData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [param]: parseFloat(value)
      }
    }));
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setLoading(false);
    initializeSimulation();
    setSimulationData(prev => ({
      ...prev,
      predictions: []
    }));
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

  const getMarkerIcon = (riskIndex) => {
    const color = getRiskColor(riskIndex);
    return new Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  // Chart data for predictions
  const predictionData = {
    labels: simulationData.predictions.map((p, index) => `Step ${index + 1}`),
    datasets: [
      {
        label: 'Risk Index',
        data: simulationData.predictions.map(p => p.riskIndex),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outbreak Simulator</h1>
          <p className="text-gray-600">Test different scenarios and predict outbreak risks</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={runSimulation}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Running...' : 'Run Simulation'}
          </button>
          
          <button
            onClick={resetSimulation}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Current Risk Index */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Current Risk Index"
          value={simulationData.currentRiskIndex}
          icon={ExclamationTriangleIcon}
          color={getRiskColor(simulationData.currentRiskIndex)}
          subtitle={getRiskLevel(simulationData.currentRiskIndex)}
        />
        <StatsCard
          title="Simulation Steps"
          value={simulationData.predictions.length}
          icon={CpuChipIcon}
          color="blue"
          subtitle="Completed runs"
        />
        <StatsCard
          title="High Risk Villages"
          value={simulationData.villages.filter(v => v.currentRiskIndex >= 300).length}
          icon={ExclamationTriangleIcon}
          color="red"
          subtitle="Requiring attention"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parameters Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Parameters</h3>
          
          <div className="space-y-6">
            {/* Environmental Factors */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Environmental Factors</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Rainfall (mm)</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={simulationData.parameters.rainfall}
                    onChange={(e) => handleParameterChange('rainfall', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span className="font-medium">{simulationData.parameters.rainfall}mm</span>
                    <span>200</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Temperature (°C)</label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={simulationData.parameters.temperature}
                    onChange={(e) => handleParameterChange('temperature', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10°C</span>
                    <span className="font-medium">{simulationData.parameters.temperature}°C</span>
                    <span>40°C</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Humidity (%)</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={simulationData.parameters.humidity}
                    onChange={(e) => handleParameterChange('humidity', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20%</span>
                    <span className="font-medium">{simulationData.parameters.humidity}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Water Quality Factors */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Water Quality Factors</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">pH Level</label>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    step="0.1"
                    value={simulationData.parameters.pH}
                    onChange={(e) => handleParameterChange('pH', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>4.0</span>
                    <span className="font-medium">{simulationData.parameters.pH}</span>
                    <span>10.0</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Turbidity (NTU)</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.1"
                    value={simulationData.parameters.turbidity}
                    onChange={(e) => handleParameterChange('turbidity', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span className="font-medium">{simulationData.parameters.turbidity} NTU</span>
                    <span>20</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Bacteria Level (CFU/ml)</label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={simulationData.parameters.bacteriaLevel}
                    onChange={(e) => handleParameterChange('bacteriaLevel', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span className="font-medium">{simulationData.parameters.bacteriaLevel} CFU/ml</span>
                    <span>500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Village Risk Map</h3>
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
              
              {simulationData.villages.map((village) => (
                <div key={village.id}>
                  <Marker
                    position={[village.lat, village.lng]}
                    icon={getMarkerIcon(village.currentRiskIndex)}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold text-gray-900">{village.name}</h4>
                        <p className="text-sm text-gray-600">Risk Index: {village.currentRiskIndex}</p>
                        <p className="text-sm text-gray-600">Population: {village.population}</p>
                        <p className="text-sm text-gray-600">Status: {getRiskLevel(village.currentRiskIndex)}</p>
                      </div>
                    </Popup>
                  </Marker>
                  
                  <Circle
                    center={[village.lat, village.lng]}
                    radius={Math.max(200, village.currentRiskIndex * 2)}
                    pathOptions={{
                      color: getRiskColor(village.currentRiskIndex),
                      fillColor: getRiskColor(village.currentRiskIndex),
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

      {/* Predictions Chart */}
      {simulationData.predictions.length > 0 && (
        <Chart
          type="line"
          data={predictionData}
          title="Simulation Results"
          options={{
            plugins: {
              legend: {
                display: false
              }
            }
          }}
        />
      )}

      {/* Village Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Village Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {simulationData.villages.map((village) => (
            <div key={village.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{village.name}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  village.currentRiskIndex >= 400 ? 'bg-red-100 text-red-800' :
                  village.currentRiskIndex >= 300 ? 'bg-orange-100 text-orange-800' :
                  village.currentRiskIndex >= 200 ? 'bg-yellow-100 text-yellow-800' :
                  village.currentRiskIndex >= 100 ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {getRiskLevel(village.currentRiskIndex)}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Risk Index: {village.currentRiskIndex}</div>
                <div>Population: {village.population}</div>
                <div>Base Risk: {village.baseRiskIndex}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Simulator;
