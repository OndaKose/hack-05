// frontend/app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';

// ← ここにルートのスクリーン名と渡せるパラメータを定義
export type RootStackParamList = {
  // index.tsx（ログイン画面）をルートとして扱うならキーは "index" になります
  index: undefined;
  // もしファイル名が Login.tsx なら "Login" にしてください
  Login: undefined;
  NewRegistration: undefined;
  explore: undefined;
};

export default function RootLayout() {
  return <Slot />;
}
