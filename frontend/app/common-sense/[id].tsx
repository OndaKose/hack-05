// frontend/app/common-sense/[id].tsx

import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { fetchCommonSenseDetail, CommonSense } from '../../utils/api'

export default function CommonSenseDetail() {
  // Expo Router のローカルパラメータ取得フック
  const { id } = useLocalSearchParams<{ id: string }>()

  const [item, setItem] = useState<CommonSense | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    fetchCommonSenseDetail(Number(id))
      .then((data) => {
        setItem(data)
        setError(null)
      })
      .catch((e) => {
        console.error(e)
        setError('読み込みに失敗しました')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  }
  if (!item) {
    return (
      <View style={styles.center}>
        <Text>データがありません</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
})