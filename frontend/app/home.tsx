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
import { LinearGradient } from 'expo-linear-gradient'
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

type PlaceWithKind = Place & { kind: 'station' | 'convenience' | 'park' }

const { width, height } = Dimensions.get('window')
const MAP_HEIGHT       = height * 0.4
const POLL_INTERVAL    = 20 * 1000  // 20秒

export default function HomeScreen() {
  const [coords, setCoords]   = useState<{ latitude: number; longitude: number } | null>(null)
  const [places, setPlaces]   = useState<PlaceWithKind[]>([])
  const [commons, setCommons] = useState<CommonSense[]>([])
  const [loading, setLoading] = useState(false)
  const mapRef = useRef<MapView>(null)

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

  /** ポーリング＆通知送信 */
  const pollAndNotify = async () => {
    setLoading(true)
    try {
      // 1) 位置情報取得
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

      // 2) 駅・コンビニ・公園の検索
      const apiKey =
        (Constants.manifest as any)?.extra?.googleMapsApiKey ??
        (Constants.expoConfig as any)?.extra?.googleMapsApiKey
      const [stations, conveniences, parks] = await Promise.all([
        fetchNearbyPlaces(latitude, longitude, 2000, apiKey, 'train_station'),
        fetchNearbyPlaces(latitude, longitude, 2000, apiKey, 'convenience_store'),
        fetchNearbyPlaces(latitude, longitude, 2000, apiKey, 'park'),
      ])
      const allPlaces: PlaceWithKind[] = [
        ...stations.map(p => ({ ...p, kind: 'station' } as const)),
        ...conveniences.map(p => ({ ...p, kind: 'convenience' } as const)),
        ...parks.map(p => ({ ...p, kind: 'park' } as const)),
      ]
      setPlaces(allPlaces)
      if (allPlaces.length === 0 || commons.length === 0) {
        setLoading(false)
        return
      }

      // 3) ランダムな種別を選択
      const kinds: PlaceWithKind['kind'][] = ['station', 'convenience', 'park']
      const randomKind = kinds[Math.floor(Math.random() * kinds.length)]

      // 4) 種別内でランダムピック
      const placesOfKind = allPlaces.filter(p => p.kind === randomKind)
      const chosen = placesOfKind.length > 0
        ? placesOfKind[Math.floor(Math.random() * placesOfKind.length)]
        : allPlaces[Math.floor(Math.random() * allPlaces.length)]

      // 5) 常識データをマッチ & ランダムに
      const label = chosen.kind === 'station'
        ? '駅'
        : chosen.kind === 'convenience'
        ? 'コンビニ'
        : '公園'
      const matched = commons.filter(c => c.genres?.includes(label))
      if (matched.length === 0) {
        setLoading(false)
        return
      }
      const picked = matched[Math.floor(Math.random() * matched.length)]

      // 6) 通知
      const title = `[${label}のマナー] ${picked.title}`
      const body  = picked.content
      await sendCommonSenseNotification(picked.id, title, body)

    } catch (e: any) {
      console.error('🎯 ポーリングエラー:', e)
    } finally {
      setLoading(false)
    }
  }

  // 初回＆定期 20秒ごと
  useEffect(() => {
    ;(async () => {
      await askNotificationPermission()
      await loadCommonSense()
      await pollAndNotify()
    })()
    const timer = setInterval(pollAndNotify, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  /** 地図を移動 */
  const moveMap = (region: Region) => mapRef.current?.animateToRegion(region, 500)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={['#4c669f','#3b5998','#192f6a']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>半径2000m以内の駅・コンビニ・公園</Text>
          <Text style={styles.headerSubtitle}>20秒ごとにランダム通知</Text>
        </LinearGradient>
      </View>

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
                coordinate={{latitude:p.geometry.location.lat, longitude:p.geometry.location.lng}}
                title={p.name}
                pinColor={p.kind==='station'?'blue':p.kind==='convenience'?'green':'orange'}
                onPress={() => moveMap({latitude:p.geometry.location.lat, longitude:p.geometry.location.lng, latitudeDelta:0.01, longitudeDelta:0.01})}
              />
            ))}
          </MapView>

          <FlatList
            style={{ flex:1 }}
            data={places}
            keyExtractor={i=>i.place_id}
            renderItem={({item})=>(
              <View style={styles.placeItem}>
                <Text style={styles.placeName}>{item.kind==='station'?'🚉':item.kind==='convenience'?'🏪':'🌳'} {item.name}</Text>
                <Text style={styles.placeVicinity}>{item.vicinity}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{textAlign:'center',margin:16}}>駅・コンビニ・公園なし</Text>}
          />
        </>
      )}

      <Button title="手動再取得" onPress={pollAndNotify} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:      { flex:1, backgroundColor:'#F3F4F6' },
  headerWrapper:  { margin:16, borderRadius:12, overflow:'hidden' },
  headerGradient: { width:'100%', paddingVertical:16, paddingHorizontal:24, justifyContent:'center', alignItems:'center' },
  headerTitle:    { fontSize:18, fontWeight:'700', color:'#FFF', textAlign:'center' },
  headerSubtitle: { marginTop:4, fontSize:14, color:'#E0E0E0', textAlign:'center' },
  map:            { width, height:MAP_HEIGHT },
  placeItem:      { backgroundColor:'#FFF', margin:8, padding:12, borderRadius:6 },
  placeName:      { fontSize:16, fontWeight:'600' },
  placeVicinity:  { color:'#555' },
})