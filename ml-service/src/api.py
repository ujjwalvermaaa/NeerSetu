from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
import logging

from ml_pipeline import MLPipeline
from predictor import OutbreakPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="NeerSetu ML Service",
    description="AI-powered outbreak prediction service for water-borne diseases",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML components
ml_pipeline = MLPipeline()
predictor = OutbreakPredictor()

# Pydantic models
class PredictionRequest(BaseModel):
    village: str
    state: str
    district: str
    # Health data
    total_diarrhea_cases: int = 0
    total_fever_cases: int = 0
    total_vomiting_cases: int = 0
    total_affected_population: int = 0
    # Water quality data
    avg_ph: float
    avg_turbidity: float
    avg_bacteria_ecoli: float
    avg_bacteria_coliform: float
    water_contaminated: bool = False
    # Environmental data
    daily_rainfall: float
    weekly_rainfall: float
    monthly_rainfall: float
    temperature: float
    humidity: float
    flood_risk_level: str = "Low"
    drought_indicator: str = "No"
    # Seasonal data
    season: str
    month: int

class SimulationRequest(BaseModel):
    village: str
    state: str
    district: str
    scenario_data: Dict[str, Any]

class TrainingRequest(BaseModel):
    dataset_path: str
    model_name: str = "outbreak_model"

class PredictionResponse(BaseModel):
    success: bool
    prediction: Dict[str, Any]
    risk_index: int
    risk_level: str
    probability: float
    contributing_factors: List[Dict[str, Any]]
    confidence: float
    timestamp: str

class SimulationResponse(BaseModel):
    success: bool
    simulation_results: Dict[str, Any]
    risk_scenarios: List[Dict[str, Any]]
    recommendations: List[str]
    timestamp: str

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "success": True,
        "message": "NeerSetu ML Service is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "model_loaded": predictor.is_model_loaded()
    }

# Status endpoint
@app.get("/status")
async def get_status():
    return {
        "success": True,
        "service": "NeerSetu ML Service",
        "status": "operational",
        "model_status": "loaded" if predictor.is_model_loaded() else "not_loaded",
        "last_training": predictor.get_last_training_time(),
        "model_version": predictor.get_model_version(),
        "features": predictor.get_feature_names(),
        "timestamp": datetime.now().isoformat()
    }

