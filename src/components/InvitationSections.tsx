import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, CalendarDays, Clock3, Heart, MapPin, Music2, Navigation, QrCode, X } from 'lucide-react'
import { weddingData } from '../data/weddingData'
import { gallery } from '../data/gallery'

type CountdownValues = { days: number; hours: number; minutes: number; seconds: number }
type LightboxState = { kind: 'gallery'; index: number } | { kind: 'gift'; index: number } | null

export function NavigationBar({ onSoundToggle, soundOn }: { onSoundToggle: () => void; soundOn: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = [['CÂU CHUYỆN', '#story'], ['KHOẢNH KHẮC', '#gallery'], ['LỜI MỜI', '#details'], ['LỜI YÊU THƯƠNG', '#wishes']]
  return <header className={`site-nav${weddingData.heroImage ? '' : ' site-nav-on-paper'}`}>
    <a className="nav-monogram" href="#home" aria-label="Về đầu trang">{weddingData.couple.monogram[0]}<span>&amp;</span>{weddingData.couple.monogram.at(-1)}</a>
    <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Điều hướng chính">
      {links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
    </nav>
    <button className={`sound-toggle${soundOn ? ' is-playing' : ''}`} onClick={onSoundToggle} aria-label={soundOn ? 'Tắt nhạc' : 'Bật nhạc'} title={soundOn ? 'Tắt nhạc' : 'Bật nhạc'}><Music2 size={17} />{soundOn && <span className="sound-bars"><i /><i /><i /></span>}</button>
    <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}><span /><span /></button>
  </header>
}

export function Hero() {
  return <section className={`hero${weddingData.heroImage ? '' : ' hero-placeholder'}`} id="home" style={{ backgroundImage: weddingData.heroImage ? `url("${weddingData.heroImage}")` : undefined }}>
    <div className="hero-shade" />
    <div className="hero-caption"><span className="eyebrow hero-eyebrow">TOGETHER WITH OUR FAMILIES</span><p className="hero-invite">We joyfully invite you to celebrate</p><h1>{weddingData.couple.bride}<span className="hero-amp">&</span>{weddingData.couple.groom}</h1><p className="hero-wedding">THE WEDDING CELEBRATION</p><span className="hero-line" /><p className="hero-date">{weddingData.date.display}</p></div>
    <a className="hero-scroll" href="#countdown"><span>CUỘN ĐỂ KHÁM PHÁ</span><ArrowDown size={15} /></a>
    <span className="hero-index">01 — 12</span>
  </section>
}

export function Countdown() {
  const [remaining, setRemaining] = useState<CountdownValues>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const update = () => {
      const difference = Math.max(0, new Date(weddingData.date.iso).getTime() - Date.now())
      setRemaining({ days: Math.floor(difference / 86_400_000), hours: Math.floor((difference / 3_600_000) % 24), minutes: Math.floor((difference / 60_000) % 60), seconds: Math.floor((difference / 1_000) % 60) })
    }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [])
  const values = [['days', 'NGÀY'], ['hours', 'GIỜ'], ['minutes', 'PHÚT'], ['seconds', 'GIÂY']] as const
  return <section className="countdown-section section-pad" id="countdown"><div className="countdown-heading"><span className="eyebrow">ĐẾM NGƯỢC ĐẾN NGÀY VUI</span><h2>Ngày mình <em>chung đôi</em></h2></div><div className="countdown-grid">{values.map(([key, label]) => <div className="countdown-unit" key={key}><span className="countdown-number">{String(remaining[key]).padStart(2, '0')}</span><span className="countdown-label">{label}</span></div>)}</div><p className="countdown-date"><CalendarDays size={15} /> {weddingData.date.weekday} · {weddingData.date.lunar}</p></section>
}

export function LoveStory() {
  if (weddingData.story.length === 0) return null
  return <section className="story-section section-pad" id="story"><div className="section-heading reveal"><span className="eyebrow">TỪ NGÀY ĐẦU TIÊN</span><h2>Một chuyện tình <em>thật đẹp</em></h2><p>Mỗi khoảnh khắc bên nhau đưa chúng mình đến gần hơn với hôm nay.</p></div><div className="story-list">{weddingData.story.map((moment, index) => <article className={`story-item reveal story-item-${index + 1}`} key={moment.title}><div className="story-photo-wrap"><img className="story-photo" src={moment.image} alt={moment.alt} loading="lazy" /><span className="story-number">0{index + 1}</span></div><div className="story-copy"><span className="eyebrow">{moment.date}</span><h3>{moment.title}</h3><p>{moment.description}</p></div></article>)}</div><div className="story-end reveal"><span /><Heart size={13} /><span /></div></section>
}

