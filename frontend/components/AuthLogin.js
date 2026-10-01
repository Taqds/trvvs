import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import AuthShell from './AuthShell'

export default function AuthLogin({ title, role, tokenKey, destination, signup, forgot }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const response = await axios.post(`/api/${role}/login`, { email: email.trim(), password })
      localStorage.setItem(tokenKey, response.data.token)
      await router.push(destination)
    } catch (failure) {
      setError(failure.response?.data?.message || 'Sign in failed. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell eyebrow={`${role} access`} title={title} description="Enter your account details to continue." footer={<><Link href="/">Back to home</Link>{signup && <Link href={signup}>Create an account</Link>}</>}>
      {router.query.session === 'expired' && <div className="notice notice--warning" role="status">Your session has ended. Please sign in again.</div>}
      {error && <div className="notice notice--error" role="alert">{error}</div>}
      <form onSubmit={submit} className="form-stack">
        <div className="form-field">
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" />
        </div>
        <div className="form-field">
          <div className="form-field__label-row"><label htmlFor="login-password">Password</label>{forgot && <Link href={forgot}>Forgot password?</Link>}</div>
          <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" />
        </div>
        <button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthShell>
  )
}
