// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* ログイン画面 (app/index.tsx) */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* 新規登録画面 (app/register.tsx) */}
      <Stack.Screen
        name="register"
        options={{ title: '新規登録' }}
      />

      {/* ホーム画面 (app/home.tsx) */}
      <Stack.Screen
        name="home"
        options={{ title: 'ホーム' }}
      />

      {/* 探索画面 (app/explore.tsx) */}
      <Stack.Screen
        name="explore"
        options={{ title: '探索' }}
      />

      {/* 投票履歴画面 (app/mypage.tsx) */}
      <Stack.Screen
        name="mypage"
        options={{ title: 'マイページ' }}
      />

      {/* レベル確認画面 (app/level.tsx) */}
      <Stack.Screen
        name="level"
        options={{ title: '自分のレベル' }}
      />
    </Stack>
  );
}