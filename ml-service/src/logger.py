#!/usr/bin/env python3
"""
Advanced Logging System for NeerSetu ML Service
"""

import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler
import json

class MLLogger:
    def __init__(self, log_dir: str = "logs", log_level: str = "INFO"):
        self.log_dir = log_dir
        self.log_level = getattr(logging, log_level.upper())
        
        # Create logs directory if it doesn't exist
        os.makedirs(log_dir, exist_ok=True)
        
        # Setup logger
        self.logger = logging.getLogger('neersetu_ml_service')
        self.logger.setLevel(self.log_level)
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Create formatters
        self.detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        
        self.simple_formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        
        # Console handler
        self.console_handler = logging.StreamHandler()
        self.console_handler.setLevel(logging.INFO)
        self.console_handler.setFormatter(self.simple_formatter)
        
        # File handler for general logs
        self.file_handler = RotatingFileHandler(
            os.path.join(log_dir, 'ml_service.log'),
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        self.file_handler.setLevel(logging.DEBUG)
        self.file_handler.setFormatter(self.detailed_formatter)
        
        # File handler for model training logs
        self.training_handler = RotatingFileHandler(
            os.path.join(log_dir, 'model_training.log'),
            maxBytes=5*1024*1024,  # 5MB
            backupCount=3
        )
        self.training_handler.setLevel(logging.INFO)
        self.training_handler.setFormatter(self.simple_formatter)
        
        # File handler for prediction logs
        self.prediction_handler = RotatingFileHandler(
            os.path.join(log_dir, 'predictions.log'),
            maxBytes=5*1024*1024,  # 5MB
            backupCount=3
        )
        self.prediction_handler.setLevel(logging.INFO)
        self.prediction_handler.setFormatter(self.simple_formatter)
        
        # File handler for errors
        self.error_handler = RotatingFileHandler(
            os.path.join(log_dir, 'errors.log'),
            maxBytes=5*1024*1024,  # 5MB
            backupCount=3
        )
        self.error_handler.setLevel(logging.ERROR)
        self.error_handler.setFormatter(self.detailed_formatter)
        
        # Add handlers to logger
        self.logger.addHandler(self.console_handler)
        self.logger.addHandler(self.file_handler)
        self.logger.addHandler(self.training_handler)
        self.logger.addHandler(self.error_handler)
        
        # Prevent duplicate logs
        self.logger.propagate = False
        
    def get_logger(self):
        """Get the configured logger"""
        return self.logger
    
    def log_training_event(self, event_type: str, details: dict = None):
        """Log model training events"""
        message = f"Training event - Type: {event_type}"
        if details:
            message += f", Details: {json.dumps(details, default=str)}"
        
        # Log to training file
        training_logger = logging.getLogger('neersetu_ml_service.training')
        training_logger.addHandler(self.training_handler)
        training_logger.setLevel(logging.INFO)
        training_logger.propagate = False
        training_logger.info(message)
    
    def log_prediction_event(self, village: str, prediction_type: str, details: dict = None):
        """Log prediction events"""
        message = f"Prediction event - Village: {village}, Type: {prediction_type}"
        if details:
            message += f", Details: {json.dumps(details, default=str)}"
        
        # Log to prediction file
        prediction_logger = logging.getLogger('neersetu_ml_service.prediction')
        prediction_logger.addHandler(self.prediction_handler)
        prediction_logger.setLevel(logging.INFO)
        prediction_logger.propagate = False
        prediction_logger.info(message)
    
    def log_model_performance(self, performance_metrics: dict):
        """Log model performance metrics"""
        timestamp = datetime.now().isoformat()
        performance_metrics['timestamp'] = timestamp
        
        perf_logger = logging.getLogger('neersetu_ml_service.performance')
        perf_logger.addHandler(self.file_handler)
        perf_logger.setLevel(logging.INFO)
        perf_logger.propagate = False
        perf_logger.info(f"Model performance: {json.dumps(performance_metrics, default=str)}")
    
    def log_feature_importance(self, feature_importance: dict):
        """Log feature importance data"""
        timestamp = datetime.now().isoformat()
        feature_importance['timestamp'] = timestamp
        
        feature_logger = logging.getLogger('neersetu_ml_service.features')
        feature_logger.addHandler(self.file_handler)
        feature_logger.setLevel(logging.INFO)
        feature_logger.propagate = False
        feature_logger.info(f"Feature importance: {json.dumps(feature_importance, default=str)}")
    
    def log_system_health(self, health_data: dict):
        """Log system health information"""
        timestamp = datetime.now().isoformat()
        health_data['timestamp'] = timestamp
        
        health_logger = logging.getLogger('neersetu_ml_service.health')
        health_logger.addHandler(self.file_handler)
        health_logger.setLevel(logging.INFO)
        health_logger.propagate = False
        health_logger.info(f"System health: {json.dumps(health_data, default=str)}")

# Global logger instance
ml_logger = MLLogger()
logger = ml_logger.get_logger()
