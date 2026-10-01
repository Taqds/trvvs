import { ForgotPassword } from '../../components/AccountForms'
export default function Page() { return <ForgotPassword role="tenant" endpoint="/api/tenant/forgetpass" next="/Tenant-System/Get-Token" login="/Tenant-System/Tenant-Login" /> }
