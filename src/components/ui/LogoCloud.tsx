"use client";

interface LogoItem {
  name: string;
  color: string;
  icon: React.ReactNode;
}

const logos: LogoItem[] = [
  {
    name: "Next.js",
    color: "#ffffff",
    icon: (
      <svg viewBox="0 0 128 128" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64c11.2 0 21.7-2.9 30.8-7.9L48.4 55.3v36.6H35.8V40.4h14.4l55.6 74.1C118.4 105.7 128 85.9 128 64c0-35.3-28.7-64-64-64zm20.2 85.8l-9.8-13V40.4h9.8v45.4z"/>
      </svg>
    ),
  },
  {
    name: "React",
    color: "#61DAFB",
    icon: (
      <svg viewBox="0 0 128 128" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 36.5c-15.4 0-29.5 2.1-40.1 5.5C13.5 45.6 7 51 7 57.5s6.5 12 16.9 15.6C34.5 76.5 48.6 78.5 64 78.5s29.5-2 40.1-5.4C114.5 69.5 121 64.1 121 57.5s-6.5-12-16.9-15.5C93.5 38.6 79.4 36.5 64 36.5zm0 5c14.7 0 28.2 2 38.2 5.2 9 2.9 13.8 7 13.8 10.8s-4.8 7.8-13.8 10.7c-10 3.2-23.5 5.3-38.2 5.3s-28.2-2.1-38.2-5.3C16.8 65.3 12 61.3 12 57.5s4.8-7.9 13.8-10.8C35.8 43.5 49.3 41.5 64 41.5z"/>
        <path d="M44.7 46.7c-7.7 13.3-11.8 26.7-11.8 37.8 0 11.2 4.1 18.4 10.3 20.1 6.2 1.7 14.2-1.8 21.9-10.3 7.7-8.5 14.8-22 18.8-37.3s4-29.9-2.2-36.7c-3.1-3.4-7.5-4.5-12.5-3.1-5.1 1.4-10.8 5.8-15.9 13.8zm4.3 2.5c4.6-7.1 9.5-11 13.5-12.1 3.9-1.1 6.9-.3 8.9 2 4.5 5 4.3 17.5.5 31.3s-10.2 26.2-17 34c-6.8 7.7-13.2 10.5-17.2 9.4-4-.9-7.1-6-7.1-15 0-10.3 3.9-23.1 11.2-35.7l7.2 6.1zM83.3 46.7c7.7 13.3 11.8 26.7 11.8 37.8 0 11.2-4.1 18.4-10.3 20.1-6.2 1.7-14.2-1.8-21.9-10.3"/>
        <circle cx="64" cy="57.5" r="7"/>
      </svg>
    ),
  },
  {
    name: "TypeScript",
    color: "#3178C6",
    icon: (
      <svg viewBox="0 0 128 128" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 63.91v62.5h125v-125H2zm100.73-5a15.56 15.56 0 017.82 4.5 20.58 20.58 0 013 4c0 .16-5.4 3.81-8.69 5.85-.12.08-.6-.44-1.13-1.23a7.09 7.09 0 00-5.87-3.53c-3.79-.26-6.23 1.73-6.21 5a4.58 4.58 0 00.54 2.34c.83 1.73 2.38 2.76 7.24 4.86 8.95 3.85 12.78 6.39 15.16 10 2.66 4 3.25 10.46 1.45 15.24-2 5.2-6.9 8.73-13.83 9.9a38.32 38.32 0 01-9.52-.1 23 23 0 01-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.16 9.16 0 011.15-.73l4.6-2.64 3.59-2.08.75 1.11a16.78 16.78 0 004.74 4.54c4 2.1 9.46 1.81 12.16-.62a5.43 5.43 0 00.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48 16.48 0 01-3.43-6.25 25 25 0 01-.22-8c1.33-6.23 6-10.58 12.82-11.87a31.66 31.66 0 019.49.26zm-29.34 5.24v5.12H57.16v46.23H45.65V69.26H29.38v-5a49.19 49.19 0 01.14-5.16c.06-.08 10-.12 22-.1l21.81.06z"/>
      </svg>
    ),
  },
  {
    name: "Supabase",
    color: "#3ECF8E",
    icon: (
      <svg viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627H99.1935C107.202 40.0627 111.186 49.9865 105.682 55.8122L63.7076 110.284Z" fill="url(#paint0_linear)"/>
        <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627H99.1935C107.202 40.0627 111.186 49.9865 105.682 55.8122L63.7076 110.284Z" fill="url(#paint1_linear)" fillOpacity="0.2"/>
        <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04087L54.4849 72.2922H9.83113C1.82246 72.2922 -2.16157 62.3684 3.34288 56.5427L45.317 2.07103Z" fill="#3ECF8E"/>
        <defs>
          <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
            <stop stopColor="#249361"/>
            <stop offset="1" stopColor="#3ECF8E"/>
          </linearGradient>
          <linearGradient id="paint1_linear" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
            <stop/>
            <stop offset="1" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "Vercel",
    color: "#ffffff",
    icon: (
      <svg viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z"/>
      </svg>
    ),
  },
  {
    name: "Tailwind",
    color: "#38BDF8",
    icon: (
      <svg viewBox="0 0 128 128" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M64.004 25.602c-17.067 0-27.73 8.53-32 25.597 6.398-8.531 13.867-11.73 22.398-9.597 4.871 1.214 8.352 4.746 12.207 8.66C72.883 56.629 80.145 64 96.004 64c17.066 0 27.73-8.531 32-25.602-6.399 8.536-13.867 11.735-22.399 9.602-4.87-1.215-8.347-4.746-12.207-8.66-6.27-6.367-13.53-13.738-29.394-13.738zM32.004 64c-17.066 0-27.73 8.531-32 25.602C6.402 81.066 13.87 77.867 22.402 80c4.871 1.215 8.352 4.746 12.207 8.66 6.274 6.367 13.536 13.738 29.395 13.738 17.066 0 27.73-8.53 32-25.597-6.399 8.531-13.867 11.73-22.399 9.597-4.87-1.214-8.347-4.745-12.207-8.66C55.128 71.371 47.868 64 32.004 64zm0 0"/>
      </svg>
    ),
  },
];

export function LogoCloud() {
  return (
    <section className="lc-section">
      <div className="wrap">
        <div className="lc-header">
          <span className="sl">Built on</span>
          <h2 className="lc-title">
            Powered by the best
            <br />
            <span className="lc-title-dim">technologies</span>
          </h2>
          <p className="lc-sub">The stack behind NeoGurpreet&apos;s Life OS.</p>
        </div>

        <div className="lc-grid">
          {logos.map((logo) => (
            <div className="lc-card" key={logo.name}>
              <div className="lc-card-inner">
                {/* Front */}
                <div className="lc-face lc-front">
                  <div className="lc-icon" style={{ color: logo.color }}>
                    {logo.icon}
                  </div>
                  <span className="lc-name">{logo.name}</span>
                </div>
                {/* Back */}
                <div className="lc-face lc-back">
                  <div
                    className="lc-back-dot"
                    style={{ background: logo.color }}
                  />
                  <span className="lc-back-name" style={{ color: logo.color }}>
                    {logo.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
