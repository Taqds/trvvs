import { ForgotPassword } from '../../components/AccountForms'
export default function Page() { return <ForgotPassword role="superadmin" endpoint="/api/superadmin/forgetpassword" next="/superadmin/GetToken" login="/superadmin/SuperadminLogin" /> }
