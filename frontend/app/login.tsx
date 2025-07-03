import React, { useState } from 'react'
import {
  SafeAreaView,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { apiLogin } from '../utils/api'

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('入力エラー', 'ユーザーネームとパスワードは必須です')
      return
    }
    try {
      const user = await apiLogin({ user_name: username, password })
      // ── ログイン成功 ──
      router.replace('/home')
    } catch (e: any) {
      Alert.alert('ログイン失敗', e.message)
    }
  }

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
      <Button title="ログイン" onPress={() => void handleLogin()} />
      <View style={styles.footer}>
        <Text>アカウントをお持ちでない方：</Text>
        <Button title="新規登録へ" onPress={() => router.push('/register')} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#F3F4F6' },
  title:     { fontSize: 24, fontWeight: '600', marginBottom: 24, textAlign: 'center' },
  input:     { backgroundColor: '#FFF', marginBottom: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4 },
  footer:    { marginTop: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
})