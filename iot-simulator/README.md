# NeerSetu IoT Simulator

Advanced IoT sensor data simulator for water quality monitoring in rural Northeast India. This simulator generates realistic sensor data and streams it to the NeerSetu backend system for real-time monitoring and analysis.

## 🚀 Features

### Core Functionality
- **Realistic Data Simulation**: Generates authentic water quality sensor data with realistic variations
- **Multiple Simulation Modes**: Continuous streaming and batch processing
- **Comprehensive Water Quality Parameters**: pH, turbidity, bacterial counts, dissolved oxygen, nitrates, phosphates, heavy metals, chlorine residual, fluoride, arsenic
- **Environmental Conditions**: Temperature, humidity, weather conditions, rainfall simulation
- **Sensor Metadata**: Battery levels, signal strength, firmware versions, maintenance tracking

### Advanced Features
- **Data Quality Validation**: Validates data against WHO/Indian water quality standards
- **Anomaly Detection**: Identifies unusual patterns and potential sensor issues
- **Risk Score Calculation**: Computes health risk scores based on water quality parameters
- **Performance Monitoring**: Real-time system performance and health monitoring
- **Comprehensive Logging**: Detailed logging with rotation and multiple log levels
- **Retry Logic**: Automatic retry with exponential backoff for failed transmissions
- **Parallel Processing**: Batch mode with concurrent data transmission
- **Graceful Shutdown**: Proper cleanup and resource management

### Monitoring & Analytics
- **Real-time Statistics**: Success rates, response times, data transmission rates
- **System Health Monitoring**: CPU, memory, disk, and network usage tracking
- **Performance Metrics**: Historical performance data and trends
- **Error Tracking**: Comprehensive error logging and analysis
- **Quality Reports**: Detailed water quality analysis and recommendations

## 📁 Project Structure

```
iot-simulator/
├── src/                          # Source code modules
│   ├── __init__.py              # Package initialization
│   ├── logger.py                # Advanced logging system
│   ├── data_processor.py        # Data validation and processing
│   ├── performance_monitor.py   # Performance monitoring
│   └── config.py                # Configuration management
├── logs/                        # Log files directory
│   └── .gitkeep                # Directory placeholder
├── iot_simulator.py             # Basic IoT simulator
├── enhanced_iot_simulator.py    # Enhanced IoT simulator
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🛠️ Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Access to the water quality dataset

### Setup
1. **Clone the repository** (if not already done):
   ```bash
   cd /Users/ujjwal/Desktop/SIH/PROJECT/iot-simulator
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

4. **Ensure dataset is available**:
   ```bash
   # Make sure the water quality dataset is in the correct location
   ls ../Datasets/2_Water_Quality_Data_NE_India.csv
   ```

## 🚀 Usage

### Basic Usage

#### Test Connection
```bash
python enhanced_iot_simulator.py --test-only
```

#### Continuous Simulation (Default)
```bash
python enhanced_iot_simulator.py
```

#### Batch Simulation
```bash
python enhanced_iot_simulator.py --mode batch --batch-size 20 --delay 10
```

### Advanced Usage

#### Custom Configuration
```bash
python enhanced_iot_simulator.py \
    --backend-url http://localhost:5000 \
    --dataset ../Datasets/2_Water_Quality_Data_NE_India.csv \
    --mode continuous \
    --interval 30 \
    --max-records 1000
```

#### Show Configuration
```bash
python enhanced_iot_simulator.py --config
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--backend-url` | Backend API URL | `http://localhost:5000` |
| `--dataset` | Path to water quality dataset | `../Datasets/2_Water_Quality_Data_NE_India.csv` |
| `--mode` | Simulation mode (`continuous` or `batch`) | `continuous` |
| `--interval` | Interval between data points in seconds | `30` |
| `--batch-size` | Batch size for batch mode | `10` |
| `--delay` | Delay between batches in seconds | `5` |
| `--max-records` | Maximum number of records to send | `None` (all) |
| `--test-only` | Test connection only | `False` |
| `--config` | Show current configuration | `False` |

