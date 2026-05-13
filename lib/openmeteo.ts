const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export interface SeasonRainfall {
  totalMm: number;
  dailyMm: number[];
  dates: string[];
  raw: unknown;
}

export async function fetchSeasonRainfall(
  lat: number,
  lon: number,
  seasonStart: string,
  endDate?: string
): Promise<SeasonRainfall> {
  const today = endDate ?? new Date().toISOString().split('T')[0];

  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'precipitation_sum,temperature_2m_max');
  url.searchParams.set('start_date', seasonStart);
  url.searchParams.set('end_date', today);
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();
  const dailyMm: number[] = (data.daily?.precipitation_sum ?? []).map(
    (d: number | null) => d ?? 0
  );
  const dates: string[] = data.daily?.time ?? [];
  const totalMm = dailyMm.reduce((sum, d) => sum + d, 0);

  return { totalMm, dailyMm, dates, raw: data };
}

export async function fetchRecentRainfall(
  lat: number,
  lon: number,
  days = 30
): Promise<SeasonRainfall> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'precipitation_sum');
  url.searchParams.set('past_days', String(days));
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) {
    // Fall back to archive endpoint
    return fetchSeasonRainfall(lat, lon, fmt(start), fmt(end));
  }
  const data = await res.json();
  const dailyMm: number[] = (data.daily?.precipitation_sum ?? []).map(
    (d: number | null) => d ?? 0
  );
  const dates: string[] = data.daily?.time ?? [];
  const totalMm = dailyMm.reduce((sum, d) => sum + d, 0);

  return { totalMm, dailyMm, dates, raw: data };
}
