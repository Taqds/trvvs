require('dotenv').config()

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Station = require('../models/stationModel')
const Tenant = require('../models/tenantModel')
const Hotel = require('../models/hotelModel')
const Residence = require('../models/residenceModel')
const Room = require('../models/roomModel')
const SuperAdmin = require('../models/SuperAdminModel')

const requestPath = path.resolve(__dirname, '../../.run/test-login-request.json')
const outputPath = path.resolve(__dirname, '../../.run/test-logins.json')

function id(kind, email) {
  return new mongoose.Types.ObjectId(crypto.createHash('sha256').update(`prrvs-test-login-v1:${kind}:${email}`).digest().subarray(0, 12))
}

async function upsertOwned(model, kind, email, fields) {
  const _id = id(kind, email)
  const other = await model.findOne({ email, _id: { $ne: _id } }).select('_id').lean()
  if (other) throw new Error(`${model.modelName}: email already belongs to another record`)
  await model.updateOne({ _id }, { $set: { email, ...fields } }, { upsert: true, runValidators: true })
  return _id
}

async function upsertLinked(model, kind, email, fields) {
  await model.updateOne({ _id: id(kind, email) }, { $set: fields }, { upsert: true, runValidators: true })
}

async function main() {
  const { emails, password } = JSON.parse(fs.readFileSync(requestPath, 'utf8'))
  if (!Array.isArray(emails) || emails.length !== 2 || !emails.every(value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) || typeof password !== 'string' || password.length < 8) {
    throw new Error('Invalid local test-login request')
  }
  const hashed = await bcrypt.hash(password, 10)
  await connectDB()

  for (const [index, email] of emails.entries()) {
    const suffix = index + 1
    const stationId = await upsertOwned(Station, 'station', email, {
      password: hashed,
      station_name: `Personal Test Police Station ${suffix}`,
      sho_cnic: `00000-999000${suffix}-0`,
      sho_name: 'Taqadas Ur Rehman (Test)',
      phone: `0300999000${suffix}`,
      address: `Test Police Area ${suffix}, Punjab`
    })
    const tenantId = await upsertOwned(Tenant, 'tenant', email, {
      password: hashed,
      name: 'Taqadas Ur Rehman (Test)',
      father: 'Demo Parent',
      cnic: `00000-999100${suffix}-0`,
      phone: `0300999100${suffix}`
    })
    const hotelId = await upsertOwned(Hotel, 'hotel', email, {
      password: hashed,
      hotel_name: `Personal Test Hotel ${suffix}`,
      own_cnic: `00000-999200${suffix}-0`,
      own_father: 'Demo Parent',
      own_name: 'Taqadas Ur Rehman (Test)',
      phone: `0300999200${suffix}`,
      address: `Test Hotel Address ${suffix}, Punjab`,
      totalRooms: 20,
      totalGuests: 1,
      isVerified: true,
      station: stationId
    })
    await upsertOwned(SuperAdmin, 'superadmin', email, {
      password: hashed,
      name: 'Taqadas Ur Rehman (Test)',
      phone: `0300999300${suffix}`,
      role: 'superadmin'
    })
    await upsertLinked(Residence, 'residence', email, {
      own_name: `Test Property Owner ${suffix}`,
      own_cnic: `00000-999300${suffix}-0`,
      own_father: 'Demo Parent',
      own_phone: `0300999400${suffix}`,
      own_address: `Test Owner Address ${suffix}, Punjab`,
      address: `Test Residence ${suffix}, Punjab`,
      station: stationId,
      tenant: tenantId,
      isActive: true,
      isVerified: true,
      entryAt: new Date('2026-01-01T00:00:00Z')
    })
    await upsertLinked(Room, 'room', email, {
      room: 1,
      hotel_ID: hotelId,
      name: `Test Guest ${suffix}`,
      cnic: `00000-999400${suffix}-0`,
      phone: Number(`0300999500${suffix}`),
      isActive: true,
      entryAt: new Date('2026-01-01T00:00:00Z')
    })
    console.log(`Created complete test records for email alias ${suffix}`)
  }

  const urls = {
    tenant: 'http://localhost:3000/Tenant-System/Tenant-Login',
    hotel: 'http://localhost:3000/Hotel-System/Hotel-Login',
    police: 'http://localhost:3000/Police-System/Police-Login',
    superadmin: 'http://localhost:3000/superadmin/SuperadminLogin'
  }
  fs.writeFileSync(outputPath, JSON.stringify({ emails, password, urls, note: 'Either email and the same password works for all four roles. Profile fields and linked records are synthetic test data.' }, null, 2) + '\n', { mode: 0o600 })
  console.log('Test logins saved to .run/test-logins.json')
}

main().catch(error => {
  const message = error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, '[redacted-uri]')
  console.error(`Test account setup failed (${error.code || error.name}): ${message}. No non-test records were deleted.`)
  process.exitCode = 1
}).finally(() => mongoose.disconnect())
