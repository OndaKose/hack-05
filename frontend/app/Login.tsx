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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
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
        // 成功時はホーム画面へ遷移
        navigation.replace('Home');
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
      <Button title="ログイン" onPress={handleLogin} />
      <View style={styles.footer}>
        <Text>アカウントをお持ちでない方：</Text>
        <Button title="新規登録へ" onPress={() => navigation.navigate('Register')} />
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
