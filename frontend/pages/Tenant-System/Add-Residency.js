import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import WorkspaceShell from '../../components/WorkspaceShell'

const login = '/Tenant-System/Tenant-Login'

export default function AddResidency() {
  const router = useRouter()
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onBlur' })

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('tenantToken')
    if (!token) { router.replace(`${login}?session=expired`); return }
    axios.get('/api/tenant/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => { if (active) setStations(response.data.stations || []) })
      .catch(error => {
        if (!active) return
        if (error.response?.status === 401) { localStorage.removeItem('tenantToken'); router.replace(`${login}?session=expired`) }
        else setNotice({ type: 'error', text: 'Police stations could not load. Please refresh this page.' })
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [router])

  async function submit(values) {
    const token = localStorage.getItem('tenantToken')
    if (!token) { router.replace(`${login}?session=expired`); return }
    setSaving(true)
    setNotice(null)
    try {
      await axios.post('/api/tenant/residence', { residence: {
        own_name: values.name.trim(), own_cnic: values.cnic.trim(), own_father: values.father.trim(),
        own_phone: values.phone.trim(), own_address: values.own_address.trim(),
        address: values.address.trim(), station: values.station
      } }, { headers: { Authorization: `Bearer ${token}` } })
      reset()
      setNotice({ type: 'success', text: 'Residency submitted. The station can now review it.' })
    } catch (error) {
      if (error.response?.status === 401) { localStorage.removeItem('tenantToken'); router.replace(`${login}?session=expired`) }
      else setNotice({ type: 'error', text: error.response?.data?.message || 'The residency could not be saved. Please try again.' })
    } finally { setSaving(false) }
  }

  return <WorkspaceShell eyebrow="Tenant registration" title="Add residency" description="Provide the property owner and address details for station verification." tokenKey="tenantToken" login={login} action={<Link href="/Tenant-System/Tenant-Dashboard" passHref><a className="button button--quiet">Back to dashboard</a></Link>}>
    <section className="content-card form-card">
      {notice && <div className={`notice notice--${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</div>}
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="content-card__head"><h2>Property details</h2><span className="field-hint">All fields are required</span></div>
        <div className="form-grid">
          <div className="form-field"><label htmlFor="owner-name">Owner name</label><input id="owner-name" placeholder="Full name" aria-invalid={!!errors.name} {...register('name', { required: 'Enter the owner name', minLength: { value: 4, message: 'Use at least 4 characters' }, maxLength: { value: 60, message: 'Use at most 60 characters' } })} />{errors.name && <p className="field-error">{errors.name.message}</p>}</div>
          <div className="form-field"><label htmlFor="owner-cnic">Owner CNIC</label><input id="owner-cnic" inputMode="numeric" placeholder="00000-0000000-0" aria-invalid={!!errors.cnic} {...register('cnic', { required: 'Enter the owner CNIC', pattern: { value: /^\d{5}-\d{7}-\d$/, message: 'Use the format 00000-0000000-0' } })} />{errors.cnic && <p className="field-error">{errors.cnic.message}</p>}</div>
          <div className="form-field"><label htmlFor="owner-father">Owner father name</label><input id="owner-father" placeholder="Full name" aria-invalid={!!errors.father} {...register('father', { required: 'Enter the father name', minLength: { value: 4, message: 'Use at least 4 characters' } })} />{errors.father && <p className="field-error">{errors.father.message}</p>}</div>
          <div className="form-field"><label htmlFor="owner-phone">Owner phone</label><input id="owner-phone" type="tel" placeholder="03001234567" aria-invalid={!!errors.phone} {...register('phone', { required: 'Enter the owner phone', pattern: { value: /^(?:\+92|92|0)3\d{9}$/, message: 'Enter a Pakistani mobile number, such as 03001234567' } })} />{errors.phone && <p className="field-error">{errors.phone.message}</p>}</div>
          <div className="form-field"><label htmlFor="owner-address">Owner address</label><textarea id="owner-address" placeholder="Owner's full mailing address" aria-invalid={!!errors.own_address} {...register('own_address', { required: 'Enter the owner address', minLength: { value: 10, message: 'Add a more complete address (at least 10 characters)' } })} />{errors.own_address && <p className="field-error">{errors.own_address.message}</p>}</div>
          <div className="form-field"><label htmlFor="residence-address">Residency address</label><textarea id="residence-address" placeholder="Full address of the rental property" aria-invalid={!!errors.address} {...register('address', { required: 'Enter the residency address', minLength: { value: 10, message: 'Add a more complete address (at least 10 characters)' } })} />{errors.address && <p className="field-error">{errors.address.message}</p>}</div>
          <div className="form-field"><label htmlFor="station">Police station</label><select id="station" defaultValue="" disabled={loading || stations.length === 0} aria-invalid={!!errors.station} {...register('station', { required: 'Choose a police station' })}><option value="">{loading ? 'Loading stations…' : stations.length ? 'Select a station' : 'No stations available'}</option>{stations.map(station => <option key={station._id} value={station._id}>{station.station_name}</option>)}</select>{errors.station && <p className="field-error">{errors.station.message}</p>}{!loading && stations.length === 0 && <p className="field-hint">Ask an administrator to add a station before submitting.</p>}</div>
        </div>
        <div className="form-card__actions"><Link href="/Tenant-System/Tenant-Dashboard" passHref><a className="button button--quiet">Cancel</a></Link><button type="submit" className="button button--primary" disabled={saving || loading || stations.length === 0}>{saving ? 'Submitting…' : 'Submit residency'}</button></div>
      </form>
    </section>
  </WorkspaceShell>
}
