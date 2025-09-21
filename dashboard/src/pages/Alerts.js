import React, { useState, useEffect, useCallback } from 'react';
import AlertCard from '../components/AlertCard';
import StatsCard from '../components/StatsCard';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    village: 'all'
  });

  const fetchAlerts = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock alerts data
      const mockAlerts = [
        {
          id: '1',
          type: 'emergency',
          title: 'Critical Water Contamination',
          message: 'High levels of bacterial contamination detected in Village A water sources. Immediate action required.',
          village: 'Village A',
          riskIndex: 420,
          status: 'sent',
          priority: 'critical',
          createdAt: '2025-01-11T10:30:00Z',
          escalationLevel: 1,
          acknowledgedBy: null,
          acknowledgedAt: null
        },
        {
          id: '2',
          type: 'risk_update',
          title: 'Risk Level Escalation',
          message: 'Risk level has escalated to HIGH in Village B due to heavy rainfall and increased turbidity.',
          village: 'Village B',
          riskIndex: 380,
          status: 'acknowledged',
          priority: 'high',
          createdAt: '2025-01-11T09:15:00Z',
          escalationLevel: 1,
          acknowledgedBy: 'Health Official',
          acknowledgedAt: '2025-01-11T09:45:00Z'
        },
        {
          id: '3',
          type: 'awareness',
          title: 'Health Awareness Campaign',
          message: 'New health tips and preventive measures are available for community members.',
          village: 'All Villages',
          riskIndex: null,
          status: 'delivered',
          priority: 'low',
          createdAt: '2025-01-11T08:00:00Z',
          escalationLevel: 1,
          acknowledgedBy: null,
          acknowledgedAt: null
        },
        {
          id: '4',
          type: 'emergency',
          title: 'Outbreak Alert',
          message: 'Multiple cases of water-borne illness reported in Village C. Immediate investigation required.',
          village: 'Village C',
          riskIndex: 450,
          status: 'escalated',
          priority: 'critical',
          createdAt: '2025-01-11T07:30:00Z',
          escalationLevel: 2,
          acknowledgedBy: 'Block Health Officer',
          acknowledgedAt: '2025-01-11T08:00:00Z'
        },
        {
          id: '5',
          type: 'risk_update',
          title: 'Water Quality Improvement',
          message: 'Water quality has improved in Village D. Risk level reduced to MODERATE.',
          village: 'Village D',
          riskIndex: 180,
          status: 'resolved',
          priority: 'medium',
          createdAt: '2025-01-10T16:20:00Z',
          escalationLevel: 1,
          acknowledgedBy: 'Health Official',
          acknowledgedAt: '2025-01-10T16:30:00Z'
        },
        {
          id: '6',
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will be performed on the monitoring system tonight from 2-4 AM.',
          village: 'All Villages',
          riskIndex: null,
          status: 'delivered',
          priority: 'low',
          createdAt: '2025-01-10T14:00:00Z',
          escalationLevel: 1,
          acknowledgedBy: null,
          acknowledgedAt: null
        }
      ];

      setAlerts(mockAlerts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = alerts;

    if (filters.status !== 'all') {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(alert => alert.type === filters.type);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(alert => alert.priority === filters.priority);
    }

    if (filters.village !== 'all') {
      filtered = filtered.filter(alert => alert.village === filters.village);
    }

    setFilteredAlerts(filtered);
  }, [alerts, filters]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged',
            acknowledgedBy: 'Current User',
            acknowledgedAt: new Date().toISOString()
          }
        : alert
    ));
  };

  const handleResolveAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' }
        : alert
    ));
  };

  const handleDismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertStats = () => {
    const total = alerts.length;
    const active = alerts.filter(a => ['sent', 'delivered', 'acknowledged', 'escalated'].includes(a.status)).length;
    const critical = alerts.filter(a => a.priority === 'critical').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;

    return { total, active, critical, resolved };
  };

  const stats = getAlertStats();

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
        <h1 className="text-2xl font-bold text-gray-900">Alerts Management</h1>
        <p className="text-gray-600">Monitor and manage all system alerts and notifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Alerts"
          value={stats.total}
          icon={BellIcon}
          color="blue"
        />
        <StatsCard
          title="Active Alerts"
          value={stats.active}
          icon={ExclamationTriangleIcon}
          color="orange"
        />
        <StatsCard
          title="Critical Alerts"
          value={stats.critical}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatsCard
          title="Resolved Alerts"
          value={stats.resolved}
          icon={CheckCircleIcon}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="emergency">Emergency</option>
              <option value="risk_update">Risk Update</option>
              <option value="awareness">Awareness</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
            <select
              value={filters.village}
              onChange={(e) => setFilters(prev => ({ ...prev, village: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Villages</option>
              <option value="Village A">Village A</option>
              <option value="Village B">Village B</option>
              <option value="Village C">Village C</option>
              <option value="Village D">Village D</option>
              <option value="All Villages">All Villages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Alerts ({filteredAlerts.length})
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
        
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more alerts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onDismiss={handleDismissAlert}
              />
            ))}
          </div>
        )}
      </div>

      {/* Alert Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">By Status</h4>
            <div className="space-y-2">
              {['sent', 'delivered', 'acknowledged', 'escalated', 'resolved'].map(status => {
                const count = alerts.filter(a => a.status === status).length;
                return (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-600">{status}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">By Priority</h4>
            <div className="space-y-2">
              {['critical', 'high', 'medium', 'low'].map(priority => {
                const count = alerts.filter(a => a.priority === priority).length;
                return (
                  <div key={priority} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-600">{priority}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
