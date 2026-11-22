import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Envelope from './components/Envelope'
import { Closing, Countdown, GallerySection, GiftSection, Hero, Lightbox, LoveStory, Location, NavigationBar, Schedule, WeddingInfo, type LightboxState } from './components/InvitationSections'
import WishesSection from './components/WishesSection'
import { weddingData } from './data/weddingData'
import { gallery } from './data/gallery'

const AdminWishes = lazy(() => import('./components/AdminWishes'))

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [opened, setOpened] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [lightbox, setLightbox] = useState<LightboxState>(null)
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (window.location.pathname.replace(/\/+$/, '') === '/admin/wishes') return
    audio.current = new Audio(weddingData.musicUrl)
    audio.current.loop = true
    audio.current.volume = 0.35
    return () => { audio.current?.pause(); audio.current = null }
  }, [])

  useEffect(() => {
    if (!opened || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } })
      })
      gsap.to('.hero', { backgroundPositionY: '62%', ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 } })
      if (weddingData.story.length > 0) {
        gsap.fromTo('.story-item', { x: 18 }, { x: 0, duration: 0.8, stagger: 0.16, ease: 'power2.out', scrollTrigger: { trigger: '.story-list', start: 'top 78%', once: true } })
      }
    })
    return () => context.revert()
  }, [opened])

  const toggleSound = useCallback(() => {
    if (!audio.current) return
    if (audio.current.paused) {
      void audio.current.play().then(() => setSoundOn(true)).catch(() => setSoundOn(false))
    } else {
      audio.current.pause()
      setSoundOn(false)
    }
  }, [])

  const moveLightbox = useCallback((direction: number) => {
    setLightbox((current) => {
      if (!current) return current
      if (current.kind === 'gallery') return { ...current, index: (current.index + direction + gallery.length) % gallery.length }
      const giftCount = weddingData.gifts.length
      return giftCount > 0 ? { ...current, index: (current.index + direction + giftCount) % giftCount } : null
    })
  }, [])

  if (window.location.pathname.replace(/\/+$/, '') === '/admin/wishes') {
    return <Suspense fallback={<main className="admin-shell" />}><AdminWishes /></Suspense>
  }

  return <>
    {!opened && <Envelope onOpen={() => setOpened(true)} />}
    {opened && <div className="invitation-site">
      <NavigationBar onSoundToggle={toggleSound} soundOn={soundOn} />
      <main>
        <Hero />
        <Countdown />
        <LoveStory />
        <GallerySection onOpen={(index) => setLightbox({ kind: 'gallery', index })} />
        <WeddingInfo />
        <Schedule />
        <Location />
        <WishesSection />
        <GiftSection onOpen={(index) => setLightbox({ kind: 'gift', index })} />
        <Closing />
      </main>
      <Lightbox state={lightbox} onClose={() => setLightbox(null)} onChange={moveLightbox} />
    </div>}
  </>
}