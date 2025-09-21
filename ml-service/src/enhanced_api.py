#!/usr/bin/env python3
"""
Enhanced FastAPI Application for NeerSetu ML Service
Comprehensive ML service with advanced features and monitoring
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import os
import logging
from datetime import datetime
import asyncio
from contextlib import asynccontextmanager

# Import our enhanced modules
from config import config
from logger import ml_logger
from enhanced_ml_pipeline import enhanced_ml_pipeline
from enhanced_predictor import enhanced_predictor

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format=config.LOG_FORMAT,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(config.LOG_DIR, 'ml_service.log'))
    ]
)
logger = logging.getLogger(__name__)

# Pydantic models
class PredictionRequest(BaseModel):
    village: str = Field(..., description="Village name")
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    
    # Health data
    total_diarrhea_cases: int = Field(0, ge=0, description="Total diarrhea cases")
    total_fever_cases: int = Field(0, ge=0, description="Total fever cases")
    total_vomiting_cases: int = Field(0, ge=0, description="Total vomiting cases")
    total_affected_population: int = Field(0, ge=0, description="Total affected population")
    
    # Water quality data
    avg_ph: float = Field(7.0, ge=0, le=14, description="Average pH level")
    avg_turbidity: float = Field(0.0, ge=0, description="Average turbidity (NTU)")
    avg_bacteria_ecoli: float = Field(0.0, ge=0, description="Average E.coli count")
    avg_bacteria_coliform: float = Field(0.0, ge=0, description="Average coliform count")
    avg_dissolved_oxygen: float = Field(0.0, ge=0, description="Average dissolved oxygen")
    avg_nitrates: float = Field(0.0, ge=0, description="Average nitrates")
    avg_phosphates: float = Field(0.0, ge=0, description="Average phosphates")
    avg_heavy_metals: float = Field(0.0, ge=0, description="Average heavy metals")
    avg_chlorine_residual: float = Field(0.0, ge=0, description="Average chlorine residual")
    avg_fluoride: float = Field(0.0, ge=0, description="Average fluoride")
    avg_arsenic: float = Field(0.0, ge=0, description="Average arsenic")
    water_contaminated: bool = Field(False, description="Water contamination status")
    
    # Environmental data
    daily_rainfall: float = Field(0.0, ge=0, description="Daily rainfall (mm)")
    weekly_rainfall: float = Field(0.0, ge=0, description="Weekly rainfall (mm)")
    monthly_rainfall: float = Field(0.0, ge=0, description="Monthly rainfall (mm)")
    temperature: float = Field(25.0, ge=-10, le=50, description="Temperature (°C)")
    humidity: float = Field(70.0, ge=0, le=100, description="Humidity (%)")
    flood_risk_level: str = Field("Low", description="Flood risk level")
    drought_indicator: str = Field("No", description="Drought indicator")
    
    # Seasonal data
    season: str = Field("Spring", description="Season")
    month: int = Field(6, ge=1, le=12, description="Month (1-12)")

class SimulationRequest(BaseModel):
    village: str = Field(..., description="Village name")
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    base_features: Dict[str, Any] = Field(..., description="Base features for simulation")
    scenarios: List[Dict[str, Any]] = Field(..., description="List of scenarios to simulate")

class TrainingRequest(BaseModel):
    dataset_path: Optional[str] = Field(None, description="Path to dataset")
    model_name: str = Field("outbreak_model", description="Model name")
    model_type: str = Field("xgboost", description="Model type")
    optimize: bool = Field(False, description="Whether to optimize hyperparameters")

class BatchPredictionRequest(BaseModel):
    predictions: List[PredictionRequest] = Field(..., description="List of prediction requests")

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

class ModelInfoResponse(BaseModel):
    success: bool
    model_info: Dict[str, Any]
    timestamp: str

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    logger.info("Starting NeerSetu ML Service")
    
    # Validate configuration
    if not config.validate_config():
        logger.error("Configuration validation failed")
        raise RuntimeError("Configuration validation failed")
    
    # Try to load existing model
    if enhanced_predictor.load_model():
        logger.info("Loaded existing model")
    else:
        logger.info("No existing model found - will need to train")
    
    yield
    
    # Shutdown
    logger.info("Shutting down NeerSetu ML Service")

# Initialize FastAPI app
app = FastAPI(
    title="NeerSetu ML Service",
    description="AI-powered outbreak prediction service for water-borne diseases in Northeast India",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# Health check endpoint
@app.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Health check endpoint"""
    try:
        model_loaded = enhanced_predictor.is_model_loaded()
        model_info = enhanced_predictor.get_model_info()
        
        return {
            "success": True,
            "message": "NeerSetu ML Service is running",
            "timestamp": datetime.now().isoformat(),
            "version": "2.0.0",
            "model_loaded": model_loaded,
            "model_type": model_info.get('model_type', 'Not loaded'),
            "model_accuracy": model_info.get('accuracy', 0.0)
        }
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return {
            "success": False,
            "message": "Service error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

# Status endpoint
@app.get("/status", response_model=ModelInfoResponse)
async def get_status():
    """Get detailed service status"""
    try:
        model_info = enhanced_ml_pipeline.get_model_info()
        
        return ModelInfoResponse(
            success=True,
            model_info=model_info,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting status: {str(e)}")

# Train model endpoint
@app.post("/train")
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train a new model"""
    try:
        logger.info(f"Starting model training: {request.model_name}")
        
        # Start training in background
        background_tasks.add_task(
            _train_model_task,
            request.dataset_path,
            request.model_name,
            request.model_type,
            request.optimize
        )
        
        return {
            "success": True,
            "message": "Model training started in background",
            "model_name": request.model_name,
            "model_type": request.model_type,
            "optimize": request.optimize,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error starting model training: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting model training: {str(e)}")

async def _train_model_task(dataset_path: str, model_name: str, model_type: str, optimize: bool):
    """Background task for model training"""
    try:
        logger.info(f"Background training started for {model_name}")
        
        # Load and prepare data
        if not enhanced_ml_pipeline.load_and_prepare_data():
            logger.error("Failed to load and prepare data")
            return
        
        # Train model
        if optimize:
            result = enhanced_ml_pipeline.optimize_model(model_type)
        else:
            result = enhanced_ml_pipeline.train_model(dataset_path, model_name)
        
        if result['success']:
            logger.info(f"Model training completed successfully: {result}")
        else:
            logger.error(f"Model training failed: {result}")
            
    except Exception as e:
        logger.error(f"Background training error: {str(e)}")

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict_outbreak(request: PredictionRequest):
    """Make outbreak prediction"""
    try:
        if not enhanced_predictor.is_model_loaded():
            raise HTTPException(
                status_code=503, 
                detail="Model not loaded. Please train the model first."
            )
        
        logger.info(f"Making prediction for village: {request.village}")
        
        # Prepare features
        features = request.dict()
        
        # Make prediction
        prediction_result = enhanced_ml_pipeline.predict_outbreak(features)
        
        if not prediction_result['success']:
            raise HTTPException(status_code=500, detail=prediction_result['error'])
        
        prediction = prediction_result['prediction']
        
        return PredictionResponse(
            success=True,
            prediction=prediction,
            risk_index=prediction['risk_index'],
            risk_level=prediction['risk_level'],
            probability=prediction['probability'],
            contributing_factors=prediction['contributing_factors'],
            confidence=prediction['confidence'],
            timestamp=prediction['timestamp']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error making prediction: {str(e)}")

# Simulation endpoint
@app.post("/simulate", response_model=SimulationResponse)
async def simulate_outbreak(request: SimulationRequest):
    """Simulate outbreak scenarios"""
    try:
        if not enhanced_predictor.is_model_loaded():
            raise HTTPException(
                status_code=503, 
                detail="Model not loaded. Please train the model first."
            )
        
        logger.info(f"Running outbreak simulation for village: {request.village}")
        
        # Prepare scenario data
        scenario_data = {
            'base_features': request.base_features,
            'scenarios': request.scenarios
        }
        
        # Run simulation
        simulation_result = enhanced_ml_pipeline.simulate_scenarios(scenario_data)
        
        if not simulation_result['success']:
            raise HTTPException(status_code=500, detail=simulation_result['error'])
        
        simulation_results = simulation_result['simulation_results']
        
        # Generate recommendations
        recommendations = _generate_recommendations(simulation_results)
        
        return SimulationResponse(
            success=True,
            simulation_results=simulation_results,
            risk_scenarios=simulation_results.get('scenarios', []),
            recommendations=recommendations,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running simulation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error running simulation: {str(e)}")

# Batch prediction endpoint
@app.post("/predict/batch")
async def predict_batch(request: BatchPredictionRequest):
    """Make batch predictions"""
    try:
        if not enhanced_predictor.is_model_loaded():
            raise HTTPException(
                status_code=503, 
                detail="Model not loaded. Please train the model first."
            )
        
        if len(request.predictions) > config.MAX_BATCH_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"Batch size exceeds maximum allowed: {config.MAX_BATCH_SIZE}"
            )
        
        logger.info(f"Making batch predictions for {len(request.predictions)} villages")
        
        # Prepare features list
        features_list = [pred.dict() for pred in request.predictions]
        
        # Make batch predictions
        batch_result = enhanced_ml_pipeline.batch_predict(features_list)
        
        if not batch_result['success']:
            raise HTTPException(status_code=500, detail=batch_result['error'])
        
        return batch_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error making batch predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error making batch predictions: {str(e)}")

# Model info endpoint
@app.get("/model/info", response_model=ModelInfoResponse)
async def get_model_info():
    """Get detailed model information"""
    try:
        model_info = enhanced_ml_pipeline.get_model_info()
        
        return ModelInfoResponse(
            success=True,
            model_info=model_info,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")

# Feature importance endpoint
@app.get("/model/features")
async def get_feature_importance():
    """Get feature importance analysis"""
    try:
        feature_result = enhanced_ml_pipeline.get_feature_importance()
        
        if not feature_result['success']:
            raise HTTPException(status_code=404, detail=feature_result['error'])
        
        return feature_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feature importance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting feature importance: {str(e)}")

# Data quality endpoint
@app.get("/data/quality")
async def get_data_quality():
    """Get data quality report"""
    try:
        quality_result = enhanced_ml_pipeline.get_data_quality_report()
        
        if not quality_result['success']:
            raise HTTPException(status_code=404, detail=quality_result['error'])
        
        return quality_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting data quality: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting data quality: {str(e)}")

# Model evaluation endpoint
@app.post("/model/evaluate")
async def evaluate_model():
    """Evaluate model performance"""
    try:
        if not enhanced_predictor.is_model_loaded():
            raise HTTPException(
                status_code=503, 
                detail="Model not loaded. Please train the model first."
            )
        
        logger.info("Starting model evaluation")
        
        evaluation_result = enhanced_ml_pipeline.evaluate_model()
        
        if not evaluation_result['success']:
            raise HTTPException(status_code=500, detail=evaluation_result['error'])
        
        return evaluation_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating model: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error evaluating model: {str(e)}")

# Helper function to generate recommendations
def _generate_recommendations(simulation_results: Dict[str, Any]) -> List[str]:
    """Generate recommendations based on simulation results"""
    recommendations = []
    
    if not simulation_results or 'scenarios' not in simulation_results:
        return ["No simulation data available for recommendations"]
    
    scenarios = simulation_results['scenarios']
    
    # Analyze scenarios and generate recommendations
    high_risk_scenarios = [s for s in scenarios if s.get('risk_index', 0) > 300]
    
    if high_risk_scenarios:
        recommendations.append("🚨 IMMEDIATE ACTION REQUIRED - Multiple high-risk scenarios detected")
        recommendations.append("💧 Deploy emergency water treatment facilities")
        recommendations.append("🏥 Increase health surveillance in affected areas")
        recommendations.append("📢 Issue public health alerts")
    
    moderate_risk_scenarios = [s for s in scenarios if 200 < s.get('risk_index', 0) <= 300]
    
    if moderate_risk_scenarios:
        recommendations.append("⚠️ Enhanced monitoring recommended for moderate-risk scenarios")
        recommendations.append("📋 Prepare contingency plans for water quality management")
        recommendations.append("🔍 Conduct additional water quality testing")
    
    # Water quality specific recommendations
    if any(s.get('water_contaminated', False) for s in scenarios):
        recommendations.append("💧 Water contamination detected - implement water purification measures")
        recommendations.append("🧪 Conduct immediate water quality testing")
        recommendations.append("🚫 Restrict access to contaminated water sources")
    
    # Rainfall specific recommendations
    high_rainfall_scenarios = [s for s in scenarios if s.get('monthly_rainfall', 0) > 200]
    if high_rainfall_scenarios:
        recommendations.append("🌧️ Heavy rainfall periods detected - monitor for flood-related contamination")
        recommendations.append("🏗️ Ensure proper drainage and water storage systems")
        recommendations.append("📊 Increase monitoring frequency during rainy season")
    
    # Temperature specific recommendations
    high_temp_scenarios = [s for s in scenarios if s.get('temperature', 25) > 35]
    if high_temp_scenarios:
        recommendations.append("🌡️ High temperature conditions - monitor for increased bacterial growth")
        recommendations.append("❄️ Ensure proper water storage and cooling")
    
    if not recommendations:
        recommendations.append("✅ Current scenarios show low risk - maintain regular monitoring")
        recommendations.append("🔄 Continue preventive health measures")
        recommendations.append("📈 Monitor trends and patterns")
    
    return recommendations

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"success": False, "message": "Endpoint not found", "timestamp": datetime.now().isoformat()}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error", "timestamp": datetime.now().isoformat()}
    )

if __name__ == "__main__":
    import uvicorn
    
    # Create logs directory
    os.makedirs(config.LOG_DIR, exist_ok=True)
    
    # Run the application
    uvicorn.run(
        app, 
        host=config.HOST, 
        port=config.PORT,
        log_level=config.LOG_LEVEL.lower(),
        access_log=True
    )
