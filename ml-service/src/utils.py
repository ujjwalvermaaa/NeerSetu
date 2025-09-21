import pandas as pd
import numpy as np
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

def calculate_risk_index(probability: float) -> int:
    """Calculate risk index (0-500 scale like AQI) from probability"""
    return int(probability * 500)

def get_risk_level(risk_index: int) -> str:
    """Get risk level from risk index"""
    if risk_index <= 100:
        return "Low"
    elif risk_index <= 200:
        return "Moderate"
    elif risk_index <= 300:
        return "High"
    elif risk_index <= 400:
        return "Very High"
    else:
        return "Severe"

def get_risk_color(risk_level: str) -> str:
    """Get color code for risk level"""
    colors = {
        "Low": "green",
        "Moderate": "yellow",
        "High": "orange",
        "Very High": "red",
        "Severe": "purple"
    }
    return colors.get(risk_level, "gray")

def calculate_water_quality_score(ph: float, turbidity: float, bacteria_ecoli: float, 
                                bacteria_coliform: float) -> Dict[str, Any]:
    """Calculate water quality score based on WHO standards"""
    
    # pH score (6.5-8.5 is optimal)
    if 6.5 <= ph <= 8.5:
        ph_score = 100
    elif 6.0 <= ph < 6.5 or 8.5 < ph <= 9.0:
        ph_score = 80
    elif 5.5 <= ph < 6.0 or 9.0 < ph <= 9.5:
        ph_score = 60
    else:
        ph_score = 40
    
    # Turbidity score (< 5 NTU is good)
    if turbidity < 5:
        turbidity_score = 100
    elif turbidity < 10:
        turbidity_score = 80
    elif turbidity < 20:
        turbidity_score = 60
    else:
        turbidity_score = 40
    
    # E.coli score (< 100 CFU/100ml is good)
    if bacteria_ecoli < 100:
        ecoli_score = 100
    elif bacteria_ecoli < 500:
        ecoli_score = 80
    elif bacteria_ecoli < 1000:
        ecoli_score = 60
    else:
        ecoli_score = 40
    
    # Coliform score (< 1000 CFU/100ml is good)
    if bacteria_coliform < 1000:
        coliform_score = 100
    elif bacteria_coliform < 5000:
        coliform_score = 80
    elif bacteria_coliform < 10000:
        coliform_score = 60
    else:
        coliform_score = 40
    
    # Overall water quality score
    overall_score = (ph_score + turbidity_score + ecoli_score + coliform_score) / 4
    
    # Determine quality level
    if overall_score >= 90:
        quality_level = "Excellent"
    elif overall_score >= 80:
        quality_level = "Good"
    elif overall_score >= 70:
        quality_level = "Fair"
    elif overall_score >= 60:
        quality_level = "Poor"
    else:
        quality_level = "Very Poor"
    
    return {
        "overall_score": round(overall_score, 2),
        "quality_level": quality_level,
        "scores": {
            "ph": ph_score,
            "turbidity": turbidity_score,
            "ecoli": ecoli_score,
            "coliform": coliform_score
        }
    }

def calculate_outbreak_severity(cases: Dict[str, int], population: int) -> Dict[str, Any]:
    """Calculate outbreak severity based on case counts and population"""
    
    total_cases = sum(cases.values())
    case_rate = (total_cases / population) * 1000 if population > 0 else 0
    
    # Determine severity level
    if case_rate >= 100:
        severity = "Critical"
        color = "red"
    elif case_rate >= 50:
        severity = "High"
        color = "orange"
    elif case_rate >= 20:
        severity = "Moderate"
        color = "yellow"
    elif case_rate >= 5:
        severity = "Low"
        color = "blue"
    else:
        severity = "Minimal"
        color = "green"
    
    return {
        "severity": severity,
        "color": color,
        "case_rate": round(case_rate, 2),
        "total_cases": total_cases,
        "population": population
    }

