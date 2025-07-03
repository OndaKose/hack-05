// frontend/app/common-sense.tsx

import React, { useEffect, useState } from 'react'
import { SafeAreaView, Text, FlatList, View, StyleSheet, ActivityIndicator } from 'react-native'
import { fetchCommonSense, CommonSense } from '../utils/api'
import { useRouter } from 'expo-router'

export default function CommonSenseList() {
  const [data, setData] = useState<CommonSense[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const list = await fetchCommonSense()
        setData(list)
      } catch (e: any) {
        console.error('常識一覧取得エラー', e)
        // 必要ならエラー表示
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.content}</Text>
            <Text>ジャンル: {item.genres?.join(', ')}</Text>
            <Text>レベル: {item.level}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>常識がまだ登録されていません。</Text>}
      />
      <View style={{ margin: 16 }}>
        <Text onPress={() => router.back()} style={styles.back}>← 戻る</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F3F4F6' },
  item: { backgroundColor: '#FFF', padding: 12, marginBottom: 8, borderRadius: 6 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  back:  { color: 'blue', fontSize: 16 }
})