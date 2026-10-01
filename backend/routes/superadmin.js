// routes/superadmin.js

const express = require('express');
const router = express.Router();
const { getSuperAdminStats, loginSuperAdmin, forgetPasssuperadmin, validateToken, requireSuperAdmin } = require('../controllers/superadminController');

router.post('/login', loginSuperAdmin);
router.get('/stats', requireSuperAdmin, getSuperAdminStats);
router.post('/forgetpassword', forgetPasssuperadmin);
router.post('/Adminchangepassword',  validateToken);

module.exports = router;
