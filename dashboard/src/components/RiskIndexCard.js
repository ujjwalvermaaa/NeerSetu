import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const RiskIndexCard = ({ riskIndex, village, lastUpdated, contributingFactors = [] }) => {
  const getRiskLevel = (index) => {
    if (index >= 400) return { level: 'SEVERE', color: 'bg-red-600', textColor: 'text-red-600' };
    if (index >= 300) return { level: 'VERY HIGH', color: 'bg-orange-600', textColor: 'text-orange-600' };
    if (index >= 200) return { level: 'HIGH', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (index >= 100) return { level: 'MODERATE', color: 'bg-blue-500', textColor: 'text-blue-600' };
    return { level: 'LOW', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const riskLevel = getRiskLevel(riskIndex);
  const percentage = (riskIndex / 500) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Risk Index</h3>
        <div className="flex items-center space-x-2">
          {riskIndex >= 200 ? (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          )}
          <span className={`text-sm font-medium ${riskLevel.textColor}`}>
            {riskLevel.level}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl font-bold text-gray-900">{riskIndex}</span>
          <span className="text-sm text-gray-500">/ 500</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${riskLevel.color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Village:</span>
          <span className="font-medium text-gray-900">{village}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Last Updated:</span>
          <span className="font-medium text-gray-900">{lastUpdated}</span>
        </div>
      </div>

      {contributingFactors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Contributing Factors:</h4>
          <div className="space-y-1">
            {contributingFactors.slice(0, 3).map((factor, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                {factor}
              </div>
            ))}
            {contributingFactors.length > 3 && (
              <div className="text-xs text-gray-500">
                +{contributingFactors.length - 3} more factors
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskIndexCard;
