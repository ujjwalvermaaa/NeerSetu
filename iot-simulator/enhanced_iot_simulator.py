#!/usr/bin/env python3
"""
Enhanced NeerSetu IoT Data Simulator
Advanced IoT sensor data simulation with comprehensive monitoring and analytics
"""

import pandas as pd
import numpy as np
import requests
import time
import random
import json
import os
import signal
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import argparse
import threading
from concurrent.futures import ThreadPoolExecutor

# Import our custom modules
from src.logger import iot_logger, logger
from src.data_processor import DataProcessor
from src.performance_monitor import PerformanceMonitor
from src.config import config

class EnhancedIoTSimulator:
    def __init__(self, backend_url: str = None, dataset_path: str = None):
        self.backend_url = backend_url or config.BACKEND_URL
        self.dataset_path = dataset_path or config.DATASET_PATH
        self.data = None
        self.current_index = 0
        self.is_running = False
        self.stop_event = threading.Event()
        
        # Initialize components
        self.data_processor = DataProcessor()
        self.performance_monitor = PerformanceMonitor()
        
        # Setup session
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'NeerSetu-IoT-Simulator/2.0',
            'X-Simulator-Version': '2.0'
        })
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        # Statistics
        self.stats = {
            'start_time': None,
            'total_sent': 0,
            'total_failed': 0,
            'total_errors': 0,
            'last_success_time': None,
            'last_error_time': None
        }
        
        logger.info("Enhanced IoT Simulator initialized")
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        self.stop_simulation()
        sys.exit(0)
    
    def load_dataset(self) -> bool:
        """Load and validate the water quality dataset"""
        try:
            logger.info(f"Loading dataset from: {self.dataset_path}")
            
            if not os.path.exists(self.dataset_path):
                logger.error(f"Dataset file not found: {self.dataset_path}")
                return False
            
            self.data = pd.read_csv(self.dataset_path)
            logger.info(f"Dataset loaded successfully with {len(self.data)} records")
            logger.info(f"Columns: {list(self.data.columns)}")
            
            # Validate required columns
            required_columns = ['village', 'state', 'pH', 'turbidity_ntu', 
                              'bacteria_ecoli_cfu_100ml', 'bacteria_coliform_cfu_100ml']
            
            missing_columns = [col for col in required_columns if col not in self.data.columns]
            if missing_columns:
                logger.error(f"Missing required columns: {missing_columns}")
                return False
            
            # Add missing optional columns with default values
            if 'district' not in self.data.columns:
                self.data['district'] = 'Unknown District'
                logger.warning("Added missing 'district' column with default values")
            
            # Data quality check
            null_counts = self.data.isnull().sum()
            if null_counts.any():
                logger.warning(f"Dataset contains null values: {null_counts[null_counts > 0].to_dict()}")
            
            logger.info("Dataset validation completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading dataset: {str(e)}")
            return False
    
    def prepare_enhanced_iot_data(self, row: pd.Series) -> Optional[Dict[str, Any]]:
        """Prepare enhanced IoT data with comprehensive sensor simulation"""
        try:
            # Add realistic sensor variations
            ph_variation = random.uniform(-config.SENSOR_VARIATION, config.SENSOR_VARIATION)
            turbidity_variation = random.uniform(-config.SENSOR_VARIATION * 2, config.SENSOR_VARIATION * 2)
            bacteria_variation = random.uniform(0.8, 1.2)
            
            # Simulate sensor battery and signal strength
            battery_level = max(20, random.randint(20, 100) - int(self.stats['total_sent'] * config.BATTERY_DRAIN_RATE))
            signal_strength = random.randint(
                max(60, 100 - config.SIGNAL_STRENGTH_VARIATION),
                100
            )
            
            # Simulate environmental conditions
            temperature = random.uniform(15, 35)
            humidity = random.uniform(40, 90)
            
            iot_data = {
                "village": str(row['village']),
                "state": str(row['state']),
                "district": str(row['district']),
                "waterSource": {
                    "id": str(row.get('water_source_id', f"WS_{random.randint(1000, 9999)}")),
                    "type": str(row.get('water_source_type', 'Groundwater')),
                    "location": {
                        "latitude": float(row.get('latitude', random.uniform(20, 30))),
                        "longitude": float(row.get('longitude', random.uniform(90, 100)))
                    }
                },
                "qualityParameters": {
                    "pH": {
                        "value": round(max(0, min(14, float(row['pH']) + ph_variation)), 2),
                        "unit": "pH",
                        "standard": 6.5,
                        "status": "Safe" if 6.5 <= (row['pH'] + ph_variation) <= 8.5 else "Unsafe"
                    },
                    "turbidity": {
                        "value": round(max(0, float(row['turbidity_ntu']) + turbidity_variation), 1),
                        "unit": "NTU",
                        "standard": 5.0,
                        "status": "Safe" if (row['turbidity_ntu'] + turbidity_variation) < 5.0 else "Unsafe"
                    },
                    "bacteriaEcoli": {
                        "value": round(max(0, float(row['bacteria_ecoli_cfu_100ml']) * bacteria_variation), 1),
                        "unit": "CFU/100ml",
                        "standard": 100,
                        "status": "Safe" if (row['bacteria_ecoli_cfu_100ml'] * bacteria_variation) < 100 else "Unsafe"
                    },
                    "bacteriaColiform": {
                        "value": round(max(0, float(row['bacteria_coliform_cfu_100ml']) * bacteria_variation), 1),
                        "unit": "CFU/100ml",
                        "standard": 1000,
                        "status": "Safe" if (row['bacteria_coliform_cfu_100ml'] * bacteria_variation) < 1000 else "Unsafe"
                    },
                    "dissolvedOxygen": {
                        "value": round(float(row.get('dissolved_oxygen_mg_l', random.uniform(4, 8))), 1),
                        "unit": "mg/L",
                        "standard": 5.0,
                        "status": "Safe" if row.get('dissolved_oxygen_mg_l', 5) >= 5.0 else "Unsafe"
                    },
                    "nitrates": {
                        "value": round(float(row.get('nitrates_mg_l', random.uniform(0, 50))), 2),
                        "unit": "mg/L",
                        "standard": 45,
                        "status": "Safe" if row.get('nitrates_mg_l', 25) <= 45 else "Unsafe"
                    },
                    "phosphates": {
                        "value": round(float(row.get('phosphates_mg_l', random.uniform(0, 0.2))), 2),
                        "unit": "mg/L",
                        "standard": 0.1,
                        "status": "Safe" if row.get('phosphates_mg_l', 0.05) <= 0.1 else "Unsafe"
                    },
                    "heavyMetals": {
                        "value": round(float(row.get('heavy_metals_mg_l', random.uniform(0, 0.02))), 3),
                        "unit": "mg/L",
                        "standard": 0.01,
                        "status": "Safe" if row.get('heavy_metals_mg_l', 0.005) <= 0.01 else "Unsafe"
                    },
                    "chlorineResidual": {
                        "value": round(float(row.get('chlorine_residual_mg_l', random.uniform(0, 0.5))), 3),
                        "unit": "mg/L",
                        "standard": 0.2,
                        "status": "Safe" if row.get('chlorine_residual_mg_l', 0.3) >= 0.2 else "Unsafe"
                    },
                    "fluoride": {
                        "value": round(float(row.get('fluoride_mg_l', random.uniform(0, 2))), 2),
                        "unit": "mg/L",
                        "standard": 1.5,
                        "status": "Safe" if row.get('fluoride_mg_l', 0.8) <= 1.5 else "Unsafe"
                    },
                    "arsenic": {
                        "value": round(float(row.get('arsenic_mg_l', random.uniform(0, 0.02))), 3),
                        "unit": "mg/L",
                        "standard": 0.01,
                        "status": "Safe" if row.get('arsenic_mg_l', 0.005) <= 0.01 else "Unsafe"
                    }
                },
                "environmentalConditions": {
                    "temperature": round(temperature, 1),
                    "humidity": round(humidity, 1),
                    "weatherCondition": random.choice(['Clear', 'Cloudy', 'Rainy', 'Foggy']),
                    "rainfall": round(random.uniform(0, 50), 1)
                },
                "testingInfo": {
                    "method": str(row.get('test_method', 'IoT Sensor')),
                    "agency": str(row.get('testing_agency', 'NeerSetu IoT Network')),
                    "equipmentId": f"IoT_{row.get('water_source_id', random.randint(1000, 9999))}",
                    "calibrationDate": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
                },
                "overallStatus": {
                    "isPotable": bool(row.get('is_potable', True)),
                    "contaminationLevel": str(row.get('contamination_level', 'Low')),
                    "riskScore": random.randint(0, 100)
                },
                "sensorMetadata": {
                    "sensorId": f"IoT_{row.get('water_source_id', random.randint(1000, 9999))}",
                    "batteryLevel": battery_level,
                    "signalStrength": signal_strength,
                    "firmwareVersion": "2.1.0",
                    "lastMaintenance": (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat(),
                    "isIotData": True
                },
                "timestamp": datetime.now().isoformat(),
                "transmissionId": f"TX_{int(time.time())}_{random.randint(1000, 9999)}"
            }
            
            # Process data if validation is enabled
            if config.ENABLE_QUALITY_VALIDATION:
                is_valid, issues = self.data_processor.validate_data_quality(iot_data)
                if not is_valid:
                    logger.warning(f"Data quality issues for {iot_data['village']}: {issues}")
            
            # Calculate risk score if enabled
            if config.ENABLE_RISK_CALCULATION:
                risk_score = self.data_processor.calculate_risk_score(iot_data)
                iot_data['overallStatus']['riskScore'] = risk_score
            
            # Detect anomalies if enabled
            if config.ENABLE_ANOMALY_DETECTION:
                anomalies = self.data_processor.detect_anomalies(iot_data)
                if anomalies:
                    iot_data['anomalies'] = anomalies
                    logger.warning(f"Anomalies detected for {iot_data['village']}: {anomalies}")
            
            return iot_data
            
        except Exception as e:
            logger.error(f"Error preparing IoT data: {str(e)}")
            self.performance_monitor.record_error('data_preparation', str(e))
            return None
    
    def send_iot_data(self, iot_data: Dict[str, Any]) -> bool:
        """Send IoT data to backend API with retry logic"""
        start_time = time.time()
        
        for attempt in range(config.MAX_RETRIES + 1):
            try:
                url = f"{self.backend_url}{config.ENDPOINTS['water_reports']}"
                
                response = self.session.post(
                    url, 
                    json=iot_data, 
                    timeout=config.API_TIMEOUT
                )
                
                response_time = time.time() - start_time
                
                if response.status_code == 201:
                    self.stats['total_sent'] += 1
                    self.stats['last_success_time'] = datetime.now()
                    
                    # Record performance metrics
                    self.performance_monitor.record_data_transmission(
                        success=True, 
                        response_time=response_time,
                        data_size=len(json.dumps(iot_data))
                    )
                    
                    # Log data transmission
                    iot_logger.log_data_transmission(
                        village=iot_data['village'],
                        status='SUCCESS',
                        details={
                            'risk_score': iot_data['overallStatus']['riskScore'],
                            'response_time_ms': round(response_time * 1000, 2),
                            'attempt': attempt + 1
                        }
                    )
                    
                    logger.info(f"✅ Sent data for {iot_data['village']} - Risk: {iot_data['overallStatus']['riskScore']} - Time: {response_time:.2f}s")
                    return True
                    
                else:
                    logger.warning(f"❌ Attempt {attempt + 1} failed for {iot_data['village']}: {response.status_code} - {response.text}")
                    
                    if attempt < config.MAX_RETRIES:
                        time.sleep(config.RETRY_DELAY * (attempt + 1))  # Exponential backoff
                    
            except requests.exceptions.RequestException as e:
                logger.warning(f"❌ Network error attempt {attempt + 1} for {iot_data['village']}: {str(e)}")
                
                if attempt < config.MAX_RETRIES:
                    time.sleep(config.RETRY_DELAY * (attempt + 1))
                    
            except Exception as e:
                logger.error(f"❌ Unexpected error attempt {attempt + 1} for {iot_data['village']}: {str(e)}")
                self.performance_monitor.record_error('api_call', str(e))
                break
        
        # All attempts failed
        self.stats['total_failed'] += 1
        self.stats['total_errors'] += 1
        self.stats['last_error_time'] = datetime.now()
        
        self.performance_monitor.record_data_transmission(success=False)
        
        iot_logger.log_data_transmission(
            village=iot_data['village'],
            status='FAILED',
            details={'attempts': config.MAX_RETRIES + 1}
        )
        
        return False
    
    def simulate_single_data_point(self) -> bool:
        """Simulate a single IoT data point"""
        if self.data is None or self.current_index >= len(self.data):
            logger.warning("No more data to simulate")
            return False
        
        row = self.data.iloc[self.current_index]
        iot_data = self.prepare_enhanced_iot_data(row)
        
        if iot_data is None:
            self.current_index += 1
            return False
        
        success = self.send_iot_data(iot_data)
        self.current_index += 1
        
        return success
    
    def simulate_continuous(self, interval_seconds: int = None, max_records: int = None):
        """Simulate continuous IoT data streaming with enhanced monitoring"""
        interval = interval_seconds or config.DEFAULT_INTERVAL
        max_records = max_records or config.MAX_RECORDS
        
        logger.info("🚀 Starting Enhanced Continuous IoT Simulation")
        logger.info(f"📊 Backend URL: {self.backend_url}")
        logger.info(f"⏱️  Interval: {interval} seconds")
        logger.info(f"📈 Max records: {max_records or 'All'}")
        logger.info(f"🔧 Features: Validation={config.ENABLE_QUALITY_VALIDATION}, "
                   f"Anomaly Detection={config.ENABLE_ANOMALY_DETECTION}, "
                   f"Risk Calculation={config.ENABLE_RISK_CALCULATION}")
        logger.info("=" * 60)
        
        self.is_running = True
        self.stats['start_time'] = datetime.now()
        
        # Start performance monitoring
        if config.PERFORMANCE_MONITORING:
            self.performance_monitor.start_monitoring(config.MONITORING_INTERVAL)
        
        try:
            while self.is_running and not self.stop_event.is_set():
                if max_records and self.stats['total_sent'] >= max_records:
                    logger.info(f"✅ Reached maximum records limit: {max_records}")
                    break
                
                if self.current_index >= len(self.data):
                    logger.info("🔄 Restarting from beginning of dataset")
                    self.current_index = 0
                
                success = self.simulate_single_data_point()
                
                # Log progress every 10 records
                if (self.stats['total_sent'] + self.stats['total_failed']) % 10 == 0:
                    self._log_progress()
                
                # Wait before next transmission
                self.stop_event.wait(interval)
                
        except KeyboardInterrupt:
            logger.info("\n🛑 Simulation stopped by user")
        except Exception as e:
            logger.error(f"❌ Simulation error: {str(e)}")
            self.performance_monitor.record_error('simulation', str(e))
        finally:
            self._finalize_simulation()
    
    def simulate_batch(self, batch_size: int = None, delay_seconds: int = None):
        """Simulate batch IoT data transmission with parallel processing"""
        batch_size = batch_size or config.DEFAULT_BATCH_SIZE
        delay = delay_seconds or config.DEFAULT_BATCH_DELAY
        
        logger.info("🚀 Starting Enhanced Batch IoT Simulation")
        logger.info(f"📊 Batch size: {batch_size}")
        logger.info(f"⏱️  Delay between batches: {delay} seconds")
        logger.info(f"🔧 Parallel processing enabled")
        logger.info("=" * 60)
        
        self.is_running = True
        self.stats['start_time'] = datetime.now()
        
        # Start performance monitoring
        if config.PERFORMANCE_MONITORING:
            self.performance_monitor.start_monitoring(config.MONITORING_INTERVAL)
        
        try:
            with ThreadPoolExecutor(max_workers=min(batch_size, 5)) as executor:
                for batch_num in range(0, len(self.data), batch_size):
                    if not self.is_running or self.stop_event.is_set():
                        break
                    
                    batch_data = self.data.iloc[batch_num:batch_num + batch_size]
                    
                    logger.info(f"📦 Processing batch {batch_num // batch_size + 1}")
                    
                    # Prepare all data points in the batch
                    iot_data_list = []
                    for _, row in batch_data.iterrows():
                        iot_data = self.prepare_enhanced_iot_data(row)
                        if iot_data:
                            iot_data_list.append(iot_data)
                    
                    # Send data points in parallel
                    futures = []
                    for iot_data in iot_data_list:
                        future = executor.submit(self.send_iot_data, iot_data)
                        futures.append(future)
                    
                    # Wait for all transmissions to complete
                    for future in futures:
                        try:
                            future.result(timeout=config.API_TIMEOUT * 2)
                        except Exception as e:
                            logger.error(f"Batch transmission error: {str(e)}")
                    
                    logger.info(f"✅ Batch {batch_num // batch_size + 1} completed")
                    self._log_progress()
                    
                    # Delay between batches
                    if batch_num + batch_size < len(self.data) and not self.stop_event.is_set():
                        self.stop_event.wait(delay)
                
        except KeyboardInterrupt:
            logger.info("\n🛑 Batch simulation stopped by user")
        except Exception as e:
            logger.error(f"❌ Batch simulation error: {str(e)}")
            self.performance_monitor.record_error('batch_simulation', str(e))
        finally:
            self._finalize_simulation()
    
    def test_connection(self) -> bool:
        """Test connection to backend with comprehensive health check"""
        try:
            # Test basic connectivity
            url = f"{self.backend_url}{config.ENDPOINTS['health_check']}"
            response = self.session.get(url, timeout=config.API_TIMEOUT)
            
            if response.status_code == 200:
                logger.info("✅ Backend connection successful")
                
                # Test API endpoint
                test_url = f"{self.backend_url}{config.ENDPOINTS['water_reports']}"
                test_response = self.session.get(test_url, timeout=config.API_TIMEOUT)
                
                if test_response.status_code in [200, 405]:  # 405 is OK for GET on POST endpoint
                    logger.info("✅ API endpoint accessible")
                    return True
                else:
                    logger.warning(f"⚠️  API endpoint returned {test_response.status_code}")
                    return False
            else:
                logger.error(f"❌ Backend connection failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Backend connection error: {str(e)}")
            return False
    
    def stop_simulation(self):
        """Stop the simulation gracefully"""
        logger.info("🛑 Stopping simulation...")
        self.is_running = False
        self.stop_event.set()
        
        if config.PERFORMANCE_MONITORING:
            self.performance_monitor.stop_monitoring()
    
    def _log_progress(self):
        """Log current progress and statistics"""
        total_attempts = self.stats['total_sent'] + self.stats['total_failed']
        success_rate = (self.stats['total_sent'] / total_attempts * 100) if total_attempts > 0 else 0
        
        uptime = datetime.now() - self.stats['start_time'] if self.stats['start_time'] else timedelta(0)
        
        logger.info(f"📊 Progress: {self.stats['total_sent']} sent, {self.stats['total_failed']} failed "
                   f"(Success: {success_rate:.1f}%, Uptime: {str(uptime).split('.')[0]})")
    
    def _finalize_simulation(self):
        """Finalize simulation and log summary"""
        self.is_running = False
        
        if config.PERFORMANCE_MONITORING:
            self.performance_monitor.stop_monitoring()
        
        # Get final performance summary
        perf_summary = self.performance_monitor.get_performance_summary()
        
        logger.info("=" * 60)
        logger.info("🏁 SIMULATION COMPLETED")
        logger.info(f"📊 Final Stats: {self.stats['total_sent']} sent, {self.stats['total_failed']} failed")
        logger.info(f"⏱️  Total Runtime: {perf_summary['uptime_formatted']}")
        logger.info(f"📈 Success Rate: {perf_summary['success_rate_percent']}%")
        logger.info(f"⚡ Avg Response Time: {perf_summary['average_response_time_ms']}ms")
        logger.info(f"📊 Data Rate: {perf_summary['data_transmission_rate_per_minute']} records/min")
        
        # Log performance metrics
        iot_logger.log_performance_metrics(perf_summary)
        
        # Log system health
        health_status = self.performance_monitor.get_health_status()
        iot_logger.log_system_health(health_status)
        
        logger.info("=" * 60)

def main():
    """Main function to run the enhanced IoT simulator"""
    parser = argparse.ArgumentParser(description='Enhanced NeerSetu IoT Data Simulator')
    parser.add_argument('--backend-url', default=config.BACKEND_URL, 
                       help='Backend API URL')
    parser.add_argument('--dataset', default=config.DATASET_PATH,
                       help='Path to water quality dataset')
    parser.add_argument('--mode', choices=['continuous', 'batch'], default='continuous',
                       help='Simulation mode')
    parser.add_argument('--interval', type=int, default=config.DEFAULT_INTERVAL,
                       help='Interval between data points in seconds (continuous mode)')
    parser.add_argument('--batch-size', type=int, default=config.DEFAULT_BATCH_SIZE,
                       help='Batch size (batch mode)')
    parser.add_argument('--delay', type=int, default=config.DEFAULT_BATCH_DELAY,
                       help='Delay between batches in seconds (batch mode)')
    parser.add_argument('--max-records', type=int, default=config.MAX_RECORDS,
                       help='Maximum number of records to send')
    parser.add_argument('--test-only', action='store_true',
                       help='Test connection only')
    parser.add_argument('--config', action='store_true',
                       help='Show current configuration')
    
    args = parser.parse_args()
    
    # Show configuration if requested
    if args.config:
        print("Current Configuration:")
        print(json.dumps(config.get_config_dict(), indent=2))
        return
    
    # Validate configuration
    if not config.validate_config():
        logger.error("❌ Configuration validation failed. Exiting.")
        return
    
    # Create simulator instance
    simulator = EnhancedIoTSimulator(args.backend_url, args.dataset)
    
    # Test connection first
    if not simulator.test_connection():
        logger.error("❌ Cannot connect to backend. Exiting.")
        return
    
    if args.test_only:
        logger.info("✅ Connection test successful. Exiting.")
        return
    
    # Load dataset
    if not simulator.load_dataset():
        logger.error("❌ Cannot load dataset. Exiting.")
        return
    
    # Run simulation based on mode
    try:
        if args.mode == 'continuous':
            simulator.simulate_continuous(args.interval, args.max_records)
        elif args.mode == 'batch':
            simulator.simulate_batch(args.batch_size, args.delay)
    except KeyboardInterrupt:
        logger.info("\n🛑 Simulation interrupted by user")
    finally:
        simulator.stop_simulation()

if __name__ == "__main__":
    main()
