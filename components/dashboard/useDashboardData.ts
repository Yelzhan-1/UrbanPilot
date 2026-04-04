"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAnomalies,
  getDistricts,
  getForecast,
  getOverview,
  getRecommendations,
} from "@/lib/data";
import type {
  Anomaly,
  CityOverview,
  District,
  ForecastPoint,
  Recommendation,
} from "@/types/dashboard";

export type DashboardDataBundle = {
  overview: CityOverview | null;
  districts: District[];
  anomalies: Anomaly[];
  forecast: ForecastPoint[];
  recommendations: Recommendation[];
};

const EMPTY_DATA: DashboardDataBundle = {
  overview: null,
  districts: [],
  anomalies: [],
  forecast: [],
  recommendations: [],
};

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardDataBundle>(EMPTY_DATA);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        getOverview(),
        getDistricts(),
        getAnomalies(),
        getForecast(),
        getRecommendations(),
      ]);

      const [
        overviewRes,
        districtsRes,
        anomaliesRes,
        forecastRes,
        recommendationsRes,
      ] = results;

      const nextData: DashboardDataBundle = {
        overview: overviewRes.status === "fulfilled" ? overviewRes.value : null,
        districts:
          districtsRes.status === "fulfilled" && Array.isArray(districtsRes.value)
            ? districtsRes.value
            : [],
        anomalies:
          anomaliesRes.status === "fulfilled" && Array.isArray(anomaliesRes.value)
            ? anomaliesRes.value
            : [],
        forecast:
          forecastRes.status === "fulfilled" && Array.isArray(forecastRes.value)
            ? forecastRes.value
            : [],
        recommendations:
          recommendationsRes.status === "fulfilled" &&
          Array.isArray(recommendationsRes.value)
            ? recommendationsRes.value
            : [],
      };

      const failedSources: string[] = [];
      if (overviewRes.status === "rejected") failedSources.push("overview");
      if (districtsRes.status === "rejected") failedSources.push("districts");
      if (anomaliesRes.status === "rejected") failedSources.push("anomalies");
      if (forecastRes.status === "rejected") failedSources.push("forecast");
      if (recommendationsRes.status === "rejected") {
        failedSources.push("recommendations");
      }

      const hasAnyData =
        nextData.overview !== null ||
        nextData.districts.length > 0 ||
        nextData.anomalies.length > 0 ||
        nextData.forecast.length > 0 ||
        nextData.recommendations.length > 0;

      setData(nextData);

      if (!hasAnyData) {
        setError("Не удалось загрузить данные UrbanPilot.");
      } else if (failedSources.length > 0) {
        setError(`Часть данных не загрузилась: ${failedSources.join(", ")}.`);
      }
    } catch {
      setData(EMPTY_DATA);
      setError("Ошибка загрузки данных UrbanPilot.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    loading,
    error,
    data,
    reload: load,
  };
}