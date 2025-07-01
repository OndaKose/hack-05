// frontend/utils/places.ts

export type Place = {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
};

export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number = 500,
  apiKey: string
): Promise<Place[]> {
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${latitude},${longitude}` +
    `&radius=${radius}` +
    `&key=${apiKey}`;
  const resp = await fetch(url);
  const json = await resp.json();
  if (json.status !== 'OK') {
    throw new Error(`Places API error: ${json.status}`);
  }
  return json.results as Place[];
}