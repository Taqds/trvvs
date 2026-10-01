import Head from 'next/head'
import Link from 'next/link'
import NavBar from './Nav-Bar'
import Footer from './Footer'

const roles = [
  { title: 'For tenants', text: 'Register your residency and follow its verification status.', href: '/Tenant-System/Tenant-Login', action: 'Tenant sign in' },
  { title: 'For hotels', text: 'Manage hotel registration and guest records in one place.', href: '/Hotel-System/Hotel-Login', action: 'Hotel sign in' },
  { title: 'For police', text: 'Review registrations linked to your police station.', href: '/Police-System/Police-Login', action: 'Police sign in' }
]

export default function MainLandingPage() {
  return <div className="landing-page">
    <Head><title>PRRVS | Rental Registration &amp; Verification</title><meta name="description" content="Register and verify tenants and hotels in Punjab." /></Head>
    <div className="landing-hero"><NavBar /><main className="landing-hero__content">
      <span className="landing-hero__kicker">Rental registration made clearer</span>
      <h1>One secure place for tenant and hotel verification.</h1>
      <p>Submit registration details, track requests and keep police station records organised across Punjab.</p>
      <div className="landing-hero__actions"><Link href="/Tenant-System/Tenant-SignUp" passHref><a className="button button--primary">Create tenant account</a></Link><Link href="/Hotel-System/Hotel-Login" passHref><a className="button button--outline">Hotel access</a></Link></div>
    </main></div>
    <section className="landing-roles" aria-labelledby="roles-title"><div className="landing-roles__inner"><span className="eyebrow">Choose your workspace</span><h2 id="roles-title">Start with your role</h2><div className="landing-roles__grid">{roles.map(role => <article className="landing-role-card" key={role.title}><h3>{role.title}</h3><p>{role.text}</p><Link href={role.href} passHref><a>{role.action} <span aria-hidden="true">→</span></a></Link></article>)}</div></div></section>
    <Footer />
  </div>
}
