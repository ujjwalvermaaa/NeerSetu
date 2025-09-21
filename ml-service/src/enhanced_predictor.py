#!/usr/bin/env python3
"""
Enhanced Prediction Module for NeerSetu ML Service
Handles predictions, SHAP explainability, and risk assessment
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging
import joblib
import os
# SHAP temporarily disabled due to compatibility issues
SHAP_AVAILABLE = False
shap = None

import warnings
warnings.filterwarnings('ignore')

from config import config
from logger import ml_logger

logger = logging.getLogger(__name__)

class EnhancedOutbreakPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoders = {}
        self.feature_names = []
        self.model_version = config.MODEL_VERSION
        self.last_training_time = None
        self.model_accuracy = None
        self.explainer = None
        self.feature_importance = {}
        self.model_metadata = {}
        
    def load_model(self, model_name: str = None) -> bool:
        """Load a trained model and all associated components"""
        try:
            if model_name is None:
                model_name = config.DEFAULT_MODEL_NAME
            
            model_dir = config.MODEL_DIR
            model_path = os.path.join(model_dir, f"{model_name}.joblib")
            scaler_path = os.path.join(model_dir, f"{model_name}_scaler.joblib")
            encoders_path = os.path.join(model_dir, f"{model_name}_encoders.joblib")
            metadata_path = os.path.join(model_dir, f"{model_name}_metadata.joblib")
            
            if not os.path.exists(model_path):
                logger.warning(f"Model file not found: {model_path}")
                return False
            
            # Load model
            self.model = joblib.load(model_path)
            
            # Load scaler
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            
            # Load label encoders
            if os.path.exists(encoders_path):
                self.label_encoders = joblib.load(encoders_path)
            
            # Load metadata
            if os.path.exists(metadata_path):
                self.model_metadata = joblib.load(metadata_path)
                self.feature_names = self.model_metadata.get('feature_names', [])
                self.feature_importance = self.model_metadata.get('feature_importance', {})
                self.model_accuracy = self.model_metadata.get('best_score', None)
                self.last_training_time = self.model_metadata.get('training_time', None)
            
            # Initialize SHAP explainer
            if config.ENABLE_SHAP and SHAP_AVAILABLE and self.model is not None:
                try:
                    if hasattr(self.model, 'predict_proba'):
                        self.explainer = shap.TreeExplainer(self.model)
                    else:
                        # For models without tree structure, use KernelExplainer
                        self.explainer = shap.KernelExplainer(self.model.predict_proba, 
                                                            np.zeros((1, len(self.feature_names))))
                except Exception as e:
                    logger.warning(f"Could not initialize SHAP explainer: {str(e)}")
                    self.explainer = None
            elif config.ENABLE_SHAP and not SHAP_AVAILABLE:
                logger.warning("SHAP is not available - explainability features disabled")
                self.explainer = None
            
            logger.info(f"Model loaded successfully: {model_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction with comprehensive analysis"""
        try:
            if not self.is_model_loaded():
                raise ValueError("Model not loaded. Please load a trained model first.")
            
            # Prepare features
            X = self._prepare_features(features)
            
            # Make prediction
            prediction_proba = self.model.predict_proba(X)[0]
            prediction_class = self.model.predict(X)[0]
            
            # Calculate confidence
            confidence = max(prediction_proba)
            
            # Calculate risk index (0-500 scale like AQI)
            risk_index = int(prediction_proba[1] * 500)
            
            # Determine risk level
            risk_level = self._get_risk_level(risk_index)
            
            # Get contributing factors
            contributing_factors = self._get_contributing_factors(features, X)
            
            # SHAP explanation
            shap_explanation = None
            if config.ENABLE_SHAP and SHAP_AVAILABLE and self.explainer is not None:
                try:
                    shap_explanation = self._get_shap_explanation(X)
                except Exception as e:
                    logger.warning(f"SHAP explanation failed: {str(e)}")
            
            result = {
                'prediction': int(prediction_class),
                'probability': float(prediction_proba[1]),
                'confidence': float(confidence),
                'risk_index': risk_index,
                'risk_level': risk_level,
                'contributing_factors': contributing_factors,
                'shap_explanation': shap_explanation,
                'feature_importance': self.feature_importance,
                'model_version': self.model_version,
                'timestamp': datetime.now().isoformat()
            }
            
            # Log prediction
            ml_logger.log_prediction_event(
                village=features.get('village', 'Unknown'),
                prediction_type='outbreak_prediction',
                details={
                    'risk_index': risk_index,
                    'risk_level': risk_level,
                    'confidence': confidence,
                    'probability': prediction_proba[1]
                }
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            raise e
    
    def _prepare_features(self, features: Dict[str, Any]) -> np.ndarray:
        """Prepare features for prediction"""
        try:
            # Create feature vector
            feature_vector = []
            
            for feature_name in self.feature_names:
                if feature_name in features:
                    value = features[feature_name]
                else:
                    # Use default value based on feature type
                    value = self._get_default_value(feature_name)
                
                # Handle categorical features
                if feature_name in self.label_encoders:
                    try:
                        value = self.label_encoders[feature_name].transform([str(value)])[0]
                    except ValueError:
                        # Handle unseen categories
                        value = 0
                
                feature_vector.append(value)
            
            # Convert to numpy array
            X = np.array(feature_vector).reshape(1, -1)
            
            # Scale features if scaler is available
            if self.scaler is not None:
                X = self.scaler.transform(X)
            
            return X
            
        except Exception as e:
            logger.error(f"Error preparing features: {str(e)}")
            raise e
    
    def _get_default_value(self, feature_name: str) -> Any:
        """Get default value for missing features"""
        # Health features
        if 'diarrhea' in feature_name.lower():
            return 0
        elif 'fever' in feature_name.lower():
            return 0
        elif 'vomiting' in feature_name.lower():
            return 0
        elif 'population' in feature_name.lower():
            return 1000
        
        # Water quality features
        elif 'ph' in feature_name.lower():
            return 7.0
        elif 'turbidity' in feature_name.lower():
            return 2.0
        elif 'bacteria' in feature_name.lower():
            return 50.0
        elif 'oxygen' in feature_name.lower():
            return 6.0
        elif 'nitrates' in feature_name.lower():
            return 25.0
        elif 'phosphates' in feature_name.lower():
            return 0.05
        elif 'heavy_metals' in feature_name.lower():
            return 0.005
        elif 'chlorine' in feature_name.lower():
            return 0.3
        elif 'fluoride' in feature_name.lower():
            return 0.8
        elif 'arsenic' in feature_name.lower():
            return 0.005
        elif 'contaminated' in feature_name.lower():
            return False
        
        # Environmental features
        elif 'rainfall' in feature_name.lower():
            return 10.0
        elif 'temperature' in feature_name.lower():
            return 25.0
        elif 'humidity' in feature_name.lower():
            return 70.0
        elif 'flood' in feature_name.lower():
            return 'Low'
        elif 'drought' in feature_name.lower():
            return 'No'
        elif 'season' in feature_name.lower():
            return 'Spring'
        elif 'month' in feature_name.lower():
            return 6
        
        # Default numeric value
        else:
            return 0.0
    
    def _get_risk_level(self, risk_index: int) -> str:
        """Get risk level based on risk index"""
        if risk_index <= config.RISK_THRESHOLDS['moderate']:
            return 'Low'
        elif risk_index <= config.RISK_THRESHOLDS['high']:
            return 'Moderate'
        elif risk_index <= config.RISK_THRESHOLDS['very_high']:
            return 'High'
        elif risk_index <= config.RISK_THRESHOLDS['severe']:
            return 'Very High'
        else:
            return 'Critical'
    
    def _get_contributing_factors(self, features: Dict[str, Any], X: np.ndarray) -> List[Dict[str, Any]]:
        """Get contributing factors for the prediction"""
        try:
            factors = []
            
            # Health factors
            if features.get('total_diarrhea_cases', 0) > 10:
                factors.append({
                    'factor': 'High diarrhea cases',
                    'value': features.get('total_diarrhea_cases', 0),
                    'impact': 'High',
                    'description': 'Number of diarrhea cases exceeds normal threshold'
                })
            
            if features.get('total_affected_population', 0) > 100:
                factors.append({
                    'factor': 'Large affected population',
                    'value': features.get('total_affected_population', 0),
                    'impact': 'High',
                    'description': 'Significant portion of population affected'
                })
            
            # Water quality factors
            if features.get('avg_bacteria_ecoli', 0) > 100:
                factors.append({
                    'factor': 'High E.coli contamination',
                    'value': features.get('avg_bacteria_ecoli', 0),
                    'impact': 'Critical',
                    'description': 'E.coli levels exceed safe limits'
                })
            
            if features.get('avg_ph', 7.0) < 6.5 or features.get('avg_ph', 7.0) > 8.5:
                factors.append({
                    'factor': 'Unsafe pH levels',
                    'value': features.get('avg_ph', 7.0),
                    'impact': 'High',
                    'description': 'pH levels outside safe range (6.5-8.5)'
                })
            
            if features.get('avg_turbidity', 0) > 5.0:
                factors.append({
                    'factor': 'High turbidity',
                    'value': features.get('avg_turbidity', 0),
                    'impact': 'High',
                    'description': 'Water turbidity exceeds safe limits'
                })
            
            # Environmental factors
            if features.get('daily_rainfall', 0) > 50:
                factors.append({
                    'factor': 'Heavy rainfall',
                    'value': features.get('daily_rainfall', 0),
                    'impact': 'Moderate',
                    'description': 'Heavy rainfall may cause contamination'
                })
            
            if features.get('flood_risk_level', 'Low') in ['High', 'Very High']:
                factors.append({
                    'factor': 'Flood risk',
                    'value': features.get('flood_risk_level', 'Low'),
                    'impact': 'High',
                    'description': 'High flood risk increases contamination probability'
                })
            
            if features.get('temperature', 25) > 30:
                factors.append({
                    'factor': 'High temperature',
                    'value': features.get('temperature', 25),
                    'impact': 'Moderate',
                    'description': 'High temperature promotes bacterial growth'
                })
            
            # Sort factors by impact
            impact_order = {'Critical': 4, 'High': 3, 'Moderate': 2, 'Low': 1}
            factors.sort(key=lambda x: impact_order.get(x['impact'], 0), reverse=True)
            
            return factors[:5]  # Return top 5 factors
            
        except Exception as e:
            logger.error(f"Error getting contributing factors: {str(e)}")
            return []
    
    def _get_shap_explanation(self, X: np.ndarray) -> Dict[str, Any]:
        """Get SHAP explanation for the prediction"""
        try:
            if self.explainer is None:
                return None
            
            # Calculate SHAP values
            shap_values = self.explainer.shap_values(X)
            
            # Get feature names
            feature_names = self.feature_names if self.feature_names else [f'feature_{i}' for i in range(X.shape[1])]
            
            # Create explanation
            explanation = {
                'shap_values': shap_values[0].tolist() if len(shap_values) > 1 else shap_values.tolist(),
                'feature_names': feature_names,
                'base_value': self.explainer.expected_value if hasattr(self.explainer, 'expected_value') else 0,
                'prediction': self.model.predict(X)[0]
            }
            
            # Get top contributing features
            feature_importance = list(zip(feature_names, shap_values[0] if len(shap_values) > 1 else shap_values))
            feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
            
            explanation['top_features'] = [
                {'feature': name, 'importance': float(importance)}
                for name, importance in feature_importance[:10]
            ]
            
            return explanation
            
        except Exception as e:
            logger.error(f"Error getting SHAP explanation: {str(e)}")
            return None
    
    def simulate_scenarios(self, scenario_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate different outbreak scenarios"""
        try:
            if not self.is_model_loaded():
                raise ValueError("Model not loaded. Please load a trained model first.")
            
            base_features = scenario_data.get('base_features', {})
            scenarios = scenario_data.get('scenarios', [])
            
            results = {
                'base_scenario': self.predict(base_features),
                'scenarios': []
            }
            
            # Simulate each scenario
            for i, scenario in enumerate(scenarios):
                try:
                    # Merge base features with scenario modifications
                    scenario_features = {**base_features, **scenario.get('modifications', {})}
                    
                    # Make prediction
                    prediction = self.predict(scenario_features)
                    
                    # Add scenario metadata
                    prediction['scenario_name'] = scenario.get('name', f'Scenario {i+1}')
                    prediction['scenario_description'] = scenario.get('description', '')
                    prediction['modifications'] = scenario.get('modifications', {})
                    
                    results['scenarios'].append(prediction)
                    
                except Exception as e:
                    logger.error(f"Error simulating scenario {i}: {str(e)}")
                    continue
            
            return results
            
        except Exception as e:
            logger.error(f"Error simulating scenarios: {str(e)}")
            raise e
    
    def batch_predict(self, features_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Make batch predictions"""
        try:
            if not self.is_model_loaded():
                raise ValueError("Model not loaded. Please load a trained model first.")
            
            results = []
            
            for features in features_list:
                try:
                    prediction = self.predict(features)
                    results.append(prediction)
                except Exception as e:
                    logger.error(f"Error in batch prediction: {str(e)}")
                    results.append({
                        'error': str(e),
                        'village': features.get('village', 'Unknown'),
                        'timestamp': datetime.now().isoformat()
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Error in batch prediction: {str(e)}")
            raise e
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            'is_loaded': self.is_model_loaded(),
            'model_type': self.model.__class__.__name__ if self.model else None,
            'model_version': self.model_version,
            'last_training': self.last_training_time,
            'accuracy': self.model_accuracy,
            'feature_names': self.feature_names,
            'feature_count': len(self.feature_names),
            'has_shap': self.explainer is not None,
            'metadata': self.model_metadata
        }
    
    def get_feature_names(self) -> List[str]:
        """Get feature names"""
        return self.feature_names
    
    def get_model_version(self) -> str:
        """Get model version"""
        return self.model_version
    
    def get_last_training_time(self) -> str:
        """Get last training time"""
        return self.last_training_time or "Unknown"
    
    def get_model_type(self) -> str:
        """Get model type"""
        return self.model.__class__.__name__ if self.model else "Not loaded"
    
    def get_model_accuracy(self) -> float:
        """Get model accuracy"""
        return self.model_accuracy or 0.0

# Global predictor instance
enhanced_predictor = EnhancedOutbreakPredictor()
