import React, { useEffect, useState, useRef } from 'react'
import {
  SafeAreaView,
  Text,
  View,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import Icon from 'react-native-vector-icons/FontAwesome'
import { fetchNearbyPlaces, Place } from '../utils/places'
import { fetchCommonSense, CommonSense } from '../utils/api'
import { sendCommonSenseNotification } from '../utils/notifications'
import { useRouter } from 'expo-router'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

type PlaceWithKind = Place & { kind: 'station' | 'convenience' | 'park' }

const { height } = Dimensions.get('window')
const MAP_HEIGHT = height * 0.4
const POLL_INTERVAL = 20 * 1000 // 20秒

export default function HomeScreen() {
  const router = useRouter()
  const [coords, setCoords]     = useState<{ latitude: number; longitude: number } | null>(null)
  const [region, setRegion]     = useState<Region | null>(null)
  const [places, setPlaces]     = useState<PlaceWithKind[]>([])
  const [commons, setCommons]   = useState<CommonSense[]>([])
  const [loading, setLoading]   = useState(false)
  const [notifyIndex, setNotifyIndex] = useState(0) // 駅→コンビニ→公園のインデックス
  const mapRef = useRef<MapView>(null)

  // 通知権限
  const askNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('通知権限なし', '通知を許可するとアラートが届きます')
    }
  }

  // CommonSense データロード
  const loadCommonSense = async () => {
    try {
      const list = await fetchCommonSense()
      setCommons(list)
    } catch (e: any) {
      console.warn('常識取得エラー:', e.message)
    }
  }

  // ポーリング＆通知
  const pollAndNotify = async () => {
    console.log('🔔 pollAndNotify @', new Date().toLocaleTimeString())
    setLoading(true)
    try {
      // 位置情報
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('位置情報権限なし', '設定から許可してください')
        setLoading(false)
        setNotifyIndex((notifyIndex + 1) % 3)
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest } as any)
      const { latitude, longitude } = loc.coords
      setCoords({ latitude, longitude })
      setRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 })

      // Google Places API key
      const apiKey = (Constants.expoConfig as any)?.extra?.googleMapsApiKey

      // 3 種類取得
      const [stations, conveniences, parks] = await Promise.all([
        fetchNearbyPlaces(latitude, longitude, 2000, apiKey, 'train_station'),
        fetchNearbyPlaces(latitude, longitude, 2000, apiKey, 'convenience_store'),
        fetchNearbyPlaces(latitude, longitude, 2000, apiKey, 'park'),
      ])

      // kind を付与して結合
      const allPlaces: PlaceWithKind[] = [
        ...stations.map(p => ({ ...p, kind: 'station' as const })),
        ...conveniences.map(p => ({ ...p, kind: 'convenience' as const })),
        ...parks.map(p => ({ ...p, kind: 'park' as const })),
      ]
      setPlaces(allPlaces)
      if (!allPlaces.length || !commons.length) {
        setLoading(false)
        setNotifyIndex((notifyIndex + 1) % 3)
        return
      }

      // 駅→コンビニ→公園 の順で通知
      const kinds: PlaceWithKind['kind'][] = ['station', 'convenience', 'park']
      const labels = ['駅', 'コンビニ', '公園']

      const kind = kinds[notifyIndex]
      const label = labels[notifyIndex]

      // 場所を取得（あればランダム・無ければ全体からランダム）
      const targets = allPlaces.filter(p => p.kind === kind)
      const chosen = targets.length
        ? targets[Math.floor(Math.random() * targets.length)]
        : allPlaces[Math.floor(Math.random() * allPlaces.length)]

      // 常識ジャンルから抽選
      const matched = commons.filter(c => c.genres?.includes(label))
      if (!matched.length) {
        setLoading(false)
        setNotifyIndex((notifyIndex + 1) % 3)
        return
      }
      const picked = matched[Math.floor(Math.random() * matched.length)]
      const title  = `[${label}のマナー] ${picked.title}`

      // 通知
      await sendCommonSenseNotification(picked.id, title, picked.content)

      // 次の種別に
      setNotifyIndex((notifyIndex + 1) % 3)
    } catch (e: any) {
      console.error('🎯 ポーリングエラー:', e)
    } finally {
      setLoading(false)
    }
  }

  // 初回＆タイマー設定
  useEffect(() => {
    ;(async () => {
      await askNotificationPermission()
      await loadCommonSense()
      await pollAndNotify()
    })()
    const timer = setInterval(pollAndNotify, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, []) // ← notifyIndexはここでは依存しない（内部で進めるだけ）

  // 地図移動
  const moveMap = (r: Region) => {
    mapRef.current?.animateToRegion(r, 500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        一定の時間が経つと通知{'\n'}
      </Text>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region ?? undefined}
        >
          {region && <Marker coordinate={region} title="現在地" pinColor="red" />}
          {places.map(p => (
            <Marker
              key={p.place_id}
              coordinate={{
                latitude: p.geometry.location.lat,
                longitude: p.geometry.location.lng,
              }}
              title={p.name}
              pinColor={
                p.kind === 'station'
                  ? 'blue'
                  : p.kind === 'convenience'
                  ? 'green'
                  : 'purple'
              }
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

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={pollAndNotify}>
          <Icon name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={places}
        keyExtractor={i => i.place_id}
        renderItem={({ item }) => (
          <View style={styles.placeItem}>
            <Text style={styles.placeName}>
              {item.kind === 'station'
                ? '🚉'
                : item.kind === 'convenience'
                ? '🏪'
                : '🌳'}{' '}
              {item.name}
            </Text>
            <Text style={styles.placeVicinity}>{item.vicinity}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>周辺の施設が見つかりませんでした</Text>
        }
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.mypageButton}
          onPress={() => router.push('/mypage')}
        >
          <Icon name="user" size={20} color="#000" />
          <Text style={styles.mypageButtonText}>マイページへ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FFF' },
  header:         { fontSize: 20, fontWeight: '700', margin: 16, textAlign: 'center' },
  mapContainer:   { height: MAP_HEIGHT, width: '100%' },
  map:            { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton:  {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 24,
  },
  placeItem:      {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  placeName:      { fontSize: 16, fontWeight: '600' },
  placeVicinity:  { color: '#555', marginTop: 4 },
  emptyText:      { textAlign: 'center', margin: 16, color: '#888' },
  buttonContainer: {
  padding: 16,
  alignItems: 'center',
},
mypageButton: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#000',
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 16,
  backgroundColor: '#FFF',
},
mypageButtonText: {
  marginLeft: 8,
  fontSize: 16,
  fontWeight: '600',
},
})