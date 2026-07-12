# EcoSphere ML Scoring Service

This FastAPI microservice handles ML-based scoring for Environmental and Social metrics.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Training

Train the synthetic models before starting the API:

```bash
python train.py
```

## Running the Service

```bash
uvicorn main:app --port 8000 --reload
```

## Endpoints

- `GET /health`
- `POST /score/environmental`
- `POST /score/social`
