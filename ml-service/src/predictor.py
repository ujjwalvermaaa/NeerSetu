import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
import logging
import shap

logger = logging.getLogger(__name__)

class OutbreakPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoders = {}
        self.feature_names = []
        self.model_version = "1.0.0"
        self.last_training_time = None
        self.model_accuracy = None
        self.explainer = None
        
    def load_model(self, model_name="outbreak_model"):
        """Load a trained model"""
        try:
            model_dir = "models"
            model_path = os.path.join(model_dir, f"{model_name}.joblib")
            scaler_path = os.path.join(model_dir, f"{model_name}_scaler.joblib")
            encoders_path = os.path.join(model_dir, f"{model_name}_encoders.joblib")
            
            if not os.path.exists(model_path):
                logger.warning(f"Model file not found: {model_path}")
                return False
            
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.label_encoders = joblib.load(encoders_path)
            
            # Initialize SHAP explainer
            self.explainer = shap.TreeExplainer(self.model)
            
            logger.info(f"Model loaded from: {model_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
    
    def is_model_loaded(self):
        """Check if model is loaded"""
        return self.model is not None
    
    def get_model_version(self):
        """Get model version"""
        return self.model_version
    
    def get_last_training_time(self):
        """Get last training time"""
        return self.last_training_time
    
    def get_feature_names(self):
        """Get feature names"""
        return self.feature_names
    
    def get_model_type(self):
        """Get model type"""
        if self.model is None:
            return "No model loaded"
        return type(self.model).__name__
    
    def get_model_accuracy(self):
        """Get model accuracy"""
        return self.model_accuracy
    
    def predict(self, features):
        """Make a prediction for given features"""
        try:
            if not self.is_model_loaded():
                raise ValueError("Model not loaded. Please load a trained model first.")
            
            # Convert features to DataFrame
            feature_df = pd.DataFrame([features])
            
            # Encode categorical variables
            for col, encoder in self.label_encoders.items():
                if col in feature_df.columns:
                    feature_df[col] = encoder.transform(feature_df[col].astype(str))
            
            # Scale features
            feature_array = self.scaler.transform(feature_df)
            
            # Make prediction
            probability = self.model.predict_proba(feature_array)[0][1]
            prediction = self.model.predict(feature_array)[0]
            
            # Get feature importance using SHAP
            shap_values = self.explainer.shap_values(feature_array)
            feature_importance = self._get_feature_importance(feature_df.columns, shap_values[0])
            
            # Calculate confidence based on probability
            confidence = abs(probability - 0.5) * 2
            
            return {
                "prediction": int(prediction),
                "probability": float(probability),
                "confidence": float(confidence),
                "contributing_factors": feature_importance
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            raise e
    
    def _get_feature_importance(self, feature_names, shap_values):
        """Get feature importance from SHAP values"""
        try:
            # Get absolute SHAP values
            abs_shap_values = np.abs(shap_values)
            
            # Get top contributing factors
            top_indices = np.argsort(abs_shap_values)[-3:][::-1]  # Top 3 factors
            
            contributing_factors = []
            for idx in top_indices:
                if idx < len(feature_names):
                    factor_name = feature_names[idx]
                    importance = float(abs_shap_values[idx])
                    
                    # Create human-readable description
                    description = self._get_factor_description(factor_name, shap_values[idx])
                    
                    contributing_factors.append({
                        "factor": factor_name,
                        "importance": importance,
                        "description": description,
                        "impact": "positive" if shap_values[idx] > 0 else "negative"
                    })
            
            return contributing_factors
            
        except Exception as e:
            logger.error(f"Error getting feature importance: {str(e)}")
            return []
    
    def _get_factor_description(self, factor_name, shap_value):
        """Get human-readable description for a factor"""
        descriptions = {
            'avg_ph': f"Water pH level ({'high' if shap_value > 0 else 'low'} risk)",
            'avg_turbidity': f"Water turbidity ({'high' if shap_value > 0 else 'low'} risk)",
            'avg_bacteria_ecoli': f"E.coli bacteria levels ({'high' if shap_value > 0 else 'low'} risk)",
            'avg_bacteria_coliform': f"Coliform bacteria levels ({'high' if shap_value > 0 else 'low'} risk)",
            'daily_rainfall': f"Daily rainfall ({'high' if shap_value > 0 else 'low'} risk)",
            'weekly_rainfall': f"Weekly rainfall ({'high' if shap_value > 0 else 'low'} risk)",
            'monthly_rainfall': f"Monthly rainfall ({'high' if shap_value > 0 else 'low'} risk)",
            'temperature': f"Temperature ({'high' if shap_value > 0 else 'low'} risk)",
            'humidity': f"Humidity levels ({'high' if shap_value > 0 else 'low'} risk)",
            'total_diarrhea_cases': f"Diarrhea cases ({'high' if shap_value > 0 else 'low'} risk)",
            'total_fever_cases': f"Fever cases ({'high' if shap_value > 0 else 'low'} risk)",
            'total_vomiting_cases': f"Vomiting cases ({'high' if shap_value > 0 else 'low'} risk)",
            'water_contaminated': f"Water contamination status ({'contaminated' if shap_value > 0 else 'clean'})",
            'flood_risk_level': f"Flood risk level ({'high' if shap_value > 0 else 'low'} risk)",
            'drought_indicator': f"Drought conditions ({'present' if shap_value > 0 else 'absent'})"
        }
        
        return descriptions.get(factor_name, f"Factor: {factor_name}")
    
    def simulate_scenarios(self, scenario_data):
        """Simulate different outbreak scenarios"""
        try:
            if not self.is_model_loaded():
                raise ValueError("Model not loaded. Please load a trained model first.")
            
            scenarios = []
            
            # Base scenario
            base_features = scenario_data.get('base_features', {})
            base_prediction = self.predict(base_features)
            scenarios.append({
                "scenario": "Current Conditions",
                "risk_index": int(base_prediction['probability'] * 500),
                "probability": base_prediction['probability'],
                "description": "Current environmental and health conditions"
            })
            
            # High rainfall scenario
            if 'rainfall_scenarios' in scenario_data:
                for rainfall_scenario in scenario_data['rainfall_scenarios']:
                    features = base_features.copy()
                    features.update(rainfall_scenario['features'])
                    
                    prediction = self.predict(features)
                    scenarios.append({
                        "scenario": rainfall_scenario['name'],
                        "risk_index": int(prediction['probability'] * 500),
                        "probability": prediction['probability'],
                        "description": rainfall_scenario['description'],
                        "changes": rainfall_scenario['features']
                    })
            
            # Water contamination scenario
            if 'water_scenarios' in scenario_data:
                for water_scenario in scenario_data['water_scenarios']:
                    features = base_features.copy()
                    features.update(water_scenario['features'])
                    
                    prediction = self.predict(features)
                    scenarios.append({
                        "scenario": water_scenario['name'],
                        "risk_index": int(prediction['probability'] * 500),
                        "probability": prediction['probability'],
                        "description": water_scenario['description'],
                        "changes": water_scenario['features']
                    })
            
            # Health surge scenario
            if 'health_scenarios' in scenario_data:
                for health_scenario in scenario_data['health_scenarios']:
                    features = base_features.copy()
                    features.update(health_scenario['features'])
                    
                    prediction = self.predict(features)
                    scenarios.append({
                        "scenario": health_scenario['name'],
                        "risk_index": int(prediction['probability'] * 500),
                        "probability": prediction['probability'],
                        "description": health_scenario['description'],
                        "changes": health_scenario['features']
                    })
            
            return {
                "scenarios": scenarios,
                "total_scenarios": len(scenarios),
                "highest_risk": max(scenarios, key=lambda x: x['risk_index']),
                "lowest_risk": min(scenarios, key=lambda x: x['risk_index']),
                "average_risk": sum(s['risk_index'] for s in scenarios) / len(scenarios)
            }
            
        except Exception as e:
            logger.error(f"Error simulating scenarios: {str(e)}")
            raise e
    
    def batch_predict(self, features_list):
        """Make predictions for multiple feature sets"""
        try:
            if not self.is_model_loaded():
                raise ValueError("Model not loaded. Please load a trained model first.")
            
            predictions = []
            
            for features in features_list:
                try:
                    prediction = self.predict(features)
                    predictions.append({
                        "success": True,
                        "prediction": prediction
                    })
                except Exception as e:
                    predictions.append({
                        "success": False,
                        "error": str(e)
                    })
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error in batch prediction: {str(e)}")
            raise e
