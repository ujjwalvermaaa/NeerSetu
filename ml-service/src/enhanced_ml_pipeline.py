#!/usr/bin/env python3
"""
Enhanced ML Pipeline for NeerSetu ML Service
Comprehensive machine learning pipeline with advanced features
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging
import os
import warnings
warnings.filterwarnings('ignore')

from config import config
from logger import ml_logger
from data_processor import data_processor
from model_trainer import model_trainer
from enhanced_predictor import enhanced_predictor

logger = logging.getLogger(__name__)

class EnhancedMLPipeline:
    def __init__(self):
        self.data = None
        self.features = None
        self.target = None
        self.training_history = []
        self.model_performance = {}
        
    def load_and_prepare_data(self) -> bool:
        """Load and prepare all datasets for training"""
        try:
            logger.info("Starting data loading and preparation")
            
            # Load all datasets
            datasets = data_processor.load_datasets()
            if not datasets:
                logger.error("No datasets loaded successfully")
                return False
            
            # Merge datasets
            merged_data = data_processor.merge_datasets(datasets)
            if merged_data.empty:
                logger.error("Failed to merge datasets")
                return False
            
            # Preprocess data
            processed_data = data_processor.preprocess_data(merged_data)
            if processed_data.empty:
                logger.error("Failed to preprocess data")
                return False
            
            # Store processed data
            self.data = processed_data
            
            # Prepare features and target
            self.features, self.target = data_processor.prepare_features_and_target(processed_data)
            
            if self.features.empty or self.target.empty:
                logger.error("Failed to prepare features and target")
                return False
            
            # Validate data quality
            quality_metrics = data_processor.validate_data_quality(processed_data)
            logger.info(f"Data quality score: {quality_metrics.get('quality_score', 0)}")
            
            # Log data preparation
            ml_logger.log_training_event('data_preparation_completed', {
                'dataset_shape': processed_data.shape,
                'feature_count': len(self.features.columns),
                'target_distribution': self.target.value_counts().to_dict(),
                'quality_score': quality_metrics.get('quality_score', 0)
            })
            
            logger.info(f"Data preparation completed: {self.features.shape[0]} samples, {self.features.shape[1]} features")
            return True
            
        except Exception as e:
            logger.error(f"Error in data preparation: {str(e)}")
            return False
    
    def train_model(self, dataset_path: str = None, model_name: str = None) -> Dict[str, Any]:
        """Train the ML model with comprehensive evaluation"""
        try:
            logger.info("Starting model training")
            
            # Load and prepare data if not already done
            if self.data is None or self.features is None or self.target is None:
                if not self.load_and_prepare_data():
                    return {'success': False, 'error': 'Failed to load and prepare data'}
            
            # Scale features
            scaled_features = data_processor.scale_features(self.features, fit=True)
            
            # Select features if enabled
            if config.TOP_FEATURES_COUNT > 0:
                scaled_features = data_processor.select_features(scaled_features, self.target)
            
            # Train models
            training_results = model_trainer.train_models(scaled_features, self.target)
            
            if not training_results['success']:
                return training_results
            
            # Get best model
            best_model = model_trainer.best_model
            if best_model is None:
                return {'success': False, 'error': 'No model trained successfully'}
            
            # Get feature importance
            feature_importance = data_processor.get_feature_importance(best_model)
            
            # Save model
            model_name = model_name or config.DEFAULT_MODEL_NAME
            save_success = model_trainer.save_model(best_model, model_name)
            
            if not save_success:
                logger.warning("Failed to save model")
            
            # Update predictor
            enhanced_predictor.load_model(model_name)
            
            # Log training completion
            ml_logger.log_training_event('model_training_completed', {
                'model_name': model_name,
                'model_type': best_model.__class__.__name__,
                'accuracy': training_results['best_score'],
                'feature_importance': feature_importance,
                'models_trained': training_results['models_trained']
            })
            
            # Store training history
            self.training_history.append({
                'timestamp': datetime.now().isoformat(),
                'model_name': model_name,
                'model_type': best_model.__class__.__name__,
                'accuracy': training_results['best_score'],
                'features_count': len(scaled_features.columns)
            })
            
            logger.info(f"Model training completed: {best_model.__class__.__name__} with accuracy {training_results['best_score']:.4f}")
            
            return {
                'success': True,
                'model_name': model_name,
                'model_type': best_model.__class__.__name__,
                'accuracy': training_results['best_score'],
                'feature_importance': feature_importance,
                'models_trained': training_results['models_trained'],
                'model_metrics': training_results['model_metrics']
            }
            
        except Exception as e:
            logger.error(f"Error in model training: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def optimize_model(self, model_type: str = None) -> Dict[str, Any]:
        """Optimize model hyperparameters"""
        try:
            logger.info(f"Starting model optimization for {model_type or 'best model'}")
            
            if self.features is None or self.target is None:
                if not self.load_and_prepare_data():
                    return {'success': False, 'error': 'Failed to load and prepare data'}
            
            # Scale features
            scaled_features = data_processor.scale_features(self.features, fit=True)
            
            # Select features if enabled
            if config.TOP_FEATURES_COUNT > 0:
                scaled_features = data_processor.select_features(scaled_features, self.target)
            
            # Optimize model
            optimization_results = model_trainer.optimize_model(scaled_features, self.target, model_type)
            
            if not optimization_results['success']:
                return optimization_results
            
            # Save optimized model
            model_name = f"{config.DEFAULT_MODEL_NAME}_optimized"
            save_success = model_trainer.save_model(optimization_results['model'], model_name)
            
            if save_success:
                # Update predictor
                enhanced_predictor.load_model(model_name)
            
            logger.info(f"Model optimization completed: {optimization_results['metrics']['accuracy']:.4f}")
            
            return {
                'success': True,
                'model_name': model_name,
                'best_params': optimization_results['best_params'],
                'accuracy': optimization_results['metrics']['accuracy'],
                'cv_score': optimization_results['cv_score']
            }
            
        except Exception as e:
            logger.error(f"Error in model optimization: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def evaluate_model(self, model_name: str = None) -> Dict[str, Any]:
        """Evaluate model performance comprehensively"""
        try:
            logger.info("Starting model evaluation")
            
            if not enhanced_predictor.is_model_loaded():
                if model_name:
                    enhanced_predictor.load_model(model_name)
                else:
                    return {'success': False, 'error': 'No model loaded for evaluation'}
            
            if self.features is None or self.target is None:
                if not self.load_and_prepare_data():
                    return {'success': False, 'error': 'Failed to load and prepare data'}
            
            # Prepare test data
            from sklearn.model_selection import train_test_split
            X_train, X_test, y_train, y_test = train_test_split(
                self.features, self.target, test_size=config.TEST_SIZE, 
                random_state=config.RANDOM_STATE, stratify=self.target
            )
            
            # Scale features
            X_test_scaled = data_processor.scale_features(X_test, fit=False)
            
            # Make predictions
            predictions = []
            for _, row in X_test_scaled.iterrows():
                features_dict = row.to_dict()
                prediction = enhanced_predictor.predict(features_dict)
                predictions.append(prediction)
            
            # Calculate evaluation metrics
            y_pred = [p['prediction'] for p in predictions]
            y_pred_proba = [p['probability'] for p in predictions]
            
            from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
            
            evaluation_metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, average='weighted'),
                'recall': recall_score(y_test, y_pred, average='weighted'),
                'f1_score': f1_score(y_test, y_pred, average='weighted'),
                'roc_auc': roc_auc_score(y_test, y_pred_proba),
                'test_samples': len(y_test),
                'positive_samples': int(y_test.sum()),
                'negative_samples': int(len(y_test) - y_test.sum())
            }
            
            # Log evaluation results
            ml_logger.log_model_performance(evaluation_metrics)
            
            logger.info(f"Model evaluation completed: Accuracy={evaluation_metrics['accuracy']:.4f}")
            
            return {
                'success': True,
                'evaluation_metrics': evaluation_metrics,
                'predictions': predictions[:10]  # Return first 10 predictions as sample
            }
            
        except Exception as e:
            logger.error(f"Error in model evaluation: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get comprehensive model information"""
        try:
            model_info = enhanced_predictor.get_model_info()
            
            # Add additional information
            model_info.update({
                'training_history': self.training_history,
                'data_stats': data_processor.data_stats,
                'feature_names': data_processor.feature_names,
                'feature_importance': data_processor.feature_importance,
                'config': config.get_config_dict()
            })
            
            return model_info
            
        except Exception as e:
            logger.error(f"Error getting model info: {str(e)}")
            return {'error': str(e)}
    
    def predict_outbreak(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Make outbreak prediction"""
        try:
            if not enhanced_predictor.is_model_loaded():
                return {'success': False, 'error': 'Model not loaded'}
            
            prediction = enhanced_predictor.predict(features)
            return {
                'success': True,
                'prediction': prediction
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def simulate_scenarios(self, scenario_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate outbreak scenarios"""
        try:
            if not enhanced_predictor.is_model_loaded():
                return {'success': False, 'error': 'Model not loaded'}
            
            simulation_results = enhanced_predictor.simulate_scenarios(scenario_data)
            return {
                'success': True,
                'simulation_results': simulation_results
            }
            
        except Exception as e:
            logger.error(f"Error simulating scenarios: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def batch_predict(self, features_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Make batch predictions"""
        try:
            if not enhanced_predictor.is_model_loaded():
                return {'success': False, 'error': 'Model not loaded'}
            
            if len(features_list) > config.MAX_BATCH_SIZE:
                return {'success': False, 'error': f'Batch size exceeds maximum allowed: {config.MAX_BATCH_SIZE}'}
            
            predictions = enhanced_predictor.batch_predict(features_list)
            
            return {
                'success': True,
                'predictions': predictions,
                'total_processed': len(predictions),
                'successful_predictions': len([p for p in predictions if 'error' not in p]),
                'failed_predictions': len([p for p in predictions if 'error' in p])
            }
            
        except Exception as e:
            logger.error(f"Error in batch prediction: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_feature_importance(self) -> Dict[str, Any]:
        """Get feature importance analysis"""
        try:
            feature_importance = data_processor.feature_importance
            
            if not feature_importance:
                return {'success': False, 'error': 'No feature importance data available'}
            
            # Sort features by importance
            sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
            
            # Get top features
            top_features = sorted_features[:config.TOP_FEATURES_COUNT]
            
            return {
                'success': True,
                'feature_importance': feature_importance,
                'top_features': [{'feature': name, 'importance': importance} for name, importance in top_features],
                'total_features': len(feature_importance)
            }
            
        except Exception as e:
            logger.error(f"Error getting feature importance: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_data_quality_report(self) -> Dict[str, Any]:
        """Get comprehensive data quality report"""
        try:
            if self.data is None:
                return {'success': False, 'error': 'No data loaded'}
            
            quality_metrics = data_processor.validate_data_quality(self.data)
            
            return {
                'success': True,
                'quality_metrics': quality_metrics,
                'recommendations': self._get_quality_recommendations(quality_metrics)
            }
            
        except Exception as e:
            logger.error(f"Error getting data quality report: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _get_quality_recommendations(self, quality_metrics: Dict[str, Any]) -> List[str]:
        """Get data quality recommendations"""
        recommendations = []
        
        if quality_metrics.get('missing_percentage', 0) > 10:
            recommendations.append("High missing data percentage - consider data imputation or collection")
        
        if quality_metrics.get('duplicate_rows', 0) > 0:
            recommendations.append("Duplicate rows detected - consider data deduplication")
        
        if quality_metrics.get('quality_score', 0) < 70:
            recommendations.append("Low data quality score - review data collection process")
        
        if quality_metrics.get('numeric_features', 0) < 5:
            recommendations.append("Limited numeric features - consider feature engineering")
        
        if not recommendations:
            recommendations.append("Data quality is acceptable for model training")
        
        return recommendations

# Global ML pipeline instance
enhanced_ml_pipeline = EnhancedMLPipeline()
