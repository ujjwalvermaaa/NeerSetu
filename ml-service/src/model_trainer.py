#!/usr/bin/env python3
"""
Advanced Model Training Module for NeerSetu ML Service
Handles model training, validation, and optimization
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging
import joblib
import os
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_auc_score, f1_score
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

from config import config
from logger import ml_logger

logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self):
        self.models = {}
        self.best_model = None
        self.best_score = 0
        self.training_history = []
        self.model_metrics = {}
        
    def train_models(self, X: pd.DataFrame, y: pd.Series, model_types: List[str] = None) -> Dict[str, Any]:
        """Train multiple models and select the best one"""
        try:
            if model_types is None:
                model_types = config.SUPPORTED_MODELS
            
            logger.info(f"Training models: {model_types}")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=config.TEST_SIZE, random_state=config.RANDOM_STATE, stratify=y
            )
            
            # Scale features
            from data_processor import data_processor
            X_train_scaled = data_processor.scale_features(X_train, fit=True)
            X_test_scaled = data_processor.scale_features(X_test, fit=False)
            
            # Train each model
            for model_type in model_types:
                try:
                    model, metrics = self._train_single_model(
                        model_type, X_train_scaled, X_test_scaled, y_train, y_test
                    )
                    
                    if model is not None:
                        self.models[model_type] = model
                        self.model_metrics[model_type] = metrics
                        
                        # Update best model
                        if metrics['accuracy'] > self.best_score:
                            self.best_score = metrics['accuracy']
                            self.best_model = model
                            
                        logger.info(f"Trained {model_type}: Accuracy={metrics['accuracy']:.4f}")
                        
                except Exception as e:
                    logger.error(f"Error training {model_type}: {str(e)}")
                    continue
            
            # Log training results
            self._log_training_results()
            
            return {
                'success': True,
                'models_trained': len(self.models),
                'best_model': self.best_model.__class__.__name__ if self.best_model else None,
                'best_score': self.best_score,
                'model_metrics': self.model_metrics
            }
            
        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _train_single_model(self, model_type: str, X_train: pd.DataFrame, X_test: pd.DataFrame, 
                          y_train: pd.Series, y_test: pd.Series) -> Tuple[Any, Dict[str, float]]:
        """Train a single model and return metrics"""
        try:
            # Initialize model
            model = self._get_model(model_type)
            
            # Train model
            model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
            
            # Calculate metrics
            metrics = self._calculate_metrics(y_test, y_pred, y_pred_proba)
            
            # Cross-validation
            cv_scores = cross_val_score(model, X_train, y_train, cv=config.CROSS_VALIDATION_FOLDS)
            metrics['cv_mean'] = cv_scores.mean()
            metrics['cv_std'] = cv_scores.std()
            
            return model, metrics
            
        except Exception as e:
            logger.error(f"Error training {model_type}: {str(e)}")
            return None, {}
    
    def _get_model(self, model_type: str):
        """Get model instance based on type"""
        if model_type == 'xgboost':
            return xgb.XGBClassifier(**config.XGBOOST_PARAMS)
        elif model_type == 'random_forest':
            return RandomForestClassifier(**config.RANDOM_FOREST_PARAMS)
        elif model_type == 'logistic_regression':
            return LogisticRegression(random_state=config.RANDOM_STATE, max_iter=1000)
        elif model_type == 'svm':
            return SVC(probability=True, random_state=config.RANDOM_STATE)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    def _calculate_metrics(self, y_true: pd.Series, y_pred: np.ndarray, y_pred_proba: np.ndarray = None) -> Dict[str, float]:
        """Calculate model performance metrics"""
        try:
            metrics = {
                'accuracy': accuracy_score(y_true, y_pred),
                'f1_score': f1_score(y_true, y_pred, average='weighted'),
                'precision': classification_report(y_true, y_pred, output_dict=True)['weighted avg']['precision'],
                'recall': classification_report(y_true, y_pred, output_dict=True)['weighted avg']['recall']
            }
            
            if y_pred_proba is not None:
                metrics['roc_auc'] = roc_auc_score(y_true, y_pred_proba)
            else:
                metrics['roc_auc'] = 0.0
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating metrics: {str(e)}")
            return {'accuracy': 0.0, 'f1_score': 0.0, 'precision': 0.0, 'recall': 0.0, 'roc_auc': 0.0}
    
    def optimize_model(self, X: pd.DataFrame, y: pd.Series, model_type: str = 'xgboost') -> Dict[str, Any]:
        """Optimize model hyperparameters using GridSearchCV"""
        try:
            logger.info(f"Optimizing {model_type} model")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=config.TEST_SIZE, random_state=config.RANDOM_STATE, stratify=y
            )
            
            # Scale features
            from data_processor import data_processor
            X_train_scaled = data_processor.scale_features(X_train, fit=True)
            X_test_scaled = data_processor.scale_features(X_test, fit=False)
            
            # Define parameter grid
            param_grid = self._get_param_grid(model_type)
            
            # Initialize base model
            base_model = self._get_model(model_type)
            
            # Grid search
            grid_search = GridSearchCV(
                base_model, 
                param_grid, 
                cv=config.CROSS_VALIDATION_FOLDS,
                scoring='accuracy',
                n_jobs=-1,
                verbose=1
            )
            
            grid_search.fit(X_train_scaled, y_train)
            
            # Get best model
            best_model = grid_search.best_estimator_
            best_params = grid_search.best_params_
            
            # Evaluate on test set
            y_pred = best_model.predict(X_test_scaled)
            y_pred_proba = best_model.predict_proba(X_test_scaled)[:, 1]
            
            metrics = self._calculate_metrics(y_test, y_pred, y_pred_proba)
            
            logger.info(f"Optimized {model_type}: Best params={best_params}, Accuracy={metrics['accuracy']:.4f}")
            
            return {
                'success': True,
                'model': best_model,
                'best_params': best_params,
                'metrics': metrics,
                'cv_score': grid_search.best_score_
            }
            
        except Exception as e:
            logger.error(f"Error optimizing model: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _get_param_grid(self, model_type: str) -> Dict[str, List]:
        """Get parameter grid for hyperparameter optimization"""
        if model_type == 'xgboost':
            return {
                'n_estimators': [50, 100, 200],
                'max_depth': [3, 6, 9],
                'learning_rate': [0.01, 0.1, 0.2],
                'subsample': [0.8, 0.9, 1.0]
            }
        elif model_type == 'random_forest':
            return {
                'n_estimators': [50, 100, 200],
                'max_depth': [5, 10, 15],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
        elif model_type == 'logistic_regression':
            return {
                'C': [0.1, 1, 10, 100],
                'penalty': ['l1', 'l2'],
                'solver': ['liblinear', 'saga']
            }
        elif model_type == 'svm':
            return {
                'C': [0.1, 1, 10, 100],
                'kernel': ['linear', 'rbf', 'poly'],
                'gamma': ['scale', 'auto', 0.1, 1]
            }
        else:
            return {}
    
    def save_model(self, model, model_name: str = None, save_metadata: bool = True) -> bool:
        """Save trained model and metadata"""
        try:
            if model_name is None:
                model_name = config.DEFAULT_MODEL_NAME
            
            # Create models directory
            os.makedirs(config.MODEL_DIR, exist_ok=True)
            
            # Save model
            model_path = os.path.join(config.MODEL_DIR, f"{model_name}.joblib")
            joblib.dump(model, model_path)
            
            # Save scaler
            from data_processor import data_processor
            scaler_path = os.path.join(config.MODEL_DIR, f"{model_name}_scaler.joblib")
            joblib.dump(data_processor.scaler, scaler_path)
            
            # Save label encoders
            encoders_path = os.path.join(config.MODEL_DIR, f"{model_name}_encoders.joblib")
            joblib.dump(data_processor.label_encoders, encoders_path)
            
            # Save metadata
            if save_metadata:
                metadata = {
                    'model_name': model_name,
                    'model_type': model.__class__.__name__,
                    'model_version': config.MODEL_VERSION,
                    'training_time': datetime.now().isoformat(),
                    'feature_names': data_processor.feature_names,
                    'feature_importance': data_processor.feature_importance,
                    'data_stats': data_processor.data_stats,
                    'model_metrics': self.model_metrics,
                    'best_score': self.best_score
                }
                
                metadata_path = os.path.join(config.MODEL_DIR, f"{model_name}_metadata.joblib")
                joblib.dump(metadata, metadata_path)
            
            logger.info(f"Model saved: {model_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            return False
    
    def load_model(self, model_name: str = None) -> bool:
        """Load trained model and metadata"""
        try:
            if model_name is None:
                model_name = config.DEFAULT_MODEL_NAME
            
            # Load model
            model_path = os.path.join(config.MODEL_DIR, f"{model_name}.joblib")
            if not os.path.exists(model_path):
                logger.error(f"Model file not found: {model_path}")
                return False
            
            model = joblib.load(model_path)
            self.best_model = model
            
            # Load scaler
            from data_processor import data_processor
            scaler_path = os.path.join(config.MODEL_DIR, f"{model_name}_scaler.joblib")
            if os.path.exists(scaler_path):
                data_processor.scaler = joblib.load(scaler_path)
            
            # Load label encoders
            encoders_path = os.path.join(config.MODEL_DIR, f"{model_name}_encoders.joblib")
            if os.path.exists(encoders_path):
                data_processor.label_encoders = joblib.load(encoders_path)
            
            # Load metadata
            metadata_path = os.path.join(config.MODEL_DIR, f"{model_name}_metadata.joblib")
            if os.path.exists(metadata_path):
                metadata = joblib.load(metadata_path)
                data_processor.feature_names = metadata.get('feature_names', [])
                data_processor.feature_importance = metadata.get('feature_importance', {})
                self.model_metrics = metadata.get('model_metrics', {})
                self.best_score = metadata.get('best_score', 0)
            
            logger.info(f"Model loaded: {model_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
    
    def _log_training_results(self):
        """Log training results"""
        try:
            training_results = {
                'timestamp': datetime.now().isoformat(),
                'models_trained': len(self.models),
                'best_model': self.best_model.__class__.__name__ if self.best_model else None,
                'best_score': self.best_score,
                'model_metrics': self.model_metrics
            }
            
            ml_logger.log_training_event('training_completed', training_results)
            
        except Exception as e:
            logger.error(f"Error logging training results: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about trained models"""
        return {
            'models_available': list(self.models.keys()),
            'best_model': self.best_model.__class__.__name__ if self.best_model else None,
            'best_score': self.best_score,
            'model_metrics': self.model_metrics,
            'training_history': self.training_history
        }

# Global model trainer instance
model_trainer = ModelTrainer()
