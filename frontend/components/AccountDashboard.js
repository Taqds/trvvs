import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import WorkspaceShell from './WorkspaceShell'

function Metric({ label, value }) {
  return <div className="metric-card"><span className="metric-card__label">{label}</span><strong className="metric-card__value">{value ?? 0}</strong></div>
}

function Details({ items }) {
  return <dl className="detail-grid">{items.map(([label, value]) => <div className="detail-item" key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
}

function TenantContent({ data }) {
  const residences = data.residences || []
  return <>
    <div className="metric-grid">
      <Metric label="Residences" value={residences.length} />
      <Metric label="Active" value={residences.filter(item => item.isActive).length} />
      <Metric label="Verified" value={residences.filter(item => item.isVerified).length} />
      <Metric label="Police stations" value={data.stations?.length || 0} />
    </div>
    <section className="content-card"><div className="content-card__head"><h2>Your residences</h2><span className="field-hint">Only your own records appear here</span></div>
      {residences.length ? <div className="record-list">{residences.map(item => <div className="record-item" key={item._id}><div><strong>{item.address}</strong><small>{item.station?.station_name || 'Station pending'} · Owner: {item.own_name}</small></div><span className={`status-pill ${item.isVerified ? 'status-pill--success' : ''}`}>{!item.isActive ? 'Inactive' : item.isVerified ? 'Verified' : 'Pending review'}</span></div>)}</div> : <div className="empty-state">No residences yet. Use “Add residency” to create your first record.</div>}
    </section>
  </>
}

function HotelContent({ data }) {
  const hotel = data.hotel
  if (!hotel) return <section className="content-card"><div className="empty-state">Hotel details are unavailable for this account.</div></section>
  return <>
    <div className="metric-grid"><Metric label="Total rooms" value={hotel.totalRooms} /><Metric label="Current guests" value={hotel.totalGuests} /><Metric label="Verification" value={hotel.isVerified ? 'Approved' : 'Pending'} /><Metric label="Police station" value={hotel.station?.station_name || '—'} /></div>
    <section className="content-card"><div className="content-card__head"><h2>Hotel details</h2><span className={`status-pill ${hotel.isVerified ? 'status-pill--success' : ''}`}>{hotel.isVerified ? 'Verified' : 'Pending review'}</span></div><Details items={[["Hotel", hotel.hotel_name], ["Email", hotel.email], ["Phone", hotel.phone], ["Address", hotel.address], ["Owner", data.owner?.own_name], ["Owner CNIC", data.owner?.own_cnic]]} /></section>
  </>
}

function PoliceContent({ data }) {
  return <>
    <div className="metric-grid"><Metric label="New tenants" value={data.newTenants} /><Metric label="Verified tenants" value={data.tenantsList} /><Metric label="New hotels" value={data.newHotels} /><Metric label="Verified hotels" value={data.hotelList} /><Metric label="Current guests" value={data.guestList} /><Metric label="Guest history" value={data.guestHistory} /><Metric label="Tenant history" value={data.tenantHistory} /></div>
    <section className="content-card"><div className="content-card__head"><h2>Station details</h2></div><Details items={[["Station", data.station?.station_name], ["Officer", data.station?.sho_name], ["Email", data.station?.email], ["Phone", data.station?.phone], ["Address", data.station?.address]]} /></section>
  </>
}

export default function AccountDashboard({ title, role, tokenKey, login, links = [] }) {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const token = localStorage.getItem(tokenKey)
    if (!token) { router.replace(`${login}?session=expired`); return }
    axios.get(`/api/${role}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => { if (active) setData(response.data) })
      .catch(failure => {
        if (!active) return
        if (failure.response?.status === 401) {
          localStorage.removeItem(tokenKey)
          router.replace(`${login}?session=expired`)
        } else setError('The dashboard could not load. Please try again shortly.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [role, tokenKey, login, router])

  return <WorkspaceShell eyebrow={`${role} workspace`} title={title} description="Your registration and verification information in one place." tokenKey={tokenKey} login={login} action={links[0] && <Link href={links[0].href} passHref><a className="button button--primary">{links[0].label}</a></Link>}>
    {links.length > 1 && <nav className="content-card" aria-label="Account actions"><div className="workspace-actions">{links.slice(1).map(link => <Link href={link.href} passHref key={link.href}><a className="button button--quiet">{link.label}</a></Link>)}</div></nav>}
    {loading && <div className="loading-state" role="status">Loading your dashboard…</div>}
    {error && <div className="notice notice--error" role="alert">{error}</div>}
    {data && role === 'tenant' && <TenantContent data={data} />}
    {data && role === 'hotel' && <HotelContent data={data} />}
    {data && role === 'police' && <PoliceContent data={data} />}
  </WorkspaceShell>
}
