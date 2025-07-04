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
import { sendCommonSenseNotification } from '../utils/notifications'

// フォアグラウンドでもバナー／リストで通知を表示
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  false,
    shouldSetBadge:   false,
  }),
})

type PlaceWithKind = Place & { kind: 'station' | 'convenience' }

const { width, height } = Dimensions.get('window')
const MAP_HEIGHT       = height * 0.4
const POLL_INTERVAL    = 20 * 1000  // 20秒

export default function HomeScreen() {
  const [coords, setCoords]   = useState<{ latitude: number; longitude: number } | null>(null)
  const [places, setPlaces]   = useState<PlaceWithKind[]>([])
  const [commons, setCommons] = useState<CommonSense[]>([])
  const [loading, setLoading] = useState(false)
  const mapRef = useRef<MapView>(null)

  // 次回は駅？コンビニ？を保持するフラグ
  // true → 駅, false → コンビニ
  const nextIsStationRef = useRef(true)

  /** 通知権限リクエスト */
  const askNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('通知権限なし', '通知を許可するとアラートが届きます')
    }
  }

  /** 常識一覧をサーバーから一度だけ取得 */
  const loadCommonSense = async () => {
    try {
      const data = await fetchCommonSense()
      setCommons(data)
    } catch (e: any) {
      console.warn('常識取得エラー:', e.message)
    }
  }

  const pollAndNotify = async () => {
    setLoading(true)
    try {
      // --- 1) 位置情報 ---
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('位置情報権限なし', '設定から許可してください')
        setLoading(false)
        return
      }
      await new Promise(r => setTimeout(r, 500))
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest } as any)
      const { latitude, longitude } = loc.coords
      setCoords({ latitude, longitude })

      // --- 2) 駅・コンビニ検索 ---
      const apiKey =
        (Constants.manifest as any)?.extra?.googleMapsApiKey ??
        (Constants.expoConfig as any)?.extra?.googleMapsApiKey
      const stations     = await fetchNearbyPlaces(latitude, longitude, 2000, apiKey, 'train_station')
      const conveniences = await fetchNearbyPlaces(latitude, longitude, 2000, apiKey, 'convenience_store')

      const allPlaces: PlaceWithKind[] = [
        ...stations.map(p => ({ ...p, kind: 'station' as const })),
        ...conveniences.map(p => ({ ...p, kind: 'convenience' as const })),
      ]
      setPlaces(allPlaces)
      if (allPlaces.length === 0 || commons.length === 0) {
        setLoading(false)
        return
      }

      // --- 3) 交互ロジック ---
      const targetKind = nextIsStationRef.current ? 'station' : 'convenience'
      // その種別の場所だけを抽出
      const placesOfKind = allPlaces.filter(p => p.kind === targetKind)

      let chosenPlace: PlaceWithKind
      if (placesOfKind.length > 0) {
        // 見つかったらここで通知 → 切り替え
        chosenPlace = placesOfKind[Math.floor(Math.random() * placesOfKind.length)]
        nextIsStationRef.current = !nextIsStationRef.current
      } else {
        // 見つからなければフォールバック（切り替えは行わない）
        chosenPlace = allPlaces[Math.floor(Math.random() * allPlaces.length)]
      }

      // ラベルと常識ピック
      const label = chosenPlace.kind === 'station' ? '駅' : 'コンビニ'
      const matched = commons.filter(c => c.genres?.includes(label))
      if (matched.length === 0) {
        setLoading(false)
        return
      }
      const picked = matched[Math.floor(Math.random() * matched.length)]
      const title  = label === '駅'
        ? `[駅のマナー] ${picked.title}`
        : `[コンビニのマナー] ${picked.title}`

      // --- 4) 通知送信 ---
      await sendCommonSenseNotification(picked.id, title, picked.content)
    } catch (e: any) {
      console.error('🎯 ポーリングエラー:', e)
    } finally {
      setLoading(false)
    }
  }

  // 初回＆定期実行
  useEffect(() => {
    ;(async () => {
      await askNotificationPermission()
      await loadCommonSense()
      await pollAndNotify()
    })()
    const timer = setInterval(pollAndNotify, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  /** 地図を指定位置に移動 */
  const moveMap = (region: Region) => {
    mapRef.current?.animateToRegion(region, 500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        半径2000m以内の駅＋コンビニ（20秒ごとに交互に通知）
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
            <Marker coordinate={coords} title="現在地" pinColor="red" />
            {places.map(p => (
              <Marker
                key={p.place_id}
                coordinate={{
                  latitude:  p.geometry.location.lat,
                  longitude: p.geometry.location.lng,
                }}
                title={p.name}
                pinColor={p.kind === 'station' ? 'blue' : 'green'}
                onPress={() =>
                  moveMap({
                    latitude:       p.geometry.location.lat,
                    longitude:      p.geometry.location.lng,
                    latitudeDelta:  0.01,
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