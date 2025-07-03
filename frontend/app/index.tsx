// app/index.tsx
import { Redirect } from 'expo-router';

// `/` に来たら、自動で `/login` にリダイレクト
export default function Index() {
  return <Redirect href="/login" />;
}