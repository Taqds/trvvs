import AccountDashboard from '../../components/AccountDashboard'
export default function TenantDashboard() { return <AccountDashboard title="Tenant dashboard" role="tenant" tokenKey="tenantToken" login="/Tenant-System/Tenant-Login" links={[{ href: '/Tenant-System/Add-Residency', label: 'Add residency' }, { href: '/Tenant-System/Change-Password', label: 'Change password' }]} /> }
