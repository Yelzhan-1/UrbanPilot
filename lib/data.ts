// lib/data.ts

import {
  CityOverview,
  District,
  Anomaly,
  ForecastPoint,
  Recommendation
} from '../types/dashboard';

/**
 * Utility to resolve the correct base URL for Next.js App Router.
 * Ensures fetches work correctly in both Server and Client Components.
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''; // Client-side request
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000'; // Default local development URL
}

/**
 * Generic fetcher for the mock JSON data in public/data/
 */
async function fetchMockData<T>(fileName: string): Promise<T> {
  const url = `${getBaseUrl()}/data/${fileName}`;
  
  // Using cache: 'no-store' ensures the dashboard feels dynamic during 
  // the hackathon and immediately reflects any manual changes to the JSON files.
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch mock data: ${fileName}`);
  }
  
  return response.json();
}

/**
 * Fetch the high-level city overview stats.
 */
export async function getOverview(): Promise<CityOverview> {
  return fetchMockData<CityOverview>('overview.json');
}

/**
 * Fetch granular data for all city districts.
 */
export async function getDistricts(): Promise<District[]> {
  return fetchMockData<District[]>('districts.json');
}

/**
 * Fetch all active anomalies/alerts across the city.
 */
export async function getAnomalies(): Promise<Anomaly[]> {
  return fetchMockData<Anomaly[]>('anomalies.json');
}

/**
 * Fetch short-term forecast points for predictive charting.
 */
export async function getForecast(): Promise<ForecastPoint[]> {
  return fetchMockData<ForecastPoint[]>('forecast.json');
}

/**
 * Fetch AI-generated decision recommendations.
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  return fetchMockData<Recommendation[]>('recommendations.json');
}