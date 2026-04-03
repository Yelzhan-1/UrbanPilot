import json
import random
import os
from datetime import datetime, timedelta

# Constants
SECTORS = ["Transport", "Ecology", "Safety", "Utilities"]
SEVERITIES = ["low", "medium", "high", "critical"]
DIFFICULTIES = ["low", "medium", "high"]
STATUSES = ["pending", "in_progress", "resolved"]

DISTRICT_PROFILES = [
    {"name": "Central Business District", "pop": 125000, "base_health": 90, "volatility": 5},
    {"name": "Western Arterial Corridor", "pop": 84000, "base_health": 60, "volatility": 20},
    {"name": "Industrial Basin", "pop": 22000, "base_health": 40, "volatility": 25},
    {"name": "Riverside Residential", "pop": 110000, "base_health": 85, "volatility": 10},
    {"name": "South Port Authority", "pop": 15000, "base_health": 55, "volatility": 15},
    {"name": "Eco-Park Heights", "pop": 65000, "base_health": 95, "volatility": 2},
    {"name": "University Campus Zone", "pop": 48000, "base_health": 75, "volatility": 10},
]

ANOMALY_TEMPLATES = {
    "Transport": [
        {"title": "Severe Gridlock", "unit": "km/h", "val_range": (5, 20), "desc": "Traffic flow significantly degraded."},
        {"title": "Freight Bottleneck", "unit": "vehicles", "val_range": (30, 100), "desc": "Heavy transport stacking up at key intersections."}
    ],
    "Ecology": [
        {"title": "Elevated Emissions", "unit": "AQI", "val_range": (120, 200), "desc": "Localized spike in PM2.5 and NOx."},
        {"title": "Water Quality Degradation", "unit": "NTU", "val_range": (40, 80), "desc": "Sudden changes in water turbidity detected."}
    ],
    "Safety": [
        {"title": "Perimeter Breach", "unit": "events", "val_range": (1, 3), "desc": "Unauthorized access detected by thermal sensors."},
        {"title": "Hazardous Material Alert", "unit": "Hazard Index", "val_range": (70, 100), "desc": "Multi-spectral sensors indicate VOC presence."}
    ],
    "Utilities": [
        {"title": "Power Grid Strain", "unit": "% load", "val_range": (95, 120), "desc": "Substation operating above optimal capacity."},
        {"title": "Pressure Drop", "unit": "bar", "val_range": (1.5, 2.5), "desc": "Water main pressure anomalies detected."}
    ]
}

def clamp(val, min_val=0, max_val=100):
    return max(min_val, min(max_val, int(val)))

def get_risk_level(health):
    if health >= 80: return "low"
    if health >= 60: return "medium"
    if health >= 40: return "high"
    return "critical"

def generate_districts():
    districts = []
    for i, prof in enumerate(DISTRICT_PROFILES):
        # Generate sector scores with random variance based on district volatility
        scores = {
            "transport": clamp(prof["base_health"] + random.uniform(-prof["volatility"], prof["volatility"])),
            "ecology": clamp(prof["base_health"] + random.uniform(-prof["volatility"], prof["volatility"])),
            "safety": clamp(prof["base_health"] + random.uniform(-prof["volatility"], prof["volatility"])),
            "utilities": clamp(prof["base_health"] + random.uniform(-prof["volatility"], prof["volatility"]))
        }
        overall_health = int(sum(scores.values()) / 4)
        
        districts.append({
            "id": f"dist-00{i+1}",
            "name": prof["name"],
            "overallHealth": overall_health,
            "overallRisk": get_risk_level(overall_health),
            "status": "Stable" if overall_health > 70 else "Warning" if overall_health > 40 else "Critical",
            "population": prof["pop"],
            "activeAnomaliesCount": 0, # Will be calculated later
            "sectorScores": scores,
            "mainIssue": None
        })
    return districts