def generate_health_recommendations(risk_level: str, contributing_factors: List[Dict]) -> List[str]:
    """Generate health recommendations based on risk level and contributing factors"""
    
    recommendations = []
    
    # General recommendations based on risk level
    if risk_level in ["Very High", "Severe"]:
        recommendations.extend([
            "Immediate intervention required",
            "Deploy emergency medical teams",
            "Implement water purification measures",
            "Issue public health advisory",
            "Prepare isolation facilities"
        ])
    elif risk_level == "High":
        recommendations.extend([
            "Enhanced monitoring required",
            "Prepare emergency response plan",
            "Increase water quality testing",
            "Alert local health authorities"
        ])
    elif risk_level == "Moderate":
        recommendations.extend([
            "Monitor situation closely",
            "Prepare contingency plans",
            "Conduct regular health checks",
            "Maintain water quality standards"
        ])
    else:
        recommendations.extend([
            "Continue regular monitoring",
            "Maintain preventive measures",
            "Keep emergency plans ready"
        ])
    
    # Specific recommendations based on contributing factors
    for factor in contributing_factors:
        factor_name = factor.get('factor', '')
        impact = factor.get('impact', '')
        
        if 'rainfall' in factor_name.lower() and impact == 'positive':
            recommendations.append("Monitor for flood-related contamination")
        elif 'bacteria' in factor_name.lower() and impact == 'positive':
            recommendations.append("Implement water disinfection measures")
        elif 'ph' in factor_name.lower() and impact == 'positive':
            recommendations.append("Adjust water pH levels")
        elif 'temperature' in factor_name.lower() and impact == 'positive':
            recommendations.append("Monitor for temperature-related bacterial growth")
    
    return list(set(recommendations))  # Remove duplicates

def calculate_intervention_priority(risk_index: int, case_rate: float, 
                                  water_contaminated: bool) -> Dict[str, Any]:
    """Calculate intervention priority based on multiple factors"""
    
    priority_score = 0
    
    # Risk index contribution (0-50 points)
    if risk_index >= 400:
        priority_score += 50
    elif risk_index >= 300:
        priority_score += 40
    elif risk_index >= 200:
        priority_score += 30
    elif risk_index >= 100:
        priority_score += 20
    else:
        priority_score += 10
    
    # Case rate contribution (0-30 points)
    if case_rate >= 100:
        priority_score += 30
    elif case_rate >= 50:
        priority_score += 25
    elif case_rate >= 20:
        priority_score += 20
    elif case_rate >= 5:
        priority_score += 15
    else:
        priority_score += 10
    
    # Water contamination contribution (0-20 points)
    if water_contaminated:
        priority_score += 20
    else:
        priority_score += 5
    
    # Determine priority level
    if priority_score >= 80:
        priority = "Critical"
        response_time = "Immediate"
    elif priority_score >= 60:
        priority = "High"
        response_time = "Within 2 hours"
    elif priority_score >= 40:
        priority = "Medium"
        response_time = "Within 6 hours"
    else:
        priority = "Low"
        response_time = "Within 24 hours"
    
    return {
        "priority": priority,
        "response_time": response_time,
        "priority_score": priority_score,
        "max_score": 100
    }

def format_prediction_output(prediction: Dict[str, Any]) -> Dict[str, Any]:
    """Format prediction output for API response"""
    
    probability = prediction.get('probability', 0)
    risk_index = calculate_risk_index(probability)
    risk_level = get_risk_level(risk_index)
    risk_color = get_risk_color(risk_level)
    
    return {
        "prediction": prediction.get('prediction', 0),
        "probability": round(probability, 4),
        "risk_index": risk_index,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "confidence": round(prediction.get('confidence', 0), 4),
        "contributing_factors": prediction.get('contributing_factors', []),
        "timestamp": prediction.get('timestamp', '')
    }

def validate_input_features(features: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and clean input features"""
    
    validated_features = {}
    
    # Required numeric features with default values
    numeric_features = {
        'avg_ph': 7.0,
        'avg_turbidity': 5.0,
        'avg_bacteria_ecoli': 100.0,
        'avg_bacteria_coliform': 1000.0,
        'daily_rainfall': 0.0,
        'weekly_rainfall': 0.0,
        'monthly_rainfall': 0.0,
        'temperature': 25.0,
        'humidity': 60.0,
        'total_diarrhea_cases': 0,
        'total_fever_cases': 0,
        'total_vomiting_cases': 0,
        'total_affected_population': 0
    }
    
    for feature, default_value in numeric_features.items():
        value = features.get(feature, default_value)
        try:
            validated_features[feature] = float(value)
        except (ValueError, TypeError):
            validated_features[feature] = default_value
    
    # Required boolean features
    boolean_features = {
        'water_contaminated': False
    }
    
    for feature, default_value in boolean_features.items():
        value = features.get(feature, default_value)
        validated_features[feature] = bool(value)
    
    # Required categorical features
    categorical_features = {
        'season': 'Winter',
        'flood_risk_level': 'Low',
        'drought_indicator': 'No'
    }
    
    for feature, default_value in categorical_features.items():
        value = features.get(feature, default_value)
        validated_features[feature] = str(value) if value else default_value
    
    # Required integer features
    integer_features = {
        'month': 1
    }
    
    for feature, default_value in integer_features.items():
        value = features.get(feature, default_value)
        try:
            validated_features[feature] = int(value)
        except (ValueError, TypeError):
            validated_features[feature] = default_value
    
    return validated_features
