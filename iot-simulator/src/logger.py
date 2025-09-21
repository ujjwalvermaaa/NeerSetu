#!/usr/bin/env python3
"""
Advanced Logging System for NeerSetu IoT Simulator
"""

import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler
import json

class IoTLogger:
    def __init__(self, log_dir: str = "logs", log_level: str = "INFO"):
        self.log_dir = log_dir
        self.log_level = getattr(logging, log_level.upper())
        
        # Create logs directory if it doesn't exist
        os.makedirs(log_dir, exist_ok=True)
        
        # Setup logger
        self.logger = logging.getLogger('neersetu_iot_simulator')
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
            os.path.join(log_dir, 'iot_simulator.log'),
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        self.file_handler.setLevel(logging.DEBUG)
        self.file_handler.setFormatter(self.detailed_formatter)
        
        # File handler for data transmission logs
        self.data_handler = RotatingFileHandler(
            os.path.join(log_dir, 'data_transmission.log'),
            maxBytes=5*1024*1024,  # 5MB
            backupCount=3
        )
        self.data_handler.setLevel(logging.INFO)
        self.data_handler.setFormatter(self.simple_formatter)
        
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
        self.logger.addHandler(self.data_handler)
        self.logger.addHandler(self.error_handler)
        
        # Prevent duplicate logs
        self.logger.propagate = False
        
    def get_logger(self):
        """Get the configured logger"""
        return self.logger
    
    def log_data_transmission(self, village: str, status: str, details: dict = None):
        """Log data transmission events"""
        message = f"Data transmission - Village: {village}, Status: {status}"
        if details:
            message += f", Details: {json.dumps(details, default=str)}"
        
        # Log to data transmission file
        data_logger = logging.getLogger('neersetu_iot_simulator.data')
        data_logger.addHandler(self.data_handler)
        data_logger.setLevel(logging.INFO)
        data_logger.propagate = False
        data_logger.info(message)
    
    def log_performance_metrics(self, metrics: dict):
        """Log performance metrics"""
        timestamp = datetime.now().isoformat()
        metrics['timestamp'] = timestamp
        
        perf_logger = logging.getLogger('neersetu_iot_simulator.performance')
        perf_logger.addHandler(self.file_handler)
        perf_logger.setLevel(logging.INFO)
        perf_logger.propagate = False
        perf_logger.info(f"Performance metrics: {json.dumps(metrics, default=str)}")
    
    def log_system_health(self, health_data: dict):
        """Log system health information"""
        timestamp = datetime.now().isoformat()
        health_data['timestamp'] = timestamp
        
        health_logger = logging.getLogger('neersetu_iot_simulator.health')
        health_logger.addHandler(self.file_handler)
        health_logger.setLevel(logging.INFO)
        health_logger.propagate = False
        health_logger.info(f"System health: {json.dumps(health_data, default=str)}")

# Global logger instance
iot_logger = IoTLogger()
logger = iot_logger.get_logger()
