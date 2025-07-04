// frontend/app/common-sense/[id].tsx

import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { PieChart } from 'react-native-chart-kit'
import {
  fetchCommonSenseDetail,
  apiVote,
  apiStats,
  apiCheckVote,
  CommonSense,
  Vote,
} from '../../utils/api'
import { getCurrentUserId } from '../../utils/auth'

export default function DetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const screenWidth = Dimensions.get('window').width
  const cardWidth = screenWidth * 0.9

  const [item, setItem] = useState<CommonSense | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ known: number; unknown: number }>({ known: 0, unknown: 0 })
  const [statLoading, setStatLoading] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  // 詳細取得
  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchCommonSenseDetail(+id)
      .then(d => { setItem(d); setError(null) })
      .catch(() => setError('読み込みに失敗しました'))
      .finally(() => setLoading(false))
  }, [id])

  // 既存投票チェック
  useEffect(() => {
    if (!id) return
    ;(async () => {
      const userId = await getCurrentUserId()
      if (!userId) return
      try {
        const v: Vote | null = await apiCheckVote(userId, +id)
        if (v) setHasVoted(true)
      } catch {
        // no vote
      }
    })()
  }, [id])

  // 集計取得
  const loadStats = async () => {
    if (!id) return
    setStatLoading(true)
    try {
      const s = await apiStats(+id)
      setStats(s)
    } catch (e) {
      console.warn('集計取得エラー', e)
    } finally {
      setStatLoading(false)
    }
  }

  // 投票ハンドラ
  const handleVote = async (recognized: boolean) => {
    const userId = await getCurrentUserId()
    if (!userId) {
      Alert.alert('エラー', 'ログイン情報がありません')
      return
    }
    try {
      await apiVote({ user_id: userId, common_sense_id: +id, recognized })
      Alert.alert(
        '投票完了',
        recognized ? '知っていたに投票しました' : '知らなかったに投票しました'
      )
      setHasVoted(true)
      await loadStats()
    } catch (e: any) {
      Alert.alert('投票エラー', e.message || '投票に失敗しました')
    }
  }

  // 円グラフデータ
  const pieData = [
    {
      name: '知っていた',
      count: stats.known,
      color: '#36A2EB',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: '知らなかった',
      count: stats.unknown,
      color: '#FF6384',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ]

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { paddingTop: insets.top }]}>  
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }
  if (error || !item) {
    return (
      <SafeAreaView style={[styles.center, { paddingTop: insets.top }]}>  
        <Text style={styles.error}>{error ?? 'データが見つかりません'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.backText}>ホームに戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#F3F4F6' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTop}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backTextTop}>ホームに戻る</Text>
        </TouchableOpacity>

        <View style={[styles.card, { width: cardWidth }]}>  
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.chipContainer}>
            {item.genres?.map((g, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{g}</Text>
              </View>
            ))}
          </View>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>難易度：{item.level}</Text>
          </View>
          <Text style={styles.content}>{item.content}</Text>

          <View style={styles.voteContainer}>
            <Text style={styles.voteLabel}>この常識を知っていましたか？</Text>
            <View style={styles.voteButtons}>
              <Button title="知っていた" onPress={() => handleVote(true)} />
              <View style={{ width: 16 }} />
              <Button title="知らなかった" onPress={() => handleVote(false)} />
            </View>
          </View>

          {hasVoted && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>投票分布</Text>
              <PieChart
                data={pieData}
                width={screenWidth * 0.9}
                height={220}
                chartConfig={{
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  error:           { color: '#D32F2F', fontSize: 16, marginBottom: 12 },
  backButton:      { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  backText:        { color: '#007AFF', marginLeft: 4 },
  backButtonTop:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backTextTop:     { color: '#333', marginLeft: 8, fontSize: 16 },
  card:            { backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 20 },
  title:           { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#333' },
  chipContainer:   { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip:            { backgroundColor: '#E0E0E0', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8, marginBottom: 8 },
  chipText:        { fontSize: 12, color: '#555' },
  levelContainer:  { alignSelf: 'flex-start', backgroundColor: '#FFF3E0', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 16 },
  levelText:       { fontSize: 13, color: '#BF360C' },
  content:         { fontSize: 16, lineHeight: 24, color: '#444', marginBottom: 20 },
  voteContainer:   { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 16 },
  voteLabel:       { fontSize: 16, marginBottom: 12, color: '#333' },
  voteButtons:     { flexDirection: 'row', justifyContent: 'center' },
  chartContainer:  { alignItems: 'center', marginTop: 16 },
  chartTitle:      { fontSize: 18, fontWeight: '600', marginBottom: 8 },
})