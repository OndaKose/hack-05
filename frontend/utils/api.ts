// frontend/utils/api.ts

import { Platform } from 'react-native'

const HOST = Platform.select({
  android: '10.0.2.2',       // Android エミュレータ向け
  ios:     'localhost',      // iOS エミュレータ向け
  default: '192.168.40.86',  // 実機や LAN 上の PC の IP
})

export const BASE_URL = `http://${HOST}:8000`

/**
 * 常識アイテムの型
 */
export type CommonSense = {
  id:      number
  title:   string
  content: string
  genres:  string[]
  level:   number
}

/**
 * /common_sense/ から常識一覧を取得
 */
export async function fetchCommonSense(): Promise<CommonSense[]> {
  console.log('📡 Fetching CommonSense from:', `${BASE_URL}/common_sense/`)
  const res = await fetch(`${BASE_URL}/common_sense/`)
  if (!res.ok) throw new Error(`API Error ${res.status}`)
  return (await res.json()) as CommonSense[]
}

/**
 * 新規ユーザ登録用
 */
export type UserCreate = {
  user_name: string
  password:   string
}
export type UserOut = {
  user_id:   number
  user_name: string
}

export async function apiRegister(user: UserCreate): Promise<UserOut> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(user),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || `API Error ${res.status}`)
  }
  return (await res.json()) as UserOut
}

/**
 * ログイン用
 */
export type UserLogin = {
  user_name: string
  password:   string
}
export type UserOutWrapped = {
  user: UserOut
}
export async function apiLogin(creds: UserLogin): Promise<UserOut> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(creds),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || `API Error ${res.status}`)
  }
  // サーバが { "user_id":.., "user_name":.. } を返す場合
  return (await res.json()) as UserOut
}