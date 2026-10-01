import AuthLogin from '../../components/AuthLogin'
export default function SuperadminLogin() { return <AuthLogin title="Superadmin sign in" role="superadmin" tokenKey="superadminToken" destination="/superadmin/SuperAdminDashboard" forgot="/superadmin/SuperadminForgotPassword" /> }
