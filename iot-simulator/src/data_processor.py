#!/usr/bin/env python3
"""
Data Processing Module for NeerSetu IoT Simulator
Handles data validation, transformation, and quality checks
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self):
        self.quality_standards = {
            'pH': {'min': 6.5, 'max': 8.5, 'unit': 'pH'},
            'turbidity': {'max': 5.0, 'unit': 'NTU'},
            'bacteria_ecoli': {'max': 100, 'unit': 'CFU/100ml'},
            'bacteria_coliform': {'max': 1000, 'unit': 'CFU/100ml'},
            'dissolved_oxygen': {'min': 5.0, 'unit': 'mg/L'},
            'nitrates': {'max': 45, 'unit': 'mg/L'},
            'phosphates': {'max': 0.1, 'unit': 'mg/L'},
            'heavy_metals': {'max': 0.01, 'unit': 'mg/L'},
            'chlorine_residual': {'min': 0.2, 'unit': 'mg/L'},
            'fluoride': {'max': 1.5, 'unit': 'mg/L'},
            'arsenic': {'max': 0.01, 'unit': 'mg/L'}
        }
    
    def validate_data_quality(self, data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate data quality against standards"""
        issues = []
        
        try:
            quality_params = data.get('qualityParameters', {})
            
            for param, value_info in quality_params.items():
                if not isinstance(value_info, dict) or 'value' not in value_info:
                    continue
                
                param_name = param.lower().replace('bacteriaecoli', 'bacteria_ecoli').replace('bacteriacoliform', 'bacteria_coliform')
                value = value_info['value']
                
                if param_name in self.quality_standards:
                    standards = self.quality_standards[param_name]
                    
                    # Check minimum value
                    if 'min' in standards and value < standards['min']:
                        issues.append(f"{param}: {value} below minimum {standards['min']} {standards['unit']}")
                    
                    # Check maximum value
                    if 'max' in standards and value > standards['max']:
                        issues.append(f"{param}: {value} above maximum {standards['max']} {standards['unit']}")
            
            return len(issues) == 0, issues
            
        except Exception as e:
            logger.error(f"Error validating data quality: {str(e)}")
            return False, [f"Validation error: {str(e)}"]
    
    def calculate_risk_score(self, data: Dict[str, Any]) -> int:
        """Calculate risk score based on water quality parameters"""
        try:
            risk_factors = []
            quality_params = data.get('qualityParameters', {})
            
            for param, value_info in quality_params.items():
                if not isinstance(value_info, dict) or 'value' not in value_info:
                    continue
                
                param_name = param.lower().replace('bacteriaecoli', 'bacteria_ecoli').replace('bacteriacoliform', 'bacteria_coliform')
                value = value_info['value']
                
                if param_name in self.quality_standards:
                    standards = self.quality_standards[param_name]
                    
                    # Calculate risk factor for this parameter
                    if 'min' in standards and value < standards['min']:
                        risk_factor = (standards['min'] - value) / standards['min'] * 50
                        risk_factors.append(min(risk_factor, 50))
                    
                    if 'max' in standards and value > standards['max']:
                        risk_factor = (value - standards['max']) / standards['max'] * 50
                        risk_factors.append(min(risk_factor, 50))
            
            # Calculate overall risk score (0-100)
            if risk_factors:
                avg_risk = sum(risk_factors) / len(risk_factors)
                return min(int(avg_risk), 100)
            else:
                return 0
                
        except Exception as e:
            logger.error(f"Error calculating risk score: {str(e)}")
            return 50  # Default moderate risk
    
    def detect_anomalies(self, data: Dict[str, Any], historical_data: List[Dict] = None) -> List[str]:
        """Detect anomalies in the data"""
        anomalies = []
        
        try:
            quality_params = data.get('qualityParameters', {})
            
            # Check for extreme values
            for param, value_info in quality_params.items():
                if not isinstance(value_info, dict) or 'value' not in value_info:
                    continue
                
                value = value_info['value']
                
                # Check for impossible values
                if value < 0:
                    anomalies.append(f"{param}: Negative value detected ({value})")
                
                # Check for extremely high values
                if param == 'pH' and (value < 0 or value > 14):
                    anomalies.append(f"{param}: pH value outside possible range ({value})")
                
                if param == 'turbidity' and value > 1000:
                    anomalies.append(f"{param}: Extremely high turbidity ({value})")
                
                if 'bacteria' in param.lower() and value > 100000:
                    anomalies.append(f"{param}: Extremely high bacterial count ({value})")
            
            # Check for missing critical parameters
            critical_params = ['pH', 'turbidity', 'bacteriaEcoli']
            for param in critical_params:
                if param not in quality_params:
                    anomalies.append(f"Missing critical parameter: {param}")
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}")
            return [f"Anomaly detection error: {str(e)}"]
    
    def generate_quality_report(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a comprehensive quality report"""
        try:
            is_valid, validation_issues = self.validate_data_quality(data)
            risk_score = self.calculate_risk_score(data)
            anomalies = self.detect_anomalies(data)
            
            # Determine overall status
            if not is_valid or anomalies:
                overall_status = "UNSAFE"
            elif risk_score > 70:
                overall_status = "HIGH_RISK"
            elif risk_score > 40:
                overall_status = "MODERATE_RISK"
            else:
                overall_status = "SAFE"
            
            report = {
                'timestamp': datetime.now().isoformat(),
                'village': data.get('village', 'Unknown'),
                'overall_status': overall_status,
                'risk_score': risk_score,
                'is_valid': is_valid,
                'validation_issues': validation_issues,
                'anomalies': anomalies,
                'quality_parameters': data.get('qualityParameters', {}),
                'recommendations': self._generate_recommendations(validation_issues, anomalies, risk_score)
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating quality report: {str(e)}")
            return {
                'timestamp': datetime.now().isoformat(),
                'village': data.get('village', 'Unknown'),
                'overall_status': 'ERROR',
                'error': str(e)
            }
    
    def _generate_recommendations(self, validation_issues: List[str], anomalies: List[str], risk_score: int) -> List[str]:
        """Generate recommendations based on data analysis"""
        recommendations = []
        
        if risk_score > 70:
            recommendations.append("IMMEDIATE ACTION REQUIRED: Water source poses high health risk")
        
        if validation_issues:
            recommendations.append("Water treatment recommended before consumption")
        
        if anomalies:
            recommendations.append("Sensor calibration may be required")
        
        if risk_score > 40:
            recommendations.append("Regular monitoring and testing recommended")
        
        if not recommendations:
            recommendations.append("Water quality is within acceptable limits")
        
        return recommendations
    
    def aggregate_data(self, data_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate multiple data points for analysis"""
        try:
            if not data_list:
                return {}
            
            # Group by village
            village_data = {}
            for data in data_list:
                village = data.get('village', 'Unknown')
                if village not in village_data:
                    village_data[village] = []
                village_data[village].append(data)
            
            # Calculate statistics for each village
            aggregated = {}
            for village, village_data_list in village_data.items():
                quality_params = {}
                
                # Get all quality parameters
                all_params = set()
                for data in village_data_list:
                    params = data.get('qualityParameters', {})
                    all_params.update(params.keys())
                
                # Calculate statistics for each parameter
                for param in all_params:
                    values = []
                    for data in village_data_list:
                        param_data = data.get('qualityParameters', {}).get(param, {})
                        if isinstance(param_data, dict) and 'value' in param_data:
                            values.append(param_data['value'])
                    
                    if values:
                        quality_params[param] = {
                            'count': len(values),
                            'mean': np.mean(values),
                            'min': np.min(values),
                            'max': np.max(values),
                            'std': np.std(values),
                            'latest': values[-1] if values else None
                        }
                
                # Calculate average risk score
                risk_scores = []
                for data in village_data_list:
                    risk_score = data.get('overallStatus', {}).get('riskScore', 0)
                    risk_scores.append(risk_score)
                
                aggregated[village] = {
                    'data_count': len(village_data_list),
                    'quality_parameters': quality_params,
                    'average_risk_score': np.mean(risk_scores) if risk_scores else 0,
                    'max_risk_score': np.max(risk_scores) if risk_scores else 0,
                    'min_risk_score': np.min(risk_scores) if risk_scores else 0,
                    'last_update': max([data.get('timestamp', '') for data in village_data_list])
                }
            
            return aggregated
            
        except Exception as e:
            logger.error(f"Error aggregating data: {str(e)}")
            return {}
