import AuthLogin from '../../components/AuthLogin'
export default function TenantLogin() { return <AuthLogin title="Tenant sign in" role="tenant" tokenKey="tenantToken" destination="/Tenant-System/Tenant-Dashboard" signup="/Tenant-System/Tenant-SignUp" forgot="/Tenant-System/Forgot-Password" /> }
