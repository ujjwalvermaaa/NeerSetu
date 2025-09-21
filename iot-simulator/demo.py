#!/usr/bin/env python3
"""
Demo script for NeerSetu IoT Simulator
Demonstrates the simulator capabilities with sample data
"""

import sys
import os
import json
import time
from datetime import datetime

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from enhanced_iot_simulator import EnhancedIoTSimulator
from data_processor import DataProcessor

def create_sample_data():
    """Create sample water quality data for demonstration"""
    sample_data = {
        'village': 'Demo Village',
        'state': 'Assam',
        'district': 'Kamrup',
        'waterSource': {
            'id': 'WS_DEMO_001',
            'type': 'Groundwater',
            'location': {
                'latitude': 26.2006,
                'longitude': 92.9376
            }
        },
        'qualityParameters': {
            'pH': {
                'value': 7.2,
                'unit': 'pH',
                'standard': 6.5,
                'status': 'Safe'
            },
            'turbidity': {
                'value': 2.1,
                'unit': 'NTU',
                'standard': 5.0,
                'status': 'Safe'
            },
            'bacteriaEcoli': {
                'value': 45.2,
                'unit': 'CFU/100ml',
                'standard': 100,
                'status': 'Safe'
            },
            'bacteriaColiform': {
                'value': 120.5,
                'unit': 'CFU/100ml',
                'standard': 1000,
                'status': 'Safe'
            },
            'dissolvedOxygen': {
                'value': 6.8,
                'unit': 'mg/L',
                'standard': 5.0,
                'status': 'Safe'
            },
            'nitrates': {
                'value': 25.3,
                'unit': 'mg/L',
                'standard': 45,
                'status': 'Safe'
            },
            'phosphates': {
                'value': 0.05,
                'unit': 'mg/L',
                'standard': 0.1,
                'status': 'Safe'
            },
            'heavyMetals': {
                'value': 0.003,
                'unit': 'mg/L',
                'standard': 0.01,
                'status': 'Safe'
            },
            'chlorineResidual': {
                'value': 0.4,
                'unit': 'mg/L',
                'standard': 0.2,
                'status': 'Safe'
            },
            'fluoride': {
                'value': 0.8,
                'unit': 'mg/L',
                'standard': 1.5,
                'status': 'Safe'
            },
            'arsenic': {
                'value': 0.005,
                'unit': 'mg/L',
                'standard': 0.01,
                'status': 'Safe'
            }
        },
        'environmentalConditions': {
            'temperature': 28.5,
            'humidity': 75.2,
            'weatherCondition': 'Clear',
            'rainfall': 12.3
        },
        'testingInfo': {
            'method': 'IoT Sensor',
            'agency': 'NeerSetu IoT Network',
            'equipmentId': 'IoT_DEMO_001',
            'calibrationDate': '2025-01-01T00:00:00'
        },
        'overallStatus': {
            'isPotable': True,
            'contaminationLevel': 'Low',
            'riskScore': 25
        },
        'sensorMetadata': {
            'sensorId': 'IoT_DEMO_001',
            'batteryLevel': 85,
            'signalStrength': 92,
            'firmwareVersion': '2.1.0',
            'lastMaintenance': '2025-01-01T00:00:00',
            'isIotData': True
        },
        'timestamp': datetime.now().isoformat(),
        'transmissionId': f"TX_DEMO_{int(time.time())}"
    }
    
    return sample_data

def demo_data_processing():
    """Demonstrate data processing capabilities"""
    print("🔬 Data Processing Demo")
    print("-" * 30)
    
    processor = DataProcessor()
    sample_data = create_sample_data()
    
    # Validate data quality
    print("1. Data Quality Validation:")
    is_valid, issues = processor.validate_data_quality(sample_data)
    print(f"   Status: {'✅ Valid' if is_valid else '❌ Invalid'}")
    if issues:
        print(f"   Issues: {issues}")
    else:
        print("   No quality issues detected")
    
    # Calculate risk score
    print("\n2. Risk Score Calculation:")
    risk_score = processor.calculate_risk_score(sample_data)
    print(f"   Risk Score: {risk_score}/100")
    
    if risk_score < 40:
        risk_level = "🟢 Low Risk"
    elif risk_score < 70:
        risk_level = "🟡 Moderate Risk"
    elif risk_score < 90:
        risk_level = "🟠 High Risk"
    else:
        risk_level = "🔴 Critical Risk"
    
    print(f"   Risk Level: {risk_level}")
    
    # Detect anomalies
    print("\n3. Anomaly Detection:")
    anomalies = processor.detect_anomalies(sample_data)
    if anomalies:
        print(f"   ⚠️  Anomalies detected: {len(anomalies)}")
        for anomaly in anomalies:
            print(f"      - {anomaly}")
    else:
        print("   ✅ No anomalies detected")
    
    # Generate quality report
    print("\n4. Quality Report Generation:")
    report = processor.generate_quality_report(sample_data)
    print(f"   Overall Status: {report['overall_status']}")
    print(f"   Recommendations: {len(report['recommendations'])}")
    for rec in report['recommendations']:
        print(f"      - {rec}")
    
    print("\n✅ Data Processing Demo Complete!\n")