export function GallerySection({ onOpen }: { onOpen: (index: number) => void }) {
  return <section className="gallery-section section-pad" id="gallery"><div className="gallery-heading reveal"><div><span className="eyebrow">NHỮNG NGÀY THÁNG CÓ NHAU</span><h2>Our <em>moments</em></h2></div><span className="gallery-count">{gallery.length} KHUNG HÌNH</span></div><div className="gallery-grid">{gallery.map((image, index) => <button className={`gallery-tile gallery-${image.shape} reveal`} key={image.src} onClick={() => onOpen(index)} aria-label={`Mở ảnh ${index + 1}: ${image.alt}`}><img src={image.src} alt={image.alt} loading="lazy" /><span className="gallery-tile-number">{String(index + 1).padStart(2, '0')}</span></button>)}</div></section>
}

export function WeddingInfo() {
  return <section className="details-section section-pad" id="details"><div className="section-heading reveal"><span className="eyebrow">THE DAY WE SAY I DO</span><h2>Trân trọng <em>kính mời</em></h2><p>Sự hiện diện của bạn là niềm vui lớn nhất của chúng mình.</p></div><div className="venue-grid">{weddingData.venues.map((venue, index) => <article className={`venue-panel reveal venue-${index + 1}`} key={venue.label}><span className="venue-index">0{index + 1}</span><span className="eyebrow">{venue.label}</span><div className="venue-rule" /><h3>{venue.title}</h3><p className="venue-time"><Clock3 size={15} />{venue.time}</p><p className="venue-address"><MapPin size={16} />{venue.address}</p>{venue.mapUrl && <a className="text-link" href={venue.mapUrl} target="_blank" rel="noreferrer">CHỈ ĐƯỜNG <ArrowRight size={14} /></a>}</article>)}</div><div className="family-addresses reveal"><span className="eyebrow">ĐỊA CHỈ HAI GIA ĐÌNH</span><div className="family-address-grid">{weddingData.familyAddresses.map((family) => <div key={family.label}><span>{family.label}</span><p>{family.address}</p></div>)}</div></div></section>
}

export function Schedule() {
  return <section className="schedule-section section-pad" id="schedule"><div className="schedule-intro reveal"><span className="eyebrow">LỊCH TRÌNH NGÀY CƯỚI · 2026—2027</span><h2>Một ngày <em>trọn vẹn</em></h2><p>Chúng mình đã chuẩn bị một ngày thật vui. Hẹn gặp bạn nhé.</p><span className="schedule-date">01<span>·</span>01</span></div><div className="schedule-list">{weddingData.schedule.map((item, index) => <article className="schedule-item reveal" key={item.time}><span className="schedule-time">{item.time}</span><span className="schedule-node" /><div className="schedule-event"><h3>{item.title}</h3><p>{item.detail}</p></div><span className="schedule-ordinal">0{index + 1}</span></article>)}</div></section>
}

export function Location() {
  const venue = weddingData.venues[1]
  return <section className="location-section" id="location"><div className={`map-frame${weddingData.mapEmbedUrl ? '' : ' map-frame-empty'}`}>{weddingData.mapEmbedUrl && <iframe src={weddingData.mapEmbedUrl} title="Bản đồ đường đến địa điểm tổ chức" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}<span className="map-pin-label"><MapPin size={15} /> {venue.address}</span></div><div className="location-copy reveal"><span className="eyebrow">WE'LL MEET YOU HERE</span><h2>Hẹn gặp <em>bạn nhé</em></h2><p>{venue.address}</p>{venue.mapUrl && <a className="outline-button" href={venue.mapUrl} target="_blank" rel="noreferrer"><Navigation size={15} /> XEM BẢN ĐỒ</a>}</div></section>
}

