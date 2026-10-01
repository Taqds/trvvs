const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const randomstring = require('randomstring')
const Tenant = require('../models/tenantModel')
const Residence = require('../models/residenceModel')
const Station = require('../models/stationModel')
const sendToken = require('../utils/sendToken')

const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' })
const fail = (res, message, code = 400) => res.status(code).json({ status: 'fail', message })

const register = asyncHandler(async (req, res) => {
  const { email, password, name, father, cnic, phone } = req.body
  if (![email, password, name, father, cnic, phone].every(Boolean)) return fail(res, 'Empty Credentials')
  if (await Tenant.exists({ email })) return fail(res, 'User already Registered')
  const tenant = await Tenant.create({ email, password: await bcrypt.hash(password, 10), name, father, cnic, phone })
  res.status(201).json({ status: 'success', token: tokenFor(tenant._id) })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return fail(res, 'Empty Credentials')
  const tenant = await Tenant.findOne({ email })
  if (!tenant || !(await bcrypt.compare(password, tenant.password))) return fail(res, 'Invalid Credentials')
  res.json({ status: 'success', token: tokenFor(tenant._id) })
})

const dashboard = asyncHandler(async (req, res) => {
  const [stations, residences] = await Promise.all([
    Station.find({}, '_id station_name'),
    Residence.find({ tenant: req.user._id }).populate('station', 'station_name')
  ])
  res.json({ status: 'success', stations, residences })
})

const addResidence = asyncHandler(async (req, res) => {
  const residence = req.body.residence
  const fields = ['own_name', 'own_cnic', 'own_father', 'own_phone', 'own_address', 'address', 'station']
  if (!residence || !fields.every(field => residence[field])) return fail(res, 'Incomplete residence data')
  if (!await Station.exists({ _id: residence.station })) return fail(res, 'Invalid station')
  await Residence.create(Object.fromEntries([...fields.map(field => [field, residence[field]]), ['tenant', req.user._id]]))
  res.status(201).json({ status: 'success' })
})

const delResidence = asyncHandler(async (req, res) => {
  if (!req.body.residence_ID) return fail(res, 'Please specify Residence ID')
  const record = await Residence.findOneAndUpdate({ _id: req.body.residence_ID, tenant: req.user._id, isActive: true }, { isActive: false, exitAt: new Date() })
  if (!record) return fail(res, 'Residence not found', 404)
  res.json({ status: 'success' })
})

const changePass = asyncHandler(async (req, res) => {
  const { oldPass, newPass } = req.body
  if (!oldPass || !newPass) return fail(res, 'Please add Old and New Passwords')
  const tenant = await Tenant.findById(req.user._id)
  if (!tenant || !(await bcrypt.compare(oldPass, tenant.password))) return fail(res, 'Old Password Incorrect')
  tenant.password = await bcrypt.hash(newPass, 10)
  await tenant.save()
  res.json({ status: 'success' })
})

const forgetPass = asyncHandler(async (req, res) => {
  if (!req.body.email) return fail(res, 'Please add Email')
  const tenant = await Tenant.findOne({ email: req.body.email })
  if (!tenant) return fail(res, 'Invalid Email')
  tenant.token = randomstring.generate({ length: 6, charset: 'numeric' })
  await tenant.save()
  await sendToken(tenant.email, 'Forgot Password', `Use this OTP for password reset: ${tenant.token}`)
  res.json({ status: 'success', message: 'OTP sent' })
})

const validateToken = asyncHandler(async (req, res) => {
  const { email, password, token } = req.body
  if (!email || !password || !token) return fail(res, 'Email, password, and token are required')
  const tenant = await Tenant.findOne({ email })
  if (!tenant || !tenant.token || tenant.token !== token) return fail(res, 'Invalid OTP')
  tenant.password = await bcrypt.hash(password, 10)
  tenant.token = undefined
  await tenant.save()
  res.json({ status: 'success', message: 'Password Changed Successfully' })
})

module.exports = { register, login, dashboard, addResidence, delResidence, changePass, forgetPass, validateToken }
