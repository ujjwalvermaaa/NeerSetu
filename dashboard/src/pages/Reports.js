import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    village: 'all',
    dateRange: '30d'
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock reports data
      const mockReports = [
        {
          id: '1',
          title: 'Monthly Health Surveillance Report',
          type: 'health',
          village: 'Village A',
          date: '2025-01-11',
          status: 'completed',
          summary: {
            totalReports: 45,
            highRiskCases: 8,
            avgRiskIndex: 185,
            topSymptoms: ['Fever', 'Diarrhea', 'Nausea'],
            recommendations: ['Increase water testing', 'Deploy health workers', 'Community awareness']
          },
          fileSize: '2.3 MB',
          generatedBy: 'Health Official'
        },
        {
          id: '2',
          title: 'Water Quality Assessment Report',
          type: 'water',
          village: 'Village B',
          date: '2025-01-10',
          status: 'completed',
          summary: {
            totalTests: 23,
            contaminatedSources: 3,
            avgPH: 6.8,
            avgTurbidity: 4.2,
            recommendations: ['Water treatment required', 'Source protection needed']
          },
          fileSize: '1.8 MB',
          generatedBy: 'Water Quality Inspector'
        },
        {
          id: '3',
          title: 'Outbreak Risk Analysis',
          type: 'risk',
          village: 'All Villages',
          date: '2025-01-09',
          status: 'completed',
          summary: {
            highRiskVillages: 3,
            avgRiskIndex: 220,
            predictedOutbreaks: 2,
            recommendations: ['Emergency response', 'Resource allocation', 'Public awareness']
          },
          fileSize: '3.1 MB',
          generatedBy: 'Risk Analyst'
        },
        {
          id: '4',
          title: 'Weekly Summary Report',
          type: 'summary',
          village: 'All Villages',
          date: '2025-01-08',
          status: 'completed',
          summary: {
            totalAlerts: 12,
            resolvedAlerts: 8,
            newCases: 15,
            recommendations: ['Continue monitoring', 'Maintain current protocols']
          },
          fileSize: '1.2 MB',
          generatedBy: 'System Administrator'
        },
        {
          id: '5',
          title: 'Emergency Response Report',
          type: 'emergency',
          village: 'Village C',
          date: '2025-01-07',
          status: 'completed',
          summary: {
            emergencyAlerts: 3,
            responseTime: '45 minutes',
            actionsTaken: ['Water source closure', 'Medical team deployment', 'Community notification'],
            recommendations: ['Improve response time', 'Better communication protocols']
          },
          fileSize: '2.7 MB',
          generatedBy: 'Emergency Coordinator'
        }
      ];

      setReports(mockReports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const generateReport = async (type, village, dateRange) => {
    setLoading(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport = {
        id: Date.now().toString(),
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${village}`,
        type: type,
        village: village,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        summary: {
          generatedAt: new Date().toISOString(),
          dataPoints: Math.floor(Math.random() * 100) + 50
        },
        fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        generatedBy: 'Current User'
      };
      
      setReports(prev => [newReport, ...prev]);
      setLoading(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setLoading(false);
    }
  };

  const downloadReport = (reportId) => {
    // Simulate download
    console.log(`Downloading report ${reportId}`);
    // In real implementation, this would trigger a file download
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'health':
        return <ChartBarIcon className="h-5 w-5 text-green-600" />;
      case 'water':
        return <DocumentTextIcon className="h-5 w-5 text-blue-600" />;
      case 'risk':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'emergency':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && reports.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and manage health surveillance reports</p>
        </div>
        
        <button
          onClick={() => setSelectedReport('new')}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Generate Report
        </button>
      </div>

      {/* Generate Report Modal */}
      {selectedReport === 'new' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="health">Health Surveillance</option>
                  <option value="water">Water Quality</option>
                  <option value="risk">Risk Analysis</option>
                  <option value="summary">Summary Report</option>
                  <option value="emergency">Emergency Response</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFilters(prev => ({ ...prev, village: e.target.value }))}
                >
                  <option value="All Villages">All Villages</option>
                  <option value="Village A">Village A</option>
                  <option value="Village B">Village B</option>
                  <option value="Village C">Village C</option>
                  <option value="Village D">Village D</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generateReport(filters.type, filters.village, filters.dateRange);
                  setSelectedReport(null);
                }}
                disabled={loading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getReportIcon(report.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {report.date}
                      </div>
                      <div>{report.village}</div>
                      <div>{report.fileSize}</div>
                      <div>By {report.generatedBy}</div>
                    </div>
                    
                    {report.summary && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Summary:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {Object.entries(report.summary).slice(0, 4).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="ml-1 font-medium text-gray-900">
                                {Array.isArray(value) ? value.join(', ') : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  
                  <button
                    onClick={() => downloadReport(report.id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Health Reports</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.type === 'health').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emergency Reports</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.type === 'emergency').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => {
                  const reportDate = new Date(r.date);
                  const now = new Date();
                  return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