def generate_anomalies(districts):
    anomalies = []
    num_anomalies = random.randint(8, 12)
    base_time = datetime.now()

    for i in range(num_anomalies):
        district = random.choice(districts)
        sector = random.choice(SECTORS)
        template = random.choice(ANOMALY_TEMPLATES[sector])
        severity = random.choice(SEVERITIES)
        
        ai_risk = random.randint(10, 30) if severity == "low" else \
                  random.randint(31, 60) if severity == "medium" else \
                  random.randint(61, 85) if severity == "high" else \
                  random.randint(86, 100)

        anomaly = {
            "id": f"anm-{100 + i + 1}",
            "title": template["title"],
            "description": template["desc"],
            "sector": sector,
            "severity": severity,
            "districtId": district["id"],
            "timestamp": (base_time - timedelta(minutes=random.randint(5, 120))).isoformat(),
            "metricValue": round(random.uniform(template["val_range"][0], template["val_range"][1]), 1),
            "metricUnit": template["unit"],
            "aiRiskScore": ai_risk
        }
        anomalies.append(anomaly)
        district["activeAnomaliesCount"] += 1
        
        # Add a main issue if the anomaly is high or critical
        if severity in ["high", "critical"] and not district["mainIssue"]:
            district["mainIssue"] = f"{template['title']} causing localized disruption."

    return anomalies

def generate_recommendations(anomalies):
    recommendations = []
    # Only generate recommendations for medium/high/critical anomalies
    actionable = [a for a in anomalies if a["severity"] in ["medium", "high", "critical"]]
    
    for i, anomaly in enumerate(actionable):
        recommendations.append({
            "id": f"rec-{200 + i + 1}",
            "anomalyId": anomaly["id"],
            "sector": anomaly["sector"],
            "scope": anomaly["districtId"],
            "priority": anomaly["severity"].capitalize(),
            "title": f"Address {anomaly['title']}",
            "description": f"Automated AI response plan for {anomaly['description'].lower()}",
            "suggestedActions": [
                f"Deploy field unit to sector {anomaly['sector']}",
                "Initiate automated risk mitigation protocol",
                "Notify local stakeholders"
            ],
            "estimatedImpactScore": random.randint(50, 95),
            "implementationDifficulty": random.choice(DIFFICULTIES),
            "status": random.choice(STATUSES)
        })
    return recommendations

def generate_forecast():
    forecast = []
    base_time = datetime.now().replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    
    for hour_offset in range(6):
        timestamp = (base_time + timedelta(hours=hour_offset)).isoformat()
        for sector in SECTORS:
            predicted = random.randint(40, 90)
            forecast.append({
                "timestamp": timestamp,
                "sector": sector,
                "predictedValue": predicted,
                "confidenceLowerBound": clamp(predicted - random.randint(5, 15)),
                "confidenceUpperBound": clamp(predicted + random.randint(5, 15))
            })
    return forecast

def generate_overview(districts, anomalies):
    avg_health = int(sum(d["overallHealth"] for d in districts) / len(districts))
    scores = {
        "transport": int(sum(d["sectorScores"]["transport"] for d in districts) / len(districts)),
        "ecology": int(sum(d["sectorScores"]["ecology"] for d in districts) / len(districts)),
        "safety": int(sum(d["sectorScores"]["safety"] for d in districts) / len(districts)),
        "utilities": int(sum(d["sectorScores"]["utilities"] for d in districts) / len(districts))
    }
    critical_count = sum(1 for a in anomalies if a["severity"] == "critical")
    
    return {
        "cityName": "Neo-Veridia",
        "overallHealth": avg_health,
        "riskScore": 100 - avg_health,
        "status": "Monitoring Required" if avg_health < 80 else "Optimal",
        "activeAnomalies": len(anomalies),
        "criticalAlerts": critical_count,
        "sectorScores": scores,
        "executiveSummary": f"AI Dashboard is tracking {len(anomalies)} active anomalies. Overall city health is at {avg_health}%.",
        "lastUpdated": datetime.now().isoformat()
    }

def main():
    print("Generating UrbanPilot synthetic data...")
    
    # Generate data
    districts = generate_districts()
    anomalies = generate_anomalies(districts)
    recommendations = generate_recommendations(anomalies)
    forecast = generate_forecast()
    overview = generate_overview(districts, anomalies)

    # Determine output directory relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "../public/data")
    
    # Create dir if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Save files
    files = {
        "districts.json": districts,
        "anomalies.json": anomalies,
        "recommendations.json": recommendations,
        "forecast.json": forecast,
        "overview.json": overview
    }

    for filename, data in files.items():
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  -> Created {filename}")
        
    print("Data generation complete! You can run this script anytime to refresh the dashboard.")

if __name__ == "__main__":
    main()