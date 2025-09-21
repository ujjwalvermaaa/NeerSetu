#!/usr/bin/env python3
"""
Performance Monitoring Module for NeerSetu IoT Simulator
Tracks performance metrics and system health
"""

import time
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import deque
import logging

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.metrics_history = deque(maxlen=max_history)
        self.start_time = time.time()
        self.is_monitoring = False
        self.monitor_thread = None
        
        # Performance counters
        self.counters = {
            'data_points_sent': 0,
            'data_points_failed': 0,
            'api_calls_successful': 0,
            'api_calls_failed': 0,
            'bytes_transmitted': 0,
            'errors_encountered': 0
        }
        
        # Response time tracking
        self.response_times = deque(maxlen=100)
        
        # System resource tracking
        self.system_metrics = deque(maxlen=100)
    
    def start_monitoring(self, interval: float = 30.0):
        """Start continuous performance monitoring"""
        if self.is_monitoring:
            logger.warning("Performance monitoring is already running")
            return
        
        self.is_monitoring = True
        self.monitor_thread = threading.Thread(
            target=self._monitor_loop,
            args=(interval,),
            daemon=True
        )
        self.monitor_thread.start()
        logger.info(f"Performance monitoring started with {interval}s interval")
    
    def stop_monitoring(self):
        """Stop performance monitoring"""
        self.is_monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        logger.info("Performance monitoring stopped")
    
    def _monitor_loop(self, interval: float):
        """Main monitoring loop"""
        while self.is_monitoring:
            try:
                self._collect_system_metrics()
                self._log_performance_metrics()
                time.sleep(interval)
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
                time.sleep(interval)
    
    def _collect_system_metrics(self):
        """Collect system resource metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Network I/O
            network_io = psutil.net_io_counters()
            
            system_metric = {
                'timestamp': datetime.now().isoformat(),
                'cpu_percent': cpu_percent,
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent,
                    'used': memory.used
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'percent': disk.percent
                },
                'network': {
                    'bytes_sent': network_io.bytes_sent,
                    'bytes_recv': network_io.bytes_recv,
                    'packets_sent': network_io.packets_sent,
                    'packets_recv': network_io.packets_recv
                }
            }
            
            self.system_metrics.append(system_metric)
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {str(e)}")
    
    def record_data_transmission(self, success: bool, response_time: float = None, data_size: int = 0):
        """Record a data transmission event"""
        if success:
            self.counters['data_points_sent'] += 1
            self.counters['api_calls_successful'] += 1
        else:
            self.counters['data_points_failed'] += 1
            self.counters['api_calls_failed'] += 1
        
        if response_time is not None:
            self.response_times.append(response_time)
        
        if data_size > 0:
            self.counters['bytes_transmitted'] += data_size
    
    def record_error(self, error_type: str, error_message: str):
        """Record an error event"""
        self.counters['errors_encountered'] += 1
        
        error_record = {
            'timestamp': datetime.now().isoformat(),
            'error_type': error_type,
            'error_message': error_message
        }
        
        # Store error in metrics history
        self.metrics_history.append({
            'type': 'error',
            'data': error_record
        })
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get current performance summary"""
        uptime = time.time() - self.start_time
        
        # Calculate success rate
        total_attempts = self.counters['data_points_sent'] + self.counters['data_points_failed']
        success_rate = (self.counters['data_points_sent'] / total_attempts * 100) if total_attempts > 0 else 0
        
        # Calculate average response time
        avg_response_time = sum(self.response_times) / len(self.response_times) if self.response_times else 0
        
        # Calculate data transmission rate
        data_rate = self.counters['data_points_sent'] / (uptime / 60) if uptime > 0 else 0  # per minute
        
        # Get latest system metrics
        latest_system = self.system_metrics[-1] if self.system_metrics else {}
        
        return {
            'uptime_seconds': uptime,
            'uptime_formatted': str(timedelta(seconds=int(uptime))),
            'counters': self.counters.copy(),
            'success_rate_percent': round(success_rate, 2),
            'average_response_time_ms': round(avg_response_time * 1000, 2),
            'data_transmission_rate_per_minute': round(data_rate, 2),
            'total_data_points': total_attempts,
            'system_metrics': latest_system,
            'monitoring_active': self.is_monitoring
        }
    
    def get_historical_metrics(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get historical metrics for the specified time period"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        historical = []
        for metric in self.metrics_history:
            if 'timestamp' in metric.get('data', {}):
                metric_time = datetime.fromisoformat(metric['data']['timestamp'])
                if metric_time >= cutoff_time:
                    historical.append(metric)
        
        return historical
    
    def _log_performance_metrics(self):
        """Log current performance metrics"""
        try:
            summary = self.get_performance_summary()
            
            # Log to performance logger
            perf_logger = logging.getLogger('neersetu_iot_simulator.performance')
            perf_logger.info(f"Performance metrics: {summary}")
            
        except Exception as e:
            logger.error(f"Error logging performance metrics: {str(e)}")
    
    def reset_counters(self):
        """Reset all performance counters"""
        for key in self.counters:
            self.counters[key] = 0
        
        self.response_times.clear()
        self.metrics_history.clear()
        self.system_metrics.clear()
        
        logger.info("Performance counters reset")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get system health status"""
        try:
            summary = self.get_performance_summary()
            
            # Determine health status
            health_status = "HEALTHY"
            warnings = []
            
            # Check success rate
            if summary['success_rate_percent'] < 80:
                health_status = "DEGRADED"
                warnings.append(f"Low success rate: {summary['success_rate_percent']}%")
            
            # Check response time
            if summary['average_response_time_ms'] > 5000:  # 5 seconds
                health_status = "DEGRADED"
                warnings.append(f"High response time: {summary['average_response_time_ms']}ms")
            
            # Check system resources
            if self.system_metrics:
                latest = self.system_metrics[-1]
                if latest.get('cpu_percent', 0) > 90:
                    health_status = "DEGRADED"
                    warnings.append(f"High CPU usage: {latest['cpu_percent']}%")
                
                if latest.get('memory', {}).get('percent', 0) > 90:
                    health_status = "DEGRADED"
                    warnings.append(f"High memory usage: {latest['memory']['percent']}%")
            
            # Check error rate
            error_rate = (summary['counters']['errors_encountered'] / 
                        max(summary['total_data_points'], 1)) * 100
            if error_rate > 10:
                health_status = "DEGRADED"
                warnings.append(f"High error rate: {error_rate:.2f}%")
            
            return {
                'status': health_status,
                'warnings': warnings,
                'summary': summary,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting health status: {str(e)}")
            return {
                'status': 'ERROR',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
