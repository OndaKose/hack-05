// frontend/app/common-sense.tsx
import React, { useEffect, useState } from 'react'
import { SafeAreaView, Text, ActivityIndicator, FlatList, View, StyleSheet } from 'react-native'
import { fetchCommonSense, CommonSense } from '../utils/api'
import { useRouter } from 'expo-router'

export default function CommonSenseList() {
  const [data, setData]       = useState<CommonSense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCommonSense()
      .then(cs => setData(cs))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />
  }
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>取得エラー: {error}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title} onPress={() => router.push(`/common-sense/${item.id}`)}>
              {item.title}
            </Text>
            <Text style={styles.meta}>ジャンル: {item.genres?.join(', ')}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item:      { marginBottom: 12, backgroundColor: '#fff', padding: 12, borderRadius: 6 },
  title:     { fontSize: 16, fontWeight: '600' },
  meta:      { marginTop: 4, color: '#555' },
})