import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import AuthShell from '../../components/AuthShell'

export default function TenantSignUp() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onBlur' })

  async function submit(values) {
    setError('')
    setBusy(true)
    try {
      const response = await axios.post('/api/tenant/register', {
        email: values.email.trim(), password: values.password,
        name: values.name.trim(), father: values.father.trim(),
        cnic: values.cnic.trim(), phone: values.phone.trim()
      })
      localStorage.setItem('tenantToken', response.data.token)
      router.push('/Tenant-System/Tenant-Dashboard')
    } catch (failure) {
      setError(failure.response?.data?.message || 'The account could not be created. Please try again.')
    } finally { setBusy(false) }
  }

  return <AuthShell eyebrow="Tenant registration" title="Create your account" description="Register to submit and track residency details." footer={<><Link href="/">Back to home</Link><Link href="/Tenant-System/Tenant-Login">Already have an account?</Link></>}>
    {error && <div className="notice notice--error" role="alert">{error}</div>}
    <form onSubmit={handleSubmit(submit)} noValidate className="form-stack">
      <div className="form-grid">
        <div className="form-field"><label htmlFor="tenant-name">Full name</label><input id="tenant-name" autoComplete="name" aria-invalid={!!errors.name} {...register('name', { required: 'Enter your name', minLength: { value: 4, message: 'Use at least 4 characters' } })} />{errors.name && <p className="field-error">{errors.name.message}</p>}</div>
        <div className="form-field"><label htmlFor="tenant-father">Father name</label><input id="tenant-father" aria-invalid={!!errors.father} {...register('father', { required: 'Enter your father name', minLength: { value: 4, message: 'Use at least 4 characters' } })} />{errors.father && <p className="field-error">{errors.father.message}</p>}</div>
        <div className="form-field"><label htmlFor="tenant-cnic">CNIC</label><input id="tenant-cnic" placeholder="00000-0000000-0" aria-invalid={!!errors.cnic} {...register('cnic', { required: 'Enter your CNIC', pattern: { value: /^\d{5}-\d{7}-\d$/, message: 'Use the format 00000-0000000-0' } })} />{errors.cnic && <p className="field-error">{errors.cnic.message}</p>}</div>
        <div className="form-field"><label htmlFor="tenant-phone">Phone</label><input id="tenant-phone" type="tel" placeholder="03001234567" aria-invalid={!!errors.phone} {...register('phone', { required: 'Enter your phone', pattern: { value: /^(?:\+92|92|0)3\d{9}$/, message: 'Enter a Pakistani mobile number' } })} />{errors.phone && <p className="field-error">{errors.phone.message}</p>}</div>
      </div>
      <div className="form-field"><label htmlFor="tenant-email">Email address</label><input id="tenant-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email', { required: 'Enter your email', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' } })} />{errors.email && <p className="field-error">{errors.email.message}</p>}</div>
      <div className="form-field"><label htmlFor="tenant-password">Password</label><input id="tenant-password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register('password', { required: 'Enter a password', minLength: { value: 8, message: 'Use at least 8 characters' } })} />{errors.password && <p className="field-error">{errors.password.message}</p>}</div>
      <button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
    </form>
  </AuthShell>
}
