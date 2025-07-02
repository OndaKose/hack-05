// frontend/app/common-sense.tsx

import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, ActivityIndicator, StyleSheet, FlatList, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchCommonSense, CommonSense } from '../utils/api';

export default function CommonSenseScreen() {
  const router = useRouter();
  const [data, setData] = useState<CommonSense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommonSense()
      .then((res: CommonSense[]) => setData(res))
      .catch((err: unknown) => console.error('fetchCommonSense error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>常識一覧</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>
              {item.title} (Lv.{item.level})
            </Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.genres}>ジャンル: {item.genres.join(', ')}</Text>
          </View>
        )}
      />
      <View style={{ marginTop: 16 }}>
        <Button title="⬅️ 戻る" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  item: { backgroundColor: '#FFF', padding: 12, borderRadius: 6, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600' },
  content: { marginTop: 4 },
  genres: { marginTop: 4, fontStyle: 'italic', color: '#555' },
});