## 📊 Data Format

The simulator generates comprehensive IoT data in the following format:

```json
{
  "village": "Village Name",
  "state": "State Name",
  "district": "District Name",
  "waterSource": {
    "id": "WS_1234",
    "type": "Groundwater",
    "location": {
      "latitude": 26.2006,
      "longitude": 92.9376
    }
  },
  "qualityParameters": {
    "pH": {
      "value": 7.2,
      "unit": "pH",
      "standard": 6.5,
      "status": "Safe"
    },
    "turbidity": {
      "value": 2.1,
      "unit": "NTU",
      "standard": 5.0,
      "status": "Safe"
    },
    "bacteriaEcoli": {
      "value": 45.2,
      "unit": "CFU/100ml",
      "standard": 100,
      "status": "Safe"
    }
    // ... more parameters
  },
  "environmentalConditions": {
    "temperature": 28.5,
    "humidity": 75.2,
    "weatherCondition": "Clear",
    "rainfall": 12.3
  },
  "sensorMetadata": {
    "sensorId": "IoT_1234",
    "batteryLevel": 85,
    "signalStrength": 92,
    "firmwareVersion": "2.1.0",
    "lastMaintenance": "2025-01-01T00:00:00",
    "isIotData": true
  },
  "overallStatus": {
    "isPotable": true,
    "contaminationLevel": "Low",
    "riskScore": 25
  },
  "timestamp": "2025-01-11T10:30:00.000Z",
  "transmissionId": "TX_1705050600_1234"
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the iot-simulator directory:

```env
# Backend Configuration
BACKEND_URL=http://localhost:5000
API_TIMEOUT=10
MAX_RETRIES=3
RETRY_DELAY=5

# Dataset Configuration
DATASET_PATH=../Datasets/2_Water_Quality_Data_NE_India.csv
DATA_VALIDATION=true

# Simulation Configuration
DEFAULT_INTERVAL=30
DEFAULT_BATCH_SIZE=10
DEFAULT_BATCH_DELAY=5
MAX_RECORDS=0

# Logging Configuration
LOG_LEVEL=INFO
LOG_DIR=logs
LOG_ROTATION_SIZE=10485760
LOG_BACKUP_COUNT=5

# Performance Monitoring
PERFORMANCE_MONITORING=true
MONITORING_INTERVAL=30
MAX_METRICS_HISTORY=1000

# Data Processing
ENABLE_ANOMALY_DETECTION=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_RISK_CALCULATION=true

# IoT Sensor Simulation
SENSOR_VARIATION=0.1
BATTERY_DRAIN_RATE=0.1
SIGNAL_STRENGTH_VARIATION=20
```

### Quality Standards

The simulator uses WHO and Indian water quality standards:

| Parameter | Standard | Unit | Safe Range |
|-----------|----------|------|------------|
| pH | 6.5-8.5 | pH | 6.5-8.5 |
| Turbidity | <5.0 | NTU | <5.0 |
| E.coli | <100 | CFU/100ml | <100 |
| Coliform | <1000 | CFU/100ml | <1000 |
| Dissolved Oxygen | >5.0 | mg/L | >5.0 |
| Nitrates | <45 | mg/L | <45 |
| Phosphates | <0.1 | mg/L | <0.1 |
| Heavy Metals | <0.01 | mg/L | <0.01 |
| Chlorine Residual | >0.2 | mg/L | >0.2 |
| Fluoride | <1.5 | mg/L | <1.5 |
| Arsenic | <0.01 | mg/L | <0.01 |

## 📈 Monitoring & Logs

### Log Files

The simulator creates several log files in the `logs/` directory:

- `iot_simulator.log`: General application logs
- `data_transmission.log`: Data transmission events
- `errors.log`: Error logs
- `performance.log`: Performance metrics

### Performance Metrics

The simulator tracks various performance metrics:

- **Transmission Statistics**: Success rate, failure count, response times
- **System Resources**: CPU, memory, disk, network usage
- **Data Quality**: Validation results, anomaly detection
- **Error Tracking**: Error types, frequencies, patterns

### Health Monitoring

The system continuously monitors its health and reports:

- **Status**: HEALTHY, DEGRADED, ERROR
- **Warnings**: Performance issues, resource constraints
- **Recommendations**: Optimization suggestions

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Ensure the backend server is running
   - Check the backend URL configuration
   - Verify network connectivity

2. **Dataset Not Found**:
   - Verify the dataset path is correct
   - Ensure the CSV file exists and is readable
   - Check file permissions

3. **High Error Rate**:
   - Check backend server logs
   - Verify API endpoint availability
   - Consider reducing transmission frequency

4. **Memory Issues**:
   - Reduce batch size
   - Enable log rotation
   - Monitor system resources

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=DEBUG
python enhanced_iot_simulator.py
```

