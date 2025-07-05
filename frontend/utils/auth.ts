// frontend/utils/auth.ts

import * as SecureStore from 'expo-secure-store'
import { UserOut } from './api'

const KEY_USER = 'CURRENT_USER'

/**
 * ログイン成功時に呼び出す：UserOut を SecureStore に保存
 */
export async function saveUser(user: UserOut): Promise<void> {
  await SecureStore.setItemAsync(KEY_USER, JSON.stringify(user))
}

/**
 * 保存済みのログインユーザー情報を取得
 */
export async function getCurrentUser(): Promise<UserOut | null> {
  const json = await SecureStore.getItemAsync(KEY_USER)
  if (!json) return null
  try {
    return JSON.parse(json) as UserOut
  } catch {
    return null
  }
}

/**
 * 現在のユーザーID を取得（未ログインなら null）
 */
export async function getCurrentUserId(): Promise<number | null> {
  const user = await getCurrentUser()
  return user?.user_id ?? null
}

/**
 * ログアウト時に呼び出す：保存データを削除
 */
export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_USER)
}