// frontend/app/home.tsx

import React, { useEffect, useState, useRef } from 'react'
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
} from 'react-native'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { fetchNearbyPlaces, Place } from '../utils/places'
import { fetchCommonSense, CommonSense } from '../utils/api'

// ① フォアグラウンドでもバナー表示する設定
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<any> => ({
    shouldShowAlert:  true,
    shouldPlaySound:  false,
    shouldSetBadge:   false,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
} as any)

// 「駅」か「コンビニ」かの種別を持たせた拡張型
type PlaceWithKind = Place & { kind: 'station' | 'convenience' }

const { width, height } = Dimensions.get('window')
const MAP_HEIGHT = height * 0.4

// ポーリング間隔（ミリ秒）: 2分
const POLL_INTERVAL = 2 * 60 * 1000

export default function HomeScreen() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [places, setPlaces] = useState<PlaceWithKind[]>([])
  const [commons, setCommons] = useState<CommonSense[]>([])
  const [loading, setLoading] = useState(false)
  const mapRef = useRef<MapView>(null)

  /** 通知権限リクエスト */
  const askNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('通知権限なし', '通知を許可するとアラートを受け取れます')
    }
  }

  /** 一度だけサーバーから常識一覧を取得 */
  const loadCommonSense = async () => {
    try {
      const data = await fetchCommonSense()
      setCommons(data)
    } catch (e: any) {
      console.warn('常識取得エラー:', e.message)
    }
  }

  /** 位置情報取得 → 駅＋コンビニ検索 → マーカーセット＆通知 */
  const pollAndNotify = async () => {
    setLoading(true)
    try {
      // 位置情報権限チェック
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('位置情報権限なし', '設定から許可してください')
        return
      }

      // 現在地取得（2秒だけ待ってみる）
      await new Promise(resolve => setTimeout(resolve, 2000))
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        // TSエラー回避のため timeout/maximumAge はキャストで回避
      } as any)
      const { latitude, longitude } = loc.coords
      setCoords({ latitude, longitude })

      // API Key 取得
      const apiKey =
        (Constants.manifest as any)?.extra?.googleMapsApiKey ??
        (Constants.expoConfig as any)?.extra?.googleMapsApiKey

      // 駅を検索（2000m以内）
      const stations = await fetchNearbyPlaces(
        latitude,
        longitude,
        2000,
        apiKey,
        'train_station'
      )

      // コンビニを検索（2000m以内）
      const convenienceStores = await fetchNearbyPlaces(
        latitude,
        longitude,
        2000,
        apiKey,
        'convenience_store'
      )

      // 種別付きにしてまとめる
      const allPlaces: PlaceWithKind[] = [
        ...stations.map(p => ({ ...p, kind: 'station' as const })),
        ...convenienceStores.map(p => ({ ...p, kind: 'convenience' as const })),
      ]
      setPlaces(allPlaces)

      // genres が存在するデータを取得
      const store = allPlaces[0] // “一つでも”あれば最初の要素を使う
      const commonsForKind = commons.find(c =>
        c.genres?.includes(store.kind === 'station' ? '駅' : 'コンビニ')
      )
      if (commonsForKind) {
        // 通知スケジュール
        await Notifications.scheduleNotificationAsync({
          content: {
            title:
              store.kind === 'station'
                ? `[駅のマナー] ${commonsForKind.title}`
                : `[コンビニのマナー] ${commonsForKind.title}`,
            body: commonsForKind.content,
          },
          trigger: null, // 即時
        })
      }
    } catch (e: any) {
      console.warn('ポーリングエラー:', e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // マウント時の初回
    ;(async () => {
      await askNotificationPermission()
      await loadCommonSense()
      await pollAndNotify()
    })()

    // 定期ポーリング（2分ごと）
    const id = setInterval(pollAndNotify, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [])

  /** 地図を指定座標に移動 */
  const moveMap = (region: Region) => {
    mapRef.current?.animateToRegion(region, 500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        半径2000m以内の駅＋コンビニ（2分ごとに更新）
      </Text>

      {loading && <ActivityIndicator style={{ margin: 16 }} size="large" />}

      {coords && (
        <>
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
            {/* 現在地 */}
            <Marker coordinate={coords} title="現在地" pinColor="red" />

            {/* 駅／コンビニ */}
            {places.map(p => (
              <Marker
                key={p.place_id}
                coordinate={{
                  latitude: p.geometry.location.lat,
                  longitude: p.geometry.location.lng,
                }}
                title={p.name}
                pinColor={p.kind === 'station' ? 'blue' : 'green'}
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

          <FlatList
            style={{ flex: 1 }}
            data={places}
            keyExtractor={i => i.place_id}
            renderItem={({ item }) => (
              <View style={styles.placeItem}>
                <Text style={styles.placeName}>
                  {item.kind === 'station' ? '🚉 ' : '🏪 '} {item.name}
                </Text>
                <Text style={styles.placeVicinity}>{item.vicinity}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', margin: 16 }}>
                駅・コンビニが見つかりませんでした
              </Text>
            }
          />
        </>
      )}

      <Button title="手動再取得" onPress={pollAndNotify} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F3F4F6' },
  header:        { fontSize: 20, fontWeight: '700', margin: 16, textAlign: 'center' },
  map:           { width, height: MAP_HEIGHT },
  placeItem:     { backgroundColor: '#FFF', margin: 8, padding: 12, borderRadius: 6 },
  placeName:     { fontSize: 16, fontWeight: '600' },
  placeVicinity: { color: '#555' },
})