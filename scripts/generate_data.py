import json
import os
import random
from datetime import datetime, timedelta

CITY_NAME = "Алматы"
RANDOM_SEED = 42

SECTORS = ["Transport", "Ecology", "Safety", "Utilities"]
SEVERITIES = ["low", "medium", "high", "critical"]
DIFFICULTIES = ["low", "medium", "high"]
STATUSES = ["pending", "in_progress", "resolved"]

DISTRICT_PROFILES = [
    {
        "name": "Алатауский район",
        "population": 315000,
        "volatility": 12,
        "sector_base": {"transport": 61, "ecology": 58, "safety": 67, "utilities": 62},
        "hotspots": ["магистрали северного пояса", "инженерные сети новых кварталов"],
    },
    {
        "name": "Алмалинский район",
        "population": 225000,
        "volatility": 9,
        "sector_base": {"transport": 66, "ecology": 63, "safety": 74, "utilities": 70},
        "hotspots": ["центральный деловой контур", "плотная уличная сеть центра"],
    },
    {
        "name": "Ауэзовский район",
        "population": 305000,
        "volatility": 10,
        "sector_base": {"transport": 64, "ecology": 62, "safety": 71, "utilities": 68},
        "hotspots": ["западный жилой массив", "коридоры высокого пассажиропотока"],
    },
    {
        "name": "Бостандыкский район",
        "population": 365000,
        "volatility": 8,
        "sector_base": {"transport": 69, "ecology": 68, "safety": 76, "utilities": 72},
        "hotspots": ["университетский и бизнес-кластер", "зоны смешанной застройки"],
    },
    {
        "name": "Жетысуский район",
        "population": 210000,
        "volatility": 11,
        "sector_base": {"transport": 60, "ecology": 56, "safety": 66, "utilities": 61},
        "hotspots": ["промышленная и складская зона", "участки старой инфраструктуры"],
    },
    {
        "name": "Медеуский район",
        "population": 245000,
        "volatility": 7,
        "sector_base": {"transport": 68, "ecology": 72, "safety": 75, "utilities": 70},
        "hotspots": ["горный пояс", "центр притяжения туристического потока"],
    },
    {
        "name": "Наурызбайский район",
        "population": 215000,
        "volatility": 9,
        "sector_base": {"transport": 63, "ecology": 70, "safety": 72, "utilities": 64},
        "hotspots": ["новые жилые массивы", "точки роста городской инфраструктуры"],
    },
    {
        "name": "Турксибский район",
        "population": 255000,
        "volatility": 12,
        "sector_base": {"transport": 58, "ecology": 54, "safety": 65, "utilities": 60},
        "hotspots": ["логистический пояс", "транспортные ворота города"],
    },
]

