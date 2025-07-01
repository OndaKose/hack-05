// frontend/app/index.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Button,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { fetchNearbyPlaces, Place } from '../utils/places';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.4;

export default function HomeScreen() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  const apiKey =
    (Constants.manifest as any)?.extra?.googleMapsApiKey ??
    (Constants.expoConfig as any)?.extra?.googleMapsApiKey;

  const loadAllData = async () => {
    setLoading(true);

    // 1) パーミッション
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限エラー', '位置情報の権限がありません');
      setLoading(false);
      return;
    }

    // 2) 現在地取得
    let loc;
    try {
      loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    } catch {
      Alert.alert('取得失敗', '現在地の取得に失敗しました');
      setLoading(false);
      return;
    }
    const { latitude, longitude } = loc.coords;
    setCoords({ latitude, longitude });

    // 3) 逆ジオコーディング
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const json = await resp.json();
      setAddress(
        json.status === 'OK' && json.results.length > 0
          ? json.results[0].formatted_address
          : '住所が見つかりませんでした'
      );
    } catch {
      Alert.alert('APIエラー', '住所変換に失敗しました');
    }

    // 4) Nearby Places
    try {
      const nearby = await fetchNearbyPlaces(latitude, longitude, 500, apiKey);
      setPlaces(nearby);
    } catch (e: any) {
      Alert.alert('Places API エラー', e.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 地図移動用ヘルパー
  const moveMap = (region: Region) => {
    mapRef.current?.animateToRegion(region, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>半径500m以内の周辺施設</Text>
      {loading && <ActivityIndicator style={{ margin: 16 }} size="large" />}

      {coords && (
        <>
          {/* 地図 */}
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {/* 現在地ピン */}
            <Marker
              coordinate={coords}
              title="現在地"
              description={address ?? undefined}
            />
            {/* Nearby Places ピン */}
            {places.map((p) => (
              <Marker
                key={p.place_id}
                coordinate={{
                  latitude: p.geometry.location.lat,
                  longitude: p.geometry.location.lng,
                }}
                title={p.name}
                description={p.vicinity}
                pinColor="blue"
                onPress={() =>
                  moveMap({
                    latitude: p.geometry.location.lat,
                    longitude: p.geometry.location.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  })
                }
              />
            ))}
          </MapView>

          {/* リスト */}
          <FlatList
            style={{ flex: 1 }}
            data={places}
            keyExtractor={(i) => i.place_id}
            renderItem={({ item }) => (
              <View style={styles.placeItem}>
                <Text style={styles.placeName}>{item.name}</Text>
                <Text style={styles.placeVicinity}>{item.vicinity}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', margin: 16 }}>
                施設が見つかりませんでした
              </Text>
            }
          />
        </>
      )}

      {/* 再取得 */}
      <Button title="再取得" onPress={loadAllData} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { fontSize: 20, fontWeight: '700', margin: 16 },
  map: { width, height: MAP_HEIGHT },
  placeItem: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 6,
    elevation: 1,
  },
  placeName: { fontSize: 16, fontWeight: '600' },
  placeVicinity: { color: '#555' },
});