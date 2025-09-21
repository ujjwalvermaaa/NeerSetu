# NeerSetu ML Service

Advanced Machine Learning service for water-borne disease outbreak prediction in rural Northeast India. This service provides AI-powered predictions, risk assessment, and scenario simulation for health officials and administrators.

## 🚀 Features

### Core ML Capabilities
- **Outbreak Prediction**: Predict water-borne disease outbreaks with high accuracy
- **Risk Assessment**: Calculate risk indices (0-500 scale like AQI) for easy interpretation
- **Scenario Simulation**: Test different scenarios and their potential outcomes
- **Batch Processing**: Process multiple predictions efficiently
- **Real-time Predictions**: Fast, low-latency prediction API

### Advanced Features
- **SHAP Explainability**: Understand why predictions are made with SHAP values
- **Feature Engineering**: Automatic feature creation and selection
- **Model Optimization**: Hyperparameter tuning and model selection
- **Multiple Algorithms**: XGBoost, Random Forest, Logistic Regression, SVM
- **Comprehensive Validation**: Cross-validation and performance metrics
- **Data Quality Assessment**: Automatic data quality scoring and recommendations

### Monitoring & Analytics
- **Performance Tracking**: Model accuracy, precision, recall, F1-score
- **Feature Importance**: Identify most influential factors
- **Data Quality Metrics**: Comprehensive data quality analysis
- **Training History**: Track model training and performance over time
- **Health Monitoring**: Service health and status monitoring

## 📁 Project Structure

```
ml-service/
├── src/                          # Source code modules
│   ├── __init__.py              # Package initialization
│   ├── config.py                # Configuration management
│   ├── logger.py                # Advanced logging system
│   ├── data_processor.py        # Data loading and preprocessing
│   ├── model_trainer.py         # Model training and optimization
│   ├── enhanced_predictor.py    # Prediction and explainability
│   ├── enhanced_ml_pipeline.py  # Main ML pipeline
│   ├── enhanced_api.py          # FastAPI application
│   ├── api.py                   # Basic API (legacy)
│   ├── ml_pipeline.py           # Basic pipeline (legacy)
│   ├── predictor.py             # Basic predictor (legacy)
│   └── utils.py                 # Utility functions
├── models/                      # Trained models directory
│   └── .gitkeep                # Directory placeholder
├── logs/                        # Log files directory
│   └── .gitkeep                # Directory placeholder
├── data/                        # Training data samples
│   └── .gitkeep                # Directory placeholder
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
├── test_ml_service.py           # Comprehensive test suite
└── README.md                    # This file
```

## 🛠️ Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Access to the training datasets

### Setup
1. **Navigate to ML service directory**:
   ```bash
   cd /Users/ujjwal/Desktop/SIH/PROJECT/ml-service
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

4. **Ensure datasets are available**:
   ```bash
   # Make sure the datasets are in the correct location
   ls ../Datasets/
   ```

## 🚀 Usage

### Start the Service

#### Development Mode
```bash
python src/enhanced_api.py
```

#### Production Mode
```bash
uvicorn src.enhanced_api:app --host 0.0.0.0 --port 8000
```

### API Endpoints

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Get Service Status
```bash
curl http://localhost:8000/status
```

#### Train Model
```bash
curl -X POST "http://localhost:8000/train" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "outbreak_model",
    "model_type": "xgboost",
    "optimize": true
  }'
```

#### Make Prediction
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "village": "Test Village",
    "state": "Assam",
    "district": "Test District",
    "total_diarrhea_cases": 5,
    "total_fever_cases": 3,
    "avg_ph": 7.2,
    "avg_turbidity": 2.1,
    "avg_bacteria_ecoli": 45.0,
    "daily_rainfall": 15.0,
    "temperature": 28.0,
    "humidity": 75.0,
    "season": "Summer",
    "month": 6
  }'
```

#### Simulate Scenarios
```bash
curl -X POST "http://localhost:8000/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "village": "Test Village",
    "state": "Assam",
    "district": "Test District",
    "base_features": {
      "total_diarrhea_cases": 5,
      "avg_ph": 7.2,
      "daily_rainfall": 15.0
    },
    "scenarios": [
      {
        "name": "Heavy Rain",
        "description": "What if rainfall increases?",
        "modifications": {
          "daily_rainfall": 50.0
        }
      }
    ]
  }'
```

### Python API Usage

```python
import requests

# Make prediction
prediction_data = {
    "village": "Test Village",
    "state": "Assam",
    "district": "Test District",
    "total_diarrhea_cases": 5,
    "avg_ph": 7.2,
    "avg_bacteria_ecoli": 45.0,
    "daily_rainfall": 15.0,
    "temperature": 28.0,
    "humidity": 75.0,
    "season": "Summer",
    "month": 6
}

response = requests.post("http://localhost:8000/predict", json=prediction_data)
result = response.json()

print(f"Risk Index: {result['risk_index']}")
print(f"Risk Level: {result['risk_level']}")
print(f"Probability: {result['probability']:.4f}")
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the ml-service directory:

```env
# Service Configuration
ML_HOST=0.0.0.0
ML_PORT=8000
ML_DEBUG=false