### Performance Tuning

For high-volume simulations:

1. **Increase batch size** for batch mode
2. **Reduce interval** for continuous mode
3. **Enable parallel processing** for batch mode
4. **Monitor system resources** and adjust accordingly

## 🤝 Integration

### Backend Integration

The simulator integrates with the NeerSetu backend through REST API:

- **Endpoint**: `POST /api/water-reports`
- **Authentication**: None (for simulation)
- **Data Format**: JSON with comprehensive water quality data
- **Response**: 201 Created on success

### Dashboard Integration

The transmitted data appears in the NeerSetu dashboard:

- **Map View**: Real-time village markers with risk indicators
- **Analytics**: Historical trends and patterns
- **Alerts**: Automatic alert generation based on risk scores
- **Reports**: Comprehensive water quality reports

## 📚 API Reference

### Data Processor

```python
from src.data_processor import DataProcessor

processor = DataProcessor()

# Validate data quality
is_valid, issues = processor.validate_data_quality(data)

# Calculate risk score
risk_score = processor.calculate_risk_score(data)

# Detect anomalies
anomalies = processor.detect_anomalies(data)

# Generate quality report
report = processor.generate_quality_report(data)
```

### Performance Monitor

```python
from src.performance_monitor import PerformanceMonitor

monitor = PerformanceMonitor()

# Start monitoring
monitor.start_monitoring(interval=30)

# Record transmission
monitor.record_data_transmission(success=True, response_time=1.5)

# Get performance summary
summary = monitor.get_performance_summary()

# Get health status
health = monitor.get_health_status()
```

## 🚀 Advanced Usage

### Custom Data Processing

```python
from enhanced_iot_simulator import EnhancedIoTSimulator

# Create custom simulator
simulator = EnhancedIoTSimulator(
    backend_url="http://localhost:5000",
    dataset_path="custom_dataset.csv"
)

# Load and process data
simulator.load_dataset()

# Custom simulation logic
for i in range(100):
    data = simulator.prepare_enhanced_iot_data(simulator.data.iloc[i])
    if data:
        success = simulator.send_iot_data(data)
```

### Batch Processing with Custom Logic

```python
import pandas as pd
from enhanced_iot_simulator import EnhancedIoTSimulator

# Load custom dataset
df = pd.read_csv("custom_water_data.csv")

# Create simulator
simulator = EnhancedIoTSimulator()

# Process in custom batches
batch_size = 50
for i in range(0, len(df), batch_size):
    batch = df.iloc[i:i+batch_size]
    
    for _, row in batch.iterrows():
        data = simulator.prepare_enhanced_iot_data(row)
        if data:
            simulator.send_iot_data(data)
```

## 📄 License

This project is part of the NeerSetu Smart Community Health Monitoring System for the Smart India Hackathon 2025.

## 🤝 Contributing

This is a hackathon project. For questions or issues, please contact the development team.

## 📞 Support

For technical support or questions about the IoT simulator:

1. Check the logs in the `logs/` directory
2. Review the configuration settings
3. Verify backend connectivity
4. Check the dataset format and availability

---

**NeerSetu IoT Simulator v2.0** - Smart Community Health Monitoring System