ANOMALY_TEMPLATES = {
    "Transport": [
        {
            "title": "Критическое замедление трафика",
            "unit": "км/ч",
            "val_range": (7, 19),
            "desc": "Средняя скорость потока на ключевых коридорах заметно снизилась.",
        },
        {
            "title": "Рост задержек автобусных маршрутов",
            "unit": "мин",
            "val_range": (9, 24),
            "desc": "Пассажирские маршруты выходят за нормативные интервалы движения.",
        },
        {
            "title": "Перегрузка перекрёстного узла",
            "unit": "% загрузки",
            "val_range": (88, 118),
            "desc": "Система фиксирует устойчивую перегрузку на локальном пересечении.",
        },
    ],
    "Ecology": [
        {
            "title": "Повышение PM2.5",
            "unit": "мкг/м³",
            "val_range": (42, 110),
            "desc": "Концентрация мелкодисперсных частиц превысила ожидаемый коридор.",
        },
        {
            "title": "Риск смога в приземном слое",
            "unit": "AQI",
            "val_range": (110, 190),
            "desc": "Атмосферная обстановка ухудшается в условиях слабой вентиляции воздуха.",
        },
        {
            "title": "Отклонение качества воды",
            "unit": "NTU",
            "val_range": (18, 54),
            "desc": "Датчики зафиксировали изменение мутности и качества воды.",
        },
    ],
    "Safety": [
        {
            "title": "Рост локальных инцидентов",
            "unit": "событий/ч",
            "val_range": (2, 9),
            "desc": "За короткий интервал времени увеличилось число происшествий.",
        },
        {
            "title": "Перегрузка экстренного реагирования",
            "unit": "% загрузки",
            "val_range": (81, 100),
            "desc": "Нагрузка на оперативные службы приблизилась к предельным значениям.",
        },
        {
            "title": "Нарушение периметра соцобъекта",
            "unit": "инцидентов",
            "val_range": (1, 4),
            "desc": "Система безопасности зафиксировала нештатный доступ на объект.",
        },
    ],
    "Utilities": [
        {
            "title": "Перегрузка электросети",
            "unit": "% нагрузки",
            "val_range": (93, 118),
            "desc": "Участок городской электросети работает выше комфортного режима.",
        },
        {
            "title": "Падение давления водоснабжения",
            "unit": "бар",
            "val_range": (1.3, 2.4),
            "desc": "Снижение давления может сказаться на стабильности подачи воды.",
        },
        {
            "title": "Пиковая нагрузка на теплоснабжение",
            "unit": "% нагрузки",
            "val_range": (84, 109),
            "desc": "Тепловой контур демонстрирует повышенную нагрузку на районном участке.",
        },
    ],
}


def clamp(val, min_val=0, max_val=100):
    return max(min_val, min(max_val, int(round(val))))


def get_risk_level(health):
    if health >= 80:
        return "low"
    if health >= 60:
        return "medium"
    if health >= 40:
        return "high"
    return "critical"


def get_status_label(health):
    if health >= 80:
        return "Стабильно"
    if health >= 60:
        return "Под наблюдением"
    if health >= 40:
        return "Требует реакции"
    return "Критично"


def district_index(profiles):
    return {
        f"dist-{i + 1:03d}": profile for i, profile in enumerate(profiles)
    }


def make_sector_scores(profile):
    scores = {}
    for sector_key, base in profile["sector_base"].items():
        adjusted = base + random.uniform(-profile["volatility"], profile["volatility"])
        scores[sector_key] = clamp(adjusted)
    return scores


def generate_districts():
    districts = []

    for i, profile in enumerate(DISTRICT_PROFILES):
        scores = make_sector_scores(profile)
        overall_health = int(sum(scores.values()) / 4)

        districts.append(
            {
                "id": f"dist-{i + 1:03d}",
                "name": profile["name"],
                "overallHealth": overall_health,
                "overallRisk": get_risk_level(overall_health),
                "status": get_status_label(overall_health),
                "population": profile["population"],
                "activeAnomaliesCount": 0,
                "sectorScores": scores,
                "mainIssue": None,
            }
        )

    return districts


def severity_to_ai_risk(severity):
    if severity == "low":
        return random.randint(18, 35)
    if severity == "medium":
        return random.randint(36, 62)
    if severity == "high":
        return random.randint(63, 84)
    return random.randint(85, 98)


def choose_severity(score):
    if score >= 78:
        return "critical"
    if score >= 62:
        return "high"
    if score >= 42:
        return "medium"
    return "low"


def choose_sector_for_district(district):
    weighted_pool = (
        ["Transport"] * max(1, 100 - district["sectorScores"]["transport"])
        + ["Ecology"] * max(1, 100 - district["sectorScores"]["ecology"])
        + ["Safety"] * max(1, 100 - district["sectorScores"]["safety"])
        + ["Utilities"] * max(1, 100 - district["sectorScores"]["utilities"])
    )
    return random.choice(weighted_pool)


def metric_value_from_template(template):
    start, end = template["val_range"]
    return round(random.uniform(start, end), 1)