# Model Configuration
MODEL_DIR=models
DEFAULT_MODEL_NAME=outbreak_model
MODEL_VERSION=2.0.0

# Dataset Configuration
DATASET_DIR=../Datasets
HEALTH_DATASET=1_Health_Surveillance_Data_NE_India.csv
WATER_DATASET=2_Water_Quality_Data_NE_India.csv
ENVIRONMENT_DATASET=3_Environmental_Rainfall_Data_NE_India.csv
OUTBREAK_DATASET=4_Outbreak_Levels_Target_Data_NE_India.csv

# Model Training
TEST_SIZE=0.2
RANDOM_STATE=42
CV_FOLDS=5

# Feature Engineering
ENABLE_FEATURE_ENGINEERING=true
ENABLE_TEMPORAL_FEATURES=true
ENABLE_INTERACTION_FEATURES=true

# Model Parameters
XGB_N_ESTIMATORS=100
XGB_MAX_DEPTH=6
XGB_LEARNING_RATE=0.1
XGB_SUBSAMPLE=0.8
XGB_COLSAMPLE_BYTREE=0.8

# SHAP Configuration
ENABLE_SHAP=true
SHAP_SAMPLE_SIZE=100

# Logging
LOG_LEVEL=INFO
LOG_DIR=logs

# Performance
ENABLE_PERFORMANCE_MONITORING=true
MONITORING_INTERVAL=60
MAX_METRICS_HISTORY=1000

# API Configuration
API_TIMEOUT=30
MAX_BATCH_SIZE=100
```

### Model Configuration

The service supports multiple machine learning algorithms:

#### XGBoost (Default)
- **Advantages**: High accuracy, handles missing values well, fast training
- **Best for**: Complex patterns, large datasets
- **Parameters**: Configurable via environment variables

#### Random Forest
- **Advantages**: Robust, handles overfitting well, interpretable
- **Best for**: Medium datasets, feature importance analysis
- **Parameters**: Configurable via environment variables

#### Logistic Regression
- **Advantages**: Fast, interpretable, good baseline
- **Best for**: Linear relationships, small datasets
- **Parameters**: Configurable via environment variables

#### Support Vector Machine (SVM)
- **Advantages**: Good for high-dimensional data, robust
- **Best for**: Complex decision boundaries
- **Parameters**: Configurable via environment variables

## 📊 Data Format

### Input Data Format

The service expects data in the following format:

```json
{
  "village": "Village Name",
  "state": "State Name",
  "district": "District Name",
  "total_diarrhea_cases": 5,
  "total_fever_cases": 3,
  "total_vomiting_cases": 2,
  "total_affected_population": 100,
  "avg_ph": 7.2,
  "avg_turbidity": 2.1,
  "avg_bacteria_ecoli": 45.0,
  "avg_bacteria_coliform": 120.0,
  "avg_dissolved_oxygen": 6.8,
  "avg_nitrates": 25.0,
  "avg_phosphates": 0.05,
  "avg_heavy_metals": 0.003,
  "avg_chlorine_residual": 0.4,
  "avg_fluoride": 0.8,
  "avg_arsenic": 0.005,
  "water_contaminated": false,
  "daily_rainfall": 15.0,
  "weekly_rainfall": 100.0,
  "monthly_rainfall": 400.0,
  "temperature": 28.0,
  "humidity": 75.0,
  "flood_risk_level": "Low",
  "drought_indicator": "No",
  "season": "Summer",
  "month": 6
}
```

### Output Data Format

The service returns predictions in the following format:

```json
{
  "success": true,
  "prediction": {
    "prediction": 1,
    "probability": 0.75,
    "confidence": 0.85,
    "risk_index": 375,
    "risk_level": "Very High",
    "contributing_factors": [
      {
        "factor": "High E.coli contamination",
        "value": 150.0,
        "impact": "Critical",
        "description": "E.coli levels exceed safe limits"
      }
    ],
    "shap_explanation": {
      "shap_values": [0.1, -0.2, 0.3, ...],
      "feature_names": ["avg_ph", "avg_turbidity", ...],
      "top_features": [
        {"feature": "avg_bacteria_ecoli", "importance": 0.3}
      ]
    },
    "timestamp": "2025-01-11T10:30:00.000Z"
  },
  "risk_index": 375,
  "risk_level": "Very High",
  "probability": 0.75,
  "contributing_factors": [...],
  "confidence": 0.85,
  "timestamp": "2025-01-11T10:30:00.000Z"
}
```

## 🧪 Testing

### Run Test Suite
```bash
python test_ml_service.py
```

### Test Individual Components
```python
# Test configuration
from src.config import config
print(config.validate_config())

