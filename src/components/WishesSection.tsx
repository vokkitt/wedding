import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Check, Send } from 'lucide-react'
import { listWishes, submitWish, type Wish } from '../api/wishesApi'

export default function WishesSection({ embedded = false }: { embedded?: boolean }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [wishes, setWishes] = useState<Wish[]>([])
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const submitting = useRef(false)

  useEffect(() => {
    void listWishes().then((result) => {
      if (result.ok) setWishes(result.data?.wishes ?? [])
    })
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return

    const cleanName = name.trim()
    const cleanMessage = message.trim()
    if (cleanName.length < 2) {
      setStatus('error')
      setError('Vui lòng nhập họ và tên từ 2 ký tự trở lên.')
      return
    }
    if (cleanMessage.length < 2) {
      setStatus('error')
      setError('Vui lòng nhập lời chúc từ 2 ký tự trở lên.')
      return
    }
    if (cleanName.length > 1000) {
      setStatus('error')
      setError('Họ và tên không vượt quá 1000 ký tự.')
      return
    }
    if (cleanMessage.length > 1000) {
      setStatus('error')
      setError('Lời chúc không vượt quá 1000 ký tự.')
      return
    }

    submitting.current = true
    setStatus('sending')
    setError('')

    const result = await submitWish(cleanName, cleanMessage)
    submitting.current = false

    if (!result.ok || !result.data?.wish) {
      setStatus('error')
      setError(result.error || 'Không thể gửi lời chúc. Vui lòng thử lại.')
      return
    }

    setWishes((current) => [result.data!.wish, ...current])
    setName('')
    setMessage('')
    setStatus('success')
  }

  if (embedded) {
    return (
      <div className="wish-combined-panel reveal">
        <span className="eyebrow">GỬI LỜI YÊU THƯƠNG</span>
        <h3>Gửi đôi mình<br /><em>một lời yêu thương</em></h3>
        <form className="wish-form" onSubmit={submit}>
          <label>
            HỌ VÀ TÊN KHÁCH MỜI
            <input value={name} onChange={(event) => { setName(event.target.value); if (status !== 'sending') setStatus('idle') }} placeholder="Tên của bạn" maxLength={1000} autoComplete="name" disabled={status === 'sending'} required />
          </label>
          <label>
            LỜI CHÚC DÀNH CHO HAI BẠN
            <textarea value={message} onChange={(event) => { setMessage(event.target.value); if (status !== 'sending') setStatus('idle') }} placeholder="Viết lời chúc thật lòng..." rows={3} maxLength={1000} disabled={status === 'sending'} required />
          </label>
          {status === 'error' && <p className="wish-status wish-status-error" role="alert">{error}</p>}
          {status === 'success' && <p className="wish-status wish-status-success" role="status"><Check size={15} /> Lời chúc đã được ghi nhận.</p>}
          <button className="wish-submit" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'ĐANG GỬI...' : 'GỬI LỜI YÊU THƯƠNG'}
            {status === 'sending' ? <Send size={15} /> : <ArrowRight size={15} />}
          </button>
        </form>
      </div>
    )
  }

  return (
    <section className="wishes-section section-pad" id="wishes">
      <div className="wishes-head reveal">
        <span className="eyebrow">A NOTE FOR THE HAPPY COUPLE</span>
        <h2>Gửi đôi mình <em>một lời yêu thương</em></h2>
        <p>Những lời chúc của bạn sẽ là kỷ niệm chúng mình luôn trân trọng.</p>
      </div>

      <div className="wishes-layout">
        <form className="wish-form reveal" onSubmit={submit}>
          <label>
            HỌ VÀ TÊN KHÁCH MỜI
            <input
              value={name}
              onChange={(event) => { setName(event.target.value); if (status !== 'sending') setStatus('idle') }}
              placeholder="Tên của bạn"
              maxLength={1000}
              autoComplete="name"
              disabled={status === 'sending'}
              required
            />
          </label>
          <label>
            LỜI CHÚC DÀNH CHO HAI BẠN
            <textarea
              value={message}
              onChange={(event) => { setMessage(event.target.value); if (status !== 'sending') setStatus('idle') }}
              placeholder="Viết lời chúc thật lòng..."
              rows={4}
              maxLength={1000}
              disabled={status === 'sending'}
              required
            />
          </label>

          {status === 'error' && <p className="wish-status wish-status-error" role="alert">{error}</p>}
          {status === 'success' && <p className="wish-status wish-status-success" role="status"><Check size={15} /> Lời chúc đã được ghi nhận.</p>}

          <button className="wish-submit" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'ĐANG GỬI...' : 'GỬI LỜI YÊU THƯƠNG'}
            {status === 'sending' ? <Send size={15} /> : <ArrowRight size={15} />}
          </button>
        </form>

        {wishes.length > 0 && (
          <div className="wish-list" aria-live="polite">
            {wishes.map((wish) => (
              <article className="wish-card reveal" key={wish.id}>
                <p>“{wish.message}”</p>
                <div><span>{wish.name}</span><small>{wish.createdAt}</small></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
