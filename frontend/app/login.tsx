// frontend/app/login.tsx

import React, { useState } from 'react'
import { SafeAreaView, View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { apiLogin, UserLogin, UserOut } from '../utils/api'

export default function LoginScreen() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!userName || !password) {
      Alert.alert('入力エラー', 'ユーザー名とパスワードを両方入力してください')
      return
    }
    setLoading(true)
    try {
      const creds: UserLogin = { user_name: userName, password }
      const user: UserOut = await apiLogin(creds)
      // 成功したらユーザー情報をどこかに保存（Context, Zustand など）、ここでは簡単に Alert
      Alert.alert('ログイン成功', `ようこそ ${user.user_name} さん！`)
      // ホーム画面へ遷移
      router.replace('/home')
    } catch (e: any) {
      Alert.alert('ログイン失敗', e.message || '認証に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ログイン</Text>
      <View style={styles.form}>
        <Text>ユーザー名</Text>
        <TextInput
          style={styles.input}
          placeholder="user_name"
          value={userName}
          autoCapitalize="none"
          onChangeText={setUserName}
        />
        <Text>パスワード</Text>
        <TextInput
          style={styles.input}
          placeholder="password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.button}>
          <Button title={loading ? '送信中…' : 'ログイン'} onPress={handleLogin} disabled={loading} />
        </View>
        <View style={styles.signup}>
          <Text>アカウントがない？ </Text>
          <Text style={styles.link} onPress={() => router.push('/register')}>
            新規登録
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#fff' },
  title:       { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  form:        { },
  input:       {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  button:      { marginVertical: 8 },
  signup:      { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  link:        { color: '#0066cc', textDecorationLine: 'underline' },
})