# Test data processor
from src.data_processor import data_processor
datasets = data_processor.load_datasets()
print(f"Loaded {len(datasets)} datasets")

# Test model trainer
from src.model_trainer import model_trainer
# ... (see test_ml_service.py for examples)
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test prediction endpoint
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

## 📈 Performance Monitoring

### Model Performance Metrics
- **Accuracy**: Overall prediction accuracy
- **Precision**: True positive rate
- **Recall**: Sensitivity
- **F1-Score**: Harmonic mean of precision and recall
- **ROC-AUC**: Area under the ROC curve

### Data Quality Metrics
- **Missing Data Percentage**: Amount of missing values
- **Duplicate Rows**: Number of duplicate records
- **Quality Score**: Overall data quality (0-100)
- **Feature Distribution**: Statistical distribution of features

### System Health Metrics
- **Model Load Status**: Whether model is loaded and ready
- **API Response Time**: Average response time for predictions
- **Memory Usage**: Current memory consumption
- **CPU Usage**: Current CPU utilization

## 🔍 Troubleshooting

### Common Issues

1. **Model Not Loaded Error**:
   - Ensure model has been trained
   - Check model files exist in models/ directory
   - Verify model loading in logs

2. **Dataset Not Found**:
   - Verify dataset paths in configuration
   - Check file permissions
   - Ensure datasets are in correct format

3. **Memory Issues**:
   - Reduce batch size
   - Enable feature selection
   - Monitor memory usage

4. **Slow Predictions**:
   - Check model complexity
   - Enable feature selection
   - Monitor system resources

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=DEBUG
python src/enhanced_api.py
```

### Log Files

Check log files in the `logs/` directory:
- `ml_service.log`: General application logs
- `model_training.log`: Model training logs
- `predictions.log`: Prediction logs
- `errors.log`: Error logs

## 🤝 Integration

### Backend Integration

The ML service integrates with the NeerSetu backend:

```python
# Backend calls ML service
import requests

def get_outbreak_prediction(village_data):
    response = requests.post(
        "http://localhost:8000/predict",
        json=village_data,
        timeout=30
    )
    return response.json()
```

### Dashboard Integration

The dashboard can display ML predictions:

```javascript
// Dashboard calls ML service
const prediction = await fetch('/api/ml/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(villageData)
});
```

### Mobile App Integration

The mobile app can send data for prediction:

```javascript
// Mobile app sends data
const prediction = await api.post('/ml/predict', {
  village: 'My Village',
  symptoms: { diarrhea: 5, fever: 3 },
  waterQuality: { ph: 7.2, bacteria: 45 }
});
```

## 📚 API Documentation

### Interactive Documentation

Visit the interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Reference

#### POST /predict
Make outbreak prediction

**Request Body**:
```json
{
  "village": "string",
  "state": "string",
  "district": "string",
  "total_diarrhea_cases": 0,
  "avg_ph": 7.0,
  "avg_turbidity": 0.0,
  "avg_bacteria_ecoli": 0.0,
  "daily_rainfall": 0.0,
  "temperature": 25.0,
  "humidity": 70.0,
  "season": "Spring",
  "month": 6
}
```

**Response**:
```json
{
  "success": true,
  "prediction": {...},
  "risk_index": 250,
  "risk_level": "High",
  "probability": 0.5,
  "contributing_factors": [...],
  "confidence": 0.8,
  "timestamp": "2025-01-11T10:30:00.000Z"
}
```

#### POST /simulate
Simulate outbreak scenarios

**Request Body**:
```json
{
  "village": "string",
  "state": "string",
  "district": "string",
  "base_features": {...},
  "scenarios": [...]
}
```

**Response**:
```json
{
  "success": true,
  "simulation_results": {...},
  "risk_scenarios": [...],
  "recommendations": [...],
  "timestamp": "2025-01-11T10:30:00.000Z"
}
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
COPY models/ ./models/
COPY logs/ ./logs/

EXPOSE 8000
CMD ["python", "src/enhanced_api.py"]
```

### Production Considerations

1. **Model Versioning**: Track model versions and performance
2. **Monitoring**: Set up comprehensive monitoring
3. **Scaling**: Use load balancers for high availability
4. **Security**: Implement authentication and rate limiting
5. **Backup**: Regular model and data backups

## 📄 License

This project is part of the NeerSetu Smart Community Health Monitoring System for the Smart India Hackathon 2025.

## 🤝 Contributing

This is a hackathon project. For questions or issues, please contact the development team.

## 📞 Support

For technical support or questions about the ML service:

1. Check the logs in the `logs/` directory
2. Review the configuration settings
3. Verify dataset availability and format
4. Test individual components using the test suite

---

**NeerSetu ML Service v2.0** - AI-Powered Outbreak Prediction
