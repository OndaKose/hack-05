// frontend/app/level.tsx

import React, { useEffect, useState } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getCurrentUserId } from '../utils/auth'
import { fetchUserLevel, UserLevel } from '../utils/api'

export default function LevelScreen() {
  const router = useRouter()
  const [level, setLevel]     = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const userId = await getCurrentUserId()
      if (!userId) {
        setError('ログインが必要です')
        setLoading(false)
        return
      }
      try {
        const lvl = await fetchUserLevel(userId)
        setLevel(lvl)
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

  if (!level) return null

  // 次レベルに必要なポイント (次レベル = user_level + 1)
  const pointsForNext = (level.user_level + 1) * 10
  // 現在の合計ポイント
  const currentPoints = level.level_sum
  // 残りの必要ポイント
  const remaining = pointsForNext - currentPoints
  // 進捗率 (0〜1)
  const progress = Math.min(currentPoints / pointsForNext, 1)

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>あなたの現在のレベル</Text>

      <View style={styles.card}>
        <Text style={styles.label}>合計レベルポイント</Text>
        <Text style={styles.value}>{currentPoints}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>ユーザーレベル</Text>
        <Text style={styles.value}>Lv.{level.user_level}</Text>
      </View>

      {/* プログレスバー */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          次のレベルまであと {remaining} ポイント
        </Text>
        <View style={styles.progressBarBackground}>
          {/* 緑部分: flex で進捗を表現 */}
          <View style={[styles.progressBarFill, { flex: progress }]} />
          {/* グレー部分: 残り */}
          <View style={{ flex: 1 - progress }} />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="ホームへ戻る" onPress={() => router.push('/home')} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 16,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
    color: '#333',
  },
  progressContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  progressText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  progressBarBackground: {
    flexDirection: 'row',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  error: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
})