from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd
import os
from schemas import EnvironmentalFeatures, SocialFeatures, ScoreResponse
from features import ENVIRONMENTAL_FEATURES, SOCIAL_FEATURES

app = FastAPI(title="EcoSphere ESG Scoring ML Service")

models = {}

@app.on_event("startup")
def load_models():
    env_path = "models/env_model.joblib"
    soc_path = "models/social_model.joblib"
    
    if os.path.exists(env_path):
        models["env"] = joblib.load(env_path)
    else:
        print(f"Warning: {env_path} not found. Environmental scoring will fail.")
        
    if os.path.exists(soc_path):
        models["social"] = joblib.load(soc_path)
    else:
        print(f"Warning: {soc_path} not found. Social scoring will fail.")

@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": list(models.keys())}

@app.post("/score/environmental", response_model=ScoreResponse)
def score_environmental(features: EnvironmentalFeatures):
    if "env" not in models:
        raise HTTPException(status_code=503, detail="Environmental model not loaded")
    
    # Convert to DataFrame with correct feature names
    df = pd.DataFrame([{
        "totalCO2": features.totalCO2,
        "co2Trend": features.co2Trend,
        "goalsOnTrack": features.goalsOnTrack,
        "goalsCompleted": features.goalsCompleted,
        "emissionIntensity": features.emissionIntensity,
        "autoRatio": features.autoRatio,
    }])[ENVIRONMENTAL_FEATURES]
    
    score = models["env"].predict(df)[0]
    # Clamp to 0-100
    score = max(0, min(100, float(score)))
    return ScoreResponse(score=score)

@app.post("/score/social", response_model=ScoreResponse)
def score_social(features: SocialFeatures):
    if "social" not in models:
        raise HTTPException(status_code=503, detail="Social model not loaded")
    
    df = pd.DataFrame([{
        "participationRate": features.participationRate,
        "diversityIndex": features.diversityIndex,
        "trainingCompletionRate": features.trainingCompletionRate,
        "challengeRate": features.challengeRate,
    }])[SOCIAL_FEATURES]
    
    score = models["social"].predict(df)[0]
    score = max(0, min(100, float(score)))
    return ScoreResponse(score=score)
