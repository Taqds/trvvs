import Link from 'next/link'
import { useRouter } from 'next/router'

export default function WorkspaceShell({ eyebrow, title, description, tokenKey, login, action, children }) {
  const router = useRouter()
  function signOut() {
    if (tokenKey) localStorage.removeItem(tokenKey)
    router.push(login || '/')
  }
  return (
    <div className="workspace-page">
      <header className="workspace-topbar">
        <div className="workspace-topbar__inner">
          <Link href="/" passHref><a className="workspace-brand">PRRVS<span className="brand-mark__dot">.</span></a></Link>
          <div className="workspace-actions">
            <Link href="/" passHref><a className="button button--quiet">Home</a></Link>
            {tokenKey && <button type="button" className="button button--quiet" onClick={signOut}>Sign out</button>}
          </div>
        </div>
      </header>
      <main className="workspace-main">
        <div className="page-heading">
          <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>
          {action}
        </div>
        {children}
      </main>
    </div>
  )
}
