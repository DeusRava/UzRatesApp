import AsyncStorage from '@react-native-async-storage/async-storage';

const CBU_API_URL = 'https://cbu.uz/ru/arkhiv-kursov-valyut/json/';
const CACHE_KEY = 'cbu_rates_cache';
const CACHE_TIMESTAMP_KEY = 'cbu_rates_timestamp';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

export interface Rate {
  code: string;
  rate: number;
  nominal: number;
  name: string;
  nameRu: string;
  diff: number;
  date: string;
}

export const MAIN_CURRENCIES = ['USD', 'EUR', 'RUB', 'GBP', 'CNY', 'KZT', 'TRY', 'AED', 'JPY', 'CHF'];

export async function fetchRates(forceRefresh = false): Promise<Rate[]> {
  if (!forceRefresh) {
    try {
      const ts = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (ts && cached) {
        const age = Date.now() - parseInt(ts, 10);
        if (age < CACHE_TTL) {
          return JSON.parse(cached);
        }
      }
    } catch (_) {}
  }

  const response = await fetch(CBU_API_URL);
  const data = await response.json();

  const rates: Rate[] = data.map((item: any) => ({
    code: item.Ccy,
    rate: parseFloat(item.Rate),
    nominal: parseInt(item.Nominal, 10),
    name: item.CcyNm_EN || item.Ccy,
    nameRu: item.CcyNm_RU || item.Ccy,
    diff: parseFloat(item.Diff),
    date: item.Date,
  }));

  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

  return rates;
}

export async function getCacheAge(): Promise<number | null> {
  const ts = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!ts) return null;
  return Date.now() - parseInt(ts, 10);
}

export function convert(rates: Rate[], fromCode: string, toCode: string, amount: number): number {
  const toUzs = (code: string, amt: number): number => {
    if (code === 'UZS') return amt;
    const r = rates.find(x => x.code === code);
    if (!r) return 0;
    return amt * (r.rate / r.nominal);
  };
  const fromUzs = (code: string, uzsAmt: number): number => {
    if (code === 'UZS') return uzsAmt;
    const r = rates.find(x => x.code === code);
    if (!r) return 0;
    return uzsAmt / (r.rate / r.nominal);
  };
  return fromUzs(toCode, toUzs(fromCode, amount));
}

export function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}
