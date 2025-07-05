// frontend/utils/api.ts

import Constants from 'expo-constants'

/**
 * app.config.js の extra から apiHost, apiPort を取得。
 * なければ debuggerHost → 127.0.0.1:8008 にフォールバック。
 */
function getApiHost(): string {
  const extra = (Constants.expoConfig as any)?.extra as {
    apiHost?: string
    apiPort?: string
  }
  if (extra?.apiHost && extra.apiPort) {
    return `${extra.apiHost}:${extra.apiPort}`
  }
  const dbg = (Constants.manifest as any)?.debuggerHost as string | undefined
  if (dbg) {
    return `${dbg.split(':')[0]}:8008`
  }
  return '127.0.0.1:8008'
}

export const BASE_URL = `http://${getApiHost()}`

// ----- 型定義 -----

/** CommonSense アイテム */
export type CommonSense = {
  id:      number
  title:   string
  content: string
  genres?: string[]
  level:   number
}

/** 投票ペイロード */
export type VotePayload = {
  user_id:         number
  common_sense_id: number
  recognized:      boolean
}

/** Vote レスポンス */
export type Vote = {
  id:               number
  user_id:          number
  common_sense_id:  number
  recognized:       boolean
}

/** 新規ユーザー登録 */
export type UserCreate = {
  user_name: string
  password:  string
}

/** ログイン情報 */
export type UserLogin = {
  user_name: string
  password:  string
}

/** ログイン後ユーザー情報 */
export type UserOut = {
  user_id:   number
  user_name: string
}

/** ユーザー投票詳細 */
export type UserVote = {
  common_sense_id: number
  title:           string
  content:         string
  recognized:      boolean
}

/** ユーザーレベル */
export type UserLevel = {
  level_sum:  number
  user_level: number
}

// ----- API 関数 -----

/** 常識一覧取得: GET /common_sense/ */
export async function fetchCommonSense(): Promise<CommonSense[]> {
  const res = await fetch(`${BASE_URL}/common_sense/`)
  if (!res.ok) throw new Error(`常識取得失敗 ${res.status}`)
  return res.json()
}

/** 常識詳細取得: GET /common_sense/{id} */
export async function fetchCommonSenseDetail(
  id: number
): Promise<CommonSense> {
  const res = await fetch(`${BASE_URL}/common_sense/${id}`)
  if (!res.ok) throw new Error(`常識詳細取得失敗 ${res.status}`)
  return res.json()
}

/** 新規登録: POST /auth/register */
export async function apiRegister(
  user: UserCreate
): Promise<UserOut> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method:  'POST',
    headers: {'Content-Type':'application/json'},
    body:    JSON.stringify(user),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || `登録失敗: ${res.status}`)
  }
  return res.json()
}

/** ログイン: POST /auth/login */
export async function apiLogin(
  creds: UserLogin
): Promise<UserOut> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method:  'POST',
    headers: {'Content-Type':'application/json'},
    body:    JSON.stringify(creds),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || `ログイン失敗: ${res.status}`)
  }
  return res.json()
}

/** 投票送信: POST /vote/ */
export async function apiVote(
  v: VotePayload
): Promise<void> {
  const res = await fetch(`${BASE_URL}/vote/`, {
    method:  'POST',
    headers: {'Content-Type':'application/json'},
    body:    JSON.stringify(v),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || `投票失敗: ${res.status}`)
  }
}

/** 投票チェック: GET /vote/check */
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

/** 投票統計取得: GET /vote/stats/{common_sense_id} */
export async function apiStats(
  common_sense_id: number
): Promise<{ known: number; unknown: number }> {
  const res = await fetch(`${BASE_URL}/vote/stats/${common_sense_id}`)
  if (!res.ok) throw new Error(`集計取得失敗: ${res.status}`)
  return res.json()
}

/** ユーザー投票履歴詳細: GET /vote/user/details/{user_id} */
export async function fetchUserVotes(
  user_id: number
): Promise<UserVote[]> {
  const res = await fetch(
    `${BASE_URL}/vote/user/details/${user_id}`
  )
  if (!res.ok) throw new Error(`投票履歴取得失敗: ${res.status}`)
  return res.json()
}

/** ユーザーレベル取得: GET /auth/level/{user_id} */
export async function fetchUserLevel(
  user_id: number
): Promise<UserLevel> {
  const res = await fetch(`${BASE_URL}/auth/level/${user_id}`)
  if (!res.ok) throw new Error(`ユーザーレベル取得失敗: ${res.status}`)
  return res.json()
}