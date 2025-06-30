import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, Alert, View, Text } from 'react-native';
import { Header } from '../components/Header';
import { FactCard } from '../components/FactCard';

export default function HomeScreen() {
  const [facts, setFacts] = useState<string[]>([]);
  const [unknownCount, setUnknownCount] = useState(0);

  useEffect(() => {
    setFacts([
      'エスカレーターでは立ち止まる側は右、日本ではこれが常識',
      '電車の中ではリュックは前にかけるとマナー向上',
      'トイレで隣に人がいたら視線を前に',
    ]);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <Header title="常識チェッカー" unknownCount={unknownCount} />

      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={facts}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <FactCard
            fact={item}
            onKnow={() => Alert.alert('知ってた！')}
            onDontKnow={() => setUnknownCount(c => c + 1)}
          />
        )}
        ListEmptyComponent={
          <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <Text style={{ color:'#6B7280' }}>豆知識がありません</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}