const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const randomstring = require('randomstring')
const jwt = require('jsonwebtoken')
const SuperAdmin = require('../models/SuperAdminModel')
const Tenant = require('../models/tenantModel')
const Station = require('../models/stationModel')
const Residence = require('../models/residenceModel')
const Hotel = require('../models/hotelModel')
const Room = require('../models/roomModel')
const sendToken = require('../utils/sendToken')

const fail = (res, message) => res.status(400).json({ status: 'fail', message })

const loginSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return fail(res, 'Email and password are required')
  const admin = await SuperAdmin.findOne({ email }).select('+password')
  if (!admin || !(await admin.matchPassword(password))) return fail(res, 'Invalid Credentials')
  res.json({ status: 'success', token: admin.getSignedJwtToken() })
})

const getSuperAdminStats = asyncHandler(async (req, res) => {
  const [tenantRegistrations, policeVerifications, guestCounts, totalHotelRegistrations, verificationsByArea, hotelRegistrationsByArea] = await Promise.all([
    Tenant.countDocuments(),
    Station.countDocuments(),
    Room.countDocuments({ isActive: true }),
    Hotel.countDocuments(),
    Residence.aggregate([{ $match: { isVerified: true } }, { $group: { _id: '$station', count: { $sum: 1 } } }]),
    Hotel.aggregate([{ $group: { _id: '$station', count: { $sum: 1 } } }])
  ])
  res.json({ tenantRegistrations, policeVerifications, guestCounts, totalHotelRegistrations, verificationsByArea, hotelRegistrationsByArea })
})

const forgetPasssuperadmin = asyncHandler(async (req, res) => {
  if (!req.body.email) return fail(res, 'Please add Email')
  const admin = await SuperAdmin.findOne({ email: req.body.email })
  if (!admin) return fail(res, 'Invalid Email')
  admin.token = randomstring.generate({ length: 6, charset: 'numeric' })
  await admin.save()
  await sendToken(admin.email, 'Forgot Password', `Use this OTP for password reset: ${admin.token}`)
  res.json({ status: 'success', message: 'OTP sent' })
})

const validateToken = asyncHandler(async (req, res) => {
  const { email, password, token } = req.body
  if (!email || !password || !token) return fail(res, 'Email, password, and token are required')
  const admin = await SuperAdmin.findOne({ email })
  if (!admin || !admin.token || admin.token !== token) return fail(res, 'Invalid OTP')
  admin.password = password
  admin.token = undefined
  await admin.save()
  res.json({ status: 'success', message: 'Password Changed Successfully' })
})

const requireSuperAdmin = asyncHandler(async (req, res, next) => {
  const value = req.headers.authorization || ''
  if (!value.startsWith('Bearer ')) return res.status(401).json({ status: 'fail', message: 'Not Authorized' })
  try {
    const decoded = jwt.verify(value.slice(7), process.env.JWT_SECRET)
    if (!await SuperAdmin.exists({ _id: decoded.id })) return res.status(401).json({ status: 'fail', message: 'Not Authorized' })
    next()
  } catch {
    res.status(401).json({ status: 'fail', message: 'Not Authorized' })
  }
})

module.exports = { getSuperAdminStats, loginSuperAdmin, forgetPasssuperadmin, validateToken, requireSuperAdmin }
