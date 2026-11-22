import { useState } from 'react'
import { ArrowDown, Heart } from 'lucide-react'
import { weddingData } from '../data/weddingData'

type EnvelopeProps = { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [opening, setOpening] = useState(false)

  const openInvitation = () => {
    if (opening) return
    setOpening(true)
    onOpen()
  }

  return (
    <div className={`envelope-screen${opening ? ' is-opening' : ''}`} aria-label={`Thiệp cưới ${weddingData.couple.bride} và ${weddingData.couple.groom}`}>
      <div className="envelope-topline"><span>THIỆP MỜI · 2027</span><span>TRÂN TRỌNG KÍNH MỜI</span></div>
      <div className="envelope-center">
        <p className="eyebrow">A CELEBRATION OF LOVE</p>
        <h1 className="envelope-title">You're<br /><em>invited</em></h1>
        <div className="envelope-art" aria-hidden="true">
          <div className="letter"><span className="letter-monogram">{weddingData.couple.monogram[0]} <i>&amp;</i> {weddingData.couple.monogram.at(-1)}</span><span className="letter-rule" /><span className="letter-note">with joy in our hearts</span></div>
          <div className="envelope-back" />
          <div className="envelope-front"><span className="envelope-initial">{weddingData.couple.monogram[0]} <i>&amp;</i> {weddingData.couple.monogram.at(-1)}</span></div>
          <div className="envelope-flap" />
          <div className="envelope-seal"><Heart size={16} strokeWidth={1.2} /></div>
        </div>
        <p className="envelope-names">{weddingData.couple.bride} <i>&</i> {weddingData.couple.groom}</p>
        <p className="envelope-date">{weddingData.date.display}</p>
        <button className="open-button" onClick={openInvitation} disabled={opening}>
          <span>{opening ? 'MỘT CHÚT PHÉP MÀU...' : 'MỞ THIỆP'}</span><ArrowDown size={15} strokeWidth={1.4} />
        </button>
      </div>
      <div className="envelope-bottomline"><span>{weddingData.couple.bride.toLocaleUpperCase('vi-VN')} &amp; {weddingData.couple.groom.toLocaleUpperCase('vi-VN')}</span><span>{weddingData.date.display}</span></div>
    </div>
  )
}