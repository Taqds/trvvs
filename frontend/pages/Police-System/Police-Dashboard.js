import AccountDashboard from '../../components/AccountDashboard'
export default function PoliceDashboard() { return <AccountDashboard title="Police dashboard" role="police" tokenKey="policeToken" login="/Police-System/Police-Login" links={[{ href: '/Police-System/Change-Password', label: 'Change password' }]} /> }
