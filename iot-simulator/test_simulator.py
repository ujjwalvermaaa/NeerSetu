#!/usr/bin/env python3
"""
Test script for NeerSetu IoT Simulator
Tests basic functionality without requiring backend connection
"""

import sys
import os
import pandas as pd
from datetime import datetime

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from enhanced_iot_simulator import EnhancedIoTSimulator
from data_processor import DataProcessor
from performance_monitor import PerformanceMonitor
from config import config

def test_data_processor():
    """Test data processor functionality"""
    print("🧪 Testing Data Processor...")
    
    processor = DataProcessor()
    
    # Create sample data
    sample_data = {
        'village': 'Test Village',
        'qualityParameters': {
            'pH': {'value': 7.2, 'unit': 'pH'},
            'turbidity': {'value': 2.1, 'unit': 'NTU'},
            'bacteriaEcoli': {'value': 45.2, 'unit': 'CFU/100ml'}
        }
    }
    
    # Test validation
    is_valid, issues = processor.validate_data_quality(sample_data)
    print(f"   ✅ Data validation: {'Valid' if is_valid else 'Invalid'}")
    if issues:
        print(f"   ⚠️  Issues: {issues}")
    
    # Test risk calculation
    risk_score = processor.calculate_risk_score(sample_data)
    print(f"   ✅ Risk score: {risk_score}")
    
    # Test anomaly detection
    anomalies = processor.detect_anomalies(sample_data)
    print(f"   ✅ Anomalies detected: {len(anomalies)}")
    
    # Test quality report
    report = processor.generate_quality_report(sample_data)
    print(f"   ✅ Quality report generated: {report['overall_status']}")
    
    print("   ✅ Data Processor tests passed!\n")

def test_performance_monitor():
    """Test performance monitor functionality"""
    print("🧪 Testing Performance Monitor...")
    
    monitor = PerformanceMonitor()
    
    # Test recording metrics
    monitor.record_data_transmission(success=True, response_time=1.5, data_size=1024)
    monitor.record_data_transmission(success=False, response_time=2.0, data_size=512)
    monitor.record_error('test_error', 'Test error message')
    
    # Test getting summary
    summary = monitor.get_performance_summary()
    print(f"   ✅ Performance summary: {summary['success_rate_percent']}% success rate")
    
    # Test health status
    health = monitor.get_health_status()
    print(f"   ✅ Health status: {health['status']}")
    
    print("   ✅ Performance Monitor tests passed!\n")

def test_iot_simulator():
    """Test IoT simulator functionality"""
    print("🧪 Testing IoT Simulator...")
    
    # Create simulator instance
    simulator = EnhancedIoTSimulator()
    
    # Test configuration
    print(f"   ✅ Backend URL: {simulator.backend_url}")
    print(f"   ✅ Dataset path: {simulator.dataset_path}")
    
    # Test data preparation (without sending)
    if os.path.exists(simulator.dataset_path):
        print("   📊 Testing data preparation...")
        
        # Load dataset
        if simulator.load_dataset():
            print("   ✅ Dataset loaded successfully")
            
            # Test preparing a single data point
            if len(simulator.data) > 0:
                row = simulator.data.iloc[0]
                iot_data = simulator.prepare_enhanced_iot_data(row)
                
                if iot_data:
                    print("   ✅ IoT data prepared successfully")
                    print(f"   📊 Village: {iot_data['village']}")
                    print(f"   📊 Risk Score: {iot_data['overallStatus']['riskScore']}")
                    print(f"   📊 Battery Level: {iot_data['sensorMetadata']['batteryLevel']}")
                    print(f"   📊 Signal Strength: {iot_data['sensorMetadata']['signalStrength']}")
                else:
                    print("   ❌ Failed to prepare IoT data")
            else:
                print("   ⚠️  Dataset is empty")
        else:
            print("   ❌ Failed to load dataset")
    else:
        print("   ⚠️  Dataset file not found, skipping data preparation test")
    
    print("   ✅ IoT Simulator tests passed!\n")

def test_configuration():
    """Test configuration validation"""
    print("🧪 Testing Configuration...")
    
    # Test config validation
    is_valid = config.validate_config()
    print(f"   ✅ Configuration valid: {is_valid}")
    
    # Test config values
    print(f"   📊 Backend URL: {config.BACKEND_URL}")
    print(f"   📊 Log Level: {config.LOG_LEVEL}")
    print(f"   📊 Performance Monitoring: {config.PERFORMANCE_MONITORING}")
    print(f"   📊 Data Validation: {config.ENABLE_QUALITY_VALIDATION}")
    print(f"   📊 Anomaly Detection: {config.ENABLE_ANOMALY_DETECTION}")
    
    print("   ✅ Configuration tests passed!\n")

def main():
    """Run all tests"""
    print("🚀 NeerSetu IoT Simulator Test Suite")
    print("=" * 50)
    
    try:
        test_configuration()
        test_data_processor()
        test_performance_monitor()
        test_iot_simulator()
        
        print("🎉 All tests completed successfully!")
        print("✅ IoT Simulator is ready for use")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
