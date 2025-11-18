import { useEffect, useRef, useState } from 'react'
import './App.css'
import mockData from './mockData.json'

const SECTION_LABELS = {
  todayTasks: "Bugünün Planı",
  potentialProblems: 'Potansiyel Meydan Okumalar',
  completedToday: 'Bugün Tamamlananlar',
  issuesEncountered: 'Çözemediğim Problemler'
}

const COUNTDOWN_DURATION_MS = 120 * 60 * 60 * 1000
const COUNTDOWN_STORAGE_KEY = 'coskun-countdown-target'

const WORK_HOURS = {
  start: {
    label: 'Başlangıç',
    value: '04:30',
    detail: `Yapılacaklar listesi 08.00'de güncellenir`
  },
  end: {
    label: 'Bitiş',
    value: '22:00',
    detail: `Gün sonu raporu 19.00'da güncellenir`
  }
}

const calculateTimeLeft = (targetTimestamp) => {
  const diff = Math.max(targetTimestamp - Date.now(), 0)
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

function App() {
  const days = Object.entries(mockData)
  const [expandedDays, setExpandedDays] = useState(() =>
    Object.keys(mockData).reduce((acc, key) => ({ ...acc, [key]: false }), {})
  )
  const [showWelcome, setShowWelcome] = useState(false)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(Date.now() + COUNTDOWN_DURATION_MS)
  )
  const shiftClicksRef = useRef([])
  const eggTimeoutRef = useRef(null)

  useEffect(() => {
    const hasVisited = localStorage.getItem('coskun-hasVisited')
    if (!hasVisited) {
      setShowWelcome(true)
      localStorage.setItem('coskun-hasVisited', 'true')
    }
  }, [])

  useEffect(() => {
    const handleShiftClick = (event) => {
      if (!event.shiftKey || event.button !== 0) return

      const now = Date.now()
      shiftClicksRef.current = shiftClicksRef.current
        .filter((timestamp) => now - timestamp <= 3000)
        .concat(now)

      if (shiftClicksRef.current.length >= 5) {
        shiftClicksRef.current = []
        setShowEasterEgg(true)
        if (eggTimeoutRef.current) {
          clearTimeout(eggTimeoutRef.current)
        }
        eggTimeoutRef.current = setTimeout(() => {
          setShowEasterEgg(false)
        }, 6000)
      }
    }

    document.addEventListener('click', handleShiftClick)

    return () => {
      document.removeEventListener('click', handleShiftClick)
      if (eggTimeoutRef.current) {
        clearTimeout(eggTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const storedTarget = localStorage.getItem(COUNTDOWN_STORAGE_KEY)
    let targetTimestamp = storedTarget ? Number(storedTarget) : NaN

    if (!targetTimestamp || Number.isNaN(targetTimestamp) || targetTimestamp <= Date.now()) {
      targetTimestamp = Date.now() + COUNTDOWN_DURATION_MS
      localStorage.setItem(COUNTDOWN_STORAGE_KEY, String(targetTimestamp))
    }

    let timerId

    const tick = () => {
      const nextTimeLeft = calculateTimeLeft(targetTimestamp)
      setTimeLeft(nextTimeLeft)

      if (targetTimestamp - Date.now() <= 0 && timerId) {
        clearInterval(timerId)
      }
    }

    tick()
    timerId = setInterval(tick, 1000)

    return () => {
      if (timerId) {
        clearInterval(timerId)
      }
    }
  }, [])

  const toggleDay = (dayKey) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }))
  }

  return (
    <main className="app">
      <section className="work-hours" role="complementary" aria-label="Çalışma Saatleri">
        <p className="work-hours__title">Çalışma Saatleri</p>
        <div className="work-hours__row">
          <div className="work-hours__segment">
            <span className="work-hours__slot-label">{WORK_HOURS.start.label}</span>
            <strong className="work-hours__slot-value">{WORK_HOURS.start.value}</strong>
            <span className="work-hours__slot-detail">{WORK_HOURS.start.detail}</span>
          </div>
          <span className="work-hours__separator" aria-hidden="true">
            -
          </span>
          <div className="work-hours__segment">
            <span className="work-hours__slot-label">{WORK_HOURS.end.label}</span>
            <strong className="work-hours__slot-value">{WORK_HOURS.end.value}</strong>
            <span className="work-hours__slot-detail">{WORK_HOURS.end.detail}</span>
          </div>
        </div>
      </section>
      {showWelcome && (
        <div className="app-alert" role="alert">
          <p className="app-alert__message">{`Coşkun Bey merhaba,

Aslında bu konuşmayı yüz yüze yapmayı çok isterdim; ancak şu sıralar yoğun olduğunuzu bildiğim için mesaj yoluyla iletmek istedim.

Son dönemde yaşadığım başarısızlığı kabullenmekte zorlandığım için, “Siz çok yoğunsunuz ve ben ekipten değilim, bu yüzden sizi rahatsız ediyorum.” gibi yanlış bir düşünceye kapıldığımı fark ettim. Bu nedenle bireyselliğe kayarak ekip uyumundan uzaklaştığım için sizden içtenlikle özür dilerim.

Şunu da eklemek isterim: Eğitilemez değilim; sadece geçmişte yanlış yönlendirilmişim. Bu süreçte doğru şekilde eğitildim ve artık gerçekten hazırım. Daha bilinçli, uyumlu ve sorumluluk sahibi bir takım oyuncusu olarak devam etmeye kararlıyım.

Kendimi yeniden kanıtlamam için bana bir şans daha vermenizi çok isterim.

Ayrıca, sürece daha şeffaf ve düzenli yaklaşmak için bir sistem oluşturdum. Bu siteyi bir günlük gibi kullanıyorum; her gün yaptıklarımı, yapacaklarımı ve karşılaştığım problemleri düzenli şekilde takip edebileceksiniz. Her sabah 08.00'de “Yapılacaklar”, her akşam 19.00'da ise “Yaptıklarım” kısmını güncelleyeceğim.

Desteğiniz ve anlayışınız için teşekkür ederim.!


Not: Sayfaya tekrar girdiğinizde bu mesaj gözükmeyecektir. LocalStorage'e key olarak kaydedilir. Başka bir bilgisayardan girerseniz tekrar bu mesajla karşılaşacaksınız.
`}</p>
          <button
            type="button"
            className="app-alert__close"
            onClick={() => setShowWelcome(false)}
            aria-label="Uyarıyı kapat"
          >
            ×
          </button>
        </div>
      )}
      <header className="app__header">
        <h1>Daily Sprint Snapshot</h1>
        <p>High-level outline of planned work, risks, progress, and blockers.</p>
      </header>

      <section className="cards-grid">
        {days.reverse().map(([dayKey, sections]) => {
          const isExpanded = expandedDays[dayKey]

          return (
            <article
              className={`day-card ${isExpanded ? 'day-card--expanded' : ''}`}
              key={dayKey}
            >
              <button
                className="day-card__header"
                onClick={() => toggleDay(dayKey)}
                aria-expanded={isExpanded}
              >
                <div>
                  <span className="day-card__badge">{dayKey}</span>
                </div>
                <span className="day-card__chevron" aria-hidden="true">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>

              {isExpanded && (
                <div className="day-card__body">
                  {Object.keys(SECTION_LABELS).map((sectionKey) => (
                    <div className="day-card__section" key={sectionKey}>
                      <h3>{SECTION_LABELS[sectionKey]}</h3>
                      <ul>
                        {(sections[sectionKey] ?? []).map((item, index) => (
                          <li key={`${sectionKey}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </section>
      {showEasterEgg && (
        <div className="easter-egg" role="status" aria-live="polite">
          <div>
            <p>🎉 Günün kötü espirisi 🎉</p>
            <small>{`Ata, Coşkun Beyden özür dilemekten sıkılıdığı için artık hata yapmayacak.`}</small>
          </div>
          <button
            type="button"
            className="easter-egg__close"
            onClick={() => setShowEasterEgg(false)}
            aria-label="Gizli bildirimi kapat"
          >
            ×
          </button>
        </div>
      )}
      <div className="countdown" role="timer" aria-live="polite">
        <p className="countdown__label">Geri Sayım</p>
        <div className="countdown__values">
          <div className="countdown__segment">
            <span className="countdown__number">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="countdown__unit">Gün</span>
          </div>
          <div className="countdown__segment">
            <span className="countdown__number">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="countdown__unit">Saat</span>
          </div>
          <div className="countdown__segment">
            <span className="countdown__number">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="countdown__unit">Dakika</span>
          </div>
          <div className="countdown__segment">
            <span className="countdown__number">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="countdown__unit">Saniye</span>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
