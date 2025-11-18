import { useEffect, useRef, useState } from 'react'
import './App.css'
import mockData from './mockData.json'

const SECTION_LABELS = {
  todayTasks: "Bugünün Planı",
  potentialProblems: 'Potansiyel Meydan Okumalar',
  completedToday: 'Bugün Tamamlananlar',
  issuesEncountered: 'Çözemediğim Problemler'
}

function App() {
  const days = Object.entries(mockData)
  const [expandedDays, setExpandedDays] = useState(() =>
    Object.keys(mockData).reduce((acc, key) => ({ ...acc, [key]: false }), {})
  )
  const [showWelcome, setShowWelcome] = useState(false)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
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

  const toggleDay = (dayKey) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }))
  }

  return (
    <main className="app">
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
    </main>
  )
}

export default App
