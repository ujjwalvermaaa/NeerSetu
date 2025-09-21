import React, { useState, useEffect } from 'react';
import Chart from '../components/Chart';
import StatsCard from '../components/StatsCard';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {},
    trends: [],
    symptoms: [],
    waterQuality: [],
    riskDistribution: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedVillage, dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analytics data
      setAnalytics({
        overview: {
          totalReports: 1247,
          highRiskVillages: 8,
          avgRiskIndex: 185,
          trend: '+12%',
          trendDirection: 'up'
        },
        trends: [
          { date: '2025-01-05', riskIndex: 120, healthReports: 15, waterReports: 8 },
          { date: '2025-01-06', riskIndex: 135, healthReports: 18, waterReports: 12 },
          { date: '2025-01-07', riskIndex: 150, healthReports: 22, waterReports: 15 },
          { date: '2025-01-08', riskIndex: 180, healthReports: 28, waterReports: 18 },
          { date: '2025-01-09', riskIndex: 220, healthReports: 35, waterReports: 22 },
          { date: '2025-01-10', riskIndex: 195, healthReports: 32, waterReports: 20 },
          { date: '2025-01-11', riskIndex: 250, healthReports: 42, waterReports: 28 }
        ],
        symptoms: [
          { symptom: 'Fever', count: 45, percentage: 35 },
          { symptom: 'Diarrhea', count: 38, percentage: 30 },
          { symptom: 'Nausea', count: 25, percentage: 20 },
          { symptom: 'Vomiting', count: 15, percentage: 12 },
          { symptom: 'Headache', count: 8, percentage: 6 }
        ],
        waterQuality: [
          { date: '2025-01-05', pH: 7.2, turbidity: 1.5, bacteriaLevel: 45 },
          { date: '2025-01-06', pH: 6.8, turbidity: 2.1, bacteriaLevel: 52 },
          { date: '2025-01-07', pH: 6.5, turbidity: 3.2, bacteriaLevel: 68 },
          { date: '2025-01-08', pH: 6.2, turbidity: 4.5, bacteriaLevel: 85 },
          { date: '2025-01-09', pH: 5.9, turbidity: 6.8, bacteriaLevel: 120 },
          { date: '2025-01-10', pH: 6.1, turbidity: 5.2, bacteriaLevel: 95 },
          { date: '2025-01-11', pH: 5.8, turbidity: 7.5, bacteriaLevel: 150 }
        ],
        riskDistribution: [
          { level: 'Low', count: 45, percentage: 35 },
          { level: 'Moderate', count: 32, percentage: 25 },
          { level: 'High', count: 28, percentage: 22 },
          { level: 'Very High', count: 15, percentage: 12 },
          { level: 'Critical', count: 8, percentage: 6 }
        ],
        monthlyData: [
          { month: 'Aug 2024', riskIndex: 120, reports: 45 },
          { month: 'Sep 2024', riskIndex: 135, reports: 52 },
          { month: 'Oct 2024', riskIndex: 180, reports: 48 },
          { month: 'Nov 2024', riskIndex: 220, reports: 61 },
          { month: 'Dec 2024', riskIndex: 195, reports: 58 },
          { month: 'Jan 2025', riskIndex: 250, reports: 67 }
        ]
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  // Chart data
  const riskTrendData = {
    labels: analytics.trends.map(trend => new Date(trend.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Risk Index',
        data: analytics.trends.map(trend => trend.riskIndex),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Health Reports',
        data: analytics.trends.map(trend => trend.healthReports),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const waterQualityData = {
    labels: analytics.waterQuality.map(data => new Date(data.date).toLocaleDateString()),
    datasets: [
      {
        label: 'pH Level',
        data: analytics.waterQuality.map(data => data.pH),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Turbidity (NTU)',
        data: analytics.waterQuality.map(data => data.turbidity),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Bacteria Level (CFU/ml)',
        data: analytics.waterQuality.map(data => data.bacteriaLevel),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y2'
      }
    ]
  };

  const symptomsData = {
    labels: analytics.symptoms.map(s => s.symptom),
    datasets: [
      {
        data: analytics.symptoms.map(s => s.count),
        backgroundColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(251, 191, 36)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)'
        ]
      }
    ]
  };

  const riskDistributionData = {
    labels: analytics.riskDistribution.map(r => r.level),
    datasets: [
      {
        data: analytics.riskDistribution.map(r => r.count),
        backgroundColor: [
          'rgb(34, 197, 94)',   // Green for Low
          'rgb(59, 130, 246)',  // Blue for Moderate
          'rgb(251, 191, 36)',  // Yellow for High
          'rgb(249, 115, 22)',  // Orange for Very High
          'rgb(239, 68, 68)'    // Red for Critical
        ]
      }
    ]
  };

  const monthlyTrendData = {
    labels: analytics.monthlyData.map(m => m.month),
    datasets: [
      {
        label: 'Risk Index',
        data: analytics.monthlyData.map(m => m.riskIndex),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      },
      {
        label: 'Reports',
        data: analytics.monthlyData.map(m => m.reports),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Comprehensive analysis of health and water quality data</p>
        </div>
        
        {/* Filters */}
        <div className="mt-4 sm:mt-0 flex space-x-4">
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Villages</option>
            <option value="village-a">Village A</option>
            <option value="village-b">Village B</option>
            <option value="village-c">Village C</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Reports"
          value={analytics.overview.totalReports.toLocaleString()}
          change={analytics.overview.trend}
          changeType={analytics.overview.trendDirection === 'up' ? 'positive' : 'negative'}
          icon={ChartBarIcon}
          color="blue"
        />
        <StatsCard
          title="High Risk Villages"
          value={analytics.overview.highRiskVillages}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatsCard
          title="Average Risk Index"
          value={analytics.overview.avgRiskIndex}
          icon={ArrowTrendingUpIcon}
          color="orange"
        />
        <StatsCard
          title="Safe Villages"
          value={analytics.riskDistribution.find(r => r.level === 'Low')?.count || 0}
          icon={CheckCircleIcon}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trend */}
        <Chart
          type="line"
          data={riskTrendData}
          title="Risk Index & Health Reports Trend"
          options={{
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Risk Index'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Health Reports'
                },
                grid: {
                  drawOnChartArea: false,
                },
              }
            }
          }}
        />

        {/* Symptoms Distribution */}
        <Chart
          type="doughnut"
          data={symptomsData}
          title="Symptoms Distribution"
          options={{
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }}
        />

        {/* Water Quality Trends */}
        <Chart
          type="line"
          data={waterQualityData}
          title="Water Quality Trends"
          options={{
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'pH Level'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Turbidity (NTU)'
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
              y2: {
                type: 'linear',
                display: false,
                position: 'right',
                title: {
                  display: true,
                  text: 'Bacteria Level'
                }
              }
            }
          }}
        />

        {/* Risk Distribution */}
        <Chart
          type="bar"
          data={riskDistributionData}
          title="Risk Level Distribution"
          options={{
            plugins: {
              legend: {
                display: false
              }
            }
          }}
        />
      </div>

      {/* Monthly Trends */}
      <Chart
        type="line"
        data={monthlyTrendData}
        title="Monthly Trends (6 Months)"
        options={{
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Risk Index'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Reports'
              },
              grid: {
                drawOnChartArea: false,
              }
            }
          }
        }}
      />

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptoms Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Symptoms</h3>
          <div className="space-y-3">
            {analytics.symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{symptom.symptom}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{symptom.count}</div>
                  <div className="text-xs text-gray-500">{symptom.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <div className="space-y-3">
            {analytics.riskDistribution.map((risk, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${
                    risk.level === 'Low' ? 'bg-green-500' :
                    risk.level === 'Moderate' ? 'bg-blue-500' :
                    risk.level === 'High' ? 'bg-yellow-500' :
                    risk.level === 'Very High' ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{risk.level}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{risk.count}</div>
                  <div className="text-xs text-gray-500">{risk.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
