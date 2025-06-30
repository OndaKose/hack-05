import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Button,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { Header } from '../components/Header';
import { FactCard } from '../components/FactCard';

type Fact = { id: number; content: string };

export default function HomeScreen() {
  // ─── 位置情報ステート ────────────────────
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const fetchLocation = async () => {
    setLocLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', '位置情報の権限がありません');
      setLocLoading(false);
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLocation(loc);
    } catch {
      Alert.alert('Error', '位置情報の取得に失敗しました');
    } finally {
      setLocLoading(false);
    }
  };

  // ─── 豆知識ステート ────────────────────
  const [facts, setFacts] = useState<Fact[]>([]);
  const [unknownCount, setUnknownCount] = useState(0);

  const handleKnow = (id: number) => {
    Alert.alert('Great!', 'あなたはこの常識を知っていました👍');
  };
  const handleDontKnow = (id: number) => {
    setUnknownCount(c => c + 1);
  };

  // マウント時に一度だけ実行
  useEffect(() => {
    fetchLocation();
    setFacts([
      { id: 1, content: 'エスカレーターでは立ち止まる側は右、日本ではこれが常識' },
      { id: 2, content: '電車の中ではリュックは前にかけるとマナー向上' },
      { id: 3, content: 'トイレで隣に人がいたら視線を前に' },
    ]);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      {/* 現在地表示パネル */}
      <View style={{ padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E5E7EB' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>あなたの現在地</Text>
        {locLoading ? (
          <ActivityIndicator style={{ marginTop: 8 }} />
        ) : location ? (
          <View style={{ marginTop: 8 }}>
            <Text>緯度: {location.coords.latitude.toFixed(6)}</Text>
            <Text>経度: {location.coords.longitude.toFixed(6)}</Text>
          </View>
        ) : (
          <Text style={{ marginTop: 8, color: '#6B7280' }}>位置情報がありません</Text>
        )}
        <Button title="再取得" onPress={fetchLocation} />
      </View>

      {/* 常識チェッカー ヘッダー */}
      <Header title="常識チェッカー" unknownCount={unknownCount} />

      {/* 豆知識リスト */}
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={facts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <FactCard
            fact={item.content}
            onKnow={() => handleKnow(item.id)}
            onDontKnow={() => handleDontKnow(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={{ flex:1, alignItems:'center', justifyContent:'center', marginTop: 20 }}>
            <Text style={{ color:'#6B7280' }}>豆知識がありません</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}