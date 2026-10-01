const mongoose = require('mongoose')
mongoose.set('strictQuery', true);
const connectDB = async ()=>{
    try {
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured')
        const conn = await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || 'police_rental', serverSelectionTimeoutMS: 10000 })
        await conn.connection.db.admin().ping()
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        const code = error.code || error.cause?.code || error.name
        throw new Error(`MongoDB connection failed (${code}). Check DNS, Atlas network access, and backend credentials.`)
    }
}

module.exports = connectDB
