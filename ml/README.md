# EcoSphere ML Scoring Service

This FastAPI microservice handles Machine Learning-based scoring for the Environmental and Social metrics of the EcoSphere ESG Platform. 

It receives real-time extracted feature data from the Next.js frontend, runs it through `scikit-learn`'s `GradientBoostingRegressor` models, and returns normalized scores on a scale of 0-100.

## Prerequisites

- Python 3.9+
- `uv` (recommended for fast package management) or standard `pip`

## Setup

We recommend using `uv` for environment management and dependency installation:

```bash
# Using uv
uv venv
uv pip install -r requirements.txt
```

Alternatively, with standard `pip`:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Training the Models

Before starting the API, you must generate the synthetic dataset and train the baseline ML models.

```bash
# Using uv
uv run python train.py
```

This script will:
1. Generate synthetic ESG data for Environmental and Social metrics.
2. Train a Gradient Boosting Regressor for each pillar.
3. Output the Mean Absolute Error (MAE) and R² scores.
4. Save `.joblib` model artifacts into the `models/` directory.

## Running the API Service

Start the FastAPI backend with Uvicorn:

```bash
# Using uv
uv run uvicorn main:app --port 8000 --reload
```

The service will be available at `http://localhost:8000`. It will attempt to load the pre-trained models from the `models/` directory upon startup.

## Endpoints

- `GET /health` : Returns API health status and a list of successfully loaded models.
- `POST /score/environmental` : Expects an `EnvironmentalFeatures` JSON payload; returns a computed score.
- `POST /score/social` : Expects a `SocialFeatures` JSON payload; returns a computed score.
