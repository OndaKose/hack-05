// frontend/app/mypage.tsx

import React, { useEffect, useState, useRef } from 'react'
import {
  SafeAreaView,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Button,
  Animated,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getCurrentUserId } from '../utils/auth'
import { fetchUserVotes, UserVote } from '../utils/api'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function MyPage() {
  const router = useRouter()
  const [data, setData]       = useState<UserVote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  // 各アイテム用の Animated.Value の配列
  const animValues = useRef<Animated.Value[]>([]).current

  useEffect(() => {
    ;(async () => {
      const userId = await getCurrentUserId()
      if (!userId) {
        setError('ログインが必要です')
        setLoading(false)
        return
      }
      try {
        const votes = await fetchUserVotes(userId)
        setData(votes)

        // Animated.Value を votes.length 個だけ用意
        animValues.splice(0, animValues.length)
        votes.forEach(() => animValues.push(new Animated.Value(SCREEN_HEIGHT)))

        // 各アイテムを順番にゆったりスライドイン
        const animations = votes.map((_, i) =>
          Animated.timing(animValues[i], {
            toValue: 0,
            useNativeDriver: true,
            duration: 500,      // 500ms かけてスライド
            delay: i * 200,     // アイテムごとに 200ms 遅延
          })
        )
        Animated.stagger(200, animations).start()
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>投票した常識達</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.common_sense_id)}
        contentContainerStyle={data.length === 0 && styles.emptyContainer}
        renderItem={({ item, index }) => (
          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateY: animValues[index] }] },
            ]}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text
              style={[
                styles.status,
                item.recognized ? styles.known : styles.unknown,
              ]}
            >
              {item.recognized ? '✅ 知っていた' : '❓ 知らなかった'}
            </Text>
          </Animated.View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>まだ投票した常識がありません</Text>
        }
      />

      <View style={styles.levelButtonContainer}>
        <Button
          title="自分のレベルを見る"
          onPress={() => router.push('/level')}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#F3F4F6', paddingTop: 16 },
  center:               { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:               { fontSize: 24, fontWeight: '700', marginHorizontal: 16, marginBottom: 12, textAlign: 'center', color: '#333' },
  error:                { color: '#D32F2F', fontSize: 16, textAlign: 'center' },
  empty:                { textAlign: 'center', marginTop: 20, color: '#555' },
  emptyContainer:      { flexGrow: 1, justifyContent: 'center' },
  card:                 { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  title:                { fontSize: 18, fontWeight: '600', color: '#222' },
  content:              { marginTop: 6, fontSize: 14, color: '#444', lineHeight: 20 },
  status:               { marginTop: 10, fontSize: 14, fontWeight: '500' },
  known:                { color: '#2E7D32' },
  unknown:              { color: '#C62828' },
  levelButtonContainer: { margin: 16, alignItems: 'center' },
})