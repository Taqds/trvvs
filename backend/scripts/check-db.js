require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Station = require('../models/stationModel')

async function main() {
  try {
    await connectDB()
    const station = await Station.findOne({}, { station_name: 1, _id: 0 }).lean()
    console.log('Station read:', station || '(collection empty)')
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

main()
