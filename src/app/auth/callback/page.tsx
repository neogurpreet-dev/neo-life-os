'use client'
import { useEffect } from 'react'

export default function AuthCallback() {
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const access_token  = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const expires_in    = params.get('expires_in')

    if (access_token && refresh_token) {
      try {
        localStorage.setItem('neo_auth_v1', JSON.stringify({
          access_token,
          refresh_token,
          expires_at: Date.now() + Number(expires_in || 3600) * 1000,
        }))
        sessionStorage.removeItem('neo_cloud_synced_v1')
      } catch (_) {}
    }

    window.location.replace('/')
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#06070E',
      color: 'rgba(255,255,255,0.6)',
      fontFamily: 'Inter, sans-serif',
      fontSize: '1rem',
    }}>
      Verifying your account…
    </div>
  )
}
