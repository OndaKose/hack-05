// app/_layout.tsx
import { Slot } from 'expo-router';

// ルートレイアウトは単に子ルートを描くだけ。
// ナビゲーションや useEffect はここではやらずに、個別の index.tsx でリダイレクトします。
export default function RootLayout() {
  return <Slot />;
}