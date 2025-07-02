// Login.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  View,
} from 'react-native';
// ① navigation の代わりに useRouter をインポート
import { useRouter } from 'expo-router';

export default function Login() {
  // ② ここで router を取得
  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('入力エラー', 'ユーザーネームとパスワードは必須です');
      return;
    }
    try {
      const response = await fetch('https://your-server.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // ③ 成功したら Home 画面（_layout.tsx の name="Home"）に置き換えて遷移
        router.replace('/home');
      } else {
        Alert.alert('ログイン失敗', data.message || 'ユーザーネームまたはパスワードが違います');
      }
    } catch (error: any) {
      Alert.alert('通信エラー', error.message || 'ネットワークに接続できません');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ログイン</Text>
      <TextInput
        placeholder="ユーザーネーム"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {/* ログインボタン */}
      <Button title="ログイン" onPress={handleLogin} />

      {/* 新規登録へ移動 */}
      <View style={styles.footer}>
        <Text>アカウントをお持ちでない方：</Text>
        <Button
          title="新規登録へ"
          onPress={() => {
            // ④ _layout.tsx の name="NewRegistration" に積み重ね遷移
            router.push('/register');
          }}
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
