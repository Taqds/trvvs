const express = require('express')
const dotenv = require('dotenv').config()
const {errorHandler} = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const port = process.env.PORT || 5000


const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended:false }))

if (process.env.FRONTEND_ORIGIN) app.use(require('cors')({ origin: process.env.FRONTEND_ORIGIN }))
 
app.use('/api/tenant', require('./routes/tenantRoutes'))
app.use('/api/hotel', require('./routes/hotelRoutes'))
app.use('/api/police', require('./routes/policeRoutes'))
app.use('/api/superadmin', require('./routes/superadmin'))

app.use(errorHandler)

connectDB().then(() => app.listen(port, () => console.log(`Server started at ${port}`))).catch(error => {
    console.error(error.message)
    process.exitCode = 1
})
