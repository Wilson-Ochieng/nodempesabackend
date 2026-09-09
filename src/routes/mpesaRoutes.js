const express = require('express');

const {
  stkPush,
  mpesaCallback,
} = require('../controllers/mpesaController');

const router = express.Router();


// POST /api/payments/mpesa/stk-push
router.post('/stk-push', stkPush);


// POST /api/payments/mpesa/callback
router.post('/callback', mpesaCallback);


module.exports = router;