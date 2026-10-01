import Link from 'next/link'

export default function NavBar() {
  return <header className="landing-nav"><div className="landing-nav__inner">
    <Link href="/" passHref><a className="brand-mark">PRRVS<span className="brand-mark__dot">.</span></a></Link>
    <nav aria-label="Main navigation" className="landing-nav__links">
      <Link href="/Tenant-System/Tenant-Login">Tenant</Link>
      <Link href="/Hotel-System/Hotel-Login">Hotel</Link>
      <Link href="/Police-System/Police-Login">Police</Link>
      <Link href="/superadmin/SuperadminLogin">Superadmin</Link>
    </nav>
  </div></header>
}
