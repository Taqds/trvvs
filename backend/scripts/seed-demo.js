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

const COUNT = 50
const output = path.resolve(__dirname, '../../.run/demo-logins.json')
const roles = {
  tenant: { email: 'tenant01@demo.invalid', url: 'http://localhost:3000/Tenant-System/Tenant-Login' },
  hotel: { email: 'hotel01@demo.invalid', url: 'http://localhost:3000/Hotel-System/Hotel-Login' },
  police: { email: 'police01@demo.invalid', url: 'http://localhost:3000/Police-System/Police-Login' },
  superadmin: { email: 'superadmin01@demo.invalid', url: 'http://localhost:3000/superadmin/SuperadminLogin' }
}

function demoId(kind, index) {
  return new mongoose.Types.ObjectId(crypto.createHash('sha256').update(`prrvs-demo-v1:${kind}:${index}`).digest().subarray(0, 12))
}

function padded(index) { return String(index).padStart(2, '0') }
function cnic(index) { return `00000-${String(index).padStart(7, '0')}-0` }
function phone(index) { return `0300${String(index).padStart(7, '0')}` }

function credentials() {
  if (fs.existsSync(output)) {
    const saved = JSON.parse(fs.readFileSync(output, 'utf8'))
    if (Object.keys(roles).every(role => saved[role]?.password)) {
      for (const role of Object.keys(roles)) saved[role].accounts = Array.from({ length: COUNT }, (_, index) => `${role}${padded(index + 1)}@demo.invalid`)
      return saved
    }
    throw new Error('Existing demo login file is incomplete; inspect it before rerunning the seed')
  }
  return Object.fromEntries(Object.entries(roles).map(([role, details]) => [role, {
    ...details,
    password: `Demo-${crypto.randomBytes(15).toString('base64url')}`,
    accountPattern: `${role}01@demo.invalid through ${role}${COUNT}@demo.invalid`,
    note: `All ${COUNT} ${role} accounts use this role's password.`,
    accounts: Array.from({ length: COUNT }, (_, index) => `${role}${padded(index + 1)}@demo.invalid`)
  }]))
}

async function upsertDemo(model, kind, rows) {
  await model.bulkWrite(rows.map((row, index) => ({
    updateOne: {
      filter: { _id: demoId(kind, index + 1) },
      update: { $set: row },
      upsert: true
    }
  })), { ordered: true })
  const count = await model.countDocuments({ _id: { $in: rows.map((_, index) => demoId(kind, index + 1)) } })
  if (count !== COUNT) throw new Error(`${kind}: expected ${COUNT} demo records, found ${count}`)
  console.log(`${kind}: ${count} demo records ready`)
}

async function main() {
  const logins = credentials()
  const hashes = Object.fromEntries(await Promise.all(Object.entries(logins).map(async ([role, details]) => [role, await bcrypt.hash(details.password, 10)])))
  await connectDB()

  const indexes = Array.from({ length: COUNT }, (_, index) => index + 1)
  await upsertDemo(Station, 'station', indexes.map(index => ({
    email: `police${padded(index)}@demo.invalid`, password: hashes.police,
    station_name: `Demo Police Station ${padded(index)}`,
    sho_cnic: cnic(index), sho_name: `Demo Officer ${padded(index)}`,
    phone: phone(index), address: `Demo Area ${padded(index)}, Punjab`
  })))
  await upsertDemo(Tenant, 'tenant', indexes.map(index => ({
    email: `tenant${padded(index)}@demo.invalid`, password: hashes.tenant,
    cnic: cnic(100 + index), father: `Demo Parent ${padded(index)}`,
    name: `Demo Tenant ${padded(index)}`, phone: phone(100 + index)
  })))
  await upsertDemo(Hotel, 'hotel', indexes.map(index => ({
    email: `hotel${padded(index)}@demo.invalid`, password: hashes.hotel,
    hotel_name: `Demo Hotel ${padded(index)}`, own_cnic: cnic(200 + index),
    own_father: `Demo Parent ${padded(index)}`, own_name: `Demo Owner ${padded(index)}`,
    phone: phone(200 + index), address: `Demo Street ${padded(index)}, Punjab`,
    totalRooms: 20, totalGuests: index % 5 === 0 ? 0 : 1,
    isVerified: index % 4 !== 0, station: demoId('station', index)
  })))
  await upsertDemo(Residence, 'residence', indexes.map(index => ({
    own_name: `Demo Property Owner ${padded(index)}`, own_cnic: cnic(300 + index),
    own_father: `Demo Parent ${padded(index)}`, own_phone: phone(300 + index),
    own_address: `Demo Owner Address ${padded(index)}, Punjab`,
    address: `Demo Residence ${padded(index)}, Punjab`,
    station: demoId('station', index), tenant: demoId('tenant', index),
    isActive: index % 5 !== 0, isVerified: index % 4 !== 0,
    entryAt: new Date('2026-01-01T00:00:00Z'),
    exitAt: index % 5 === 0 ? new Date('2026-06-01T00:00:00Z') : null
  })))
  await upsertDemo(Room, 'room', indexes.map(index => ({
    room: 1, hotel_ID: demoId('hotel', index),
    name: `Demo Guest ${padded(index)}`, cnic: cnic(400 + index),
    phone: Number(phone(400 + index)), isActive: index % 5 !== 0,
    entryAt: new Date('2026-01-01T00:00:00Z'),
    exitAt: index % 5 === 0 ? new Date('2026-06-01T00:00:00Z') : null
  })))
  await upsertDemo(SuperAdmin, 'superadmin', indexes.map(index => ({
    email: `superadmin${padded(index)}@demo.invalid`, password: hashes.superadmin,
    name: `Demo Superadmin ${padded(index)}`, phone: phone(500 + index), role: 'superadmin'
  })))

  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, JSON.stringify(logins, null, 2) + '\n', { mode: 0o600 })
  console.log('Demo login file: .run/demo-logins.json (ignored by version control)')
}

main().catch(error => {
  console.error(`Demo seed failed (${error.code || error.name}). No existing application records were deleted.`)
  process.exitCode = 1
}).finally(() => mongoose.disconnect())
