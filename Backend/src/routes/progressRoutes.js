const express = require('express');
const { getDashboard } = require('../controllers/progressController');
const protect = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);

module.exports = router;