import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
from features import ENVIRONMENTAL_FEATURES, SOCIAL_FEATURES

def generate_synthetic_env_data(n=500):
    np.random.seed(42)
    totalCO2 = np.random.uniform(500, 5000, n)
    co2Trend = np.random.uniform(-0.5, 0.5, n)
    goalsOnTrack = np.random.randint(0, 5, n)
    goalsCompleted = np.random.randint(0, 5, n)
    emissionIntensity = totalCO2 / np.random.uniform(10, 100, n)
    autoRatio = np.random.uniform(0, 1, n)
    
    X = pd.DataFrame({
        "totalCO2": totalCO2,
        "co2Trend": co2Trend,
        "goalsOnTrack": goalsOnTrack,
        "goalsCompleted": goalsCompleted,
        "emissionIntensity": emissionIntensity,
        "autoRatio": autoRatio,
    })
    
    # Heuristic target
    base = 70.0 - (totalCO2 / 1000) - (co2Trend * 20) + (goalsCompleted * 10) + (goalsOnTrack * 5)
    # Add some noise
    noise = np.random.normal(0, 5, n)
    y = np.clip(base + noise, 0, 100)
    
    return X, y

def generate_synthetic_social_data(n=500):
    np.random.seed(42)
    participationRate = np.random.uniform(0, 1, n)
    diversityIndex = np.random.uniform(0, 1, n)
    trainingCompletionRate = np.random.uniform(0, 1, n)
    challengeRate = np.random.uniform(0, 1, n)
    
    X = pd.DataFrame({
        "participationRate": participationRate,
        "diversityIndex": diversityIndex,
        "trainingCompletionRate": trainingCompletionRate,
        "challengeRate": challengeRate,
    })
    
    base = (participationRate * 40) + (trainingCompletionRate * 30) + (diversityIndex * 20) + (np.clip(challengeRate, 0, 1) * 10)
    # Scale up
    base *= 100 / (40+30+20+10) # which is * 1.0, wait base is out of 100
    
    noise = np.random.normal(0, 5, n)
    y = np.clip(base + noise, 0, 100)
    
    return X, y

def train_and_save():
    os.makedirs("models", exist_ok=True)
    
    # Environmental
    X_env, y_env = generate_synthetic_env_data()
    X_train, X_test, y_train, y_test = train_test_split(X_env, y_env, test_size=0.2, random_state=42)
    
    model_env = GradientBoostingRegressor(n_estimators=100, max_depth=3, random_state=42)
    model_env.fit(X_train, y_train)
    preds = model_env.predict(X_test)
    print("Environmental Model:")
    print(f"MAE: {mean_absolute_error(y_test, preds):.2f}")
    print(f"R2 : {r2_score(y_test, preds):.2f}")
    
    joblib.dump(model_env, "models/env_model.joblib")
    
    # Social
    X_soc, y_soc = generate_synthetic_social_data()
    X_train, X_test, y_train, y_test = train_test_split(X_soc, y_soc, test_size=0.2, random_state=42)
    
    model_soc = GradientBoostingRegressor(n_estimators=100, max_depth=3, random_state=42)
    model_soc.fit(X_train, y_train)
    preds = model_soc.predict(X_test)
    print("\nSocial Model:")
    print(f"MAE: {mean_absolute_error(y_test, preds):.2f}")
    print(f"R2 : {r2_score(y_test, preds):.2f}")
    
    joblib.dump(model_soc, "models/social_model.joblib")
    
if __name__ == "__main__":
    train_and_save()
