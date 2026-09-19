'use client';

export default function Hero() {
  return (
    <section style={{
      minHeight: '64vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '88px 24px 56px',
    }}>
      {/* Eyebrow */}
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        letterSpacing: '.22em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
        marginBottom: '24px',
        opacity: 0.9,
      }}>
        Life Operating System · IIT Roorkee · Sem 1 · 2026
      </div>

      {/* Name */}
      <h1 style={{
        fontWeight: 900,
        fontSize: 'clamp(60px, 10vw, 104px)',
        letterSpacing: '-5px',
        lineHeight: 0.90,
        background: 'linear-gradient(160deg, #fff 0%, rgba(255,255,255,.65) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        NeoGurpreet
      </h1>

      {/* Sub */}
      <p style={{
        marginTop: '24px',
        fontSize: 'clamp(12px, 1.4vw, 14px)',
        color: 'var(--t2)',
        letterSpacing: '.01em',
        lineHeight: 1.75,
        fontWeight: 400,
      }}>
        Mathematics &amp; Computing (BS-MS) &nbsp;·&nbsp; Rajendra Bhawan
        <br />
        Class Representative &nbsp;·&nbsp; Autumn Semester
      </p>

      {/* Rule */}
      <div style={{
        width: '48px',
        height: '1px',
        margin: '28px auto 0',
        background: 'linear-gradient(90deg, transparent, rgba(59,130,246,.8), transparent)',
      }} />

      {/* Dynamic pills row (stats placeholders) */}
      <div style={{
        marginTop: '32px',
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '8px',
        justifyContent: 'center',
      }}>
        {[
          { label: '— done', id: 'hp-done' },
          { label: '— due this week', id: 'hp-week' },
        ].map((p) => (
          <span
            key={p.id}
            id={p.id}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '.07em',
              color: 'var(--t3)',
              background: 'var(--g1)',
              border: '1px solid var(--gb)',
              borderRadius: '9999px',
              padding: '5px 14px',
              WebkitBackdropFilter: 'blur(16px)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* Subject pills row */}
      <div style={{
        marginTop: '10px',
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '8px',
        justifyContent: 'center',
      }}>
        {[
          { code: 'MAI-101', color: '#93C5FD', border: 'rgba(147,197,253,.25)' },
          { code: 'PHI-101', color: '#C4B5FD', border: 'rgba(196,181,253,.25)' },
          { code: 'MAC-101', color: '#6EE7B7', border: 'rgba(110,231,183,.25)' },
          { code: 'CSE-101', color: '#FCA5A5', border: 'rgba(252,165,165,.25)' },
          { code: 'TMI-102', color: '#FCD34D', border: 'rgba(252,211,77,.25)'  },
        ].map((s) => (
          <span
            key={s.code}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '.07em',
              color: s.color,
              background: 'var(--g1)',
              border: `1px solid ${s.border}`,
              borderRadius: '9999px',
              padding: '5px 14px',
              WebkitBackdropFilter: 'blur(16px)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {s.code}
          </span>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{
        marginTop: '14px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap' as const,
        justifyContent: 'center',
      }}>
        <button className="bp-open-btn">
          📐 Life Architecture Blueprint
        </button>
        <button className="cal-open-btn">
          📅 Weekly Architecture
        </button>
      </div>
    </section>
  );
}
