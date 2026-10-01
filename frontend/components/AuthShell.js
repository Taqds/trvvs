import Link from 'next/link'

export default function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <main className="auth-page">
      <div className="auth-page__backdrop" />
      <div className="auth-layout">
        <section className="auth-intro" aria-label="About the service">
          <Link href="/" passHref><a className="brand-mark">PRRVS<span className="brand-mark__dot">.</span></a></Link>
          <div>
            <p className="auth-intro__kicker">Punjab rental verification</p>
            <h2>One place for residents, hotels and police teams.</h2>
            <p>Keep registration details organised and check verification progress securely.</p>
          </div>
          <p className="auth-intro__foot">Police Rental Registration &amp; Verification System</p>
        </section>
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card__top">
            <span className="eyebrow">{eyebrow}</span>
            <h1 id="auth-title">{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {children}
          {footer && <div className="auth-card__footer">{footer}</div>}
        </section>
      </div>
    </main>
  )
}
