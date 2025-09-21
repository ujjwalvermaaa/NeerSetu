#!/usr/bin/env python3
"""
Configuration Module for NeerSetu ML Service
"""

import os
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class MLConfig:
    """Configuration class for ML Service"""
    
    # Service Configuration
    HOST = os.getenv('ML_HOST', '0.0.0.0')
    PORT = int(os.getenv('ML_PORT', '8000'))
    DEBUG = os.getenv('ML_DEBUG', 'false').lower() == 'true'
    
    # Model Configuration
    MODEL_DIR = os.getenv('MODEL_DIR', 'models')
    DEFAULT_MODEL_NAME = os.getenv('DEFAULT_MODEL_NAME', 'outbreak_model')
    MODEL_VERSION = os.getenv('MODEL_VERSION', '2.0.0')
    
    # Dataset Configuration
    DATASET_DIR = os.getenv('DATASET_DIR', '../Datasets')
    HEALTH_DATASET = os.getenv('HEALTH_DATASET', '1_Health_Surveillance_Data_NE_India.csv')
    WATER_DATASET = os.getenv('WATER_DATASET', '2_Water_Quality_Data_NE_India.csv')
    ENVIRONMENT_DATASET = os.getenv('ENVIRONMENT_DATASET', '3_Environmental_Rainfall_Data_NE_India.csv')
    OUTBREAK_DATASET = os.getenv('OUTBREAK_DATASET', '4_Outbreak_Levels_Target_Data_NE_India.csv')
    
    # Model Training Configuration
    TEST_SIZE = float(os.getenv('TEST_SIZE', '0.2'))
    RANDOM_STATE = int(os.getenv('RANDOM_STATE', '42'))
    CROSS_VALIDATION_FOLDS = int(os.getenv('CV_FOLDS', '5'))
    
    # Feature Engineering
    ENABLE_FEATURE_ENGINEERING = os.getenv('ENABLE_FEATURE_ENGINEERING', 'true').lower() == 'true'
    ENABLE_TEMPORAL_FEATURES = os.getenv('ENABLE_TEMPORAL_FEATURES', 'true').lower() == 'true'
    ENABLE_INTERACTION_FEATURES = os.getenv('ENABLE_INTERACTION_FEATURES', 'true').lower() == 'true'
    
    # Model Parameters
    XGBOOST_PARAMS = {
        'n_estimators': int(os.getenv('XGB_N_ESTIMATORS', '100')),
        'max_depth': int(os.getenv('XGB_MAX_DEPTH', '6')),
        'learning_rate': float(os.getenv('XGB_LEARNING_RATE', '0.1')),
        'subsample': float(os.getenv('XGB_SUBSAMPLE', '0.8')),
        'colsample_bytree': float(os.getenv('XGB_COLSAMPLE_BYTREE', '0.8')),
        'random_state': RANDOM_STATE
    }
    
    RANDOM_FOREST_PARAMS = {
        'n_estimators': int(os.getenv('RF_N_ESTIMATORS', '100')),
        'max_depth': int(os.getenv('RF_MAX_DEPTH', '10')),
        'min_samples_split': int(os.getenv('RF_MIN_SAMPLES_SPLIT', '2')),
        'min_samples_leaf': int(os.getenv('RF_MIN_SAMPLES_LEAF', '1')),
        'random_state': RANDOM_STATE
    }
    
    # Risk Index Configuration
    RISK_THRESHOLDS = {
        'low': 0,
        'moderate': 100,
        'high': 200,
        'very_high': 300,
        'severe': 400,
        'critical': 500
    }
    
    # Feature Importance Thresholds
    MIN_FEATURE_IMPORTANCE = float(os.getenv('MIN_FEATURE_IMPORTANCE', '0.01'))
    TOP_FEATURES_COUNT = int(os.getenv('TOP_FEATURES_COUNT', '10'))
    
    # SHAP Configuration
    ENABLE_SHAP = os.getenv('ENABLE_SHAP', 'true').lower() == 'true'
    SHAP_SAMPLE_SIZE = int(os.getenv('SHAP_SAMPLE_SIZE', '100'))
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_DIR = os.getenv('LOG_DIR', 'logs')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Performance Monitoring
    ENABLE_PERFORMANCE_MONITORING = os.getenv('ENABLE_PERFORMANCE_MONITORING', 'true').lower() == 'true'
    MONITORING_INTERVAL = int(os.getenv('MONITORING_INTERVAL', '60'))
    
    # Caching Configuration
    ENABLE_CACHING = os.getenv('ENABLE_CACHING', 'true').lower() == 'true'
    CACHE_TTL = int(os.getenv('CACHE_TTL', '3600'))  # 1 hour
    
    # API Configuration
    API_TIMEOUT = int(os.getenv('API_TIMEOUT', '30'))
    MAX_BATCH_SIZE = int(os.getenv('MAX_BATCH_SIZE', '100'))
    
    # Data Validation
    ENABLE_DATA_VALIDATION = os.getenv('ENABLE_DATA_VALIDATION', 'true').lower() == 'true'
    MIN_DATA_POINTS = int(os.getenv('MIN_DATA_POINTS', '10'))
    
    # Feature Categories
    HEALTH_FEATURES = [
        'total_diarrhea_cases', 'total_fever_cases', 'total_vomiting_cases',
        'total_affected_population', 'symptom_severity', 'duration_days'
    ]
    
    WATER_QUALITY_FEATURES = [
        'avg_ph', 'avg_turbidity', 'avg_bacteria_ecoli', 'avg_bacteria_coliform',
        'avg_dissolved_oxygen', 'avg_nitrates', 'avg_phosphates', 'avg_heavy_metals',
        'avg_chlorine_residual', 'avg_fluoride', 'avg_arsenic', 'water_contaminated'
    ]
    
    ENVIRONMENTAL_FEATURES = [
        'daily_rainfall', 'weekly_rainfall', 'monthly_rainfall', 'temperature',
        'humidity', 'flood_risk_level', 'drought_indicator', 'season', 'month'
    ]
    
    # Risk Factors
    HIGH_RISK_FACTORS = [
        'high_bacterial_contamination', 'low_ph', 'high_turbidity',
        'heavy_rainfall', 'flood_conditions', 'high_temperature',
        'multiple_symptoms', 'large_affected_population'
    ]
    
    # Model Types
    SUPPORTED_MODELS = ['xgboost', 'random_forest', 'logistic_regression', 'svm']
    DEFAULT_MODEL_TYPE = os.getenv('DEFAULT_MODEL_TYPE', 'xgboost')
    
    @classmethod
    def get_config_dict(cls) -> Dict[str, Any]:
        """Get all configuration as a dictionary"""
        return {
            'host': cls.HOST,
            'port': cls.PORT,
            'debug': cls.DEBUG,
            'model_dir': cls.MODEL_DIR,
            'default_model_name': cls.DEFAULT_MODEL_NAME,
            'model_version': cls.MODEL_VERSION,
            'dataset_dir': cls.DATASET_DIR,
            'test_size': cls.TEST_SIZE,
            'random_state': cls.RANDOM_STATE,
            'cv_folds': cls.CROSS_VALIDATION_FOLDS,
            'enable_feature_engineering': cls.ENABLE_FEATURE_ENGINEERING,
            'enable_temporal_features': cls.ENABLE_TEMPORAL_FEATURES,
            'enable_interaction_features': cls.ENABLE_INTERACTION_FEATURES,
            'xgboost_params': cls.XGBOOST_PARAMS,
            'random_forest_params': cls.RANDOM_FOREST_PARAMS,
            'risk_thresholds': cls.RISK_THRESHOLDS,
            'min_feature_importance': cls.MIN_FEATURE_IMPORTANCE,
            'top_features_count': cls.TOP_FEATURES_COUNT,
            'enable_shap': cls.ENABLE_SHAP,
            'shap_sample_size': cls.SHAP_SAMPLE_SIZE,
            'log_level': cls.LOG_LEVEL,
            'log_dir': cls.LOG_DIR,
            'enable_performance_monitoring': cls.ENABLE_PERFORMANCE_MONITORING,
            'monitoring_interval': cls.MONITORING_INTERVAL,
            'enable_caching': cls.ENABLE_CACHING,
            'cache_ttl': cls.CACHE_TTL,
            'api_timeout': cls.API_TIMEOUT,
            'max_batch_size': cls.MAX_BATCH_SIZE,
            'enable_data_validation': cls.ENABLE_DATA_VALIDATION,
            'min_data_points': cls.MIN_DATA_POINTS,
            'supported_models': cls.SUPPORTED_MODELS,
            'default_model_type': cls.DEFAULT_MODEL_TYPE
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate configuration values"""
        try:
            # Check if model directory exists, create if not
            if not os.path.exists(cls.MODEL_DIR):
                os.makedirs(cls.MODEL_DIR, exist_ok=True)
                print(f"Created model directory: {cls.MODEL_DIR}")
            
            # Check if log directory exists, create if not
            if not os.path.exists(cls.LOG_DIR):
                os.makedirs(cls.LOG_DIR, exist_ok=True)
                print(f"Created log directory: {cls.LOG_DIR}")
            
            # Validate numeric values
            assert 0 < cls.TEST_SIZE < 1, "TEST_SIZE must be between 0 and 1"
            assert cls.RANDOM_STATE >= 0, "RANDOM_STATE must be non-negative"
            assert cls.CROSS_VALIDATION_FOLDS >= 2, "CV_FOLDS must be at least 2"
            assert cls.PORT > 0, "PORT must be positive"
            assert cls.API_TIMEOUT > 0, "API_TIMEOUT must be positive"
            assert cls.MAX_BATCH_SIZE > 0, "MAX_BATCH_SIZE must be positive"
            
            return True
            
        except Exception as e:
            print(f"Configuration validation error: {str(e)}")
            return False

# Global config instance
config = MLConfig()
