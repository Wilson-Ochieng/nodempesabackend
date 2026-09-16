const express = require('express');

const {
  sendDispatchEmail,
} = require('../controllers/emailController');

const router = express.Router();

router.post(
  '/dispatch',
  sendDispatchEmail
);

module.exports = router;