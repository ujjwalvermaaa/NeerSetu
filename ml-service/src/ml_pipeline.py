import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import xgboost as xgb
import joblib
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class MLPipeline:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
        self.model_version = "1.0.0"
        self.last_training_time = None
        
    def load_and_preprocess_data(self, dataset_path):
        """Load and preprocess the dataset for training"""
        try:
            logger.info(f"Loading dataset from: {dataset_path}")
            
            # Load the dataset
            df = pd.read_csv(dataset_path)
            logger.info(f"Dataset loaded with shape: {df.shape}")
            
            # Display basic info about the dataset
            logger.info(f"Columns: {list(df.columns)}")
            logger.info(f"First few rows:\n{df.head()}")
            
            # Handle missing values
            df = df.fillna(df.median(numeric_only=True))
            
            # Create features for ML model
            features = self._create_features(df)
            
            # Create target variable
            target = self._create_target(df)
            
            logger.info(f"Features shape: {features.shape}")
            logger.info(f"Target shape: {target.shape}")
            logger.info(f"Target distribution: {target.value_counts()}")
            
            return features, target
            
        except Exception as e:
            logger.error(f"Error loading and preprocessing data: {str(e)}")
            raise e
    
    def _create_features(self, df):
        """Create features from the dataset"""
        features = pd.DataFrame()
        
        # Water quality features
        if 'pH' in df.columns:
            features['avg_ph'] = df['pH']
        if 'turbidity_ntu' in df.columns:
            features['avg_turbidity'] = df['turbidity_ntu']
        if 'bacteria_ecoli_cfu_100ml' in df.columns:
            features['avg_bacteria_ecoli'] = df['bacteria_ecoli_cfu_100ml']
        if 'bacteria_coliform_cfu_100ml' in df.columns:
            features['avg_bacteria_coliform'] = df['bacteria_coliform_cfu_100ml']
        if 'dissolved_oxygen_mg_l' in df.columns:
            features['dissolved_oxygen'] = df['dissolved_oxygen_mg_l']
        if 'nitrates_mg_l' in df.columns:
            features['nitrates'] = df['nitrates_mg_l']
        if 'phosphates_mg_l' in df.columns:
            features['phosphates'] = df['phosphates_mg_l']
        if 'heavy_metals_mg_l' in df.columns:
            features['heavy_metals'] = df['heavy_metals_mg_l']
        if 'chlorine_residual_mg_l' in df.columns:
            features['chlorine_residual'] = df['chlorine_residual_mg_l']
        if 'fluoride_mg_l' in df.columns:
            features['fluoride'] = df['fluoride_mg_l']
        if 'arsenic_mg_l' in df.columns:
            features['arsenic'] = df['arsenic_mg_l']
        
        # Environmental features
        if 'daily_rainfall_mm' in df.columns:
            features['daily_rainfall'] = df['daily_rainfall_mm']
        if 'weekly_rainfall_mm' in df.columns:
            features['weekly_rainfall'] = df['weekly_rainfall_mm']
        if 'monthly_rainfall_mm' in df.columns:
            features['monthly_rainfall'] = df['monthly_rainfall_mm']
        if 'temperature_celsius' in df.columns:
            features['temperature'] = df['temperature_celsius']
        if 'humidity_percent' in df.columns:
            features['humidity'] = df['humidity_percent']
        if 'wind_speed_kmh' in df.columns:
            features['wind_speed'] = df['wind_speed_kmh']
        if 'atmospheric_pressure_hpa' in df.columns:
            features['atmospheric_pressure'] = df['atmospheric_pressure_hpa']
        
        # Health features
        if 'diarrhea_cases' in df.columns:
            features['total_diarrhea_cases'] = df['diarrhea_cases']
        if 'fever_cases' in df.columns:
            features['total_fever_cases'] = df['fever_cases']
        if 'vomiting_cases' in df.columns:
            features['total_vomiting_cases'] = df['vomiting_cases']
        if 'stomach_pain_cases' in df.columns:
            features['total_stomach_pain_cases'] = df['stomach_pain_cases']
        if 'dehydration_cases' in df.columns:
            features['total_dehydration_cases'] = df['dehydration_cases']
        if 'nausea_cases' in df.columns:
            features['total_nausea_cases'] = df['nausea_cases']
        if 'headache_cases' in df.columns:
            features['total_headache_cases'] = df['headache_cases']
        if 'weakness_cases' in df.columns:
            features['total_weakness_cases'] = df['weakness_cases']
        
        # Population features
        if 'total_population' in df.columns:
            features['total_population'] = df['total_population']
        if 'households_affected' in df.columns:
            features['households_affected'] = df['households_affected']
        
        # Categorical features
        if 'season' in df.columns:
            features['season'] = df['season']
        if 'month' in df.columns:
            features['month'] = df['month']
        if 'flood_risk_level' in df.columns:
            features['flood_risk_level'] = df['flood_risk_level']
        if 'drought_indicator' in df.columns:
            features['drought_indicator'] = df['drought_indicator']
        if 'water_contaminated' in df.columns:
            features['water_contaminated'] = df['water_contaminated'].astype(int)
        if 'is_potable' in df.columns:
            features['is_potable'] = df['is_potable'].astype(int)
        
        # Handle missing values
        features = features.fillna(features.median(numeric_only=True))
        
        # Encode categorical variables
        categorical_columns = features.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
            features[col] = self.label_encoders[col].fit_transform(features[col].astype(str))
        
        self.feature_names = list(features.columns)
        return features
    
    def _create_target(self, df):
        """Create target variable from the dataset"""
        # Use outbreak column if available
        if 'outbreak' in df.columns:
            return df['outbreak'].astype(int)
        
        # If no outbreak column, create based on other indicators
        target = np.zeros(len(df))
        
        # High case counts indicate potential outbreak
        if 'diarrhea_cases' in df.columns:
            target += (df['diarrhea_cases'] > df['diarrhea_cases'].quantile(0.8)).astype(int)
        if 'fever_cases' in df.columns:
            target += (df['fever_cases'] > df['fever_cases'].quantile(0.8)).astype(int)
        if 'vomiting_cases' in df.columns:
            target += (df['vomiting_cases'] > df['vomiting_cases'].quantile(0.8)).astype(int)
        
        # Water contamination indicates higher risk
        if 'water_contaminated' in df.columns:
            target += df['water_contaminated'].astype(int)
        
        # High rainfall increases risk
        if 'monthly_rainfall_mm' in df.columns:
            target += (df['monthly_rainfall_mm'] > df['monthly_rainfall_mm'].quantile(0.8)).astype(int)
        
        # Convert to binary (outbreak or no outbreak)
        target = (target > 0).astype(int)
        
        return target
    
    def train_model(self, dataset_path, model_name="outbreak_model"):
        """Train the ML model"""
        try:
            logger.info(f"Starting model training with dataset: {dataset_path}")
            
            # Load and preprocess data
            features, target = self.load_and_preprocess_data(dataset_path)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                features, target, test_size=0.2, random_state=42, stratify=target
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train XGBoost model
            logger.info("Training XGBoost model...")
            self.model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                eval_metric='logloss'
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            
            logger.info(f"Model accuracy: {accuracy:.4f}")
            logger.info(f"Classification report:\n{classification_report(y_test, y_pred)}")
            
            # Cross-validation
            cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5)
            logger.info(f"Cross-validation scores: {cv_scores}")
            logger.info(f"Mean CV score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
            
            # Save model
            model_dir = "models"
            os.makedirs(model_dir, exist_ok=True)
            
            model_path = os.path.join(model_dir, f"{model_name}.joblib")
            scaler_path = os.path.join(model_dir, f"{model_name}_scaler.joblib")
            encoders_path = os.path.join(model_dir, f"{model_name}_encoders.joblib")
            
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, scaler_path)
            joblib.dump(self.label_encoders, encoders_path)
            
            self.last_training_time = datetime.now().isoformat()
            
            logger.info(f"Model saved to: {model_path}")
            logger.info("Model training completed successfully")
            
            return {
                "success": True,
                "accuracy": accuracy,
                "cv_scores": cv_scores.tolist(),
                "model_path": model_path,
                "timestamp": self.last_training_time
            }
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise e
    
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
            
            logger.info(f"Model loaded from: {model_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
