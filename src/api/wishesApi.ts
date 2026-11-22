export type Wish = {
  id: string
  name: string
  message: string
  createdAt: string
}

export type ApiResult<T = unknown> = {
  ok: boolean
  data?: T
  error?: string
}

export type WishPage = {
  wishes: Wish[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const API_URL = (import.meta.env.VITE_WISHES_API_URL as string | undefined)?.trim() ?? ''

async function postJson<T>(action: string, payload: Record<string, unknown> = {}): Promise<ApiResult<T>> {
  if (!API_URL) return { ok: false, error: 'Chưa cấu hình Google Apps Script API.' }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    })

    if (!response.ok) throw new Error(`Google Sheets API phản hồi HTTP ${response.status}`)

    const result = await response.json() as ApiResult<T>
    if (!result.ok) throw new Error(result.error || 'Không thể xử lý yêu cầu.')
    return result
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Không thể kết nối máy chủ.',
    }
  }
}

function getClientId() {
  const key = 'wishes_client_id'
  let clientId = sessionStorage.getItem(key)
  if (!clientId) {
    clientId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(key, clientId)
  }
  return clientId
}

export function submitWish(name: string, message: string) {
  return postJson<{ wish: Wish }>('submitWish', { name, message, clientId: getClientId() })
}

export function listWishes(page = 1, search = '') {
  return postJson<WishPage>('getWishes', { page, search })
}

export function adminLogin(password: string) {
  return postJson<{ token: string }>('adminLogin', { password })
}

export function adminListWishes(token: string, page = 1, search = '', sort = 'newest') {
  return postJson<WishPage>('adminGetWishes', { token, page, search, sort })
}

export function adminDeleteWish(token: string, id: string) {
  return postJson('adminDeleteWish', { token, id })
}

export function adminLogout(token: string) {
  return postJson('adminLogout', { token })
}
