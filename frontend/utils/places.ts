// frontend/utils/places.ts

export type Place = {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  types?: string[];
};

/**
 * Google Places API の Nearby Search を呼び出します。
 * @param latitude 緯度
 * @param longitude 経度
 * @param radius 半径 (メートル)
 * @param apiKey Google Maps API Key
 * @param type Optional. Places API の type パラメータ (例: 'train_station', 'convenience_store')
 * @returns 取得結果。該当なしの場合は空配列。
 * @throws 「REQUEST_DENIED」など、ZERO_RESULTS 以外のステータス時に Error を投げます。
 */
export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number = 500,
  apiKey: string,
  type?: string,
): Promise<Place[]> {
  // URL 組み立て
  let url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${latitude},${longitude}` +
    `&radius=${radius}`;

  if (type) {
    url += `&type=${encodeURIComponent(type)}`;
  }

  url += `&key=${apiKey}`;

  // API 呼び出し
  const resp = await fetch(url);
  const json = await resp.json();

  switch (json.status) {
    case 'OK':
      // 正常に結果が返ってきた場合
      return json.results as Place[];

    case 'ZERO_RESULTS':
      // 該当する地点がない場合 → 空配列を返却
      return [];

    default:
      // それ以外は例外として扱う
      throw new Error(`Places API error: ${json.status}`);
  }
}