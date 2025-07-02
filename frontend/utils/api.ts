// frontend/utils/api.ts

import { Platform } from 'react-native';

const HOST = Platform.select({
  android: '10.0.2.2',      // Android エミュレータ
  ios: '10.37.57.55',       // ← ここを書き換え
  default: '10.37.57.55',   // web やその他
});

export const BASE_URL = `http://${HOST}:8000`;

export type CommonSense = {
  id: number;
  title: string;
  content: string;
  genres: string[];
  level: number;
};

export async function fetchCommonSense(): Promise<CommonSense[]> {
  const url = `${BASE_URL}/common_sense/`;
  console.log("📡 Fetching CommonSense from:", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Error ${res.status}`);
  return (await res.json()) as CommonSense[];
}