export function GiftSection({ onOpen }: { onOpen: (index: number) => void }) {
  if (weddingData.gifts.length === 0) return null
  return <section className="gift-section section-pad" id="gift"><div className="gift-heading reveal"><span className="eyebrow">YOUR PRESENCE IS OUR PRESENT</span><h2>Tấm lòng <em>thương mến</em></h2><p>Nếu bạn muốn gửi một món quà nhỏ, chúng mình xin nhận bằng tất cả yêu thương.</p></div><div className="gift-grid">{weddingData.gifts.map((gift, index) => <article className="gift-card reveal" key={gift.side}><div className={`gift-qr${gift.qr ? '' : ' gift-qr-pending'}`}>{gift.qr ? <><img src={gift.qr} alt={`Mã QR mừng cưới ${gift.side.toLowerCase()}`} /><button onClick={() => onOpen(index)} aria-label={`Phóng to mã QR ${gift.side}`} title="Phóng to mã QR"><QrCode size={17} /></button></> : <div><QrCode size={24} /><span>Thêm ảnh vào<br />public/qr/{gift.qrFileName}</span></div>}</div><span className="eyebrow">{gift.side}</span><h3>{gift.name}</h3><p>{gift.bank}</p><span className="gift-account">{gift.account}</span></article>)}</div></section>
}

export function Closing() {
  return <footer className={`closing-section${weddingData.closingImage ? '' : ' closing-placeholder'}`} id="closing" style={{ backgroundImage: weddingData.closingImage ? `url("${weddingData.closingImage}")` : undefined }}><div className="closing-overlay" /><div className="closing-petals" aria-hidden="true"><i /><i /><i /><i /><i /></div><div className="closing-copy reveal"><span className="eyebrow">WITH ALL OUR LOVE</span><h2>{weddingData.couple.bride}<i>&</i>{weddingData.couple.groom}</h2><span className="closing-rule" /><p>Thank you for being part<br />of our happiness</p><span className="closing-date">{weddingData.date.display}</span></div><div className="footer-line"><span>{weddingData.couple.bride.toLocaleUpperCase('vi-VN')} &amp; {weddingData.couple.groom.toLocaleUpperCase('vi-VN')}</span><span>MADE WITH LOVE · 2027</span></div></footer>
}

export function Lightbox({ state, onClose, onChange }: { state: LightboxState; onClose: () => void; onChange: (direction: number) => void }) {
  const touchStart = useRef<number | null>(null)
  useEffect(() => {
    if (!state) return
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onChange(1)
      if (event.key === 'ArrowLeft') onChange(-1)
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('modal-open')
    return () => { window.removeEventListener('keydown', handleKeyDown); document.body.classList.remove('modal-open') }
  }, [state, onClose, onChange])
  if (!state) return null
  const photo = state.kind === 'gallery' ? gallery[state.index] : null
  const gift = state.kind === 'gift' ? weddingData.gifts[state.index] : null
  const onTouchStart = (event: TouchEvent) => { touchStart.current = event.touches[0]?.clientX ?? null }
  const onTouchEnd = (event: TouchEvent) => { if (touchStart.current === null) return; const delta = event.changedTouches[0]!.clientX - touchStart.current; if (Math.abs(delta) > 48) onChange(delta < 0 ? 1 : -1); touchStart.current = null }
  return <div className="lightbox" role="dialog" aria-modal="true" aria-label={photo?.alt ?? `Mã QR ${gift?.side}`} onClick={onClose} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}><button className="lightbox-close" aria-label="Đóng" onClick={onClose}><X size={22} /></button>{photo ? <><button className="lightbox-arrow lightbox-prev" aria-label="Ảnh trước" onClick={(event) => { event.stopPropagation(); onChange(-1) }}><ArrowLeft size={21} /></button><figure className="lightbox-figure" onClick={(event) => event.stopPropagation()}><img src={photo.src} alt={photo.alt} /><figcaption>{photo.alt}<span>{String(state.index + 1).padStart(2, '0')} / {gallery.length}</span></figcaption></figure><button className="lightbox-arrow lightbox-next" aria-label="Ảnh tiếp theo" onClick={(event) => { event.stopPropagation(); onChange(1) }}><ArrowRight size={21} /></button></> : gift && <div className="qr-modal" onClick={(event) => event.stopPropagation()}><img src={gift.qr} alt={`Mã QR ngân hàng của ${gift.name}`} /><span className="eyebrow">{gift.side} · {gift.bank}</span><h2>{gift.name}</h2><p>{gift.account}</p></div>}</div>
}

export type { LightboxState }