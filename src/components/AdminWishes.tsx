import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowDownAZ, Download, LogOut, RefreshCw, Search, Trash2 } from 'lucide-react'
import { Document, Packer, Paragraph, TextRun, AlignmentType, Footer, PageNumber } from 'docx'
import { adminDeleteWish, adminListWishes, adminLogin, adminLogout, type Wish } from '../api/wishesApi'

const TOKEN_KEY = 'wishes_admin_token'

export default function AdminWishes() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '')
  const [wishes, setWishes] = useState<Wish[]>([])
  const [search, setSearch] = useState('')
  const [newestFirst, setNewestFirst] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const loadWishes = async (sessionToken: string, targetPage = page, targetSearch = search, targetSort = newestFirst ? 'newest' : 'oldest') => {
    setLoading(true)
    const result = await adminListWishes(sessionToken, targetPage, targetSearch, targetSort)
    setLoading(false)
    if (!result.ok) {
      setStatus(result.error || 'Không thể tải danh sách lời chúc.')
      if (result.error?.toLowerCase().includes('phiên')) {
        sessionStorage.removeItem(TOKEN_KEY)
        setToken('')
      }
      return
    }
    setWishes(result.data?.wishes ?? [])
    setPage(result.data?.page ?? 1)
    setTotal(result.data?.total ?? 0)
    setTotalPages(result.data?.totalPages ?? 1)
    setStatus('')
  }

  useEffect(() => {
    if (token) void loadWishes(token)
  }, [])

  const loginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password) return
    setLoading(true)
    setStatus('')
    const result = await adminLogin(password)
    setLoading(false)
    if (!result.ok || !result.data?.token) {
      setStatus(result.error || 'Đăng nhập thất bại.')
      return
    }
    sessionStorage.setItem(TOKEN_KEY, result.data.token)
    setToken(result.data.token)
    setPassword('')
    await loadWishes(result.data.token)
  }

  const removeWish = async (id: string) => {
    if (!token || !window.confirm('Xóa lời chúc này khỏi danh sách?')) return
    setLoading(true)
    const result = await adminDeleteWish(token, id)
    setLoading(false)
    if (!result.ok) {
      setStatus(result.error || 'Không thể xóa lời chúc.')
      return
    }
    setWishes((current) => current.filter((wish) => wish.id !== id))
  }

  const logout = async () => {
    if (token) await adminLogout(token)
    sessionStorage.removeItem(TOKEN_KEY)
    setToken('')
    setWishes([])
  }

  const filtered = useMemo(() => wishes, [wishes])

  const exportWord = async () => {
    if (!token) return

    setLoading(true)
    const allWishes: Wish[] = []
    let exportPage = 1
    let exportTotalPages = 1

    do {
      const result = await adminListWishes(token, exportPage, '', 'newest')
      if (!result.ok) {
        setLoading(false)
        setStatus(result.error || 'Không thể tải dữ liệu để xuất Word.')
        return
      }
      allWishes.push(...(result.data?.wishes ?? []))
      exportTotalPages = result.data?.totalPages ?? 1
      exportPage += 1
    } while (exportPage <= exportTotalPages)

    setLoading(false)
    if (allWishes.length === 0) {
      setStatus('Chưa có lời chúc để xuất.')
      return
    }

    const children = [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 180 }, children: [new TextRun({ text: 'LỜI CHÚC YÊU THƯƠNG', bold: true, size: 34, color: '46382F' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'ÁI DUYÊN & THANH NHÂN', bold: true, size: 26, color: 'A98955' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Ngày cưới: 01.01.2027', size: 22, color: '82776C' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 }, children: [new TextRun({ text: `Tổng số lời chúc: ${allWishes.length}`, size: 22, color: '82776C' })] }),
    ]

    allWishes.forEach((wish, index) => {
      children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `${index + 1}. ${wish.name}`, bold: true, size: 22, color: '46382F' })] }))
      children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: wish.message, size: 22 })] }))
      children.push(new Paragraph({ spacing: { after: 280 }, children: [new TextRun({ text: wish.createdAt, italics: true, size: 18, color: '82776C' })] }))
    })

    const doc = new Document({
      sections: [{
        properties: {},
        children,
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: ['Trang ', PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], size: 18, color: '82776C' })],
            })],
          }),
        },
      }],
    })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Loi-chuc-cuoi-Ai-Duyen-Thanh-Nhan.docx'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!token) {
    return (
      <main className="admin-shell">
        <form className="admin-login" onSubmit={loginSubmit}>
          <span className="eyebrow">QUẢN TRỊ THIỆP CƯỚI</span>
          <h1>Quản lý <em>lời chúc</em></h1>
          <label>MẬT KHẨU QUẢN TRỊ<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {status && <p className="admin-status" role="alert">{status}</p>}
          <button className="admin-primary" type="submit" disabled={loading}>{loading ? 'ĐANG KIỂM TRA...' : 'ĐĂNG NHẬP'}</button>
        </form>
      </main>
    )
  }

  return (
    <main className="admin-shell admin-dashboard">
      <header className="admin-header">
        <div><span className="eyebrow">ÁI DUYÊN &amp; THANH NHÂN</span><h1>Lời chúc <em>yêu thương</em></h1></div>
        <button className="admin-icon-button" onClick={logout} title="Đăng xuất" aria-label="Đăng xuất"><LogOut size={18} /></button>
      </header>

      <div className="admin-summary"><span>TỔNG SỐ LỜI CHÚC</span><strong>{total}</strong></div>

      <div className="admin-toolbar">
        <form className="admin-search" onSubmit={(event) => { event.preventDefault(); setPage(1); void loadWishes(token, 1, search) }}>
          <Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên khách mời" />
        </form>
        <button className="admin-secondary" onClick={() => { const nextNewest = !newestFirst; setNewestFirst(nextNewest); void loadWishes(token, 1, search, nextNewest ? 'newest' : 'oldest') }}><ArrowDownAZ size={16} /> {newestFirst ? 'MỚI NHẤT' : 'CŨ NHẤT'}</button>
        <button className="admin-secondary" onClick={() => loadWishes(token, page, search)} disabled={loading}><RefreshCw size={16} /> LÀM MỚI</button>
        <button className="admin-primary" onClick={exportWord} disabled={loading}><Download size={16} /> XUẤT DANH SÁCH LỜI CHÚC WORD</button>
      </div>

      {status && <p className="admin-status" role="alert">{status}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>HỌ VÀ TÊN</th><th>NỘI DUNG</th><th>THỜI GIAN</th><th><span className="sr-only">Thao tác</span></th></tr></thead>
          <tbody>
            {filtered.map((wish) => (
              <tr key={wish.id}><td>{wish.name}</td><td>{wish.message}</td><td>{wish.createdAt}</td><td><button className="admin-delete" onClick={() => removeWish(wish.id)} title="Xóa lời chúc" aria-label={`Xóa lời chúc của ${wish.name}`}><Trash2 size={16} /></button></td></tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="admin-empty">Không có lời chúc phù hợp.</td></tr>}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="admin-pagination" aria-label="Phân trang lời chúc">
          <button className="admin-secondary" onClick={() => loadWishes(token, page - 1, search)} disabled={loading || page <= 1}>TRƯỚC</button>
          <span>Trang {page} / {totalPages}</span>
          <button className="admin-secondary" onClick={() => loadWishes(token, page + 1, search)} disabled={loading || page >= totalPages}>SAU</button>
        </nav>
      )}
    </main>
  )
}
