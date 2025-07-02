// app/register.tsx  ← ファイル名もルート名に合わせて register.tsx にリネームしてください
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
import { useRouter } from 'expo-router';

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('入力エラー', 'ユーザーネームとパスワードは必須です');
      return;
    }
    if (password !== confirm) {
      Alert.alert('入力エラー', 'パスワードが一致しません');
      return;
    }

    try {
      const response = await fetch('https://your-server.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          '登録完了',
          'アカウントが作成されました',
          [{
            text: 'OK',
            onPress: () => {
              // 登録後はログイン（index）へ置き換え遷移
              router.replace('/');
            }
          }]
        );
      } else {
        Alert.alert('登録失敗', data.message || '予期せぬエラー');
      }
    } catch (e) {
      const err = e as any;
      Alert.alert('通信エラー', err.message || 'ネットワークに接続できません');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>新規登録</Text>

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

      <TextInput
        placeholder="パスワード再入力"
        value={confirm}
        onChangeText={setConfirm}
        style={styles.input}
        secureTextEntry
      />

      <Button
        title="登録する"
        onPress={() => { void handleRegister(); }}
      />

      <View style={styles.footer}>
        <Text>アカウントをお持ちの方：</Text>
        <Button
          title="ログインへ"
          onPress={() => {
            // ログイン画面（app/index.tsx）へ積み重ね遷移
            router.push('/');
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

