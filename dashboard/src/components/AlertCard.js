import React from 'react';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AlertCard = ({ alert, onAcknowledge, onResolve, onDismiss }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'emergency':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'risk_update':
        return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'awareness':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type, priority) => {
    if (type === 'emergency' || priority === 'critical') return 'border-red-200 bg-red-50';
    if (priority === 'high') return 'border-orange-200 bg-orange-50';
    if (priority === 'medium') return 'border-yellow-200 bg-yellow-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'text-yellow-600 bg-yellow-100';
      case 'delivered':
        return 'text-blue-600 bg-blue-100';
      case 'acknowledged':
        return 'text-green-600 bg-green-100';
      case 'resolved':
        return 'text-gray-600 bg-gray-100';
      case 'escalated':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className={`rounded-lg border p-4 ${getAlertColor(alert.type, alert.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getAlertIcon(alert.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                {alert.status}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Village: {alert.village}</span>
              <span>•</span>
              <span>{formatTime(alert.createdAt)}</span>
              {alert.riskIndex && (
                <>
                  <span>•</span>
                  <span>Risk: {alert.riskIndex}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {alert.status === 'sent' && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Acknowledge
            </button>
          )}
          
          {alert.status === 'acknowledged' && (
            <button
              onClick={() => onResolve(alert.id)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Resolve
            </button>
          )}
          
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {alert.escalationLevel > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-xs text-orange-600">
            <ClockIcon className="h-3 w-3 mr-1" />
            Escalated to Level {alert.escalationLevel}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCard;
