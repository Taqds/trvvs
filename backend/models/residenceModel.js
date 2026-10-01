const mongoose = require('mongoose')
const residenceSchema = mongoose.Schema({
    own_name: { type: String, required:true },
    isActive: { type: Boolean, default: true, required:false },
    isVerified: { type: Boolean, default: false, required:false },
    own_cnic: { type: String, required:true },
    own_father: { type: String, required:true },
    own_phone: { type: String, required:true },
    own_address: { type: String, required:true },
    address: { type: String, required:true },
    station: { type: mongoose.ObjectId, ref: 'station', required:true },
    tenant: { type: mongoose.ObjectId, ref: 'tenant', required:true },
    entryAt: { type: Date, default: Date.now(), required:false },
    exitAt: { type:Date, required:false }
})

module.exports = mongoose.model('residence', residenceSchema, 'residence')