def demo_iot_data_generation():
    """Demonstrate IoT data generation"""
    print("📡 IoT Data Generation Demo")
    print("-" * 30)
    
    simulator = EnhancedIoTSimulator()
    
    # Create sample data
    sample_data = create_sample_data()
    
    print("1. Sample IoT Data Structure:")
    print(json.dumps(sample_data, indent=2))
    
    print("\n2. Data Validation:")
    is_valid, issues = simulator.data_processor.validate_data_quality(sample_data)
    print(f"   Validation: {'✅ Passed' if is_valid else '❌ Failed'}")
    
    print("\n3. Risk Assessment:")
    risk_score = simulator.data_processor.calculate_risk_score(sample_data)
    print(f"   Risk Score: {risk_score}/100")
    
    print("\n4. Sensor Metadata:")
    metadata = sample_data['sensorMetadata']
    print(f"   Sensor ID: {metadata['sensorId']}")
    print(f"   Battery Level: {metadata['batteryLevel']}%")
    print(f"   Signal Strength: {metadata['signalStrength']}%")
    print(f"   Firmware Version: {metadata['firmwareVersion']}")
    
    print("\n5. Environmental Conditions:")
    env = sample_data['environmentalConditions']
    print(f"   Temperature: {env['temperature']}°C")
    print(f"   Humidity: {env['humidity']}%")
    print(f"   Weather: {env['weatherCondition']}")
    print(f"   Rainfall: {env['rainfall']}mm")
    
    print("\n✅ IoT Data Generation Demo Complete!\n")

def demo_quality_standards():
    """Demonstrate water quality standards"""
    print("📋 Water Quality Standards Demo")
    print("-" * 30)
    
    processor = DataProcessor()
    
    print("WHO/Indian Water Quality Standards:")
    print("-" * 40)
    
    for param, standards in processor.quality_standards.items():
        print(f"\n{param.upper()}:")
        print(f"   Unit: {standards['unit']}")
        
        if 'min' in standards and 'max' in standards:
            print(f"   Safe Range: {standards['min']} - {standards['max']}")
        elif 'min' in standards:
            print(f"   Minimum: {standards['min']}")
        elif 'max' in standards:
            print(f"   Maximum: {standards['max']}")
    
    print("\n✅ Quality Standards Demo Complete!\n")

def demo_simulation_modes():
    """Demonstrate different simulation modes"""
    print("🎮 Simulation Modes Demo")
    print("-" * 30)
    
    print("1. Continuous Mode:")
    print("   - Streams data continuously at specified intervals")
    print("   - Real-time monitoring and analysis")
    print("   - Suitable for live demonstrations")
    print("   - Command: python enhanced_iot_simulator.py --mode continuous")
    
    print("\n2. Batch Mode:")
    print("   - Processes data in batches")
    print("   - Parallel processing for efficiency")
    print("   - Suitable for bulk data processing")
    print("   - Command: python enhanced_iot_simulator.py --mode batch --batch-size 20")
    
    print("\n3. Test Mode:")
    print("   - Tests connection without sending data")
    print("   - Validates configuration and setup")
    print("   - Command: python enhanced_iot_simulator.py --test-only")
    
    print("\n✅ Simulation Modes Demo Complete!\n")

def main():
    """Run the complete demo"""
    print("🚀 NeerSetu IoT Simulator Demo")
    print("=" * 50)
    print("This demo showcases the capabilities of the IoT simulator")
    print("without requiring a backend connection.\n")
    
    try:
        demo_quality_standards()
        demo_data_processing()
        demo_iot_data_generation()
        demo_simulation_modes()
        
        print("🎉 Demo completed successfully!")
        print("\n📚 Next Steps:")
        print("1. Ensure the backend server is running")
        print("2. Verify the dataset is available")
        print("3. Run: python enhanced_iot_simulator.py --test-only")
        print("4. Start simulation: python enhanced_iot_simulator.py")
        
    except Exception as e:
        print(f"❌ Demo failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
