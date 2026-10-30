from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from astro_engine import calculate_chart, evaluate_rules, calculate_extended_data

app = FastAPI(title="Astronomical Core API", description="Python backend for Vedic Astrology chart calculation and deterministic rule matching.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
    # Phase 2: Append new charts without touching original logic
    extended_data = calculate_extended_data(
        req.birth_data.year, req.birth_data.month, req.birth_data.day, 
        req.birth_data.hour, req.birth_data.lat, req.birth_data.lon
    )
    
    # Convert Pydantic models to dicts for the engine
    rules_dict = [rule.model_dump() for rule in req.rules]
    
    # Pass extended_data so Phase 2B operators (nakshatra, ashtakavarga, karkamsha) work in matching
    matched_rules = evaluate_rules(chart, rules_dict, extended_data)
    
    return {
        "chart": chart,
        "matched_rules": matched_rules,
        # Phase 2A
        "chalit_chart": extended_data["chalit_chart"],
        "navamsha_chart": extended_data["navamsha_chart"],
        "panchang": extended_data["panchang"],
        # Phase 2B
        "grah_sthiti": extended_data["grah_sthiti"],
        "ashtakavarga": extended_data["ashtakavarga"],
        "karkamsha": extended_data["karkamsha"],
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

