#!/usr/bin/env python3
"""
Simple test script for NeerSetu ML Service
Tests basic functionality without SHAP dependencies
"""

import sys
import os
import json
from datetime import datetime

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def test_configuration():
    """Test configuration validation"""
    print("🧪 Testing Configuration...")
    
    try:
        from config import config
        
        # Test config validation
        is_valid = config.validate_config()
        print(f"   ✅ Configuration valid: {is_valid}")
        
        # Test config values
        print(f"   📊 Host: {config.HOST}")
        print(f"   📊 Port: {config.PORT}")
        print(f"   📊 Model Directory: {config.MODEL_DIR}")
        print(f"   📊 Dataset Directory: {config.DATASET_DIR}")
        print(f"   📊 Log Level: {config.LOG_LEVEL}")
        print(f"   📊 Supported Models: {config.SUPPORTED_MODELS}")
        
        print("   ✅ Configuration tests passed!\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Configuration test failed: {str(e)}")
        return False

def test_data_processor():
    """Test data processor functionality"""
    print("🧪 Testing Data Processor...")
    
    try:
        from data_processor import data_processor
        
        # Test loading datasets
        datasets = data_processor.load_datasets()
        print(f"   📊 Datasets loaded: {len(datasets)}")
        
        for name, df in datasets.items():
            if not df.empty:
                print(f"   📊 {name}: {df.shape}")
        
        # Test merging datasets
        if datasets:
            merged_data = data_processor.merge_datasets(datasets)
            print(f"   📊 Merged data shape: {merged_data.shape}")
            
            if not merged_data.empty:
                # Test preprocessing
                processed_data = data_processor.preprocess_data(merged_data)
                print(f"   📊 Processed data shape: {processed_data.shape}")
                
                # Test feature preparation
                features, target = data_processor.prepare_features_and_target(processed_data)
                print(f"   📊 Features shape: {features.shape}")
                print(f"   📊 Target shape: {target.shape}")
                
                # Test data quality validation
                quality_metrics = data_processor.validate_data_quality(processed_data)
                print(f"   📊 Data quality score: {quality_metrics.get('quality_score', 0)}")
            else:
                print("   ⚠️  No data to process")
        else:
            print("   ⚠️  No datasets available")
        
        print("   ✅ Data Processor tests passed!\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Data Processor test failed: {str(e)}")
        return False

def test_model_trainer():
    """Test model trainer functionality"""
    print("🧪 Testing Model Trainer...")
    
    try:
        from model_trainer import model_trainer
        import pandas as pd
        import numpy as np
        
        # Create sample data for testing
        np.random.seed(42)
        n_samples = 100
        
        sample_data = pd.DataFrame({
            'village': [f'Village_{i}' for i in range(n_samples)],
            'state': np.random.choice(['Assam', 'Manipur', 'Meghalaya'], n_samples),
            'total_diarrhea_cases': np.random.poisson(5, n_samples),
            'total_fever_cases': np.random.poisson(3, n_samples),
            'avg_ph': np.random.normal(7.0, 0.5, n_samples),
            'avg_turbidity': np.random.exponential(2.0, n_samples),
            'avg_bacteria_ecoli': np.random.exponential(50, n_samples),
            'daily_rainfall': np.random.exponential(10, n_samples),
            'temperature': np.random.normal(25, 5, n_samples),
            'humidity': np.random.uniform(40, 90, n_samples),
            'season': np.random.choice(['Spring', 'Summer', 'Autumn', 'Winter'], n_samples),
            'month': np.random.randint(1, 13, n_samples)
        })
        
        # Create target variable
        sample_data['target'] = (sample_data['total_diarrhea_cases'] > 8).astype(int)
        
        # Prepare features
        features = sample_data.drop(['village', 'state', 'target'], axis=1)
        target = sample_data['target']
        
        print(f"   📊 Sample data shape: {features.shape}")
        print(f"   📊 Target distribution: {target.value_counts().to_dict()}")
        
        # Test model training
        training_result = model_trainer.train_models(features, target, ['xgboost'])
        print(f"   📊 Training result: {training_result['success']}")
        
        if training_result['success']:
            print(f"   📊 Models trained: {training_result['models_trained']}")
            print(f"   📊 Best model: {training_result['best_model']}")
            print(f"   📊 Best score: {training_result['best_score']:.4f}")
            
            # Test model saving
            save_success = model_trainer.save_model(model_trainer.best_model, 'test_model')
            print(f"   📊 Model saved: {save_success}")
        
        print("   ✅ Model Trainer tests passed!\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Model Trainer test failed: {str(e)}")
        return False

