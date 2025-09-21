#!/usr/bin/env python3
"""
Configuration Module for NeerSetu IoT Simulator
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for IoT Simulator"""
    
    # Backend Configuration
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
    API_TIMEOUT = int(os.getenv('API_TIMEOUT', '10'))
    MAX_RETRIES = int(os.getenv('MAX_RETRIES', '3'))
    RETRY_DELAY = int(os.getenv('RETRY_DELAY', '5'))
    
    # Dataset Configuration
    DATASET_PATH = os.getenv('DATASET_PATH', '../Datasets/2_Water_Quality_Data_NE_India.csv')
    DATA_VALIDATION = os.getenv('DATA_VALIDATION', 'true').lower() == 'true'
    
    # Simulation Configuration
    DEFAULT_INTERVAL = int(os.getenv('DEFAULT_INTERVAL', '30'))
    DEFAULT_BATCH_SIZE = int(os.getenv('DEFAULT_BATCH_SIZE', '10'))
    DEFAULT_BATCH_DELAY = int(os.getenv('DEFAULT_BATCH_DELAY', '5'))
    MAX_RECORDS = int(os.getenv('MAX_RECORDS', '0')) or None
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_DIR = os.getenv('LOG_DIR', 'logs')
    LOG_ROTATION_SIZE = int(os.getenv('LOG_ROTATION_SIZE', '10485760'))  # 10MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', '5'))
    
    # Performance Monitoring
    PERFORMANCE_MONITORING = os.getenv('PERFORMANCE_MONITORING', 'true').lower() == 'true'
    MONITORING_INTERVAL = int(os.getenv('MONITORING_INTERVAL', '30'))
    MAX_METRICS_HISTORY = int(os.getenv('MAX_METRICS_HISTORY', '1000'))
    
    # Data Processing
    ENABLE_ANOMALY_DETECTION = os.getenv('ENABLE_ANOMALY_DETECTION', 'true').lower() == 'true'
    ENABLE_QUALITY_VALIDATION = os.getenv('ENABLE_QUALITY_VALIDATION', 'true').lower() == 'true'
    ENABLE_RISK_CALCULATION = os.getenv('ENABLE_RISK_CALCULATION', 'true').lower() == 'true'
    
    # IoT Sensor Simulation
    SENSOR_VARIATION = float(os.getenv('SENSOR_VARIATION', '0.1'))  # 10% variation
    BATTERY_DRAIN_RATE = float(os.getenv('BATTERY_DRAIN_RATE', '0.1'))  # 0.1% per transmission
    SIGNAL_STRENGTH_VARIATION = int(os.getenv('SIGNAL_STRENGTH_VARIATION', '20'))
    
    # Quality Standards (WHO/Indian Standards)
    QUALITY_STANDARDS = {
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
    
    # Risk Score Thresholds
    RISK_THRESHOLDS = {
        'low': 0,
        'moderate': 40,
        'high': 70,
        'critical': 90
    }
    
    # API Endpoints
    ENDPOINTS = {
        'water_reports': '/api/water-reports',
        'health_check': '/health',
        'analytics': '/api/analytics',
        'alerts': '/api/alerts'
    }
    
    # Village and Location Data
    NORTHEAST_STATES = [
        'Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 
        'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'
    ]
    
    # Default sensor configurations
    SENSOR_CONFIGS = {
        'battery_level': {'min': 20, 'max': 100},
        'signal_strength': {'min': 60, 'max': 100},
        'temperature': {'min': 15, 'max': 35},  # Celsius
        'humidity': {'min': 40, 'max': 90}  # Percentage
    }
    
    @classmethod
    def get_config_dict(cls) -> Dict[str, Any]:
        """Get all configuration as a dictionary"""
        return {
            'backend_url': cls.BACKEND_URL,
            'api_timeout': cls.API_TIMEOUT,
            'max_retries': cls.MAX_RETRIES,
            'retry_delay': cls.RETRY_DELAY,
            'dataset_path': cls.DATASET_PATH,
            'data_validation': cls.DATA_VALIDATION,
            'default_interval': cls.DEFAULT_INTERVAL,
            'default_batch_size': cls.DEFAULT_BATCH_SIZE,
            'default_batch_delay': cls.DEFAULT_BATCH_DELAY,
            'max_records': cls.MAX_RECORDS,
            'log_level': cls.LOG_LEVEL,
            'log_dir': cls.LOG_DIR,
            'performance_monitoring': cls.PERFORMANCE_MONITORING,
            'monitoring_interval': cls.MONITORING_INTERVAL,
            'enable_anomaly_detection': cls.ENABLE_ANOMALY_DETECTION,
            'enable_quality_validation': cls.ENABLE_QUALITY_VALIDATION,
            'enable_risk_calculation': cls.ENABLE_RISK_CALCULATION,
            'sensor_variation': cls.SENSOR_VARIATION,
            'battery_drain_rate': cls.BATTERY_DRAIN_RATE,
            'signal_strength_variation': cls.SIGNAL_STRENGTH_VARIATION
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate configuration values"""
        try:
            # Check if dataset path exists
            if not os.path.exists(cls.DATASET_PATH):
                print(f"Warning: Dataset path does not exist: {cls.DATASET_PATH}")
            
            # Check if log directory exists, create if not
            if not os.path.exists(cls.LOG_DIR):
                os.makedirs(cls.LOG_DIR, exist_ok=True)
                print(f"Created log directory: {cls.LOG_DIR}")
            
            # Validate numeric values
            assert cls.API_TIMEOUT > 0, "API_TIMEOUT must be positive"
            assert cls.MAX_RETRIES >= 0, "MAX_RETRIES must be non-negative"
            assert cls.RETRY_DELAY >= 0, "RETRY_DELAY must be non-negative"
            assert cls.DEFAULT_INTERVAL > 0, "DEFAULT_INTERVAL must be positive"
            assert cls.DEFAULT_BATCH_SIZE > 0, "DEFAULT_BATCH_SIZE must be positive"
            assert cls.DEFAULT_BATCH_DELAY >= 0, "DEFAULT_BATCH_DELAY must be non-negative"
            
            return True
            
        except Exception as e:
            print(f"Configuration validation error: {str(e)}")
            return False

# Global config instance
config = Config()
