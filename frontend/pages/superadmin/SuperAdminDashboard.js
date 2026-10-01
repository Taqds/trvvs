import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import WorkspaceShell from '../../components/WorkspaceShell'

const login = '/superadmin/SuperadminLogin'

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('superadminToken')
    if (!token) { router.replace(`${login}?session=expired`); return }
    axios.get('/api/superadmin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => { if (active) setStats(response.data) })
      .catch(failure => {
        if (!active) return
        if (failure.response?.status === 401) { localStorage.removeItem('superadminToken'); router.replace(`${login}?session=expired`) }
        else setError('Statistics could not load. Please try again shortly.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [router])

  const metrics = stats && [
    ['Tenant registrations', stats.tenantRegistrations],
    ['Police stations', stats.policeVerifications],
    ['Active guests', stats.guestCounts],
    ['Hotel registrations', stats.totalHotelRegistrations]
  ]

  return <WorkspaceShell eyebrow="Administration" title="System overview" description="A clear view of current registrations and verification activity." tokenKey="superadminToken" login={login}>
    {loading && <div className="loading-state" role="status">Loading statistics…</div>}
    {error && <div className="notice notice--error" role="alert">{error}</div>}
    {metrics && <>
      <div className="metric-grid">{metrics.map(([label, value]) => <div className="metric-card" key={label}><span className="metric-card__label">{label}</span><strong className="metric-card__value">{value ?? 0}</strong></div>)}</div>
      <section className="content-card"><div className="content-card__head"><h2>Verification activity</h2></div><p>Verified residences appear in {stats.verificationsByArea?.length || 0} station areas. Hotels are registered in {stats.hotelRegistrationsByArea?.length || 0} station areas.</p></section>
    </>}
  </WorkspaceShell>
}
