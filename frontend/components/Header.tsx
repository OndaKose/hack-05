import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

type Props = {
  title: string;
  unknownCount: number;
};

export function Header({ title, unknownCount }: Props) {
  const router = useRouter();

  const handleLogoPress = () => {
    // ホームに戻る処理などあればここに
    router.push('/');
  };

  return (
    <View style={styles.container}>
      {/* 背景をぼかす */}
      <BlurView intensity={50} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        {/* 左：タイトル or ロゴ */}
        <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer}>
          {/* もしロゴ画像があればこちらをアンコメント */}
          {/* <Image source={require('../assets/images/logo.png')} style={styles.logo} /> */}
          <Text style={styles.titleText}>{title}</Text>
        </TouchableOpacity>

        {/* 右：知らんかった数 */}
        <View style={styles.countContainer}>
          <Text style={styles.labelText}>知らんかった数:</Text>
          <Text style={styles.countText}>{unknownCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)', // gray-200/50%
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)', // 半透明白
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // ロゴ画像を使う場合のスタイル例
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937', // gray-800
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    marginRight: 4,
    fontSize: 14,
    color: '#4B5563', // gray-600
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626', // red-600
  },
});