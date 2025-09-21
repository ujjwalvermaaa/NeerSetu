import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import RiskIndexCard from '../components/RiskIndexCard';
import Chart from '../components/Chart';
import AlertCard from '../components/AlertCard';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHealthReports: 0,
    totalWaterReports: 0,
    activeAlerts: 0,
    highRiskVillages: [],
    recentActivity: { healthReports: [], waterReports: [] },
    riskDistribution: [],
    monthlyTrends: []
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        totalUsers: 1247,
        totalHealthReports: 342,
        totalWaterReports: 156,
        activeAlerts: 8,
        highRiskVillages: [
          { _id: '1', village: 'Village A', latestRiskIndex: 420, latestDate: '2025-01-11' },
          { _id: '2', village: 'Village B', latestRiskIndex: 380, latestDate: '2025-01-11' },
          { _id: '3', village: 'Village C', latestRiskIndex: 350, latestDate: '2025-01-10' }
        ],
        recentActivity: {
          healthReports: [
            { id: '1', symptoms: ['fever', 'diarrhea'], severity: 'high', createdAt: '2025-01-11T10:30:00Z' },
            { id: '2', symptoms: ['nausea'], severity: 'medium', createdAt: '2025-01-11T09:15:00Z' }
          ],
          waterReports: [
            { id: '1', pH: 6.2, turbidity: 8.5, bacteriaLevel: 72, timestamp: '2025-01-11T10:00:00Z' },
            { id: '2', pH: 7.1, turbidity: 2.1, bacteriaLevel: 45, timestamp: '2025-01-11T09:30:00Z' }
          ]
        },
        riskDistribution: [
          { _id: 'Low', count: 45 },
          { _id: 'Moderate', count: 32 },
          { _id: 'High', count: 18 },
          { _id: 'Very High', count: 8 },
          { _id: 'Severe', count: 3 }
        ],
        monthlyTrends: [
          { _id: { year: 2024, month: 8 }, avgRiskIndex: 120, count: 45 },
          { _id: { year: 2024, month: 9 }, avgRiskIndex: 135, count: 52 },
          { _id: { year: 2024, month: 10 }, avgRiskIndex: 180, count: 48 },
          { _id: { year: 2024, month: 11 }, avgRiskIndex: 220, count: 61 },
          { _id: { year: 2024, month: 12 }, avgRiskIndex: 195, count: 58 },
          { _id: { year: 2025, month: 1 }, avgRiskIndex: 250, count: 67 }
        ]
      });

      setAlerts([
        {
          id: '1',
          type: 'emergency',
          title: 'High Risk Detected',
          message: 'Critical water contamination detected in Village A',
          village: 'Village A',
          riskIndex: 420,
          status: 'sent',
          priority: 'critical',
          createdAt: '2025-01-11T10:30:00Z',
          escalationLevel: 1
        },
        {
          id: '2',
          type: 'risk_update',
          title: 'Risk Level Update',
          message: 'Risk level updated for Village B',
          village: 'Village B',
          riskIndex: 380,
          status: 'acknowledged',
          priority: 'high',
          createdAt: '2025-01-11T09:15:00Z',
          escalationLevel: 1
        },
        {
          id: '3',
          type: 'awareness',
          title: 'Health Awareness',
          message: 'New health tips available for community',
          village: 'All Villages',
          status: 'delivered',
          priority: 'low',
          createdAt: '2025-01-11T08:00:00Z',
          escalationLevel: 1
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' }
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

  // Chart data
  const riskTrendData = {
    labels: stats.monthlyTrends.map(trend => 
      `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`
    ),
    datasets: [
      {
        label: 'Average Risk Index',
        data: stats.monthlyTrends.map(trend => trend.avgRiskIndex),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const riskDistributionData = {
    labels: stats.riskDistribution.map(item => item._id),
    datasets: [
      {
        data: stats.riskDistribution.map(item => item.count),
        backgroundColor: [
          'rgb(34, 197, 94)', // Green for Low
          'rgb(59, 130, 246)', // Blue for Moderate
          'rgb(251, 191, 36)', // Yellow for High
          'rgb(249, 115, 22)', // Orange for Very High
          'rgb(239, 68, 68)'   // Red for Severe
        ]
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-lg lg:text-xl text-gray-600">Monitor health and water quality across all villages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12%"
          changeType="positive"
          icon={UserGroupIcon}
          color="blue"
          subtitle="Active community members"
        />
        <StatsCard
          title="Health Reports"
          value={stats.totalHealthReports.toLocaleString()}
          change="+8%"
          changeType="positive"
          icon={DocumentTextIcon}
          color="green"
          subtitle="Reports this month"
        />
        <StatsCard
          title="Water Reports"
          value={stats.totalWaterReports.toLocaleString()}
          change="+15%"
          changeType="positive"
          icon={ChartBarIcon}
          color="indigo"
          subtitle="Quality assessments"
        />
        <StatsCard
          title="Active Alerts"
          value={stats.activeAlerts}
          change="+3"
          changeType="negative"
          icon={ExclamationTriangleIcon}
          color="red"
          subtitle="Requiring attention"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Risk Index Card */}
        <div className="xl:col-span-1">
          <RiskIndexCard
            riskIndex={420}
            village="Village A"
            lastUpdated="2 hours ago"
            contributingFactors={[
              'High turbidity levels',
              'Low pH values',
              'Heavy rainfall',
              'Bacterial contamination'
            ]}
          />
        </div>

        {/* Charts */}
        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
          <Chart
            type="line"
            data={riskTrendData}
            title="Risk Index Trends (6 Months)"
            options={{
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
          
          <Chart
            type="doughnut"
            data={riskDistributionData}
            title="Risk Distribution"
            options={{
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* High Risk Villages */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">High Risk Villages</h3>
          <div className="space-y-3">
            {stats.highRiskVillages.map((village) => (
              <div key={village._id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900">{village.village}</h4>
                  <p className="text-sm text-gray-600">Risk Index: {village.latestRiskIndex}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Critical
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{village.latestDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Recent Alerts</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onDismiss={handleDismissAlert}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
