const express = require('express');

const {
  stkPush,
  mpesaCallback,
  paymentStatus,
} = require('../controllers/mpesaController');

const router = express.Router();

router.post('/stk-push', stkPush);

router.post('/callback', mpesaCallback);

router.get('/status/:checkoutRequestId', paymentStatus);

module.exports = router;