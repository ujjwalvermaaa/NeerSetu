#!/usr/bin/env python3
"""
NeerSetu IoT Data Simulator
Simulates IoT sensor data for water quality monitoring
"""

import pandas as pd
import numpy as np
import requests
import time
import random
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IoTSimulator:
    def __init__(self, backend_url: str = None, dataset_path: str = None):
        self.backend_url = backend_url or os.getenv('BACKEND_URL', 'http://localhost:5000')
        self.dataset_path = dataset_path or '../Datasets/2_Water_Quality_Data_NE_India.csv'
        self.data = None
        self.current_index = 0
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'NeerSetu-IoT-Simulator/1.0'
        })
        
    def load_dataset(self):
        """Load the water quality dataset"""
        try:
            logger.info(f"Loading dataset from: {self.dataset_path}")
            self.data = pd.read_csv(self.dataset_path)
            logger.info(f"Dataset loaded with {len(self.data)} records")
            logger.info(f"Columns: {list(self.data.columns)}")
            return True
        except Exception as e:
            logger.error(f"Error loading dataset: {str(e)}")
            return False
    
    def prepare_iot_data(self, row: pd.Series) -> Dict[str, Any]:
        """Prepare IoT data from dataset row"""
        try:
            # Add some realistic IoT sensor variations
            ph_variation = random.uniform(-0.2, 0.2)
            turbidity_variation = random.uniform(-1.0, 1.0)
            bacteria_variation = random.uniform(0.8, 1.2)
            
            iot_data = {
                "village": row['village'],
                "state": row['state'],
                "district": row['district'],
                "waterSource": {
                    "id": row['water_source_id'],
                    "type": row['water_source_type'],
                    "location": {
                        "latitude": float(row['latitude']),
                        "longitude": float(row['longitude'])
                    }
                },
                "qualityParameters": {
                    "pH": {
                        "value": round(float(row['pH']) + ph_variation, 2),
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
                        "value": round(float(row['bacteria_ecoli_cfu_100ml']) * bacteria_variation, 1),
                        "unit": "CFU/100ml",
                        "standard": 100,
                        "status": "Safe" if (row['bacteria_ecoli_cfu_100ml'] * bacteria_variation) < 100 else "Unsafe"
                    },
                    "bacteriaColiform": {
                        "value": round(float(row['bacteria_coliform_cfu_100ml']) * bacteria_variation, 1),
                        "unit": "CFU/100ml",
                        "standard": 1000,
                        "status": "Safe" if (row['bacteria_coliform_cfu_100ml'] * bacteria_variation) < 1000 else "Unsafe"
                    },
                    "dissolvedOxygen": {
                        "value": round(float(row['dissolved_oxygen_mg_l']), 1),
                        "unit": "mg/L",
                        "standard": 5.0,
                        "status": "Safe" if row['dissolved_oxygen_mg_l'] >= 5.0 else "Unsafe"
                    },
                    "nitrates": {
                        "value": round(float(row['nitrates_mg_l']), 2),
                        "unit": "mg/L",
                        "standard": 45,
                        "status": "Safe" if row['nitrates_mg_l'] <= 45 else "Unsafe"
                    },
                    "phosphates": {
                        "value": round(float(row['phosphates_mg_l']), 2),
                        "unit": "mg/L",
                        "standard": 0.1,
                        "status": "Safe" if row['phosphates_mg_l'] <= 0.1 else "Unsafe"
                    },
                    "heavyMetals": {
                        "value": round(float(row['heavy_metals_mg_l']), 3),
                        "unit": "mg/L",
                        "standard": 0.01,
                        "status": "Safe" if row['heavy_metals_mg_l'] <= 0.01 else "Unsafe"
                    },
                    "chlorineResidual": {
                        "value": round(float(row['chlorine_residual_mg_l']), 3),
                        "unit": "mg/L",
                        "standard": 0.2,
                        "status": "Safe" if row['chlorine_residual_mg_l'] >= 0.2 else "Unsafe"
                    },
                    "fluoride": {
                        "value": round(float(row['fluoride_mg_l']), 2),
                        "unit": "mg/L",
                        "standard": 1.5,
                        "status": "Safe" if row['fluoride_mg_l'] <= 1.5 else "Unsafe"
                    },
                    "arsenic": {
                        "value": round(float(row['arsenic_mg_l']), 3),
                        "unit": "mg/L",
                        "standard": 0.01,
                        "status": "Safe" if row['arsenic_mg_l'] <= 0.01 else "Unsafe"
                    }
                },
                "testingInfo": {
                    "method": row['test_method'],
                    "agency": row['testing_agency']
                },
                "overallStatus": {
                    "isPotable": bool(row['is_potable']),
                    "contaminationLevel": row['contamination_level'],
                    "riskScore": random.randint(0, 100)
                },
                "isIotData": True,
                "timestamp": datetime.now().isoformat(),
                "sensorId": f"IoT_{row['water_source_id']}",
                "batteryLevel": random.randint(20, 100),
                "signalStrength": random.randint(60, 100)
            }
            
            return iot_data
            
        except Exception as e:
            logger.error(f"Error preparing IoT data: {str(e)}")
            return None
    
    def send_iot_data(self, iot_data: Dict[str, Any]) -> bool:
        """Send IoT data to backend API"""
        try:
            url = f"{self.backend_url}/api/water-reports"
            
            response = self.session.post(url, json=iot_data, timeout=10)
            
            if response.status_code == 201:
                logger.info(f"✅ Sent data for {iot_data['village']} - Risk Score: {iot_data['overallStatus']['riskScore']}")
                return True
            else:
                logger.error(f"❌ Failed to send data for {iot_data['village']}: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Network error sending data for {iot_data['village']}: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"❌ Error sending data for {iot_data['village']}: {str(e)}")
            return False
    
    def simulate_single_data_point(self) -> bool:
        """Simulate a single IoT data point"""
        if self.data is None or self.current_index >= len(self.data):
            logger.warning("No more data to simulate")
            return False
        
        row = self.data.iloc[self.current_index]
        iot_data = self.prepare_iot_data(row)
        
        if iot_data is None:
            self.current_index += 1
            return False
        
        success = self.send_iot_data(iot_data)
        self.current_index += 1
        
        return success
    
    def simulate_continuous(self, interval_seconds: int = 30, max_records: int = None):
        """Simulate continuous IoT data streaming"""
        logger.info(f"🚀 Starting continuous IoT simulation")
        logger.info(f"📊 Backend URL: {self.backend_url}")
        logger.info(f"⏱️  Interval: {interval_seconds} seconds")
        logger.info(f"📈 Max records: {max_records or 'All'}")
        logger.info("=" * 50)
        
        sent_count = 0
        failed_count = 0
        
        try:
            while True:
                if max_records and sent_count >= max_records:
                    logger.info(f"✅ Reached maximum records limit: {max_records}")
                    break
                
                if self.current_index >= len(self.data):
                    logger.info("🔄 Restarting from beginning of dataset")
                    self.current_index = 0
                
                success = self.simulate_single_data_point()
                
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
                
                # Log progress every 10 records
                if (sent_count + failed_count) % 10 == 0:
                    logger.info(f"📊 Progress: {sent_count} sent, {failed_count} failed")
                
                # Wait before next transmission
                time.sleep(interval_seconds)
                
        except KeyboardInterrupt:
            logger.info("\n🛑 Simulation stopped by user")
        except Exception as e:
            logger.error(f"❌ Simulation error: {str(e)}")
        finally:
            logger.info("=" * 50)
            logger.info(f"📊 Final Stats: {sent_count} sent, {failed_count} failed")
            logger.info("🏁 Simulation completed")
    
    def simulate_batch(self, batch_size: int = 10, delay_seconds: int = 5):
        """Simulate a batch of IoT data points"""
        logger.info(f"🚀 Starting batch IoT simulation")
        logger.info(f"📊 Batch size: {batch_size}")
        logger.info(f"⏱️  Delay between batches: {delay_seconds} seconds")
        logger.info("=" * 50)
        
        sent_count = 0
        failed_count = 0
        
        try:
            for batch_num in range(0, len(self.data), batch_size):
                batch_data = self.data.iloc[batch_num:batch_num + batch_size]
                
                logger.info(f"📦 Processing batch {batch_num // batch_size + 1}")
                
                for _, row in batch_data.iterrows():
                    iot_data = self.prepare_iot_data(row)
                    
                    if iot_data is None:
                        failed_count += 1
                        continue
                    
                    success = self.send_iot_data(iot_data)
                    
                    if success:
                        sent_count += 1
                    else:
                        failed_count += 1
                    
                    # Small delay between individual records
                    time.sleep(0.5)
                
                logger.info(f"✅ Batch {batch_num // batch_size + 1} completed: {sent_count} sent, {failed_count} failed")
                
                # Delay between batches
                if batch_num + batch_size < len(self.data):
                    time.sleep(delay_seconds)
                
        except KeyboardInterrupt:
            logger.info("\n🛑 Batch simulation stopped by user")
        except Exception as e:
            logger.error(f"❌ Batch simulation error: {str(e)}")
        finally:
            logger.info("=" * 50)
            logger.info(f"📊 Final Stats: {sent_count} sent, {failed_count} failed")
            logger.info("🏁 Batch simulation completed")
    
    def test_connection(self) -> bool:
        """Test connection to backend"""
        try:
            url = f"{self.backend_url}/health"
            response = self.session.get(url, timeout=5)
            
            if response.status_code == 200:
                logger.info("✅ Backend connection successful")
                return True
            else:
                logger.error(f"❌ Backend connection failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Backend connection error: {str(e)}")
            return False

def main():
    """Main function to run the IoT simulator"""
    import argparse
    
    parser = argparse.ArgumentParser(description='NeerSetu IoT Data Simulator')
    parser.add_argument('--backend-url', default='http://localhost:5000', 
                       help='Backend API URL')
    parser.add_argument('--dataset', default='../Datasets/2_Water_Quality_Data_NE_India.csv',
                       help='Path to water quality dataset')
    parser.add_argument('--mode', choices=['continuous', 'batch'], default='continuous',
                       help='Simulation mode')
    parser.add_argument('--interval', type=int, default=30,
                       help='Interval between data points in seconds (continuous mode)')
    parser.add_argument('--batch-size', type=int, default=10,
                       help='Batch size (batch mode)')
    parser.add_argument('--delay', type=int, default=5,
                       help='Delay between batches in seconds (batch mode)')
    parser.add_argument('--max-records', type=int, default=None,
                       help='Maximum number of records to send')
    parser.add_argument('--test-only', action='store_true',
                       help='Test connection only')
    
    args = parser.parse_args()
    
    # Create simulator instance
    simulator = IoTSimulator(args.backend_url, args.dataset)
    
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
    if args.mode == 'continuous':
        simulator.simulate_continuous(args.interval, args.max_records)
    elif args.mode == 'batch':
        simulator.simulate_batch(args.batch_size, args.delay)

if __name__ == "__main__":
    main()
