#!/usr/bin/env python3
"""
Advanced Data Processing Module for NeerSetu ML Service
Handles data loading, preprocessing, feature engineering, and validation
"""

import pandas as pd
import numpy as np
import os
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
from sklearn.feature_selection import SelectKBest, f_classif
import warnings
warnings.filterwarnings('ignore')

from config import config

logger = logging.getLogger(__name__)

class MLDataProcessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
        self.feature_importance = {}
        self.data_stats = {}
        
    def load_datasets(self) -> Dict[str, pd.DataFrame]:
        """Load all required datasets"""
        datasets = {}
        
        try:
            # Load health surveillance data
            health_path = os.path.join(config.DATASET_DIR, config.HEALTH_DATASET)
            if os.path.exists(health_path):
                datasets['health'] = pd.read_csv(health_path)
                logger.info(f"Loaded health dataset: {datasets['health'].shape}")
            else:
                logger.warning(f"Health dataset not found: {health_path}")
            
            # Load water quality data
            water_path = os.path.join(config.DATASET_DIR, config.WATER_DATASET)
            if os.path.exists(water_path):
                datasets['water'] = pd.read_csv(water_path)
                logger.info(f"Loaded water dataset: {datasets['water'].shape}")
            else:
                logger.warning(f"Water dataset not found: {water_path}")
            
            # Load environmental data
            env_path = os.path.join(config.DATASET_DIR, config.ENVIRONMENT_DATASET)
            if os.path.exists(env_path):
                datasets['environment'] = pd.read_csv(env_path)
                logger.info(f"Loaded environment dataset: {datasets['environment'].shape}")
            else:
                logger.warning(f"Environment dataset not found: {env_path}")
            
            # Load outbreak target data
            outbreak_path = os.path.join(config.DATASET_DIR, config.OUTBREAK_DATASET)
            if os.path.exists(outbreak_path):
                datasets['outbreak'] = pd.read_csv(outbreak_path)
                logger.info(f"Loaded outbreak dataset: {datasets['outbreak'].shape}")
            else:
                logger.warning(f"Outbreak dataset not found: {outbreak_path}")
            
            return datasets
            
        except Exception as e:
            logger.error(f"Error loading datasets: {str(e)}")
            return {}
    
    def merge_datasets(self, datasets: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Merge all datasets into a single dataframe"""
        try:
            merged_df = None
            
            # Start with health data as base
            if 'health' in datasets and not datasets['health'].empty:
                merged_df = datasets['health'].copy()
                logger.info("Using health data as base for merging")
            
            # Merge with water quality data
            if 'water' in datasets and not datasets['water'].empty:
                if merged_df is not None:
                    # Merge on common columns (village, state, date)
                    merge_cols = ['village', 'state']
                    if 'date' in merged_df.columns and 'date' in datasets['water'].columns:
                        merge_cols.append('date')
                    
                    merged_df = pd.merge(
                        merged_df, 
                        datasets['water'], 
                        on=merge_cols, 
                        how='left',
                        suffixes=('', '_water')
                    )
                    logger.info("Merged with water quality data")
                else:
                    merged_df = datasets['water'].copy()
                    logger.info("Using water data as base for merging")
            
            # Merge with environmental data
            if 'environment' in datasets and not datasets['environment'].empty:
                if merged_df is not None:
                    merge_cols = ['village', 'state']
                    if 'date' in merged_df.columns and 'date' in datasets['environment'].columns:
                        merge_cols.append('date')
                    
                    merged_df = pd.merge(
                        merged_df, 
                        datasets['environment'], 
                        on=merge_cols, 
                        how='left',
                        suffixes=('', '_env')
                    )
                    logger.info("Merged with environmental data")
                else:
                    merged_df = datasets['environment'].copy()
                    logger.info("Using environment data as base for merging")
            
            # Merge with outbreak target data
            if 'outbreak' in datasets and not datasets['outbreak'].empty:
                if merged_df is not None:
                    merge_cols = ['village', 'state']
                    if 'date' in merged_df.columns and 'date' in datasets['outbreak'].columns:
                        merge_cols.append('date')
                    
                    merged_df = pd.merge(
                        merged_df, 
                        datasets['outbreak'], 
                        on=merge_cols, 
                        how='left',
                        suffixes=('', '_outbreak')
                    )
                    logger.info("Merged with outbreak target data")
                else:
                    merged_df = datasets['outbreak'].copy()
                    logger.info("Using outbreak data as base for merging")
            
            if merged_df is not None:
                logger.info(f"Final merged dataset shape: {merged_df.shape}")
                logger.info(f"Columns: {list(merged_df.columns)}")
            
            return merged_df
            
        except Exception as e:
            logger.error(f"Error merging datasets: {str(e)}")
            return pd.DataFrame()
    
    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocess the merged dataset"""
        try:
            logger.info("Starting data preprocessing")
            
            # Create a copy to avoid modifying original
            processed_df = df.copy()
            
            # Handle missing values
            processed_df = self._handle_missing_values(processed_df)
            
            # Convert date columns
            processed_df = self._process_date_columns(processed_df)
            
            # Create target variable
            processed_df = self._create_target_variable(processed_df)
            
            # Feature engineering
            if config.ENABLE_FEATURE_ENGINEERING:
                processed_df = self._engineer_features(processed_df)
            
            # Remove duplicates
            processed_df = processed_df.drop_duplicates()
            
            logger.info(f"Preprocessed dataset shape: {processed_df.shape}")
            return processed_df
            
        except Exception as e:
            logger.error(f"Error preprocessing data: {str(e)}")
            return df
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in the dataset"""
        try:
            # Fill numeric columns with median
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            for col in numeric_columns:
                if df[col].isnull().any():
                    df[col].fillna(df[col].median(), inplace=True)
            
            # Fill categorical columns with mode
            categorical_columns = df.select_dtypes(include=['object']).columns
            for col in categorical_columns:
                if df[col].isnull().any():
                    mode_value = df[col].mode()[0] if not df[col].mode().empty else 'Unknown'
                    df[col].fillna(mode_value, inplace=True)
            
            logger.info("Handled missing values")
            return df
            
        except Exception as e:
            logger.error(f"Error handling missing values: {str(e)}")
            return df
    
    def _process_date_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Process date columns and extract temporal features"""
        try:
            date_columns = [col for col in df.columns if 'date' in col.lower()]
            
            for col in date_columns:
                if df[col].dtype == 'object':
                    df[col] = pd.to_datetime(df[col], errors='coerce')
                
                # Extract temporal features
                if config.ENABLE_TEMPORAL_FEATURES:
                    df[f'{col}_year'] = df[col].dt.year
                    df[f'{col}_month'] = df[col].dt.month
                    df[f'{col}_day'] = df[col].dt.day
                    df[f'{col}_dayofweek'] = df[col].dt.dayofweek
                    df[f'{col}_quarter'] = df[col].dt.quarter
                    
                    # Create season feature
                    df[f'{col}_season'] = df[col].dt.month.map({
                        12: 'Winter', 1: 'Winter', 2: 'Winter',
                        3: 'Spring', 4: 'Spring', 5: 'Spring',
                        6: 'Summer', 7: 'Summer', 8: 'Summer',
                        9: 'Autumn', 10: 'Autumn', 11: 'Autumn'
                    })
            
            logger.info("Processed date columns")
            return df
            
        except Exception as e:
            logger.error(f"Error processing date columns: {str(e)}")
            return df
    
    def _create_target_variable(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create target variable for outbreak prediction"""
        try:
            # If outbreak data is available, use it directly
            if 'outbreak_level' in df.columns:
                df['target'] = df['outbreak_level']
            elif 'is_outbreak' in df.columns:
                df['target'] = df['is_outbreak'].astype(int)
            else:
                # Create target based on health data
                if 'total_diarrhea_cases' in df.columns:
                    # Create outbreak indicator based on diarrhea cases
                    df['target'] = (df['total_diarrhea_cases'] > df['total_diarrhea_cases'].quantile(0.8)).astype(int)
                else:
                    # Create target based on water contamination
                    if 'water_contaminated' in df.columns:
                        df['target'] = df['water_contaminated'].astype(int)
                    else:
                        # Create target based on bacterial contamination
                        if 'avg_bacteria_ecoli' in df.columns:
                            df['target'] = (df['avg_bacteria_ecoli'] > df['avg_bacteria_ecoli'].quantile(0.8)).astype(int)
                        else:
                            df['target'] = 0  # Default to no outbreak
            
            logger.info(f"Created target variable. Distribution: {df['target'].value_counts().to_dict()}")
            return df
            
        except Exception as e:
            logger.error(f"Error creating target variable: {str(e)}")
            return df
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer new features for better model performance"""
        try:
            logger.info("Starting feature engineering")
            
            # Health-related features
            if 'total_diarrhea_cases' in df.columns:
                df['symptom_severity'] = df['total_diarrhea_cases'] + df.get('total_fever_cases', 0) + df.get('total_vomiting_cases', 0)
                df['affected_population_ratio'] = df.get('total_affected_population', 0) / df.get('total_population', 1)
            
            # Water quality features
            water_cols = [col for col in df.columns if any(param in col.lower() for param in ['ph', 'turbidity', 'bacteria', 'oxygen', 'nitrates', 'phosphates'])]
            if water_cols:
                df['water_quality_score'] = self._calculate_water_quality_score(df, water_cols)
                df['water_contamination_risk'] = self._calculate_contamination_risk(df, water_cols)
            
            # Environmental features
            if 'daily_rainfall' in df.columns:
                df['rainfall_intensity'] = df['daily_rainfall'] / (df.get('temperature', 25) + 1)
                df['flood_risk'] = (df['daily_rainfall'] > df['daily_rainfall'].quantile(0.9)).astype(int)
            
            # Temporal features
            if config.ENABLE_TEMPORAL_FEATURES:
                df = self._create_temporal_features(df)
            
            # Interaction features
            if config.ENABLE_INTERACTION_FEATURES:
                df = self._create_interaction_features(df)
            
            logger.info("Feature engineering completed")
            return df
            
        except Exception as e:
            logger.error(f"Error in feature engineering: {str(e)}")
            return df
    
    def _calculate_water_quality_score(self, df: pd.DataFrame, water_cols: List[str]) -> pd.Series:
        """Calculate overall water quality score"""
        try:
            score = pd.Series(0, index=df.index)
            
            # pH score (optimal range 6.5-8.5)
            if 'ph' in ' '.join(water_cols).lower():
                ph_col = [col for col in water_cols if 'ph' in col.lower()][0]
                score += np.where((df[ph_col] >= 6.5) & (df[ph_col] <= 8.5), 1, 0)
            
            # Turbidity score (lower is better)
            if 'turbidity' in ' '.join(water_cols).lower():
                turb_col = [col for col in water_cols if 'turbidity' in col.lower()][0]
                score += np.where(df[turb_col] < 5.0, 1, 0)
            
            # Bacterial contamination score
            bacteria_cols = [col for col in water_cols if 'bacteria' in col.lower()]
            for col in bacteria_cols:
                if 'ecoli' in col.lower():
                    score += np.where(df[col] < 100, 1, 0)
                elif 'coliform' in col.lower():
                    score += np.where(df[col] < 1000, 1, 0)
            
            return score / len(water_cols) if water_cols else pd.Series(0, index=df.index)
            
        except Exception as e:
            logger.error(f"Error calculating water quality score: {str(e)}")
            return pd.Series(0, index=df.index)
    
    def _calculate_contamination_risk(self, df: pd.DataFrame, water_cols: List[str]) -> pd.Series:
        """Calculate water contamination risk score"""
        try:
            risk = pd.Series(0, index=df.index)
            
            # High bacterial contamination
            bacteria_cols = [col for col in water_cols if 'bacteria' in col.lower()]
            for col in bacteria_cols:
                if 'ecoli' in col.lower():
                    risk += np.where(df[col] > 100, 1, 0)
                elif 'coliform' in col.lower():
                    risk += np.where(df[col] > 1000, 1, 0)
            
            # Low pH
            if 'ph' in ' '.join(water_cols).lower():
                ph_col = [col for col in water_cols if 'ph' in col.lower()][0]
                risk += np.where(df[ph_col] < 6.5, 1, 0)
            
            # High turbidity
            if 'turbidity' in ' '.join(water_cols).lower():
                turb_col = [col for col in water_cols if 'turbidity' in col.lower()][0]
                risk += np.where(df[turb_col] > 5.0, 1, 0)
            
            return risk
            
        except Exception as e:
            logger.error(f"Error calculating contamination risk: {str(e)}")
            return pd.Series(0, index=df.index)
    
    def _create_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create temporal features"""
        try:
            # Rolling averages for time series data
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                if col not in ['target']:
                    df[f'{col}_7day_avg'] = df[col].rolling(window=7, min_periods=1).mean()
                    df[f'{col}_30day_avg'] = df[col].rolling(window=30, min_periods=1).mean()
            
            # Lag features
            for col in ['total_diarrhea_cases', 'avg_bacteria_ecoli', 'daily_rainfall']:
                if col in df.columns:
                    df[f'{col}_lag1'] = df[col].shift(1)
                    df[f'{col}_lag7'] = df[col].shift(7)
            
            return df
            
        except Exception as e:
            logger.error(f"Error creating temporal features: {str(e)}")
            return df
    
    def _create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create interaction features between different variables"""
        try:
            # Health and water quality interactions
            if 'total_diarrhea_cases' in df.columns and 'avg_bacteria_ecoli' in df.columns:
                df['diarrhea_bacteria_interaction'] = df['total_diarrhea_cases'] * df['avg_bacteria_ecoli']
            
            # Environmental and health interactions
            if 'daily_rainfall' in df.columns and 'total_diarrhea_cases' in df.columns:
                df['rainfall_health_interaction'] = df['daily_rainfall'] * df['total_diarrhea_cases']
            
            # Temperature and bacterial growth
            if 'temperature' in df.columns and 'avg_bacteria_ecoli' in df.columns:
                df['temp_bacteria_interaction'] = df['temperature'] * df['avg_bacteria_ecoli']
            
            return df
            
        except Exception as e:
            logger.error(f"Error creating interaction features: {str(e)}")
            return df
    
    def prepare_features_and_target(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare features and target for model training"""
        try:
            # Select feature columns (exclude target and non-feature columns)
            exclude_cols = ['target', 'village', 'state', 'district', 'date']
            feature_cols = [col for col in df.columns if col not in exclude_cols]
            
            # Separate features and target
            X = df[feature_cols].copy()
            y = df['target'].copy()
            
            # Handle categorical variables
            categorical_cols = X.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                self.label_encoders[col] = le
            
            # Store feature names
            self.feature_names = list(X.columns)
            
            # Store data statistics
            self.data_stats = {
                'feature_count': len(self.feature_names),
                'sample_count': len(X),
                'target_distribution': y.value_counts().to_dict(),
                'missing_values': X.isnull().sum().to_dict()
            }
            
            logger.info(f"Prepared features: {X.shape}, target: {y.shape}")
            logger.info(f"Feature names: {self.feature_names}")
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preparing features and target: {str(e)}")
            return pd.DataFrame(), pd.Series()
    
    def scale_features(self, X: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """Scale features using StandardScaler"""
        try:
            if fit:
                X_scaled = self.scaler.fit_transform(X)
            else:
                X_scaled = self.scaler.transform(X)
            
            return pd.DataFrame(X_scaled, columns=X.columns, index=X.index)
            
        except Exception as e:
            logger.error(f"Error scaling features: {str(e)}")
            return X
    
    def select_features(self, X: pd.DataFrame, y: pd.Series, k: int = None) -> pd.DataFrame:
        """Select top k features using statistical tests"""
        try:
            if k is None:
                k = min(config.TOP_FEATURES_COUNT, X.shape[1])
            
            selector = SelectKBest(score_func=f_classif, k=k)
            X_selected = selector.fit_transform(X, y)
            
            # Get selected feature names
            selected_features = X.columns[selector.get_support()].tolist()
            
            # Update feature names
            self.feature_names = selected_features
            
            logger.info(f"Selected {len(selected_features)} features: {selected_features}")
            
            return pd.DataFrame(X_selected, columns=selected_features, index=X.index)
            
        except Exception as e:
            logger.error(f"Error selecting features: {str(e)}")
            return X
    
    def get_feature_importance(self, model) -> Dict[str, float]:
        """Get feature importance from trained model"""
        try:
            if hasattr(model, 'feature_importances_'):
                importance = model.feature_importances_
            elif hasattr(model, 'coef_'):
                importance = np.abs(model.coef_[0])
            else:
                return {}
            
            feature_importance = dict(zip(self.feature_names, importance))
            self.feature_importance = feature_importance
            
            # Log feature importance
            from logger import ml_logger
            ml_logger.log_feature_importance(feature_importance)
            
            return feature_importance
            
        except Exception as e:
            logger.error(f"Error getting feature importance: {str(e)}")
            return {}
    
    def validate_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Validate data quality and return quality metrics"""
        try:
            quality_metrics = {
                'total_samples': len(df),
                'total_features': len(df.columns),
                'missing_values': df.isnull().sum().sum(),
                'missing_percentage': (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100,
                'duplicate_rows': df.duplicated().sum(),
                'numeric_features': len(df.select_dtypes(include=[np.number]).columns),
                'categorical_features': len(df.select_dtypes(include=['object']).columns),
                'date_features': len([col for col in df.columns if 'date' in col.lower()]),
                'target_distribution': df['target'].value_counts().to_dict() if 'target' in df.columns else {}
            }
            
            # Data quality score (0-100)
            quality_score = 100
            quality_score -= min(quality_metrics['missing_percentage'], 50)  # Penalize missing values
            quality_score -= min(quality_metrics['duplicate_rows'] / len(df) * 100, 20)  # Penalize duplicates
            
            quality_metrics['quality_score'] = max(quality_score, 0)
            
            return quality_metrics
            
        except Exception as e:
            logger.error(f"Error validating data quality: {str(e)}")
            return {'quality_score': 0, 'error': str(e)}

# Global data processor instance
data_processor = MLDataProcessor()
