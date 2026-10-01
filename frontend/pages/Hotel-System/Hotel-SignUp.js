import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import WorkspaceShell from '../../components/WorkspaceShell'

export default function HotelSignUp() {
  const router = useRouter()
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onBlur' })

  useEffect(() => {
    axios.get('/api/hotel/stations')
      .then(response => setStations(response.data.stations || []))
      .catch(() => setError('Police stations could not load. Please refresh this page.'))
      .finally(() => setLoading(false))
  }, [])

  async function submit(values) {
    setBusy(true)
    setError('')
    try {
      const response = await axios.post('/api/hotel/register', {
        email: values.email.trim(), password: values.password, hotel_name: values.hotel_name.trim(),
        own_cnic: values.own_cnic.trim(), own_father: values.own_father.trim(), own_name: values.own_name.trim(),
        phone: values.phone.trim(), address: values.address.trim(), totalRooms: Number(values.totalRooms), station: values.station
      })
      localStorage.setItem('hotelToken', response.data.token)
      router.push('/Hotel-System/Hotel-Dashboard')
    } catch (failure) { setError(failure.response?.data?.message || 'The hotel account could not be created.') }
    finally { setBusy(false) }
  }

  return <WorkspaceShell eyebrow="Hotel registration" title="Register your hotel" description="Enter hotel and owner details for verification by your local station." action={<Link href="/Hotel-System/Hotel-Login" passHref><a className="button button--quiet">Back to sign in</a></Link>}>
    <section className="content-card form-card">
      {error && <div className="notice notice--error" role="alert">{error}</div>}
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="form-grid">
          <div className="form-field"><label htmlFor="hotel-name">Hotel name</label><input id="hotel-name" aria-invalid={!!errors.hotel_name} {...register('hotel_name', { required: 'Enter the hotel name' })} />{errors.hotel_name && <p className="field-error">{errors.hotel_name.message}</p>}</div>
          <div className="form-field"><label htmlFor="hotel-email">Email address</label><input id="hotel-email" type="email" aria-invalid={!!errors.email} {...register('email', { required: 'Enter an email', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })} />{errors.email && <p className="field-error">{errors.email.message}</p>}</div>
          <div className="form-field"><label htmlFor="owner-name">Owner name</label><input id="owner-name" aria-invalid={!!errors.own_name} {...register('own_name', { required: 'Enter the owner name' })} />{errors.own_name && <p className="field-error">{errors.own_name.message}</p>}</div>
          <div className="form-field"><label htmlFor="owner-father">Owner father name</label><input id="owner-father" aria-invalid={!!errors.own_father} {...register('own_father', { required: 'Enter the father name' })} />{errors.own_father && <p className="field-error">{errors.own_father.message}</p>}</div>
          <div className="form-field"><label htmlFor="owner-cnic">Owner CNIC</label><input id="owner-cnic" placeholder="00000-0000000-0" aria-invalid={!!errors.own_cnic} {...register('own_cnic', { required: 'Enter the owner CNIC', pattern: { value: /^\d{5}-\d{7}-\d$/, message: 'Use the format 00000-0000000-0' } })} />{errors.own_cnic && <p className="field-error">{errors.own_cnic.message}</p>}</div>
          <div className="form-field"><label htmlFor="hotel-phone">Phone</label><input id="hotel-phone" type="tel" placeholder="03001234567" aria-invalid={!!errors.phone} {...register('phone', { required: 'Enter a phone number', pattern: { value: /^(?:\+92|92|0)3\d{9}$/, message: 'Enter a Pakistani mobile number' } })} />{errors.phone && <p className="field-error">{errors.phone.message}</p>}</div>
          <div className="form-field"><label htmlFor="total-rooms">Total rooms</label><input id="total-rooms" type="number" min="1" aria-invalid={!!errors.totalRooms} {...register('totalRooms', { required: 'Enter the room count', min: { value: 1, message: 'Enter at least one room' } })} />{errors.totalRooms && <p className="field-error">{errors.totalRooms.message}</p>}</div>
          <div className="form-field"><label htmlFor="station">Police station</label><select id="station" defaultValue="" disabled={loading || !stations.length} aria-invalid={!!errors.station} {...register('station', { required: 'Choose a station' })}><option value="">{loading ? 'Loading stations…' : stations.length ? 'Select a station' : 'No stations available'}</option>{stations.map(item => <option key={item._id} value={item._id}>{item.station_name}</option>)}</select>{errors.station && <p className="field-error">{errors.station.message}</p>}</div>
          <div className="form-field"><label htmlFor="hotel-address">Hotel address</label><textarea id="hotel-address" aria-invalid={!!errors.address} {...register('address', { required: 'Enter the hotel address', minLength: { value: 10, message: 'Add a more complete address' } })} />{errors.address && <p className="field-error">{errors.address.message}</p>}</div>
          <div className="form-field"><label htmlFor="hotel-password">Password</label><input id="hotel-password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register('password', { required: 'Enter a password', minLength: { value: 8, message: 'Use at least 8 characters' } })} />{errors.password && <p className="field-error">{errors.password.message}</p>}</div>
        </div>
        <div className="form-card__actions"><Link href="/Hotel-System/Hotel-Login" passHref><a className="button button--quiet">Cancel</a></Link><button className="button button--primary" type="submit" disabled={busy || loading || !stations.length}>{busy ? 'Creating account…' : 'Register hotel'}</button></div>
      </form>
    </section>
  </WorkspaceShell>
}