def get_sector_actions(sector, district_name):
    if sector == "Transport":
        return [
            f"Перенастроить светофорные фазы в районе «{district_name}»",
            "Вывести дополнительный мониторинг на загруженные коридоры",
            "Передать приоритетный сценарий в городской центр управления трафиком",
        ]
    if sector == "Ecology":
        return [
            "Усилить контроль экологических датчиков на проблемном участке",
            "Запустить локальный сценарий предупреждения для населения",
            "Передать данные в профильные городские службы для оперативной проверки",
        ]
    if sector == "Safety":
        return [
            "Перенаправить дежурные силы на участок повышенного риска",
            "Поднять уровень мониторинга камер и сенсоров на ближайшие 2 часа",
            "Уточнить обстановку через районные оперативные службы",
        ]
    return [
        "Провести диагностику сетевого узла и смежных участков",
        "Подготовить резервный сценарий переключения нагрузки",
        "Уведомить районные эксплуатационные бригады о приоритетном выезде",
    ]


def get_recommendation_title(anomaly):
    if anomaly["sector"] == "Transport":
        return "Стабилизировать транспортный коридор"
    if anomaly["sector"] == "Ecology":
        return "Снизить экологическую нагрузку"
    if anomaly["sector"] == "Safety":
        return "Усилить меры реагирования"
    return "Нормализовать работу инженерной сети"


def get_recommendation_description(anomaly, district_name):
    return (
        f"AI-модуль рекомендует приоритетное реагирование на событие «{anomaly['title']}» "
        f"в зоне «{district_name}». Цель — снизить риск каскадного ухудшения в течение ближайших часов."
    )


def generate_anomalies(districts):
    anomalies = []
    base_time = datetime.now().replace(second=0, microsecond=0)
    district_lookup = {district["id"]: district for district in districts}
    profile_lookup = district_index(DISTRICT_PROFILES)

    num_anomalies = random.randint(10, 14)

    for i in range(num_anomalies):
        district = random.choice(districts)
        sector = choose_sector_for_district(district)
        template = random.choice(ANOMALY_TEMPLATES[sector])

        sector_key = sector.lower()
        health_gap = max(0, 100 - district["sectorScores"][sector_key])
        severity = choose_severity(health_gap + random.randint(0, 18))

        anomaly = {
            "id": f"anm-{101 + i}",
            "title": template["title"],
            "description": template["desc"],
            "sector": sector,
            "severity": severity,
            "districtId": district["id"],
            "timestamp": (base_time - timedelta(minutes=random.randint(6, 180))).isoformat(),
            "metricValue": metric_value_from_template(template),
            "metricUnit": template["unit"],
            "aiRiskScore": severity_to_ai_risk(severity),
        }

        anomalies.append(anomaly)
        district["activeAnomaliesCount"] += 1

        if severity in ["high", "critical"] and not district["mainIssue"]:
            hotspot = random.choice(profile_lookup[district["id"]]["hotspots"])
            district["mainIssue"] = f"{template['title']} в зоне «{hotspot}»."

    for district in districts:
        if not district["mainIssue"]:
            weakest_sector = min(district["sectorScores"], key=district["sectorScores"].get)
            readable = {
                "transport": "транспортный контур",
                "ecology": "экологический контур",
                "safety": "контур общественной безопасности",
                "utilities": "инженерный контур",
            }[weakest_sector]
            district["mainIssue"] = f"Наибольшее внимание требуется на направление: {readable}."

    return anomalies


def generate_recommendations(anomalies, districts):
    recommendations = []
    district_names = {district["id"]: district["name"] for district in districts}
    actionable = [a for a in anomalies if a["severity"] in ["medium", "high", "critical"]]

    for i, anomaly in enumerate(actionable):
        district_name = district_names[anomaly["districtId"]]
        recommendations.append(
            {
                "id": f"rec-{201 + i}",
                "anomalyId": anomaly["id"],
                "sector": anomaly["sector"],
                "scope": anomaly["districtId"],
                "priority": anomaly["severity"].capitalize(),
                "title": get_recommendation_title(anomaly),
                "description": get_recommendation_description(anomaly, district_name),
                "suggestedActions": get_sector_actions(anomaly["sector"], district_name),
                "estimatedImpactScore": random.randint(58, 94),
                "implementationDifficulty": random.choice(DIFFICULTIES),
                "status": random.choice(STATUSES),
            }
        )

    return recommendations