# Train model endpoint
@app.post("/train")
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    try:
        logger.info(f"Starting model training with dataset: {request.dataset_path}")
        
        # Start training in background
        background_tasks.add_task(
            ml_pipeline.train_model,
            request.dataset_path,
            request.model_name
        )
        
        return {
            "success": True,
            "message": "Model training started in background",
            "dataset_path": request.dataset_path,
            "model_name": request.model_name,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error starting model training: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting model training: {str(e)}")

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict_outbreak(request: PredictionRequest):
    try:
        if not predictor.is_model_loaded():
            raise HTTPException(status_code=503, detail="Model not loaded. Please train the model first.")
        
        logger.info(f"Making prediction for village: {request.village}")
        
        # Prepare features for prediction
        features = {
            'avg_ph': request.avg_ph,
            'avg_turbidity': request.avg_turbidity,
            'avg_bacteria_ecoli': request.avg_bacteria_ecoli,
            'avg_bacteria_coliform': request.avg_bacteria_coliform,
            'daily_rainfall': request.daily_rainfall,
            'weekly_rainfall': request.weekly_rainfall,
            'monthly_rainfall': request.monthly_rainfall,
            'temperature': request.temperature,
            'humidity': request.humidity,
            'water_contaminated': int(request.water_contaminated),
            'total_diarrhea_cases': request.total_diarrhea_cases,
            'total_fever_cases': request.total_fever_cases,
            'total_vomiting_cases': request.total_vomiting_cases,
            'total_affected_population': request.total_affected_population,
            'flood_risk_level': request.flood_risk_level,
            'drought_indicator': request.drought_indicator,
            'season': request.season,
            'month': request.month
        }
        
        # Make prediction
        prediction_result = predictor.predict(features)
        
        # Calculate risk index (0-500 scale like AQI)
        risk_index = int(prediction_result['probability'] * 500)
        
        # Determine risk level
        if risk_index <= 100:
            risk_level = "Low"
        elif risk_index <= 200:
            risk_level = "Moderate"
        elif risk_index <= 300:
            risk_level = "High"
        elif risk_index <= 400:
            risk_level = "Very High"
        else:
            risk_level = "Severe"
        
        return PredictionResponse(
            success=True,
            prediction=prediction_result,
            risk_index=risk_index,
            risk_level=risk_level,
            probability=prediction_result['probability'],
            contributing_factors=prediction_result['contributing_factors'],
            confidence=prediction_result['confidence'],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error making prediction: {str(e)}")

# Simulation endpoint
@app.post("/simulate", response_model=SimulationResponse)
async def simulate_outbreak(request: SimulationRequest):
    try:
        if not predictor.is_model_loaded():
            raise HTTPException(status_code=503, detail="Model not loaded. Please train the model first.")
        
        logger.info(f"Running outbreak simulation for village: {request.village}")
        
        # Run simulation with different scenarios
        simulation_results = predictor.simulate_scenarios(request.scenario_data)
        
        # Generate recommendations based on simulation
        recommendations = generate_recommendations(simulation_results)
        
        return SimulationResponse(
            success=True,
            simulation_results=simulation_results,
            risk_scenarios=simulation_results.get('scenarios', []),
            recommendations=recommendations,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error running simulation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error running simulation: {str(e)}")

# Batch prediction endpoint
@app.post("/predict/batch")
async def predict_batch(requests: List[PredictionRequest]):
    try:
        if not predictor.is_model_loaded():
            raise HTTPException(status_code=503, detail="Model not loaded. Please train the model first.")
        
        logger.info(f"Making batch predictions for {len(requests)} villages")
        
        results = []
        for request in requests:
            try:
                # Prepare features for prediction
                features = {
                    'avg_ph': request.avg_ph,
                    'avg_turbidity': request.avg_turbidity,
                    'avg_bacteria_ecoli': request.avg_bacteria_ecoli,
                    'avg_bacteria_coliform': request.avg_bacteria_coliform,
                    'daily_rainfall': request.daily_rainfall,
                    'weekly_rainfall': request.weekly_rainfall,
                    'monthly_rainfall': request.monthly_rainfall,
                    'temperature': request.temperature,
                    'humidity': request.humidity,
                    'water_contaminated': int(request.water_contaminated),
                    'total_diarrhea_cases': request.total_diarrhea_cases,
                    'total_fever_cases': request.total_fever_cases,
                    'total_vomiting_cases': request.total_vomiting_cases,
                    'total_affected_population': request.total_affected_population,
                    'flood_risk_level': request.flood_risk_level,
                    'drought_indicator': request.drought_indicator,
                    'season': request.season,
                    'month': request.month
                }
                
                # Make prediction
                prediction_result = predictor.predict(features)
                
                # Calculate risk index
                risk_index = int(prediction_result['probability'] * 500)
                
                # Determine risk level
                if risk_index <= 100:
                    risk_level = "Low"
                elif risk_index <= 200:
                    risk_level = "Moderate"
                elif risk_index <= 300:
                    risk_level = "High"
                elif risk_index <= 400:
                    risk_level = "Very High"
                else:
                    risk_level = "Severe"
                
                results.append({
                    "village": request.village,
                    "state": request.state,
                    "district": request.district,
                    "risk_index": risk_index,
                    "risk_level": risk_level,
                    "probability": prediction_result['probability'],
                    "contributing_factors": prediction_result['contributing_factors'],
                    "confidence": prediction_result['confidence']
                })
                
            except Exception as e:
                logger.error(f"Error predicting for village {request.village}: {str(e)}")
                results.append({
                    "village": request.village,
                    "error": str(e)
                })
        
        return {
            "success": True,
            "predictions": results,
            "total_processed": len(requests),
            "successful_predictions": len([r for r in results if 'error' not in r]),
            "failed_predictions": len([r for r in results if 'error' in r]),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error making batch predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error making batch predictions: {str(e)}")

# Model info endpoint
@app.get("/model/info")
async def get_model_info():
    try:
        return {
            "success": True,
            "model_info": {
                "is_loaded": predictor.is_model_loaded(),
                "model_version": predictor.get_model_version(),
                "last_training": predictor.get_last_training_time(),
                "feature_names": predictor.get_feature_names(),
                "model_type": predictor.get_model_type(),
                "accuracy": predictor.get_model_accuracy()
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")

# Helper function to generate recommendations
def generate_recommendations(simulation_results):
    recommendations = []
    
    if not simulation_results or 'scenarios' not in simulation_results:
        return ["No simulation data available for recommendations"]
    
    scenarios = simulation_results['scenarios']
    
    # Analyze scenarios and generate recommendations
    high_risk_scenarios = [s for s in scenarios if s.get('risk_index', 0) > 300]
    
    if high_risk_scenarios:
        recommendations.append("Immediate intervention required - multiple high-risk scenarios detected")
        recommendations.append("Deploy emergency water treatment facilities")
        recommendations.append("Increase health surveillance in affected areas")
    
    moderate_risk_scenarios = [s for s in scenarios if 200 < s.get('risk_index', 0) <= 300]
    
    if moderate_risk_scenarios:
        recommendations.append("Enhanced monitoring recommended for moderate-risk scenarios")
        recommendations.append("Prepare contingency plans for water quality management")
    
    # Water quality specific recommendations
    if any(s.get('water_contaminated', False) for s in scenarios):
        recommendations.append("Water contamination detected - implement water purification measures")
        recommendations.append("Conduct immediate water quality testing")
    
    # Rainfall specific recommendations
    high_rainfall_scenarios = [s for s in scenarios if s.get('monthly_rainfall', 0) > 200]
    if high_rainfall_scenarios:
        recommendations.append("Heavy rainfall periods detected - monitor for flood-related contamination")
        recommendations.append("Ensure proper drainage and water storage systems")
    
    if not recommendations:
        recommendations.append("Current scenarios show low risk - maintain regular monitoring")
        recommendations.append("Continue preventive health measures")
    
    return recommendations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
