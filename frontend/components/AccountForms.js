import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import AuthShell from './AuthShell'
import WorkspaceShell from './WorkspaceShell'

function FormNotice({ message, type = 'error' }) {
  return message ? <div className={`notice notice--${type}`} role={type === 'error' ? 'alert' : 'status'}>{message}</div> : null
}

export function ForgotPassword({ role, endpoint, next, login }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await axios.post(endpoint, { email: email.trim() })
      localStorage.setItem('passwordResetEmail', email.trim())
      router.push(next)
    } catch (failure) {
      setError(failure.response?.data?.message || 'We could not send a reset token. Try again shortly.')
    } finally { setBusy(false) }
  }

  return <AuthShell eyebrow={`${role} account`} title="Forgot password?" description="Enter your account email and we will send a reset token." footer={<Link href={login}>Back to sign in</Link>}>
    <FormNotice message={error} />
    <form onSubmit={submit} className="form-stack">
      <div className="form-field"><label htmlFor="reset-email">Email address</label><input id="reset-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" /></div>
      <button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset token'}</button>
    </form>
  </AuthShell>
}

export function ResetPassword({ role, endpoint, login }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (password !== confirm) { setError('The passwords do not match.'); return }
    if (password.length < 8) { setError('Use at least 8 characters for your new password.'); return }
    const accountEmail = email.trim() || localStorage.getItem('passwordResetEmail') || localStorage.getItem('email')
    if (!accountEmail) { setError('Enter the account email address.'); return }
    setBusy(true)
    try {
      await axios.post(endpoint, { email: accountEmail, password, token: token.trim() })
      localStorage.removeItem('passwordResetEmail')
      localStorage.removeItem('email')
      router.push(login)
    } catch (failure) {
      setError(failure.response?.data?.message || 'The password could not be reset. Check the token and try again.')
    } finally { setBusy(false) }
  }

  return <AuthShell eyebrow={`${role} account`} title="Set a new password" description="Use the token sent to your email. You can enter the email again if you opened this page on another device." footer={<Link href={login}>Back to sign in</Link>}>
    <FormNotice message={error} />
    <form onSubmit={submit} className="form-stack">
      <div className="form-field"><label htmlFor="account-email">Account email</label><input id="account-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" /><p className="field-hint">Leave blank to use the email from the previous step.</p></div>
      <div className="form-field"><label htmlFor="reset-token">Reset token</label><input id="reset-token" type="text" inputMode="numeric" required value={token} onChange={event => setToken(event.target.value)} placeholder="6-digit code" /></div>
      <div className="form-field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} /></div>
      <div className="form-field"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" required value={confirm} onChange={event => setConfirm(event.target.value)} /></div>
      <button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Reset password'}</button>
    </form>
  </AuthShell>
}

export function ChangePassword({ role, tokenKey, login, dashboard }) {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (newPassword !== confirm) { setError('The new passwords do not match.'); return }
    if (newPassword.length < 8) { setError('Use at least 8 characters for the new password.'); return }
    const token = localStorage.getItem(tokenKey)
    if (!token) { router.replace(`${login}?session=expired`); return }
    setBusy(true)
    try {
      await axios.post(`/api/${role}/changepass`, { oldPass: oldPassword, newPass: newPassword }, { headers: { Authorization: `Bearer ${token}` } })
      localStorage.removeItem(tokenKey)
      router.push(login)
    } catch (failure) {
      if (failure.response?.status === 401) { localStorage.removeItem(tokenKey); router.replace(`${login}?session=expired`) }
      else setError(failure.response?.data?.message || 'The password could not be changed. Please try again.')
    } finally { setBusy(false) }
  }

  return <WorkspaceShell eyebrow={`${role} account`} title="Change password" description="Choose a new password for your account." tokenKey={tokenKey} login={login} action={<Link href={dashboard} passHref><a className="button button--quiet">Back to dashboard</a></Link>}>
    <section className="content-card form-card"><FormNotice message={error} />
      <form onSubmit={submit} className="form-stack">
        <div className="form-field"><label htmlFor="old-password">Current password</label><input id="old-password" type="password" autoComplete="current-password" required value={oldPassword} onChange={event => setOldPassword(event.target.value)} /></div>
        <div className="form-field"><label htmlFor="new-account-password">New password</label><input id="new-account-password" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={event => setNewPassword(event.target.value)} /></div>
        <div className="form-field"><label htmlFor="confirm-account-password">Confirm new password</label><input id="confirm-account-password" type="password" autoComplete="new-password" required value={confirm} onChange={event => setConfirm(event.target.value)} /></div>
        <div className="form-card__actions"><Link href={dashboard} passHref><a className="button button--quiet">Cancel</a></Link><button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button></div>
      </form>
    </section>
  </WorkspaceShell>
}