def generate_forecast(districts):
    forecast = []
    base_time = datetime.now().replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)

    sector_bases = {
        "Transport": int(sum(d["sectorScores"]["transport"] for d in districts) / len(districts)),
        "Ecology": int(sum(d["sectorScores"]["ecology"] for d in districts) / len(districts)),
        "Safety": int(sum(d["sectorScores"]["safety"] for d in districts) / len(districts)),
        "Utilities": int(sum(d["sectorScores"]["utilities"] for d in districts) / len(districts)),
    }

    for hour_offset in range(6):
        timestamp = (base_time + timedelta(hours=hour_offset)).isoformat()

        for sector in SECTORS:
            trend = random.randint(-6, 6)
            hour_pressure = random.randint(-4, 4)
            predicted = clamp(sector_bases[sector] + trend + hour_pressure, 35, 95)

            forecast.append(
                {
                    "timestamp": timestamp,
                    "sector": sector,
                    "predictedValue": predicted,
                    "confidenceLowerBound": clamp(predicted - random.randint(4, 11), 20, 100),
                    "confidenceUpperBound": clamp(predicted + random.randint(4, 11), 20, 100),
                }
            )

    return forecast


def generate_overview(districts, anomalies):
    avg_health = int(sum(d["overallHealth"] for d in districts) / len(districts))
    scores = {
        "transport": int(sum(d["sectorScores"]["transport"] for d in districts) / len(districts)),
        "ecology": int(sum(d["sectorScores"]["ecology"] for d in districts) / len(districts)),
        "safety": int(sum(d["sectorScores"]["safety"] for d in districts) / len(districts)),
        "utilities": int(sum(d["sectorScores"]["utilities"] for d in districts) / len(districts)),
    }
    critical_count = sum(1 for anomaly in anomalies if anomaly["severity"] == "critical")

    if avg_health >= 80:
        status = "Стабильный режим"
    elif avg_health >= 65:
        status = "Нужен усиленный мониторинг"
    elif avg_health >= 50:
        status = "Повышенное внимание"
    else:
        status = "Требуется немедленная реакция"

    top_district = min(districts, key=lambda item: item["overallHealth"])

    return {
        "cityName": CITY_NAME,
        "overallHealth": avg_health,
        "riskScore": 100 - avg_health,
        "status": status,
        "activeAnomalies": len(anomalies),
        "criticalAlerts": critical_count,
        "sectorScores": scores,
        "executiveSummary": (
            f"Городская платформа фиксирует {len(anomalies)} активных событий. "
            f"Интегральное состояние города — {avg_health}%. "
            f"Зона приоритетного внимания: {top_district['name']}."
        ),
        "lastUpdated": datetime.now().isoformat(),
    }


def main():
    random.seed(RANDOM_SEED)
    print(f"Generating UrbanPilot data for {CITY_NAME}...")

    districts = generate_districts()
    anomalies = generate_anomalies(districts)
    recommendations = generate_recommendations(anomalies, districts)
    forecast = generate_forecast(districts)
    overview = generate_overview(districts, anomalies)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "../public/data")
    os.makedirs(output_dir, exist_ok=True)

    files = {
        "districts.json": districts,
        "anomalies.json": anomalies,
        "recommendations.json": recommendations,
        "forecast.json": forecast,
        "overview.json": overview,
    }

    for filename, data in files.items():
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  -> Created {filename}")

    print("Data generation complete.")


if __name__ == "__main__":
    main()
