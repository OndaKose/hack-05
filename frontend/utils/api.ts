// frontend/utils/api.ts

import Constants from 'expo-constants'

/**
 * Metro バンドラーのホストを取得
 */
function getMetroHost(): string {
  const dbg = (Constants.manifest as any)?.debuggerHost as string | undefined
  if (dbg) return dbg.split(':')[0]
  return '192.168.40.47'  // 開発用PCのIPに書き換え
}

export const BASE_URL = `http://${getMetroHost()}:8008`

// ----- 型定義 -----

export type CommonSense = {
  id:      number
  title:   string
  content: string
  genres?: string[]
  level:   number
}

export type VotePayload = {
  user_id:         number
  common_sense_id: number
  recognized:      boolean
}

export type Vote = {
  id:               number
  user_id:          number
  common_sense_id:  number
  recognized:       boolean
}

export type UserCreate = {
  user_name: string
  password:  string
}

export type UserLogin = {
  user_name: string
  password:  string
}

export type UserOut = {
  user_id:   number
  user_name: string
}

// ----- API 関数 -----

export async function fetchCommonSense(): Promise<CommonSense[]> {
  const res = await fetch(`${BASE_URL}/common_sense/`)
  if (!res.ok) throw new Error(`常識取得失敗 ${res.status}`)
  return res.json()
}

export async function fetchCommonSenseDetail(id: number): Promise<CommonSense> {
  const res = await fetch(`${BASE_URL}/common_sense/${id}`)
  if (!res.ok) throw new Error(`常識詳細取得失敗 ${res.status}`)
  return res.json()
}

export async function apiRegister(user: UserCreate): Promise<UserOut> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(user),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || `登録失敗: ${res.status}`)
  }
  return res.json()
}

export async function apiLogin(creds: UserLogin): Promise<UserOut> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(creds),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || `ログイン失敗: ${res.status}`)
  }
  return res.json()
}

export async function apiVote(v: VotePayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/vote/`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(v),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || `投票失敗: ${res.status}`)
  }
}

export async function apiCheckVote(
  user_id: number,
  common_sense_id: number
): Promise<Vote | null> {
  const res = await fetch(
    `${BASE_URL}/vote/check?user_id=${user_id}&common_sense_id=${common_sense_id}`
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`投票チェック失敗: ${res.status}`)
  return res.json()
}

export async function apiStats(
  common_sense_id: number
): Promise<{ known: number; unknown: number }> {
  const res = await fetch(`${BASE_URL}/vote/stats/${common_sense_id}`)
  if (!res.ok) throw new Error(`集計取得失敗: ${res.status}`)
  return res.json()
}