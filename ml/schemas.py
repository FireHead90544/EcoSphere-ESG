from pydantic import BaseModel

class EnvironmentalFeatures(BaseModel):
    totalCO2: float
    co2Trend: float
    goalsOnTrack: int
    goalsCompleted: int
    emissionIntensity: float
    autoRatio: float

class SocialFeatures(BaseModel):
    participationRate: float
    diversityIndex: float
    trainingCompletionRate: float
    challengeRate: float

class ScoreResponse(BaseModel):
    score: float
