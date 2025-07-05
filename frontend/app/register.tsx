// frontend/app/register.tsx

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
import { apiRegister } from '../utils/api'

export default function Register() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('入力エラー', 'ユーザーネームとパスワードは必須です')
      return
    }
    if (password !== confirm) {
      Alert.alert('入力エラー', 'パスワードが一致しません')
      return
    }

    try {
      const user = await apiRegister({ user_name: username, password })
      Alert.alert('登録完了', `ようこそ ${user.user_name} さん！`, [
        { text: 'OK', onPress: () => router.replace('/login') },
      ])
    } catch (e: any) {
      Alert.alert('登録失敗', e.message || 'ネットワークエラー')
    }
  }

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
      <Button title="登録する" onPress={() => void handleRegister()} />
      <View style={styles.footer}>
        <Text>アカウントをお持ちの方：</Text>
        <Button title="ログインへ" onPress={() => router.push('/login')} />
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