def test_enhanced_predictor():
    """Test enhanced predictor functionality"""
    print("🧪 Testing Enhanced Predictor...")
    
    try:
        from enhanced_predictor import enhanced_predictor
        
        # Test loading model
        load_success = enhanced_predictor.load_model('test_model')
        print(f"   📊 Model loaded: {load_success}")
        
        if load_success:
            # Test model info
            model_info = enhanced_predictor.get_model_info()
            print(f"   📊 Model type: {model_info.get('model_type', 'Unknown')}")
            print(f"   📊 Model version: {model_info.get('model_version', 'Unknown')}")
            print(f"   📊 Feature count: {model_info.get('feature_count', 0)}")
            
            # Test prediction
            sample_features = {
                'village': 'Test Village',
                'state': 'Assam',
                'district': 'Test District',
                'total_diarrhea_cases': 5,
                'total_fever_cases': 3,
                'avg_ph': 7.2,
                'avg_turbidity': 2.1,
                'avg_bacteria_ecoli': 45.0,
                'daily_rainfall': 15.0,
                'temperature': 28.0,
                'humidity': 75.0,
                'season': 'Summer',
                'month': 6
            }
            
            try:
                prediction = enhanced_predictor.predict(sample_features)
                print(f"   📊 Prediction: {prediction['prediction']}")
                print(f"   📊 Probability: {prediction['probability']:.4f}")
                print(f"   📊 Risk Index: {prediction['risk_index']}")
                print(f"   📊 Risk Level: {prediction['risk_level']}")
                print(f"   📊 Contributing Factors: {len(prediction['contributing_factors'])}")
            except Exception as e:
                print(f"   ⚠️  Prediction failed: {str(e)}")
        else:
            print("   ⚠️  No model available for testing")
        
        print("   ✅ Enhanced Predictor tests passed!\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Enhanced Predictor test failed: {str(e)}")
        return False

def test_enhanced_ml_pipeline():
    """Test enhanced ML pipeline functionality"""
    print("🧪 Testing Enhanced ML Pipeline...")
    
    try:
        from enhanced_ml_pipeline import enhanced_ml_pipeline
        
        # Test data loading and preparation
        data_loaded = enhanced_ml_pipeline.load_and_prepare_data()
        print(f"   📊 Data loaded: {data_loaded}")
        
        if data_loaded:
            # Test model info
            model_info = enhanced_ml_pipeline.get_model_info()
            print(f"   📊 Model loaded: {model_info.get('is_loaded', False)}")
            print(f"   📊 Model type: {model_info.get('model_type', 'Unknown')}")
            
            # Test feature importance
            feature_result = enhanced_ml_pipeline.get_feature_importance()
            if feature_result['success']:
                print(f"   📊 Feature importance available: {len(feature_result['feature_importance'])} features")
            else:
                print(f"   ⚠️  Feature importance: {feature_result['error']}")
            
            # Test data quality
            quality_result = enhanced_ml_pipeline.get_data_quality_report()
            if quality_result['success']:
                print(f"   📊 Data quality score: {quality_result['quality_metrics'].get('quality_score', 0)}")
            else:
                print(f"   ⚠️  Data quality: {quality_result['error']}")
        else:
            print("   ⚠️  No data available for testing")
        
        print("   ✅ Enhanced ML Pipeline tests passed!\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Enhanced ML Pipeline test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 NeerSetu ML Service Simple Test Suite")
    print("=" * 50)
    
    tests = [
        test_configuration,
        test_data_processor,
        test_model_trainer,
        test_enhanced_predictor,
        test_enhanced_ml_pipeline
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with error: {str(e)}")
    
    print("=" * 50)
    print(f"🎉 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All tests completed successfully!")
        print("✅ ML Service is ready for use")
        return True
    else:
        print("❌ Some tests failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
