from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from astro_engine import calculate_chart, evaluate_rules

app = FastAPI(title="Astronomical Core API", description="Python backend for Vedic Astrology chart calculation and deterministic rule matching.")

class ChartRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: float  # UTC hour (e.g., 14.5 for 14:30 UTC)
    lat: float
    lon: float

class RuleCondition(BaseModel):
    entity: str
    operator: str
    value: str

class AstroRule(BaseModel):
    id: str
    name: str
    description: str
    logic: str = "AND"
    conditions: List[RuleCondition]

class EvaluateRequest(BaseModel):
    birth_data: ChartRequest
    rules: List[AstroRule]

@app.get("/")
def read_root():
    return {"status": "Astronomical Core API is running."}

@app.post("/api/chart")
def get_chart(req: ChartRequest):
    """Calculate the exact planetary positions using Swiss Ephemeris."""
    chart = calculate_chart(req.year, req.month, req.day, req.hour, req.lat, req.lon)
    return chart

@app.post("/api/evaluate")
def evaluate(req: EvaluateRequest):
    """Calculate chart and evaluate it deterministically against provided rules."""
    chart = calculate_chart(
        req.birth_data.year, req.birth_data.month, req.birth_data.day, 
        req.birth_data.hour, req.birth_data.lat, req.birth_data.lon
    )
    
    # Convert Pydantic models to dicts for the engine
    rules_dict = [rule.model_dump() for rule in req.rules]
    
    matched_rules = evaluate_rules(chart, rules_dict)
    
    return {
        "chart": chart,
        "matched_rules": matched_rules
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

