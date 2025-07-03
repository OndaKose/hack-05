// frontend/utils/api.ts
import Constants from 'expo-constants'

/**
 * Metro バンドラーが動いているホストを取得します。
 * Expo Go / 開発ビルドの環境で動的に切り替わります。
 */
function getMetroHost(): string {
  // Expo Go なら debuggerHost (Metro バンドラのホスト) が取れます
  const dbg = (Constants.manifest as any)?.debuggerHost as string|undefined;
  if (dbg) return dbg.split(':')[0];
  // それ以外は開発用 PC の LAN アドレス
  return '192.168.40.47';    // ifconfig で出てた en0 の inet 部分
}
export const BASE_URL = `http://${getMetroHost()}:8008`;

/**
 * 常識アイテムの型
 */
export type CommonSense = {
  id:      number
  title:   string
  content: string
  genres?: string[]
  level:   number
}

/**
 * /common_sense/ から常識一覧を取得
 */
export async function fetchCommonSense(): Promise<CommonSense[]> {
  const res = await fetch(`${BASE_URL}/common_sense/`)
  if (!res.ok) throw new Error(`常識取得失敗 ${res.status}`)
  return res.json()
}

/**
 * /common_sense/{id} から単一アイテムを取得
 */
export async function fetchCommonSenseDetail(id: number): Promise<CommonSense> {
  console.log('📡 Fetching CommonSense detail from:', `${BASE_URL}/common_sense/${id}`)
  const res = await fetch(`${BASE_URL}/common_sense/${id}`)
  if (!res.ok) throw new Error(`API Error ${res.status}`)
  return (await res.json()) as CommonSense
}

/**
 * ユーザ登録用
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
  return (await res.json()) as UserOut
}