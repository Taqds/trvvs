import AccountDashboard from '../../components/AccountDashboard'
export default function HotelDashboard() { return <AccountDashboard title="Hotel dashboard" role="hotel" tokenKey="hotelToken" login="/Hotel-System/Hotel-Login" links={[{ href: '/Hotel-System/Change-Password', label: 'Change password' }]} /> }
