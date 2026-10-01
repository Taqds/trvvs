import Link from 'next/link'

export default function Footer() {
  return <footer className="landing-footer"><div className="landing-footer__inner">
    <div><strong>PRRVS</strong><p>Rental registration and verification for Punjab.</p></div>
    <nav aria-label="Footer navigation"><Link href="/Tenant-System/Tenant-Login">Tenant access</Link><Link href="/Hotel-System/Hotel-Login">Hotel access</Link><Link href="/Police-System/Police-Login">Police access</Link></nav>
    <small>Police Rental Registration &amp; Verification System</small>
  </div></footer>
}
